from flask import Flask, request, jsonify, send_file
import psycopg2
import os
import json

app = Flask(__name__)

# Connection string
DB_URL = "postgresql://postgres.krkoacewzhigjjybgzng:GDR.lsm2026@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/api/inspection/<date_str>', methods=['GET'])
def get_inspection(date_str):
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Query to find inspection by date
        query = """
            SELECT day_shift_person, night_shift_person, day_remarks, night_remarks, checklist_data 
            FROM inspections 
            WHERE inspection_date = %s
        """
        cur.execute(query, (date_str,))
        row = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if row:
            return jsonify({
                "found": True,
                "data": {
                    "dayPerson": row[0],
                    "nightPerson": row[1],
                    "dayRemarks": row[2],
                    "nightRemarks": row[3],
                    "checklist": row[4]
                }
            })
        else:
            return jsonify({"found": False})

    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"found": False, "error": str(e)}), 500

@app.route('/api/save', methods=['POST'])
def save_inspection():
    try:
        data = request.json
        
        # Extract fields
        inspection_date = data.get('date')
        day_person = data.get('dayPerson')
        night_person = data.get('nightPerson')
        day_remarks = data.get('dayRemarks')
        night_remarks = data.get('nightRemarks')
        checklist = json.dumps(data.get('checklist'))

        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Check if record exists
        check_query = "SELECT id FROM inspections WHERE inspection_date = %s"
        cur.execute(check_query, (inspection_date,))
        existing_id = cur.fetchone()
        
        if existing_id:
            # Update
            update_query = """
                UPDATE inspections 
                SET day_shift_person = %s, 
                    night_shift_person = %s, 
                    day_remarks = %s, 
                    night_remarks = %s, 
                    checklist_data = %s
                WHERE inspection_date = %s
            """
            cur.execute(update_query, (day_person, night_person, day_remarks, night_remarks, checklist, inspection_date))
            message = "Datos actualizados exitosamente"
        else:
            # Insert
            insert_query = """
                INSERT INTO inspections 
                (inspection_date, day_shift_person, night_shift_person, day_remarks, night_remarks, checklist_data)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cur.execute(insert_query, (inspection_date, day_person, night_person, day_remarks, night_remarks, checklist))
            message = "Datos guardados exitosamente"
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"success": True, "message": message}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
