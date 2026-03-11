import sqlite3

def fix_emails():
    conn = sqlite3.connect('career_assistant.db')
    cursor = conn.cursor()
    
    print("Fixing emails...")
    cursor.execute("UPDATE users SET email = 'varun5757@gmail.com' WHERE email = 'varun5757@gmail'")
    conn.commit()
    print(f"Updated {cursor.rowcount} rows.")
    
    conn.close()

if __name__ == "__main__":
    fix_emails()
