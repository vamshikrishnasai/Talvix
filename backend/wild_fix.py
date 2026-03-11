import sqlite3

def fix_it():
    conn = sqlite3.connect('career_assistant.db')
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET email = 'vamshiprog77@gmail.com' WHERE email LIKE 'vamshiprog77%'")
    print(f"Update 1 result: {cursor.rowcount}")
    
    cursor.execute("UPDATE users SET email = 'varun5757@gmail.com' WHERE email LIKE 'varun5757%'")
    print(f"Update 2 result: {cursor.rowcount}")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_it()
