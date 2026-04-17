import json

DB_FILE = "college_master_db.json"

def main():
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)

    count = 0
    for cid, c in db.items():
        if c.get('course') == 'AYUSH':
            name_lower = c.get('name', '').lower()
            sub_course = 'AYUSH' # default
            if 'ayurved' in name_lower or 'bams' in name_lower:
                sub_course = 'BAMS'
            elif 'homoeopath' in name_lower or 'homeopath' in name_lower or 'bhms' in name_lower:
                sub_course = 'BHMS'
            elif 'unani' in name_lower or 'bums' in name_lower:
                sub_course = 'BUMS'
            elif 'siddha' in name_lower or 'bsms' in name_lower:
                sub_course = 'BSMS'
                
            c['sub_course'] = sub_course
            count += 1
            
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)
        
    print(f"Updated {count} AYUSH colleges with sub-courses.")

if __name__ == "__main__":
    main()
