from google import genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
# Using 2.0-flash as it's likely similar to 2.5 but maybe better quota
model_id = 'gemini-2.0-flash' 
prompt = "Generate 2 interview questions for a React Developer. Return JSON list: [{'question': 'string'}]"

try:
    print(f"Calling {model_id}...")
    response = client.models.generate_content(model=model_id, contents=prompt)
    print("SUCCESS")
    print(f"Text: {response.text}")
except Exception as e:
    print(f"Error: {e}")
