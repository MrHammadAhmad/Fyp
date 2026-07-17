import sqlite3
conn = sqlite3.connect('e:/Backend,Frontend/Backend/backend/supabase_local.db')
print(conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='SupportTickets'").fetchall())
