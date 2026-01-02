#!/usr/bin/env python3
"""
Setup Supabase database table for Generator Test results
"""
import os
from supabase import create_client, Client

# Get Supabase credentials from environment
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set")
    exit(1)

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL to create the test_results table
create_table_sql = """
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  performance_level TEXT NOT NULL,
  self_evaluation TEXT NOT NULL,
  assessment TEXT NOT NULL,
  detailed_results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_results_email ON test_results(applicant_email);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date DESC);
"""

try:
    # Execute the SQL
    response = supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
    print("✅ Successfully created test_results table in Supabase")
    print(f"Response: {response}")
except Exception as e:
    print(f"❌ Error creating table: {e}")
    print("\nNote: You may need to create the table manually in the Supabase dashboard")
    print("or use the SQL editor with the schema.sql file")
