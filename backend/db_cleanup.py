import sqlite3

def clean_all():
    conn = sqlite3.connect('career_assistant.db')
    cursor = conn.cursor()
    
    # Fix vamshiprog77@gmail (missing .com)
    cursor.execute("UPDATE users SET email = 'vamshiprog77@gmail.com' WHERE email = 'vamshiprog77@gmail'")
    print(f"Fixed {cursor.rowcount} for vamshiprog77")
    
    # Check for other partial gmail addresses if any
    cursor.execute("UPDATE users SET email = email || '.com' WHERE email LIKE '%@gmail' AND email NOT LIKE '%.com'")
    print(f"Fixed {cursor.rowcount} more generic gmail typos")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    clean_all()
