"""
Stub implementation for Indeed job scraper.
This module provides placeholder functions to maintain API compatibility.
For production, implement actual Indeed scraping or use Indeed API.
"""

from typing import List, Dict, Optional


def search_indeed_jobs(job_title: str, location: str = "India", limit: int = 10) -> List[Dict]:
    """
    Stub function for Indeed job search.
    
    Args:
        job_title: The job title or keywords to search for
        location: Location to search in
        limit: Maximum number of jobs to return
    
    Returns:
        Empty list (stub implementation)
    """
    # Stub implementation - returns empty list
    # In production, implement actual Indeed scraping or use Indeed API
    print(f"⚠️ Indeed scraper not implemented. Search requested: '{job_title}' in '{location}'")
    return []


def format_indeed_jobs_for_api(jobs: List[Dict], career_title: Optional[str] = None) -> List[Dict]:
    """
    Format job listings for API response.
    
    Args:
        jobs: List of job dictionaries
        career_title: Optional career title for context
    
    Returns:
        Formatted list of job dictionaries
    """
    # Stub implementation - returns empty list
    return []


