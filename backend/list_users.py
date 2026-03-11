import sqlite3

def list_users():
    conn = sqlite3.connect('career_assistant.db')
    cursor = conn.cursor()
    
    print("--- Users in Database ---")
    cursor.execute("SELECT id, email, full_name FROM users")
    users = cursor.fetchall()
    for user in users:
        print(f"ID: {user[0]}, Email: {user[1]}, Name: {user[2]}")
    
    conn.close()

if __name__ == "__main__":
    list_users()
