import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def list_all():
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)
    try:
        for m in genai.list_models():
            print(m.name)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_all()
