-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  branch TEXT NOT NULL,
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

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_results_email ON test_results(applicant_email);

-- Create index on test_date for sorting
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date DESC);
