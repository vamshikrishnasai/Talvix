import sqlite3

def check_db():
    conn = sqlite3.connect('career_assistant.db')
    cursor = conn.cursor()
    
    tables = ['users', 'resumes']
    for table in tables:
        print(f"--- Table: {table} ---")
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        for col in columns:
            print(col[1])
    
    conn.close()

if __name__ == "__main__":
    check_db()
