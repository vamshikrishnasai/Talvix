import sqlite3

def log_emails():
    conn = sqlite3.connect('career_assistant.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, email FROM users")
    with open('users_debug.txt', 'w') as f:
        for row in cursor.fetchall():
            f.write(f"ID={row[0]} EMAIL={repr(row[1])}\n")
    conn.close()

if __name__ == "__main__":
    log_emails()
