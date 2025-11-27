import os
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId

load_dotenv()

# Global client to reuse connection
client = None

def get_db_connection():
    """Create and return a database connection"""
    global client
    if client is None:
        uri = os.getenv('MONGODB_URI')
        if not uri:
            raise ValueError("MONGODB_URI not found in environment variables")
        client = MongoClient(uri)
    
    db_name = os.getenv('DB_NAME', 'prism_careers')
    return client[db_name]

def get_career_by_slug(slug: str):
    """Fetch complete career details by slug"""
    db = get_db_connection()
    careers_collection = db['careers']
    
    # Find career by slug
    career = careers_collection.find_one({"slug": slug})
    
    if not career:
        return None
    
    # Convert ObjectId to string
    if '_id' in career:
        career['id'] = str(career['_id'])
        del career['_id']
    
    # In MongoDB, related data is embedded, so we just return the document
    # If data was normalized, we would fetch from other collections here
    # But for this migration, we will assume a denormalized/embedded structure for simplicity and performance
    
    return career

def get_all_careers():
    """Fetch all careers with basic info"""
    db = get_db_connection()
    careers_collection = db['careers']
    
    # Fetch all careers, projecting only necessary fields
    cursor = careers_collection.find(
        {}, 
        {
            "slug": 1, "title": 1, "category": 1, "short_description": 1,
            "avg_salary_min": 1, "avg_salary_max": 1, "popular_exams": 1
        }
    ).sort("title", 1)
    
    careers = []
    for career in cursor:
        # Format salary
        if career.get('avg_salary_min') and career.get('avg_salary_max'):
            min_lpa = career['avg_salary_min'] // 100000
            max_lpa = career['avg_salary_max'] // 100000
            career['avg_salary'] = f"₹{min_lpa}-{max_lpa} LPA"
        else:
            career['avg_salary'] = "Varies"
            
        # Ensure popular_exams is a list of strings
        if 'popular_exams' not in career:
             # Try to fetch from embedded entrance_exams if popular_exams not explicitly set
             if 'entrance_exams' in career:
                 career['popular_exams'] = [exam['exam_name'] for exam in career['entrance_exams'][:5]]
             else:
                 career['popular_exams'] = []
        
        if '_id' in career:
            del career['_id']
            
        careers.append(career)
            
    return careers

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from career title"""
    import re
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)  # Replace non-alphanumeric with hyphens
    slug = re.sub(r'^-+|-+$', '', slug)  # Remove leading/trailing hyphens
    return slug

def create_or_update_career_from_assessment(career_data: dict):
    """
    Automatically create or update a career in the database from assessment recommendations.
    """
    db = get_db_connection()
    careers_collection = db['careers']
    
    try:
        # Generate slug from title
        title = career_data.get('title', '').strip()
        if not title:
            return None
            
        slug = generate_slug(title)
        
        # Extract salary range
        salary_min = None
        salary_max = None
        salary_range = career_data.get('salary_range', '')
        if salary_range:
            import re
            numbers = re.findall(r'\d+', salary_range.replace(',', ''))
            if len(numbers) >= 2:
                try:
                    salary_min = int(numbers[0]) * 100000
                    salary_max = int(numbers[1]) * 100000
                except:
                    pass
            elif len(numbers) == 1:
                try:
                    salary_min = int(numbers[0]) * 100000
                    salary_max = int(numbers[0]) * 150000
                except:
                    pass
        
        # Determine category
        description = career_data.get('description', '').lower()
        title_lower = title.lower()
        category = 'Technology'
        if any(word in title_lower or word in description for word in ['business', 'manager', 'analyst', 'consultant', 'marketing', 'sales', 'finance', 'accounting']):
            category = 'Business'
        elif any(word in title_lower or word in description for word in ['doctor', 'medical', 'health', 'nurse', 'pharmacy']):
            category = 'Healthcare'
        elif any(word in title_lower or word in description for word in ['engineer', 'mechanical', 'civil', 'electrical']):
            category = 'Engineering'
        elif any(word in title_lower or word in description for word in ['teacher', 'professor', 'education', 'academic']):
            category = 'Education'
        elif any(word in title_lower or word in description for word in ['art', 'design', 'creative', 'writer']):
            category = 'Arts'
        
        short_desc = career_data.get('description', title)[:200]
        full_desc = career_data.get('description', title)
        
        # Prepare document
        career_doc = {
            "slug": slug,
            "title": title,
            "category": category,
            "short_description": short_desc,
            "full_description": full_desc,
            "avg_salary_min": salary_min,
            "avg_salary_max": salary_max,
            "growth_prospects": career_data.get('growth_prospects'),
            "updated_at": "CURRENT_TIMESTAMP" # In real app use datetime.now()
        }
        
        # Check if exists
        existing = careers_collection.find_one({"slug": slug})
        
        if existing:
            # Update
            careers_collection.update_one(
                {"slug": slug},
                {"$set": career_doc}
            )
            career_id = str(existing['_id'])
            print(f"✅ Updated existing career: {title} (slug: {slug})")
        else:
            # Insert
            # Add default empty lists for embedded structures
            career_doc.update({
                "entrance_exams": [],
                "educational_paths": [],
                "skills_required": [],
                "roadmap": [],
                "job_roles": [],
                "resources": []
            })
            result = careers_collection.insert_one(career_doc)
            career_id = str(result.inserted_id)
            print(f"✅ Created new career: {title} (slug: {slug})")
        
        # If new or updated, we should ideally generate the roadmap etc.
        # For MongoDB, we'll just ensure the structure exists
        if not existing:
             # We could call a helper to populate default roadmap here
             pass
             
        return career_id
            
    except Exception as e:
        print(f"⚠️ Error creating/updating career '{title}': {e}")
        import traceback
        traceback.print_exc()
        return None
