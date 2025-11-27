"""
ASGI entry point for uvicorn.
This file allows the app to be imported as 'app:app' for compatibility.
"""
import sys
import os

# Ensure we're importing from the current directory
sys.path.insert(0, os.path.dirname(__file__))

# Import the app from main.py
from main import app

# Alias app as main to support 'uvicorn app:main'
main = app

__all__ = ['app', 'main']

