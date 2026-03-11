import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def check_flash():
    api_key = os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=api_key)
    print("Checking for flash models...")
    found = False
    try:
        for m in genai.list_models():
            if 'flash' in m.name.lower():
                print(f"FOUND FLASH: {m.name}")
                found = True
        if not found:
            print("No flash models found at all.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_flash()
