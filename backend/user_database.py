import os
from datetime import datetime
from database import get_db_connection
from pymongo import DESCENDING

def create_or_update_user_profile(firebase_uid, email, display_name=None):
    """Create or update user profile in MongoDB"""
    db = get_db_connection()
    users = db['users']
    
    user_data = {
        "firebase_uid": firebase_uid,
        "email": email,
        "last_login": datetime.now()
    }
    
    if display_name:
        user_data["display_name"] = display_name
        
    users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": user_data},
        upsert=True
    )
    return True

def save_assessment_data(firebase_uid, answers, results):
    """Save assessment results to MongoDB"""
    db = get_db_connection()
    assessments = db['assessments']
    
    assessment_doc = {
        "firebase_uid": firebase_uid,
        "answers": answers,
        "results": results,
        "created_at": datetime.now()
    }
    
    assessments.insert_one(assessment_doc)
    
    # Also update user profile with latest assessment summary if needed
    return True

def get_user_progress(firebase_uid):
    """Get user progress stats"""
    db = get_db_connection()
    
    # Count assessments
    assessment_count = db['assessments'].count_documents({"firebase_uid": firebase_uid})
    
    # Get selected careers count
    user = db['users'].find_one({"firebase_uid": firebase_uid})
    saved_careers_count = len(user.get('selected_careers', [])) if user else 0
    
    # Calculate profile completion (mock logic)
    profile_completion = 20
    if assessment_count > 0: profile_completion += 40
    if saved_careers_count > 0: profile_completion += 20
    
    return {
        "assessments_completed": assessment_count,
        "careers_explored": saved_careers_count, # Using saved careers as proxy
        "profile_completion": profile_completion,
        "next_milestone": "Complete Career Roadmap"
    }

def get_user_recent_activity(firebase_uid, limit=5):
    """Get recent activity for dashboard"""
    db = get_db_connection()
    
    activities = []
    
    # Get recent assessments
    recent_assessments = db['assessments'].find(
        {"firebase_uid": firebase_uid}
    ).sort("created_at", DESCENDING).limit(limit)
    
    for assessment in recent_assessments:
        activities.append({
            "type": "assessment",
            "title": "Career Assessment",
            "date": assessment['created_at'].strftime("%Y-%m-%d"),
            "description": "Completed career assessment"
        })
        
    return activities[:limit]

def save_chat_message(firebase_uid, message, response):
    """Save chat history"""
    db = get_db_connection()
    chats = db['chat_history']
    
    chat_doc = {
        "firebase_uid": firebase_uid,
        "message": message,
        "response": response,
        "timestamp": datetime.now()
    }
    
    chats.insert_one(chat_doc)
    return True

def get_chat_history(firebase_uid, limit=20):
    """Get chat history"""
    db = get_db_connection()
    chats = db['chat_history'].find(
        {"firebase_uid": firebase_uid}
    ).sort("timestamp", DESCENDING).limit(limit)
    
    history = []
    for chat in chats:
        history.append({
            "message": chat['message'],
            "response": chat['response'],
            "timestamp": chat['timestamp'].isoformat()
        })
    
    return list(reversed(history)) # Return in chronological order

def track_career_exploration(firebase_uid, career_slug):
    """Track that a user viewed a career"""
    # In a real app, we might log this to an analytics collection
    pass

def get_latest_assessment_results(firebase_uid):
    """Get the most recent assessment result"""
    db = get_db_connection()
    assessment = db['assessments'].find_one(
        {"firebase_uid": firebase_uid},
        sort=[("created_at", DESCENDING)]
    )
    
    if assessment and 'results' in assessment:
        return assessment['results']
    return None

def get_user_context(firebase_uid):
    """Get context for AI mentor"""
    latest_results = get_latest_assessment_results(firebase_uid)
    
    context = {
        "assessment_completed": False,
        "career_matches": [],
        "skills_to_develop": [],
        "selected_careers": []
    }
    
    if latest_results:
        context["assessment_completed"] = True
        context["career_matches"] = latest_results.get('careerPaths', [])
        context["skills_to_develop"] = latest_results.get('skillsGap', [])
        
    return context

def save_selected_career_journey(firebase_uid, career_slug, career_title):
    """Save selected career journey"""
    db = get_db_connection()
    users = db['users']
    
    users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": {
            "current_journey": {
                "slug": career_slug,
                "title": career_title,
                "selected_at": datetime.now()
            }
        }}
    )
    return True

def get_selected_career_journey(firebase_uid):
    """Get selected career journey"""
    db = get_db_connection()
    user = db['users'].find_one({"firebase_uid": firebase_uid})
    
    if user and 'current_journey' in user:
        return user['current_journey']
    return None

def update_roadmap_progress(firebase_uid, career_slug, step_id, status):
    """Update progress on a roadmap step"""
    db = get_db_connection()
    users = db['users']
    
    # Store progress in a nested object: roadmap_progress.career_slug.step_id = status
    key = f"roadmap_progress.{career_slug}.{step_id}"
    
    users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": {key: status}}
    )
    return True

def get_roadmap_progress(firebase_uid, career_slug):
    """Get progress for a specific career roadmap"""
    db = get_db_connection()
    user = db['users'].find_one({"firebase_uid": firebase_uid})
    
    if user and 'roadmap_progress' in user and career_slug in user['roadmap_progress']:
        return user['roadmap_progress'][career_slug]
    return {}

def get_job_listings(career_slug):
    """Mock job listings"""
    return []

def apply_to_job(firebase_uid, job_id, job_data):
    """Mock job application"""
    return {"status": "success"}

def get_user_job_applications(firebase_uid):
    """Mock applications"""
    return []

def save_selected_careers(firebase_uid, careers):
    """Save list of selected careers"""
    db = get_db_connection()
    users = db['users']
    
    users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": {"selected_careers": careers}}
    )
    return True

def get_selected_careers(firebase_uid):
    """Get list of selected careers"""
    db = get_db_connection()
    user = db['users'].find_one({"firebase_uid": firebase_uid})
    
    if user and 'selected_careers' in user:
        return user['selected_careers']
    return []
