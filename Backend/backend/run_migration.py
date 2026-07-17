"""
Migration: Creates Memberships, PayoutAccounts, ManualCharges, Withdrawals tables
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(__file__))

from app.services.supabase_db import supabase_admin

TABLES = ["Memberships", "PayoutAccounts", "ManualCharges", "Withdrawals"]

missing = []
for table_name in TABLES:
    try:
        supabase_admin.table(table_name).select("id").limit(1).execute()
        print(f"[OK] Table '{table_name}' exists.")
    except Exception as e:
        msg = str(e).lower()
        if "does not exist" in msg or "42p01" in msg or "relation" in msg or "undefined" in msg:
            print(f"[MISSING] Table '{table_name}' does not exist yet.")
            missing.append(table_name)
        else:
            print(f"[EXISTS?] Table '{table_name}' responded: {str(e)[:80]}")

print()
if missing:
    print("RESULT: Missing tables:", missing)
    print("You MUST run the SQL in Supabase SQL Editor to create them.")
    print("File: migrations/create_memberships_and_payout_tables.sql")
else:
    print("RESULT: All tables exist! Migration already applied.")
