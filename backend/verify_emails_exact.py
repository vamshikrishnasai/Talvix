import sqlite3

def check_one():
    conn = sqlite3.connect('career_assistant.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, email FROM users")
    for row in cursor.fetchall():
        id_val, email = row
        print(f"ID={id_val} EMAIL={repr(email)}")
    conn.close()

if __name__ == "__main__":
    check_one()
