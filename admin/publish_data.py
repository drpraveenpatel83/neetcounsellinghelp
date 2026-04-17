import json
import os

DB_FILE = "college_master_db.json"
JS_FILE = "../colleges-data.js"

def publish():
    if not os.path.exists(DB_FILE):
        print(f"Error: {DB_FILE} not found. Run import_data.py first.")
        return

    with open(DB_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)

    # Convert the dictionary back into a list of objects
    colleges = list(db.values())
    
    # Optional: we can sort them by state and then by name
    colleges.sort(key=lambda x: (x.get('state', ''), x.get('name', '')))

    js_content = f"const collegeData = {json.dumps(colleges, indent=2)};\n"
    
    with open(JS_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully published {len(colleges)} colleges to {JS_FILE}")

if __name__ == "__main__":
    publish()
