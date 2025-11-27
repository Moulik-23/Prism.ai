from dotenv import load_dotenv
import os
from pathlib import Path

# Try loading from current directory
print(f"Current working directory: {os.getcwd()}")
print(f"File location: {__file__}")

env_path = Path(__file__).parent / '.env'
print(f"Looking for .env at: {env_path}")
print(f"Does .env exist? {env_path.exists()}")

if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        print(f"First 20 chars of .env: {f.read(20)}")

load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GOOGLE_API_KEY")
print(f"GOOGLE_API_KEY found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"Key starts with: {api_key[:5]}")
