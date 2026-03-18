import os
from google import genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

print("Checking model 2.5-flash...")
try:
    res = client.models.generate_content(model='gemini-2.5-flash', contents="hi")
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
