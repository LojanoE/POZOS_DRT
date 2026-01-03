import psycopg2

# Connection string
DB_URL = "postgresql://postgres.krkoacewzhigjjybgzng:GDR.lsm2026@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

def setup_users():
    try:
        print("Connecting to Supabase...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        print("Creating 'users' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        """)
        
        print("Inserting user GDR...")
        # Upsert user GDR
        cur.execute("""
            INSERT INTO users (username, password) 
            VALUES (%s, %s)
            ON CONFLICT (username) 
            DO UPDATE SET password = EXCLUDED.password;
        """, ('GDR', '123'))
        
        # Also ensure RLS is enabled and allows public read for login (or specific access)
        # For simplicity, we will allow public read on users table to check credentials client-side
        # (Not secure for production, but fits the request context of a simple app)
        cur.execute("ALTER TABLE users ENABLE ROW LEVEL SECURITY;")
        cur.execute("""
            DROP POLICY IF EXISTS "Public Read Users" ON users;
            CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("User 'GDR' created successfully!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    setup_users()
