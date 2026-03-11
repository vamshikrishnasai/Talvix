import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def test_old_sdk():
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    # The models in the list command were 'models/gemini-2.5-flash' etc.
    # In old SDK, we usually use just 'gemini-1.5-flash' or 'gemini-pro'
    model = genai.GenerativeModel('gemini-2.5-flash')
    try:
        print("Calling gemini-1.5-flash (old SDK)...")
        response = model.generate_content("Hi")
        print(f"SUCCESS: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_old_sdk()
