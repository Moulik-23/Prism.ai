from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from database import get_career_by_slug, get_all_careers, create_or_update_career_from_assessment
from user_database import (create_or_update_user_profile, save_assessment_data,
                            get_user_progress, get_user_recent_activity,
                            save_chat_message, track_career_exploration,
                            get_latest_assessment_results, get_chat_history,
                            get_user_context, save_selected_career_journey,
                            get_selected_career_journey, update_roadmap_progress,
                            get_roadmap_progress, get_job_listings, apply_to_job,
                            get_user_job_applications, get_selected_careers)
try:
    from indeed_scraper import search_indeed_jobs, format_indeed_jobs_for_api
except ImportError:
    # Fallback stub functions if indeed_scraper is not available
    def search_indeed_jobs(job_title: str, location: str = "India", limit: int = 10):
        return []
    
    def format_indeed_jobs_for_api(jobs, career_title=None):
        return []

# Load environment variables
# Load environment variables
from pathlib import Path
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Career Guidance API", version="1.0.0")

# CORS configuration - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize Gemini AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.7
)

# Pydantic models
class AssessmentAnswer(BaseModel):
    question_id: str
    question: str
    answer: str

class AssessmentSubmission(BaseModel):
    user_id: str
    answers: List[AssessmentAnswer]
    user_profile: Optional[Dict] = None

class ChatMessage(BaseModel):
    user_id: str
    message: str
    context: Optional[Dict] = None

class CareerRecommendation(BaseModel):
    career_paths: List[Dict]
    skills_gap: List[Dict]
    learning_resources: List[Dict]
    personalized_advice: str

# Career assessment questions
ASSESSMENT_QUESTIONS = [
    {
        "id": "q1",
        "question": "What subjects or topics do you enjoy the most in school/college?",
        "type": "text",
        "category": "interests"
    },
    {
        "id": "q2",
        "question": "Which of these activities do you prefer? (Select multiple)",
        "type": "multiple_choice",
        "options": [
            "Solving mathematical problems",
            "Creative writing or art",
            "Building or fixing things",
            "Helping others",
            "Analyzing data",
            "Public speaking or debates"
        ],
        "category": "preferences"
    },
    {
        "id": "q3",
        "question": "What are your strongest skills?",
        "type": "text",
        "category": "skills"
    },
    {
        "id": "q4",
        "question": "What is your educational background or current academic level?",
        "type": "text",
        "category": "education"
    },
    {
        "id": "q5",
        "question": "Which industries interest you the most? (Select up to 3)",
        "type": "multiple_choice",
        "options": [
            "Technology & IT",
            "Healthcare & Medicine",
            "Finance & Banking",
            "Education & Research",
            "Arts & Entertainment",
            "Engineering & Manufacturing",
            "Business & Entrepreneurship",
            "Government & Public Service",
            "Agriculture & Environment"
        ],
        "category": "industries"
    },
    {
        "id": "q6",
        "question": "What are your long-term career goals?",
        "type": "text",
        "category": "goals"
    },
    {
        "id": "q7",
        "question": "Do you prefer working independently or in teams?",
        "type": "single_choice",
        "options": ["Independently", "In teams", "Both equally"],
        "category": "work_style"
    },
    {
        "id": "q8",
        "question": "What motivates you most in a career?",
        "type": "single_choice",
        "options": [
            "High salary and financial stability",
            "Passion and interest in the field",
            "Making a social impact",
            "Work-life balance",
            "Growth opportunities and challenges"
        ],
        "category": "motivation"
    },
    {
        "id": "q9",
        "question": "Are you aware of entrance exams relevant to your career interests? If yes, which ones?",
        "type": "text",
        "category": "exams"
    },
    {
        "id": "q10",
        "question": "What challenges or obstacles do you face in choosing a career path?",
        "type": "text",
        "category": "challenges"
    }
]

# API Routes
@app.get("/")
async def root():
    return {"message": "Career Guidance API", "version": "1.0.0", "status": "active"}

@app.get("/api/assessment/questions")
async def get_assessment_questions():
    """Fetch career assessment questions"""
    return {"questions": ASSESSMENT_QUESTIONS}

@app.post("/api/assessment/submit")
async def submit_assessment(submission: AssessmentSubmission):
    """Process assessment answers and return AI-generated career recommendations"""
    try:
        print(f"📝 Assessment submission received for user: {submission.user_id}")
        print(f"📝 Number of answers: {len(submission.answers) if submission.answers else 0}")
        
        # Ensure user profile exists
        try:
            if submission.user_profile:
                create_or_update_user_profile(
                    firebase_uid=submission.user_id,
                    email=submission.user_profile.get('email', ''),
                    display_name=submission.user_profile.get('displayName')
                )
        except Exception as profile_error:
            print(f"⚠️ Warning: Could not create/update user profile: {profile_error}")
            import traceback
            traceback.print_exc()
        
        # Format answers for AI processing
        if not submission.answers or len(submission.answers) == 0:
            raise HTTPException(status_code=400, detail="No answers provided in assessment")
        
        answers_text = "\n".join([
            f"Q: {ans.question}\nA: {ans.answer}" 
            for ans in submission.answers
        ])
        
        print(f"🤖 Invoking AI model for career analysis...")
        
        # Create prompt template for career analysis
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", """You are an expert career counselor specializing in guiding Indian students. 
            Analyze the student's assessment responses and provide comprehensive career guidance.
            
            Your response must be in valid JSON format with the following structure:
            {{
                "career_paths": [
                    {{
                        "title": "Career Title",
                        "description": "Detailed description",
                        "match_percentage": 85,
                        "required_education": "Educational requirements",
                        "salary_range": "Expected salary in INR",
                        "growth_prospects": "Career growth outlook"
                    }}
                ],
                "skills_gap": [
                    {{
                        "skill": "Skill name",
                        "current_level": "Beginner/Intermediate/Advanced",
                        "required_level": "Required proficiency",
                        "priority": "High/Medium/Low",
                        "learning_path": "How to acquire this skill"
                    }}
                ],
                "learning_resources": [
                    {{
                        "resource_name": "Course/Resource name",
                        "type": "Course/Book/Certification",
                        "provider": "Platform or institution",
                        "relevance": "Why this is recommended"
                    }}
                ],
                "personalized_advice": "Detailed personalized career advice including next steps, entrance exams to consider, and strategic guidance for Indian students"
            }}
            
            Provide at least 3-5 career paths, identify 5-7 key skills gaps, recommend 5-8 learning resources, 
            and give comprehensive personalized advice tailored to the Indian education and job market."""),
            ("human", "Student Assessment Responses:\n\n{answers}\n\nProvide comprehensive career guidance in JSON format.")
        ])
        
        # Invoke AI model
        try:
            chain = prompt_template | llm
            response = chain.invoke({"answers": answers_text})
            print(f"✅ AI model response received")
        except Exception as ai_error:
            print(f"❌ AI model error: {ai_error}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"AI model error: {str(ai_error)}")
        
        # Parse AI response
        if not hasattr(response, 'content'):
            raise HTTPException(status_code=500, detail="AI response missing content attribute")
        
        response_text = response.content.strip()
        print(f"📄 AI response length: {len(response_text)} characters")
        
        # Extract JSON from markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Clean JSON: Remove invalid control characters (except newlines and tabs within strings)
        # Replace control characters with spaces, but preserve legitimate JSON structure
        import re
        # Remove control characters (0x00-0x1F) except newline (0x0A) and tab (0x09) and carriage return (0x0D)
        # But we need to be careful - control chars inside strings should be escaped or removed
        # A safer approach: remove control chars that aren't part of valid JSON structure
        cleaned_text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', '', response_text)
        
        # Also try to fix common issues: unescaped newlines in strings
        # This is a simple fix - replace literal newlines in string values with \n
        # But we need to be careful not to break the JSON structure
        # A better approach: use a JSON repair library or manual fix
        
        # Parse JSON
        try:
            result = json.loads(cleaned_text)
            print(f"✅ JSON parsed successfully")
        except json.JSONDecodeError as json_error:
            # Try to fix common JSON issues
            print(f"⚠️ First JSON parse attempt failed, trying to fix common issues...")
            print(f"❌ JSON decode error: {json_error}")
            
            # Fix unescaped newlines in strings
            # Find all string values and escape newlines/tabs
            def fix_json_strings(text):
                # This regex finds string values in JSON and fixes common issues
                # It's a bit complex, so let's try a simpler approach first
                
                # Remove control characters more aggressively
                text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
                
                # Try to fix unescaped newlines in JSON strings
                # Replace literal newlines with escaped newlines, but only inside string values
                # We'll use a simple approach: replace \n with \\n, but be careful
                lines = text.split('\n')
                fixed_lines = []
                in_string = False
                escape_next = False
                
                for line in lines:
                    fixed_line = ''
                    for i, char in enumerate(line):
                        if escape_next:
                            fixed_line += char
                            escape_next = False
                            continue
                        if char == '\\':
                            fixed_line += char
                            escape_next = True
                            continue
                        if char == '"':
                            in_string = not in_string
                            fixed_line += char
                            continue
                        if in_string and char in ['\n', '\r', '\t']:
                            # Escape control characters in strings
                            if char == '\n':
                                fixed_line += '\\n'
                            elif char == '\r':
                                fixed_line += '\\r'
                            elif char == '\t':
                                fixed_line += '\\t'
                        else:
                            fixed_line += char
                    fixed_lines.append(fixed_line)
                
                return '\n'.join(fixed_lines)
            
            try:
                fixed_text = fix_json_strings(cleaned_text)
                result = json.loads(fixed_text)
                print(f"✅ JSON parsed successfully after fixing control characters")
            except json.JSONDecodeError as second_error:
                print(f"❌ Second JSON parse attempt also failed: {second_error}")
                print(f"📄 Response text (first 1000 chars): {response_text[:1000]}")
                print(f"📄 Error position info: {str(second_error)}")
                
                # Try one more time with a more aggressive cleanup
                try:
                    # Remove all control characters completely
                    aggressive_clean = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', cleaned_text)
                    result = json.loads(aggressive_clean)
                    print(f"✅ JSON parsed successfully after aggressive cleanup")
                except json.JSONDecodeError as final_error:
                    print(f"❌ All JSON parse attempts failed")
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Error parsing AI response as JSON: {str(final_error)}. The AI response may contain invalid characters. Please try again."
                    )
        
        # Validate result structure
        if not isinstance(result, dict):
            raise HTTPException(status_code=500, detail="AI response is not a valid JSON object")
        
        # Automatically add recommended careers to database if they don't exist
        career_paths = result.get('career_paths', [])
        if not isinstance(career_paths, list):
            career_paths = []
        
        for career in career_paths:
            try:
                create_or_update_career_from_assessment(career)
            except Exception as e:
                print(f"⚠️ Warning: Could not auto-add career '{career.get('title', 'Unknown')}': {e}")
        
        # Save assessment data to database
        try:
            answers_list = [{
                'question': ans.question,
                'answer': ans.answer
            } for ans in submission.answers]
            
            results_dict = {
                'careerPaths': career_paths,
                'skillsGap': result.get('skills_gap', []),
                'learningResources': result.get('learning_resources', []),
                'personalizedAdvice': result.get('personalized_advice', '')
            }
            
            save_assessment_data(submission.user_id, answers_list, results_dict)
            print(f"✅ Assessment data saved for user {submission.user_id}")
            print(f"✅ Auto-added {len(career_paths)} careers to Explore Careers section")
        except Exception as db_error:
            print(f"⚠️ Warning: Could not save assessment data: {db_error}")
            import traceback
            traceback.print_exc()
            # Don't fail the request - user still gets recommendations
        
        return {
            "status": "success",
            "user_id": submission.user_id,
            "recommendations": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error in assessment submission: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing assessment: {str(e)}")

@app.post("/api/mentor/chat")
async def chat_with_mentor(chat: ChatMessage):
    """AI Mentor chatbot for real-time career guidance with context awareness"""
    try:
        # Get user context (career matches, skills, assessment results)
        user_context = get_user_context(chat.user_id)
        
        # Get recent chat history (last 5 conversations for context)
        chat_history = get_chat_history(chat.user_id, limit=5)
        
        # Build context-aware system message
        context_parts = []
        
        # Add career context from Explore/Detail page if provided
        if chat.context and isinstance(chat.context, dict):
            if 'career_title' in chat.context:
                context_parts.append("CURRENT CAREER OF INTEREST (User clicked from Explore/Detail page):")
                context_parts.append(f"- Career: {chat.context.get('career_title')}")
                if chat.context.get('career_description'):
                    context_parts.append(f"- Description: {chat.context.get('career_description')[:300]}")
                if chat.context.get('avg_salary'):
                    context_parts.append(f"- Average Salary: {chat.context.get('avg_salary')}")
                if chat.context.get('popular_exams'):
                    exams = ', '.join(chat.context.get('popular_exams', [])[:5])
                    context_parts.append(f"- Entrance Exams: {exams}")
                if chat.context.get('skills_required'):
                    skills = ', '.join(chat.context.get('skills_required', [])[:5])
                    context_parts.append(f"- Required Skills: {skills}")
                if chat.context.get('job_roles'):
                    roles = ', '.join(chat.context.get('job_roles', [])[:3])
                    context_parts.append(f"- Job Roles: {roles}")
                context_parts.append("\nIMPORTANT: The user is specifically asking about THIS career. Reference it directly in your responses.")
                context_parts.append("")
        
        if user_context['assessment_completed']:
            context_parts.append("USER'S CAREER ASSESSMENT RESULTS:")
            
            if user_context['career_matches']:
                career_list = ", ".join([f"{c.get('title', 'Career')} ({c.get('match_percentage', 0)}% match)" 
                                        for c in user_context['career_matches'][:3]])
                context_parts.append(f"- Career Matches: {career_list}")
            
            if user_context['skills_to_develop']:
                skills_list = ", ".join([s.get('skill', 'Skill') for s in user_context['skills_to_develop'][:5]])
                context_parts.append(f"- Skills to Develop: {skills_list}")
            
            if user_context['selected_careers']:
                context_parts.append(f"- Selected Career Interests: {', '.join(user_context['selected_careers'])}")
        
        # Add chat history context if available
        if chat_history:
            context_parts.append("\nRECENT CONVERSATION HISTORY:")
            for i, hist in enumerate(chat_history[-3:], 1):  # Last 3 conversations
                context_parts.append(f"\nPrevious exchange {i}:")
                context_parts.append(f"User: {hist['message']}")
                context_parts.append(f"Your response: {hist['response'][:200]}...")  # First 200 chars
        
        context_info = "\n".join(context_parts) if context_parts else ""
        
        # Build messages array with system context and chat history
        messages = [
            SystemMessage(content=f"""You are Prism AI Mentor, a friendly and knowledgeable career guidance counselor 
            specializing in helping Indian students make informed career decisions. 
            
            IMPORTANT: You have access to the user's personal information:
            {context_info}
            
            Use this information to provide personalized advice. Reference their career matches, skills, and previous 
            conversations naturally. If they ask about careers, skills, or topics mentioned in their assessment, 
            use that context to give more relevant answers.
            
            Provide conversational, empathetic, and practical career advice. Consider:
            - Indian education system (10th, 12th, graduation paths)
            - Entrance exams (JEE, NEET, CAT, UPSC, etc.)
            - Career opportunities in India and abroad
            - Current job market trends
            - Skill development and certifications
            
            Keep responses concise (2-4 paragraphs), friendly, and actionable. Reference their specific career matches 
            and skills when relevant.""")
        ]
        
        # Add recent chat history as conversation context (last 2-3 exchanges)
        if chat_history:
            for hist in chat_history[-2:]:  # Last 2 conversations
                messages.append(HumanMessage(content=hist['message']))
                messages.append(AIMessage(content=hist['response'][:500]))  # Truncated for context
        
        # Add current user message
        messages.append(HumanMessage(content=chat.message))
        
        # Invoke AI with full context
        response = llm.invoke(messages)
        
        # Save chat history
        save_chat_message(chat.user_id, chat.message, response.content)
        
        return {
            "status": "success",
            "response": response.content,
            "user_id": chat.user_id
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

@app.get("/api/careers/explore")
async def explore_careers(user_id: Optional[str] = None):
    """Get popular career paths for Indian students from database.
    If user_id is provided, includes match percentages from user's latest assessment.
    Returns real statistics about careers.
    """
    try:
        careers = get_all_careers()
        
        # Calculate real statistics
        total_careers = len(careers)
        categories = set(career.get('category', 'Unknown') for career in careers)
        total_exams = sum(len(career.get('popular_exams', [])) for career in careers)
        
        # If user_id provided, add match percentages from their assessment results
        if user_id:
            try:
                latest_results = get_latest_assessment_results(user_id)
                if latest_results and latest_results.get('career_paths'):
                    # Create a map of career titles to match percentages
                    match_map = {}
                    for career in latest_results['career_paths']:
                        title = career.get('title', '').strip()
                        match_percentage = career.get('match_percentage')
                        if title and match_percentage is not None:
                            match_map[title.lower()] = match_percentage
                    
                    # Add match percentages to careers
                    for career in careers:
                        career_title = career.get('title', '').strip().lower()
                        if career_title in match_map:
                            career['match_percentage'] = match_map[career_title]
                            career['is_recommended'] = True
            except Exception as e:
                print(f"⚠️ Could not fetch match percentages for user {user_id}: {e}")
        
        # Add default careers if database is empty
        if not careers:
            careers = [
                {
                    "slug": "engineering",
                    "title": "Engineering",
                    "short_description": "Various engineering disciplines including Computer Science, Mechanical, Electrical, Civil, etc.",
                    "popular_exams": ["JEE Main", "JEE Advanced", "State Engineering Entrance Exams"],
                    "avg_salary": "₹4-15 LPA"
                }
            ]
        
        # Calculate real statistics (moved after default careers check)
        total_careers = len(careers)
        categories = set(career.get('category', 'Unknown') for career in careers if career.get('category'))
        total_exams = sum(len(career.get('popular_exams', [])) for career in careers if career.get('popular_exams'))
        
        return {
            "careers": careers,
            "statistics": {
                "total_careers": total_careers,
                "total_categories": len(categories),
                "total_exams": total_exams,
                "categories": list(categories) if categories else []
            }
        }
    except Exception as e:
        # Fallback to static data if database fails
        print(f"Database error: {e}")
        fallback_careers = [
            {"slug": "engineering", "title": "Engineering", "short_description": "Various engineering disciplines", 
             "popular_exams": ["JEE Main"], "avg_salary": "₹4-15 LPA", "category": "Engineering"}
        ]
        return {
            "careers": fallback_careers,
            "statistics": {
                "total_careers": len(fallback_careers),
                "total_categories": 1,
                "total_exams": 1,
                "categories": ["Engineering"]
            }
        }

@app.get("/api/careers/{slug}")
async def get_career_details(slug: str, user_id: Optional[str] = None):
    """Get detailed information about a specific career"""
    try:
        career = get_career_by_slug(slug)
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")
        
        # Track career exploration if user_id provided
        if user_id:
            track_career_exploration(user_id, slug)
        
        return {"career": career}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching career details: {str(e)}")

@app.get("/api/user/{firebase_uid}/progress")
async def get_user_dashboard_data(firebase_uid: str):
    """Get user progress and dashboard data"""
    try:
        progress = get_user_progress(firebase_uid)
        recent_activity = get_user_recent_activity(firebase_uid, limit=5)
        latest_results = get_latest_assessment_results(firebase_uid)
        
        return {
            "progress": progress,
            "recent_activity": recent_activity,
            "latest_assessment": latest_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user data: {str(e)}")

@app.post("/api/user/profile")
async def update_user_profile(user_data: Dict):
    """Create or update user profile"""
    try:
        create_or_update_user_profile(
            firebase_uid=user_data['firebase_uid'],
            email=user_data['email'],
            display_name=user_data.get('display_name')
        )
        return {"status": "success", "message": "Profile updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.post("/api/user/selected-careers")
async def save_selected_careers(data: Dict):
    """Save user's selected career choices (max 3)"""
    try:
        from user_database import save_selected_careers
        firebase_uid = data['firebase_uid']
        careers = data['careers'][:3]  # Limit to 3
        
        save_selected_careers(firebase_uid, careers)
        return {"status": "success", "message": f"Saved {len(careers)} career choices"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving career choices: {str(e)}")

@app.get("/api/user/{firebase_uid}/selected-careers")
async def get_user_selected_careers(firebase_uid: str):
    """Get user's saved career choices"""
    try:
        selected_careers_data = get_selected_careers(firebase_uid)
        # Extract just the career titles from the database results
        careers = [career[0] if isinstance(career, (list, tuple)) else career for career in selected_careers_data]
        return {
            "status": "success",
            "careers": careers,
            "count": len(careers)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching selected careers: {str(e)}")

@app.get("/api/mentor/chat/history/{firebase_uid}")
async def get_mentor_chat_history(firebase_uid: str, limit: int = 20):
    """Get user's chat history with AI mentor"""
    try:
        history = get_chat_history(firebase_uid, limit=limit)
        return {
            "status": "success",
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")

# =====================================================
# Career Journey API Endpoints
# =====================================================

@app.post("/api/career-journey/select")
async def select_career_journey(data: Dict):
    """Select a career for the Career Journey (single selection)"""
    try:
        firebase_uid = data['firebase_uid']
        career_slug = data['career_slug']
        career_title = data['career_title']
        
        # First, try exact slug match
        career = get_career_by_slug(career_slug)
        
        # If not found, try fuzzy matching by title
        if not career:
            # Normalize title for better matching
            normalized_title = career_title.lower().strip()
            # Try to find similar careers
            all_careers = get_all_careers()
            matching_career = None
            
            for c in all_careers:
                # Check if title contains the search term or vice versa
                db_title = c.get('title', '').lower()
                if (normalized_title in db_title or db_title in normalized_title or
                    normalized_title.replace(' ', '-') in db_title.replace(' ', '-') or
                    career_slug in c.get('slug', '')):
                    matching_career = c
                    break
            
            if matching_career:
                # Use the matched career from database
                career_slug = matching_career['slug']
                career_title = matching_career['title']
                career = get_career_by_slug(career_slug)
        
        # If still not found, return error
        if not career:
            return {
                "status": "career_not_found",
                "message": f"Career '{career_title}' is not yet available in our database",
                "career_title": career_title,
                "career_slug": career_slug
            }
        
        save_selected_career_journey(firebase_uid, career_slug, career_title)
        return {"status": "success", "message": f"Career journey selected: {career_title}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error selecting career journey: {str(e)}")

@app.post("/api/career/request")
async def request_career_addition(data: Dict):
    """Request admin to add a career that is not in the database"""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        career_title = data.get('career_title', '')
        career_slug = data.get('career_slug', '')
        user_email = data.get('user_email', '')
        user_name = data.get('user_name', 'User')
        firebase_uid = data.get('firebase_uid', '')
        user_message = data.get('message', '')
        
        if not career_title:
            raise HTTPException(status_code=400, detail="Career title is required")
        
        # Save request to database for tracking
        try:
            from database import get_db_connection
            connection = get_db_connection()
            try:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO career_requests (firebase_uid, career_title, career_slug, user_email, user_name, message, status)
                        VALUES (%s, %s, %s, %s, %s, %s, 'pending')
                    """, (firebase_uid, career_title, career_slug, user_email, user_name, user_message))
                    connection.commit()
                    print(f"✅ Career request saved to database: {career_title}")
            except Exception as db_error:
                print(f"⚠️ Could not save career request to database: {db_error}")
                # Continue even if DB save fails - try to create table
                try:
                    with connection.cursor() as cursor:
                        cursor.execute("""
                            CREATE TABLE IF NOT EXISTS career_requests (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                firebase_uid VARCHAR(255) NOT NULL,
                                career_title VARCHAR(255) NOT NULL,
                                career_slug VARCHAR(255),
                                user_email VARCHAR(255),
                                user_name VARCHAR(255),
                                message TEXT,
                                status VARCHAR(50) DEFAULT 'pending',
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                INDEX idx_firebase_uid (firebase_uid),
                                INDEX idx_status (status)
                            )
                        """)
                        connection.commit()
                        # Retry insert
                        cursor.execute("""
                            INSERT INTO career_requests (firebase_uid, career_title, career_slug, user_email, user_name, message, status)
                            VALUES (%s, %s, %s, %s, %s, %s, 'pending')
                        """, (firebase_uid, career_title, career_slug, user_email, user_name, user_message))
                        connection.commit()
                        print(f"✅ Career request saved after table creation: {career_title}")
                except:
                    pass
            finally:
                connection.close()
        except Exception as db_init_error:
            print(f"⚠️ Database connection error: {db_init_error}")
            # Continue with email sending even if DB fails
        
        # Prepare email
        admin_email = "moulik.023@gmail.com"
        subject = f"New Career Request: {career_title}"
        
        # Email body
        email_body = f"""
Hello Admin (moulik.023@gmail.com),

A user has requested to add a new career to the Prism database.

Career Details:
- Career Title: {career_title}
- Career Slug: {career_slug}

User Details:
- Name: {user_name}
- Email: {user_email}
- User ID: {firebase_uid}

User Message:
{user_message if user_message else 'No additional message provided.'}

Please add this career to the database with complete information including:
- Career description
- Roadmap steps (4 detailed steps like Data Science)
- Entrance exams (3-4 relevant exams)
- Educational paths (UG, PG, Certifications)
- Required skills (6-8 skills)
- Job roles (4 levels: Junior → Mid → Senior → Lead)
- Learning resources (courses, books, platforms)

You can use the insert_product_manager_careers.sql file as a template.

Thank you!
Prism Career Guidance System

Note: This email was automatically generated when user attempted to select a career 
that doesn't exist in the database. Career will be automatically added with roadmap 
once you insert the data using the SQL template.
        """
        
        # Send email
        try:
            # Use Gmail SMTP (you may need to configure this based on your email provider)
            smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
            smtp_port = int(os.getenv('SMTP_PORT', '587'))
            smtp_user = os.getenv('SMTP_USER', '')  # Your email
            smtp_password = os.getenv('SMTP_PASSWORD', '')  # App password
            
            # If SMTP credentials are not configured, return error so frontend can use Gmail fallback
            if not smtp_user or not smtp_password:
                print(f"📧 Career Request (Email not configured):")
                print(f"   To: {admin_email}")
                print(f"   Subject: {subject}")
                print(f"   Career: {career_title}")
                print(f"   User: {user_email}")
                print("\n⚠️ Configure SMTP_USER and SMTP_PASSWORD in .env to send emails")
                return {
                    "status": "email_not_configured",
                    "message": "Email service not configured. Please use Gmail compose option.",
                    "career_title": career_title,
                    "career_slug": career_slug,
                    "admin_email": admin_email,
                    "note": "Request saved to database. Please use Gmail to notify admin."
                }
            
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = admin_email
            msg['Subject'] = subject
            msg.attach(MIMEText(email_body, 'plain'))
            
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_user, smtp_password)
            text = msg.as_string()
            server.sendmail(smtp_user, admin_email, text)
            server.quit()
            
            print(f"✅ Email sent to admin for career request: {career_title}")
            
            return {
                "status": "success",
                "message": f"Career request sent to admin. '{career_title}' will be added soon!"
            }
        except Exception as email_error:
            print(f"⚠️ Error sending email: {email_error}")
            # Return error status so frontend can use Gmail fallback
            return {
                "status": "email_failed",
                "message": "Email sending failed. Please use Gmail compose option.",
                "career_title": career_title,
                "career_slug": career_slug,
                "admin_email": admin_email,
                "error": str(email_error),
                "note": "Request saved to database. Please use Gmail to notify admin."
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing career request: {str(e)}")

@app.get("/api/career-journey/{firebase_uid}")
async def get_career_journey(firebase_uid: str):
    """Get user's selected career journey"""
    try:
        selected_career = get_selected_career_journey(firebase_uid)
        if not selected_career:
            return {"status": "not_selected", "career": None, "roadmap_progress": []}
        
        # Get career details
        career = get_career_by_slug(selected_career['career_slug'])
        
        # Get roadmap progress
        roadmap_progress = []
        if career and career.get('id'):
            roadmap_progress = get_roadmap_progress(firebase_uid, career['id'])
            print(f"✅ Loaded roadmap progress for career_id {career['id']}: {len(roadmap_progress)} steps")  # Debug
        
        return {
            "status": "success",
            "career": career,
            "selected_career": selected_career,
            "roadmap_progress": roadmap_progress or []
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching career journey: {str(e)}")

@app.post("/api/career-journey/roadmap/progress")
async def update_roadmap_step(data: Dict):
    """Update roadmap step completion status"""
    try:
        firebase_uid = data['firebase_uid']
        career_id = data['career_id']
        roadmap_stage = data['roadmap_stage']
        roadmap_step_id = data['roadmap_step_id']
        step_title = data.get('step_title', '')
        is_completed = bool(data['is_completed'])  # Ensure boolean
        notes = data.get('notes')
        
        update_roadmap_progress(firebase_uid, career_id, roadmap_stage, 
                               roadmap_step_id, step_title, is_completed, notes)
        
        print(f"✅ API: Roadmap progress updated for {firebase_uid}, career {career_id}, step {roadmap_step_id}: {is_completed}")
        
        return {"status": "success", "message": "Roadmap progress updated"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating roadmap progress: {str(e)}")

@app.get("/api/jobs")
async def get_jobs(career_id: Optional[int] = None, limit: int = 50):
    """Get job listings, optionally filtered by career"""
    try:
        jobs = get_job_listings(career_id=career_id, limit=limit)
        return {"status": "success", "jobs": jobs, "count": len(jobs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching jobs: {str(e)}")

@app.post("/api/jobs/apply")
async def apply_job(data: Dict):
    """Apply to a job"""
    try:
        firebase_uid = data['firebase_uid']
        job_listing_id = data.get('job_listing_id')
        job_title = data.get('job_title')
        company_name = data.get('company_name')
        job_location = data.get('job_location')
        salary_range = data.get('salary_range')
        job_url = data.get('job_url')
        notes = data.get('notes')
        
        apply_to_job(firebase_uid, job_listing_id, job_title, company_name,
                    job_location, salary_range, job_url, notes)
        return {"status": "success", "message": "Job application recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying to job: {str(e)}")

@app.get("/api/jobs/my-applications/{firebase_uid}")
async def get_my_applications(firebase_uid: str):
    """Get user's job applications"""
    try:
        applications = get_user_job_applications(firebase_uid)
        return {"status": "success", "applications": applications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching applications: {str(e)}")

@app.get("/api/jobs/indeed-search")
async def search_indeed_jobs_api(job_title: str, location: str = "India", limit: int = 10):
    """
    Search Indeed.com for jobs based on job title and location.
    
    Args:
        job_title: The job title or keywords to search for (required)
        location: Location to search in (default: "India")
        limit: Maximum number of jobs to return (default: 10, max: 25)
    
    Returns:
        JSON response with job listings from Indeed
    """
    try:
        # Validate inputs
        if not job_title or not job_title.strip():
            raise HTTPException(status_code=400, detail="job_title parameter is required")
        
        # Limit the maximum number of results
        limit = min(limit, 25)
        
        # Search Indeed
        print(f"Searching Indeed for: '{job_title}' in '{location}'")
        jobs = search_indeed_jobs(
            job_title=job_title.strip(),
            location=location.strip() if location else "India",
            limit=limit
        )
        
        print(f"Found {len(jobs)} jobs from Indeed")
        
        # Format jobs for API response
        formatted_jobs = format_indeed_jobs_for_api(jobs, career_title=None)
        
        # If no jobs found, provide helpful message
        if len(formatted_jobs) == 0:
            return {
                "status": "success",
                "source": "Indeed",
                "jobs": [],
                "count": 0,
                "message": f"Indeed job search is currently not implemented. To enable this feature, implement the Indeed scraper or integrate with Indeed API.\n\nRequested search: '{job_title}' in '{location}'",
                "search_params": {
                    "job_title": job_title,
                    "location": location,
                    "limit": limit
                }
            }
        
        return {
            "status": "success",
            "source": "Indeed",
            "jobs": formatted_jobs,
            "count": len(formatted_jobs),
            "search_params": {
                "job_title": job_title,
                "location": location,
                "limit": limit
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error searching Indeed jobs: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
