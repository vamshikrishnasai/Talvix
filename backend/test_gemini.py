from google import genai
import os
from dotenv import load_dotenv
import json

load_dotenv(override=True)

def test_ai():
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    model_name = 'gemini-2.5-flash' # The model ID the user wants
    prompt = "Generate 2 interview questions for a React Developer. Return JSON list: [{'question': 'string'}]"
    
    try:
        print(f"Calling model {model_name}...")
        response = client.models.generate_content(model=model_name, contents=prompt)
        print("Response received.")
        print(f"Raw response text: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai()
