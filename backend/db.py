import sqlite3

DB_NAME = "cases.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    # USERS
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    reset_token TEXT,
    reset_expiry TEXT
)
    """)

    # CASES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        case_id TEXT PRIMARY KEY,
        user_id INTEGER,
        url TEXT,
        probability REAL,
        decision TEXT,
        risk_level TEXT,
        reasons TEXT,
        explanation TEXT,
        features TEXT,
        created_at TEXT
    )
    """)

    conn.commit()
    conn.close()
