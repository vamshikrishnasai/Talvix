import google.generativeai as genai

KEY = ""

def test():
    try:
        genai.configure(api_key=KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Say 'OK'")
        print(f"RESULT: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test()
