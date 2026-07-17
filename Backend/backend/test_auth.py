import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.services.supabase_db import supabase

print(dir(supabase.auth))
