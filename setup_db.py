import psycopg2

# Connection details
# Note: The password was provided as [GDR.lsm2026]. I am assuming the brackets are part of the password.
# If connection fails, it might be because the brackets were indicating a placeholder.
DB_URL = "postgresql://postgres.krkoacewzhigjjybgzng:GDR.lsm2026@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

CREATE_TABLE_QUERY = """
CREATE TABLE IF NOT EXISTS inspections (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    inspection_date DATE NOT NULL,
    day_shift_person TEXT,
    night_shift_person TEXT,
    day_remarks TEXT,
    night_remarks TEXT,
    checklist_data JSONB
);
"""

def setup_database():
    try:
        print("Connecting to Supabase...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        print("Creating 'inspections' table if it doesn't exist...")
        cur.execute(CREATE_TABLE_QUERY)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Database setup completed successfully!")
        
    except Exception as e:
        print(f"Error setting up database: {e}")

if __name__ == "__main__":
    setup_database()
