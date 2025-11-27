import os
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime

load_dotenv()

def get_db():
    uri = os.getenv('MONGODB_URI')
    if not uri:
        print("❌ MONGODB_URI not found in .env")
        return None
    try:
        client = MongoClient(uri)
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")
        db = client[os.getenv('DB_NAME', 'prism_careers')]
        print(f"DEBUG: db type: {type(db)}")
        return db
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return None

def seed_data():
    print("DEBUG: Calling get_db()")
    db = get_db()
    print("DEBUG: get_db returned a database object")
    if db is None:
        return

    print("DEBUG: Getting collection...")
    careers_collection = db['careers']
    print(f"DEBUG: Collection: {careers_collection}")
    
    # Clear existing careers
    print("Dropping collection...")
    careers_collection.drop()
    print("🗑️ Cleared existing careers")

    # Define Career Data (Document Structure)
    careers = [
        {
            "slug": "software-engineer",
            "title": "Software Engineer",
            "category": "Technology",
            "short_description": "Design, develop, and maintain software applications and systems.",
            "full_description": "Software Engineers apply engineering principles to the design, development, maintenance, testing, and evaluation of computer software. They work on a wide range of projects, from building web applications and mobile apps to developing operating systems and network control systems.",
            "avg_salary_min": 500000,
            "avg_salary_max": 2500000,
            "growth_prospects": "Excellent",
            "work_environment": "Office/Remote, Collaborative",
            "job_outlook": "High demand globally",
            "entrance_exams": [
                {"exam_name": "JEE Main", "exam_full_name": "Joint Entrance Examination - Main", "exam_level": "UG", "conducting_body": "NTA", "frequency": "Twice a year", "exam_pattern": "MCQs in Physics, Chemistry, Maths", "preparation_time": "1-2 years", "difficulty_level": "High"},
                {"exam_name": "BITSAT", "exam_full_name": "Birla Institute of Technology and Science Admission Test", "exam_level": "UG", "conducting_body": "BITS Pilani", "frequency": "Annual", "exam_pattern": "MCQs in PCM, English, Logical Reasoning", "preparation_time": "1 year", "difficulty_level": "High"},
                {"exam_name": "GATE", "exam_full_name": "Graduate Aptitude Test in Engineering", "exam_level": "PG", "conducting_body": "IITs", "frequency": "Annual", "exam_pattern": "Technical subjects + General Aptitude", "preparation_time": "6-12 months", "difficulty_level": "High"}
            ],
            "educational_paths": [
                {"degree_level": "UG", "degree_name": "B.Tech in Computer Science/IT", "duration": "4 years", "eligibility": "10+2 with PCM", "top_colleges": "IITs, NITs, IIITs, BITS", "specializations": "AI, Web Dev, Cyber Security"},
                {"degree_level": "UG", "degree_name": "BCA (Bachelor of Computer Applications)", "duration": "3 years", "eligibility": "10+2 any stream with Maths", "top_colleges": "Christ University, Loyola College", "specializations": "Application Development"},
                {"degree_level": "PG", "degree_name": "M.Tech in Computer Science", "duration": "2 years", "eligibility": "B.Tech + GATE", "top_colleges": "IITs, NITs, IISc", "specializations": "Data Science, Systems Engineering"}
            ],
            "skills_required": [
                {"skill_name": "Python/Java/C++", "skill_category": "Technical", "importance_level": "Critical", "description": "Core programming languages"},
                {"skill_name": "Data Structures & Algorithms", "skill_category": "Technical", "importance_level": "Critical", "description": "Problem solving foundation"},
                {"skill_name": "System Design", "skill_category": "Technical", "importance_level": "High", "description": "Designing scalable systems"},
                {"skill_name": "Git/GitHub", "skill_category": "Technical", "importance_level": "High", "description": "Version control"},
                {"skill_name": "Communication", "skill_category": "Soft Skill", "importance_level": "Medium", "description": "Team collaboration"}
            ],
            "roadmap": [
                {"stage": "Foundation", "timeline": "Year 1-2", "title": "Learn Basics", "description": "Master a programming language and DSA.", "action_items": "Learn Python/Java, Practice on LeetCode, Build simple CLI apps", "sort_order": 1},
                {"stage": "Development", "timeline": "Year 2-3", "title": "Build Projects", "description": "Create web or mobile applications.", "action_items": "Learn a framework (React/Django), Build a portfolio website, Contribute to Open Source", "sort_order": 2},
                {"stage": "Internship", "timeline": "Year 3-4", "title": "Gain Experience", "description": "Work in a real-world environment.", "action_items": "Apply for internships, Network on LinkedIn, Mock interviews", "sort_order": 3},
                {"stage": "Placement", "timeline": "Year 4", "title": "Job Hunt", "description": "Secure a full-time role.", "action_items": "Prepare resume, Practice system design, Apply to companies", "sort_order": 4}
            ],
            "job_roles": [
                {"role_title": "Junior Software Engineer", "experience_level": "0-2 years", "responsibilities": "Bug fixing, minor features", "salary_range": "₹5-10 LPA"},
                {"role_title": "Senior Software Engineer", "experience_level": "3-6 years", "responsibilities": "System design, mentoring, major features", "salary_range": "₹15-35 LPA"},
                {"role_title": "Tech Lead", "experience_level": "6+ years", "responsibilities": "Architecture, team leadership", "salary_range": "₹35-60+ LPA"}
            ],
            "resources": [
                {"resource_type": "Course", "resource_name": "CS50: Introduction to Computer Science", "provider": "Harvard/edX", "url": "https://cs50.harvard.edu/x/", "description": "Best intro to CS", "is_free": True},
                {"resource_type": "Platform", "resource_name": "LeetCode", "provider": "LeetCode", "url": "https://leetcode.com/", "description": "Practice coding problems", "is_free": True},
                {"resource_type": "Book", "resource_name": "Clean Code", "provider": "Robert C. Martin", "url": "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882", "description": "Best practices for coding", "is_free": False}
            ]
        },
        {
            "slug": "data-scientist",
            "title": "Data Scientist",
            "category": "Technology",
            "short_description": "Analyze complex data to help organizations make better decisions.",
            "full_description": "Data Scientists use scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data. They combine skills from statistics, computer science, and domain expertise.",
            "avg_salary_min": 600000,
            "avg_salary_max": 3000000,
            "growth_prospects": "Very High",
            "work_environment": "Office/Remote, Analytical",
            "job_outlook": "Rapidly growing field",
            "entrance_exams": [
                {"exam_name": "GATE", "exam_full_name": "Graduate Aptitude Test in Engineering", "exam_level": "PG", "conducting_body": "IITs", "frequency": "Annual", "exam_pattern": "Data Science & AI Paper", "preparation_time": "6-12 months", "difficulty_level": "High"},
                {"exam_name": "ISI Admission Test", "exam_full_name": "Indian Statistical Institute Admission Test", "exam_level": "PG", "conducting_body": "ISI", "frequency": "Annual", "exam_pattern": "Mathematics & Statistics", "preparation_time": "1 year", "difficulty_level": "Very High"}
            ],
            "educational_paths": [
                {"degree_level": "UG", "degree_name": "B.Sc in Statistics/Data Science", "duration": "3 years", "eligibility": "10+2 with Maths", "top_colleges": "ISI, CMI, IITs", "specializations": "Statistics, ML"},
                {"degree_level": "PG", "degree_name": "M.Sc/M.Tech in Data Science", "duration": "2 years", "eligibility": "Graduation in relevant field", "top_colleges": "IITs, IISc, ISI", "specializations": "Deep Learning, NLP"}
            ],
            "skills_required": [
                {"skill_name": "Python/R", "skill_category": "Technical", "importance_level": "Critical", "description": "Data analysis languages"},
                {"skill_name": "Statistics & Probability", "skill_category": "Technical", "importance_level": "Critical", "description": "Mathematical foundation"},
                {"skill_name": "Machine Learning", "skill_category": "Technical", "importance_level": "Critical", "description": "Predictive modeling"},
                {"skill_name": "SQL", "skill_category": "Technical", "importance_level": "High", "description": "Data extraction"},
                {"skill_name": "Data Visualization", "skill_category": "Technical", "importance_level": "High", "description": "Presenting insights"}
            ],
            "roadmap": [
                {"stage": "Foundation", "timeline": "Month 0-6", "title": "Math & Code", "description": "Learn Stats and Python.", "action_items": "Complete Stats 101, Learn Python syntax, Pandas/NumPy", "sort_order": 1},
                {"stage": "Core ML", "timeline": "Month 6-12", "title": "Algorithms", "description": "Understand ML algorithms.", "action_items": "Learn Scikit-learn, Implement Linear Regression, Decision Trees", "sort_order": 2},
                {"stage": "Deep Learning", "timeline": "Year 1-2", "title": "Advanced AI", "description": "Neural Networks and beyond.", "action_items": "Learn TensorFlow/PyTorch, Build CNN/RNN models", "sort_order": 3},
                {"stage": "Application", "timeline": "Ongoing", "title": "Real Projects", "description": "Solve real problems.", "action_items": "Kaggle competitions, End-to-end deployment", "sort_order": 4}
            ],
            "job_roles": [
                {"role_title": "Data Analyst", "experience_level": "0-2 years", "responsibilities": "Data cleaning, visualization", "salary_range": "₹4-8 LPA"},
                {"role_title": "Data Scientist", "experience_level": "2-5 years", "responsibilities": "Model building, insights", "salary_range": "₹10-25 LPA"},
                {"role_title": "Principal Data Scientist", "experience_level": "5+ years", "responsibilities": "Strategy, advanced AI", "salary_range": "₹30-50+ LPA"}
            ],
            "resources": [
                {"resource_type": "Course", "resource_name": "Machine Learning Specialization", "provider": "Coursera/Andrew Ng", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "description": "Best ML intro", "is_free": False},
                {"resource_type": "Platform", "resource_name": "Kaggle", "provider": "Google", "url": "https://www.kaggle.com/", "description": "Data Science competitions", "is_free": True}
            ]
        },
        {
            "slug": "product-manager",
            "title": "Product Manager",
            "category": "Business",
            "short_description": "Guide the success of a product and lead the cross-functional team that is responsible for improving it.",
            "full_description": "Product Managers are responsible for the strategy, roadmap, and feature definition for a product or product line. They work with engineering, design, marketing, sales, and support teams.",
            "avg_salary_min": 1000000,
            "avg_salary_max": 4000000,
            "growth_prospects": "High",
            "work_environment": "Office, Collaborative, High-pressure",
            "job_outlook": "Growing demand in tech",
            "entrance_exams": [
                {"exam_name": "CAT", "exam_full_name": "Common Admission Test", "exam_level": "PG", "conducting_body": "IIMs", "frequency": "Annual", "exam_pattern": "Quant, Verbal, DILR", "preparation_time": "6-12 months", "difficulty_level": "Very High"},
                {"exam_name": "GMAT", "exam_full_name": "Graduate Management Admission Test", "exam_level": "PG", "conducting_body": "GMAC", "frequency": "On Demand", "exam_pattern": "Quant, Verbal, IR, AWA", "preparation_time": "3-6 months", "difficulty_level": "High"}
            ],
            "educational_paths": [
                {"degree_level": "PG", "degree_name": "MBA", "duration": "2 years", "eligibility": "Graduation + CAT/GMAT", "top_colleges": "IIMs, ISB, XLRI", "specializations": "Marketing, Strategy, Tech Management"},
                {"degree_level": "Certification", "degree_name": "Product Management Certification", "duration": "3-6 months", "eligibility": "Any Graduate", "top_colleges": "UpGrad, ISB Exec Ed", "specializations": "Product Lifecycle"}
            ],
            "skills_required": [
                {"skill_name": "Strategic Thinking", "skill_category": "Business", "importance_level": "Critical", "description": "Long-term vision"},
                {"skill_name": "User Empathy", "skill_category": "Soft Skill", "importance_level": "Critical", "description": "Understanding user needs"},
                {"skill_name": "Data Analysis", "skill_category": "Technical", "importance_level": "High", "description": "Metrics driven decisions"},
                {"skill_name": "Communication", "skill_category": "Soft Skill", "importance_level": "Critical", "description": "Stakeholder management"},
                {"skill_name": "Agile/Scrum", "skill_category": "Technical", "importance_level": "Medium", "description": "Development process"}
            ],
            "roadmap": [
                {"stage": "Explore", "timeline": "Year 0-1", "title": "Understand Tech & Biz", "description": "Learn how software is built and sold.", "action_items": "Work in support/sales/dev, Read \"Inspired\" by Marty Cagan", "sort_order": 1},
                {"stage": "Transition", "timeline": "Year 1-2", "title": "APM Role", "description": "Associate Product Manager.", "action_items": "Apply for APM programs, Build side projects", "sort_order": 2},
                {"stage": "Growth", "timeline": "Year 2-5", "title": "Product Manager", "description": "Own a feature or product.", "action_items": "Launch features, Improve metrics, Mentor others", "sort_order": 3},
                {"stage": "Leadership", "timeline": "Year 5+", "title": "Group PM / VP", "description": "Manage PMs and Strategy.", "action_items": "Define product vision, Portfolio management", "sort_order": 4}
            ],
            "job_roles": [
                {"role_title": "Associate Product Manager", "experience_level": "0-2 years", "responsibilities": "Feature execution, research", "salary_range": "₹10-18 LPA"},
                {"role_title": "Product Manager", "experience_level": "2-5 years", "responsibilities": "Roadmap ownership, strategy", "salary_range": "₹20-40 LPA"},
                {"role_title": "Director of Product", "experience_level": "8+ years", "responsibilities": "Product line strategy, team mgmt", "salary_range": "₹50-80+ LPA"}
            ],
            "resources": [
                {"resource_type": "Book", "resource_name": "Inspired", "provider": "Marty Cagan", "url": "https://www.amazon.com/INSPIRED-Create-Tech-Products-Customers/dp/1119387507", "description": "PM Bible", "is_free": False},
                {"resource_type": "Community", "resource_name": "The Product Folks", "provider": "Community", "url": "https://www.theproductfolks.com/", "description": "PM Community in India", "is_free": True}
            ]
        },
        {
            "slug": "doctor",
            "title": "Doctor (MBBS)",
            "category": "Healthcare",
            "short_description": "Diagnose and treat illnesses, injuries, and other health conditions.",
            "full_description": "Doctors are medical professionals who diagnose, treat, and prevent illnesses. They may specialize in various fields such as surgery, pediatrics, cardiology, etc. The path is rigorous but offers high respect and stability.",
            "avg_salary_min": 800000,
            "avg_salary_max": 3500000,
            "growth_prospects": "Stable",
            "work_environment": "Hospitals/Clinics, High-stress",
            "job_outlook": "Always in demand",
            "entrance_exams": [
                {"exam_name": "NEET", "exam_full_name": "National Eligibility cum Entrance Test", "exam_level": "UG", "conducting_body": "NTA", "frequency": "Annual", "exam_pattern": "Physics, Chemistry, Biology", "preparation_time": "2 years", "difficulty_level": "Very High"},
                {"exam_name": "NEET PG", "exam_full_name": "National Eligibility cum Entrance Test - PG", "exam_level": "PG", "conducting_body": "NBE", "frequency": "Annual", "exam_pattern": "Medical subjects", "preparation_time": "1 year", "difficulty_level": "High"},
                {"exam_name": "INI-CET", "exam_full_name": "Institute of National Importance Combined Entrance Test", "exam_level": "PG", "conducting_body": "AIIMS", "frequency": "Twice a year", "exam_pattern": "Medical subjects", "preparation_time": "1 year", "difficulty_level": "Very High"}
            ],
            "educational_paths": [
                {"degree_level": "UG", "degree_name": "MBBS", "duration": "5.5 years", "eligibility": "10+2 with PCB + NEET", "top_colleges": "AIIMS, MAMC, CMC Vellore", "specializations": "General Medicine"},
                {"degree_level": "PG", "degree_name": "MD/MS", "duration": "3 years", "eligibility": "MBBS + NEET PG", "top_colleges": "AIIMS, PGI Chandigarh", "specializations": "Cardiology, Neurology, Surgery"}
            ],
            "skills_required": [
                {"skill_name": "Clinical Knowledge", "skill_category": "Technical", "importance_level": "Critical", "description": "Diagnosis and treatment"},
                {"skill_name": "Empathy", "skill_category": "Soft Skill", "importance_level": "Critical", "description": "Patient care"},
                {"skill_name": "Decision Making", "skill_category": "Soft Skill", "importance_level": "Critical", "description": "Critical situations"},
                {"skill_name": "Stamina", "skill_category": "Physical", "importance_level": "High", "description": "Long working hours"},
                {"skill_name": "Continuous Learning", "skill_category": "Soft Skill", "importance_level": "High", "description": "Keeping up with medical advances"}
            ],
            "roadmap": [
                {"stage": "Preparation", "timeline": "Class 11-12", "title": "Crack NEET", "description": "Prepare for medical entrance.", "action_items": "Focus on PCB, Join coaching, Solve mock tests", "sort_order": 1},
                {"stage": "MBBS", "timeline": "5.5 Years", "title": "Medical School", "description": "Complete undergraduate medical education.", "action_items": "Study anatomy/physiology, Clinical rotations, Internship", "sort_order": 2},
                {"stage": "Specialization", "timeline": "3 Years", "title": "Post Graduation", "description": "Pursue MD/MS for specialization.", "action_items": "Crack NEET PG, Choose specialty, Residency", "sort_order": 3},
                {"stage": "Super Specialization", "timeline": "2-3 Years", "title": "DM/MCh", "description": "Become a super-specialist.", "action_items": "Advanced training in specific field", "sort_order": 4}
            ],
            "job_roles": [
                {"role_title": "Junior Resident", "experience_level": "0-3 years", "responsibilities": "Patient care, learning", "salary_range": "₹6-10 LPA"},
                {"role_title": "Senior Resident", "experience_level": "3-6 years", "responsibilities": "Specialized care, teaching", "salary_range": "₹12-18 LPA"},
                {"role_title": "Consultant", "experience_level": "6+ years", "responsibilities": "Independent practice, surgery", "salary_range": "₹20-50+ LPA"}
            ],
            "resources": [
                {"resource_type": "Platform", "resource_name": "Marrow", "provider": "Marrow", "url": "https://www.marrow.com/", "description": "NEET PG Prep", "is_free": False},
                {"resource_type": "Book", "resource_name": "Gray's Anatomy", "provider": "Elsevier", "url": "https://www.amazon.in/Grays-Anatomy-Student-Richard-Drake/dp/0702051314", "description": "Medical Bible", "is_free": False}
            ]
        },
        {
            "slug": "chartered-accountant",
            "title": "Chartered Accountant",
            "category": "Finance",
            "short_description": "Manage finances, audit accounts, and provide financial advice.",
            "full_description": "Chartered Accountants are financial experts who handle auditing, taxation, financial reporting, and corporate finance. It is one of the most prestigious and challenging commerce careers in India.",
            "avg_salary_min": 700000,
            "avg_salary_max": 3000000,
            "growth_prospects": "High",
            "work_environment": "Office, Client-facing",
            "job_outlook": "Stable demand",
            "entrance_exams": [
                {"exam_name": "CA Foundation", "exam_full_name": "CA Foundation Course", "exam_level": "UG", "conducting_body": "ICAI", "frequency": "Twice a year", "exam_pattern": "Accounting, Law, Maths, Economics", "preparation_time": "6 months", "difficulty_level": "Medium"},
                {"exam_name": "CA Intermediate", "exam_full_name": "CA Intermediate Course", "exam_level": "UG", "conducting_body": "ICAI", "frequency": "Twice a year", "exam_pattern": "Accounting, Tax, Audit, FM", "preparation_time": "9 months", "difficulty_level": "High"},
                {"exam_name": "CA Final", "exam_full_name": "CA Final Course", "exam_level": "UG", "conducting_body": "ICAI", "frequency": "Twice a year", "exam_pattern": "Advanced FR, SFM, Audit, Law", "preparation_time": "2-3 years", "difficulty_level": "Very High"}
            ],
            "educational_paths": [
                {"degree_level": "Professional", "degree_name": "CA Course", "duration": "4-5 years", "eligibility": "10+2 any stream", "top_colleges": "ICAI (Distance)", "specializations": "Audit, Taxation, Finance"},
                {"degree_level": "UG", "degree_name": "B.Com (Honours)", "duration": "3 years", "eligibility": "10+2 Commerce", "top_colleges": "SRCC, Loyola, Christ", "specializations": "Accounting, Finance"}
            ],
            "skills_required": [
                {"skill_name": "Accounting", "skill_category": "Technical", "importance_level": "Critical", "description": "Financial reporting"},
                {"skill_name": "Taxation Laws", "skill_category": "Technical", "importance_level": "Critical", "description": "Direct and Indirect Tax"},
                {"skill_name": "Auditing", "skill_category": "Technical", "importance_level": "High", "description": "Verification of books"},
                {"skill_name": "Analytical Skills", "skill_category": "Soft Skill", "importance_level": "High", "description": "Financial analysis"},
                {"skill_name": "Ethics", "skill_category": "Soft Skill", "importance_level": "Critical", "description": "Professional integrity"}
            ],
            "roadmap": [
                {"stage": "Foundation", "timeline": "6 Months", "title": "CA Foundation", "description": "Clear the entrance level.", "action_items": "Register with ICAI, Study 4 papers", "sort_order": 1},
                {"stage": "Intermediate", "timeline": "9 Months", "title": "CA Inter", "description": "Clear Group 1 & 2.", "action_items": "Study 8 papers, IT & OC training", "sort_order": 2},
                {"stage": "Articleship", "timeline": "2 Years", "title": "Practical Training", "description": "Work under a practicing CA.", "action_items": "Gain hands-on experience in Audit/Tax", "sort_order": 3},
                {"stage": "Final", "timeline": "6 Months", "title": "CA Final", "description": "Become a CA.", "action_items": "Clear Final exams, Membership", "sort_order": 4}
            ],
            "job_roles": [
                {"role_title": "Article Assistant", "experience_level": "Student", "responsibilities": "Auditing, Return filing", "salary_range": "Stipend"},
                {"role_title": "Fresher CA", "experience_level": "0-2 years", "responsibilities": "Internal audit, Tax", "salary_range": "₹8-12 LPA"},
                {"role_title": "Senior Associate", "experience_level": "2-5 years", "responsibilities": "Team lead, Client mgmt", "salary_range": "₹15-25 LPA"},
                {"role_title": "Partner/CFO", "experience_level": "10+ years", "responsibilities": "Practice owner / Finance Head", "salary_range": "₹40-80+ LPA"}
            ],
            "resources": [
                {"resource_type": "Organization", "resource_name": "ICAI", "provider": "Institute of Chartered Accountants of India", "url": "https://www.icai.org/", "description": "Official Body", "is_free": True},
                {"resource_type": "Platform", "resource_name": "Unacademy CA", "provider": "Unacademy", "url": "https://unacademy.com/goal/ca-foundation-intermediate/BBKWG", "description": "Online Coaching", "is_free": False}
            ]
        },
        {
            "slug": "digital-marketer",
            "title": "Digital Marketer",
            "category": "Marketing",
            "short_description": "Promote products and services using digital channels.",
            "full_description": "Digital Marketers use online platforms like social media, search engines, email, and websites to connect with customers. They analyze data to optimize campaigns and drive business growth.",
            "avg_salary_min": 350000,
            "avg_salary_max": 1800000,
            "growth_prospects": "Explosive",
            "work_environment": "Agency/In-house/Remote",
            "job_outlook": "High demand",
            "entrance_exams": [
                {"exam_name": "Google Ads Cert", "exam_full_name": "Google Ads Certification", "exam_level": "Certificate", "conducting_body": "Google", "frequency": "On Demand", "exam_pattern": "MCQs on Ad platforms", "preparation_time": "1 month", "difficulty_level": "Low"},
                {"exam_name": "HubSpot Inbound", "exam_full_name": "HubSpot Inbound Marketing", "exam_level": "Certificate", "conducting_body": "HubSpot", "frequency": "On Demand", "exam_pattern": "Content & Strategy", "preparation_time": "2 weeks", "difficulty_level": "Low"}
            ],
            "educational_paths": [
                {"degree_level": "UG", "degree_name": "BBA in Marketing", "duration": "3 years", "eligibility": "10+2 any stream", "top_colleges": "Symbiosis, NMIMS", "specializations": "Digital Marketing"},
                {"degree_level": "PG", "degree_name": "MBA in Marketing", "duration": "2 years", "eligibility": "Graduation", "top_colleges": "MICA, IIMs", "specializations": "Brand Management"},
                {"degree_level": "Certification", "degree_name": "Digital Marketing Course", "duration": "3-6 months", "eligibility": "Any", "top_colleges": "UpGrad, Udacity", "specializations": "SEO, SEM, SMM"}
            ],
            "skills_required": [
                {"skill_name": "SEO/SEM", "skill_category": "Technical", "importance_level": "Critical", "description": "Search engine visibility"},
                {"skill_name": "Content Strategy", "skill_category": "Creative", "importance_level": "High", "description": "Engaging content"},
                {"skill_name": "Data Analytics", "skill_category": "Technical", "importance_level": "High", "description": "Google Analytics"},
                {"skill_name": "Social Media", "skill_category": "Technical", "importance_level": "High", "description": "Platform expertise"},
                {"skill_name": "Copywriting", "skill_category": "Creative", "importance_level": "High", "description": "Persuasive writing"}
            ],
            "roadmap": [
                {"stage": "Learning", "timeline": "Month 0-3", "title": "Basics", "description": "Understand channels.", "action_items": "Learn SEO, Social Media, Email Marketing", "sort_order": 1},
                {"stage": "Practice", "timeline": "Month 3-6", "title": "Portfolio", "description": "Apply skills.", "action_items": "Start a blog, Run small ads, Intern", "sort_order": 2},
                {"stage": "Specialization", "timeline": "Year 1-2", "title": "Expertise", "description": "Master one channel.", "action_items": "Become SEO expert or Paid Ads specialist", "sort_order": 3},
                {"stage": "Strategy", "timeline": "Year 3+", "title": "Leadership", "description": "Manage campaigns.", "action_items": "Head of Marketing, Strategy planning", "sort_order": 4}
            ],
            "job_roles": [
                {"role_title": "Digital Marketing Executive", "experience_level": "0-2 years", "responsibilities": "Social media, content", "salary_range": "₹3-6 LPA"},
                {"role_title": "SEO Specialist", "experience_level": "2-4 years", "responsibilities": "Ranking optimization", "salary_range": "₹6-10 LPA"},
                {"role_title": "Digital Marketing Manager", "experience_level": "5+ years", "responsibilities": "Team lead, Strategy", "salary_range": "₹15-25+ LPA"}
            ],
            "resources": [
                {"resource_type": "Course", "resource_name": "Google Digital Garage", "provider": "Google", "url": "https://learndigital.withgoogle.com/digitalgarage", "description": "Fundamentals", "is_free": True},
                {"resource_type": "Blog", "resource_name": "Moz Blog", "provider": "Moz", "url": "https://moz.com/blog", "description": "SEO Knowledge", "is_free": True}
            ]
        },
        {
            "slug": "civil-services",
            "title": "Civil Services (IAS/IPS)",
            "category": "Government",
            "short_description": "Serve the nation in top administrative and police roles.",
            "full_description": "Civil Servants are the backbone of the Indian administration. They are responsible for implementing government policies, maintaining law and order, and public administration. It is the most prestigious career in India.",
            "avg_salary_min": 600000,
            "avg_salary_max": 2500000,
            "growth_prospects": "Stable",
            "work_environment": "Field/Office, Public Service",
            "job_outlook": "Permanent & Prestigious",
            "entrance_exams": [
                {"exam_name": "UPSC CSE Prelims", "exam_full_name": "Civil Services Preliminary Exam", "exam_level": "National", "conducting_body": "UPSC", "frequency": "Annual", "exam_pattern": "GS + CSAT (MCQs)", "preparation_time": "1 year", "difficulty_level": "Very High"},
                {"exam_name": "UPSC CSE Mains", "exam_full_name": "Civil Services Main Exam", "exam_level": "National", "conducting_body": "UPSC", "frequency": "Annual", "exam_pattern": "9 Descriptive Papers", "preparation_time": "1 year", "difficulty_level": "Extremely High"},
                {"exam_name": "UPSC Interview", "exam_full_name": "Personality Test", "exam_level": "National", "conducting_body": "UPSC", "frequency": "Annual", "exam_pattern": "Oral Interview", "preparation_time": "2 months", "difficulty_level": "Very High"}
            ],
            "educational_paths": [
                {"degree_level": "UG", "degree_name": "Any Graduation", "duration": "3-4 years", "eligibility": "10+2 any stream", "top_colleges": "DU, JNU, Any recognized uni", "specializations": "Humanities helps in GS"}
            ],
            "skills_required": [
                {"skill_name": "General Awareness", "skill_category": "Knowledge", "importance_level": "Critical", "description": "Current affairs"},
                {"skill_name": "Analytical Ability", "skill_category": "Cognitive", "importance_level": "Critical", "description": "Policy analysis"},
                {"skill_name": "Decision Making", "skill_category": "Soft Skill", "importance_level": "Critical", "description": "Administrative decisions"},
                {"skill_name": "Communication", "skill_category": "Soft Skill", "importance_level": "High", "description": "Public speaking"},
                {"skill_name": "Ethics & Integrity", "skill_category": "Attribute", "importance_level": "Critical", "description": "Public service values"}
            ],
            "roadmap": [
                {"stage": "Foundation", "timeline": "Year 1", "title": "NCERTs & Basics", "description": "Build strong base.", "action_items": "Read NCERTs 6-12, Read Newspaper daily", "sort_order": 1},
                {"stage": "Advanced", "timeline": "Year 2", "title": "Standard Books", "description": "Deep dive into subjects.", "action_items": "Read Laxmikanth (Polity), Spectrum (History)", "sort_order": 2},
                {"stage": "Practice", "timeline": "6 Months", "title": "Mock Tests", "description": "Test your knowledge.", "action_items": "Join Test Series, Answer Writing practice", "sort_order": 3},
                {"stage": "Selection", "timeline": "Exam Cycle", "title": "The Exam", "description": "Clear 3 stages.", "action_items": "Prelims -> Mains -> Interview", "sort_order": 4}
            ],
            "job_roles": [
                {"role_title": "SDM / ASP", "experience_level": "Entry (Probation)", "responsibilities": "Sub-division admin", "salary_range": "₹56,100 + Allowances"},
                {"role_title": "District Collector / SP", "experience_level": "Mid Level", "responsibilities": "District administration", "salary_range": "₹78,800 + Allowances"},
                {"role_title": "Cabinet Secretary", "experience_level": "Top Level", "responsibilities": "Highest civil servant", "salary_range": "₹2,50,000 + Allowances"}
            ],
            "resources": [
                {"resource_type": "Newspaper", "resource_name": "The Hindu / Indian Express", "provider": "News", "url": "https://www.thehindu.com/", "description": "Daily Current Affairs", "is_free": False},
                {"resource_type": "Website", "resource_name": "Mrunal.org", "provider": "Mrunal Patel", "url": "https://mrunal.org/", "description": "Economics & GS", "is_free": True}
            ]
        }
    ]

    print(f"Attempting to insert {len(careers)} careers...")
    
    success_count = 0
    for i, career in enumerate(careers):
        try:
            print(f"Inserting [{i+1}/{len(careers)}]: {career.get('title', 'Unknown')}")
            careers_collection.insert_one(career)
            success_count += 1
            print("✅ Success")
        except Exception as e:
            print(f"❌ Failed to insert {career.get('title')}: {e}")
            import traceback
            traceback.print_exc()
            
    print(f"\nSummary: {success_count}/{len(careers)} careers inserted.")

if __name__ == "__main__":
    seed_data()
