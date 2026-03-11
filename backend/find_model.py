import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def find_working_model():
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)
    
    # Preferred models in order
    preferred = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.0-pro',
        'gemini-pro'
    ]
    
    available = []
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available.append(m.name.replace('models/', ''))
    except Exception as e:
        print(f"List failed: {e}")
        return

    print(f"Available models: {available}")
    
    for p in preferred:
        if p in available:
            print(f"SUCCESS: Found preferred model {p}")
            return p
            
    if available:
        print(f"FALLBACK: Using first available model {available[0]}")
        return available[0]
    
    print("CRITICAL: No models available.")
    return None

if __name__ == "__main__":
    find_working_model()
