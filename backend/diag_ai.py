import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(override=True)

def diag():
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)
    try:
        print("Listing models...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"Model: {m.name}")
        
        print("\nSending test prompt...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hi")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"DIAG ERROR: {e}")

if __name__ == "__main__":
    diag()
