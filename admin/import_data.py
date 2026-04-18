import os
import json
import csv
import re

DB_FILE = "college_master_db.json"
JS_FILE = "../colleges-data.js"
NMC_CSV = "../nmc mbbs .csv"
BAMS_CSV = "../List of Permitted Ayurveda Colleges for the A.Y. 2024-25 as on 05.02.2026.csv"
BHMS_CSV = "../homepathy.csv"
BUMS_CSV = "../List of total Unani colleges across country as on 29.08.2025.csv"
BSMS_CSV = "../List of total Siddha Colleges across country as on 29.08.2025.csv"

def init_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_db(db):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)

def generate_id(state, name):
    base = f"{state}_{name}"
    return re.sub(r'[^a-z0-9]', '', base.lower())

def clean_college_name(name, state=""):
    name = str(name).replace('\n', ' ').strip()
    name = re.sub(r'\b\d{6}\b', '', name)
    
    split_words = [
        " At.", " at ", ", At ", " A/P", " Village", " Vill.", ", P.O", ", Post", 
        ", Taluka", ", Tal.", ", Taluk", ", Tq", ", Tehsil", ", Teh.", 
        ", Dist.", ", Distt.", ", District", ", Near", ", Opp.", " - 4", 
        " - 5", " - 6", " - 7", " - 8"
    ]
    
    # Extra splits specific to standard formats
    for word in split_words:
        if word.lower() in name.lower():
            idx = name.lower().find(word.lower())
            if idx > 0:
                name = name[:idx]
                
    if state and state.lower() in name.lower() and name.lower().endswith(state.lower()):
        idx = name.lower().rfind(state.lower())
        if idx > 0:
            name = name[:idx]
            
    return name.strip(' ,-')

def determine_mbbs_filter_type(mgt_str, name):
    mgt_str = str(mgt_str).lower()
    name_lower = str(name).lower()
    if "aiims" in name_lower or "all india institute" in name_lower:
        return "AIIMS"
    elif "central university" in name_lower or "bhu" in name_lower or "amu" in name_lower or "aligarh muslim university" in name_lower or "banaras hindu" in name_lower:
        return "Central University"
    elif 'deemed' in mgt_str or 'deemed' in name_lower:
        return 'Deemed'
    elif 'govt' in mgt_str or 'government' in mgt_str:
        return 'Govt'
    else:
        return 'Private'

def determine_ayush_filter_type(mgt_str, name):
    mgt_str = str(mgt_str).lower()
    name_lower = str(name).lower()
    if "central university" in name_lower or "national institute" in mgt_str or "national institute" in name_lower:
        return "Central University"
    elif 'deemed' in mgt_str:
        return 'Deemed'
    elif 'govt. aided' in mgt_str or 'government aided' in mgt_str or 'grant-in-aid' in mgt_str or 'aided' in mgt_str:
        return 'Govt. Aided'
    elif 'govt' in mgt_str or 'government' in mgt_str:
        return 'Govt'
    else:
        return 'Private'

def get_sub_course(name):
    name_lower = name.lower()
    if 'ayurved' in name_lower or 'bams' in name_lower:
        return 'BAMS'
    elif 'homoeopath' in name_lower or 'homeopath' in name_lower or 'bhms' in name_lower:
        return 'BHMS'
    elif 'unani' in name_lower or 'bums' in name_lower:
        return 'BUMS'
    elif 'siddha' in name_lower or 'bsms' in name_lower:
        return 'BSMS'
    return 'AYUSH'

def extract_all_from_js():
    colleges = []
    if os.path.exists(JS_FILE):
        with open(JS_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        match = re.search(r'const collegeData = (\[.*?\]);', content, re.DOTALL)
        if match:
            colleges = json.loads(match.group(1))
    return colleges

def import_legacy_data(db):
    colleges = extract_all_from_js()
    count = 0
    for c in colleges:
        cid = generate_id(c['state'], c['name'])
        if cid not in db:
            if c.get('course') == 'AYUSH':
                c['sub_course'] = get_sub_course(c['name'])
            elif c.get('course') == 'MBBS':
                c['filterType'] = determine_mbbs_filter_type(c.get('type', ''), c.get('name', ''))
            db[cid] = c
            count += 1
    print(f"Imported {count} legacy colleges from colleges-data.js.")

def import_bams(db):
    if not os.path.exists(BAMS_CSV):
        print("BAMS CSV not found!")
        return
        
    count = 0
    with open(BAMS_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        lines = list(reader)
        
    for row in lines[9:]: # BAMS csv actual rows start around 10
        if len(row) < 7: continue
        state = row[2].strip()
        raw_name = row[3].strip()
        mgt = row[4].strip()
        seats = row[7].strip() # Sanction seats UG (Without EWS)
        if not seats or not state or not raw_name: continue
        
        name = clean_college_name(raw_name, state)
        c_type = mgt.replace('\n', ' ')
        filter_type = determine_ayush_filter_type(c_type, name)
        sub_course = get_sub_course(name)
        
        cid = generate_id(state, name)
        if cid not in db:
            db[cid] = {}
            
        db[cid].update({
            'state': state,
            'name': name,
            'course': 'AYUSH',
            'sub_course': sub_course,
            'type': c_type,
            'filterType': filter_type,
            'seats': seats,
            'link': db[cid].get('link', f"{state.lower().replace(' ', '-')}-ayush-counselling.html")
        })
        count += 1
        
    print(f"Imported/Updated {count} BAMS colleges from NCISM CSV.")

def import_ayush_common(db, filepath, course_type, sub_course):
    if not os.path.exists(filepath):
        print(f"{sub_course} CSV not found!")
        return
        
    count = 0
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        lines = list(reader)
        
    for row in lines:
        if len(row) < 5: continue
        if sub_course in ["BUMS", "BSMS"]:
            if "S. No" in row[0] or "List" in row[0]: continue
            state = row[2].strip()
            raw_name = row[3].strip()
            mgt = row[4].strip()
            seats = ""
        elif sub_course == "BHMS":
            if "No" in row[0] or "MARBH" in row[0] or "Status" in row[0] or "Decision" in row[0]: continue
            if len(row) < 6: continue
            raw_name = row[1].strip()
            state = row[2].strip()
            mgt = row[4].strip()
            seats = row[5].strip()
            
        if not state or not raw_name: continue
        
        name = clean_college_name(raw_name, state)
        c_type = mgt.replace('\n', ' ')
        filter_type = determine_ayush_filter_type(c_type, name)
        
        cid = generate_id(state, name)
        if cid not in db:
            db[cid] = {}
            
        db[cid].update({
            'state': state,
            'name': name,
            'course': course_type,
            'sub_course': sub_course,
            'type': c_type,
            'filterType': filter_type,
            'seats': str(seats),
            'link': db[cid].get('link', f"{state.lower().replace(' ', '-')}-ayush-counselling.html")
        })
        count += 1
        
    print(f"Imported/Updated {count} {sub_course} colleges from CSV.")

def import_nmc_mbbs(db):
    if not os.path.exists(NMC_CSV):
        return
    count = 0
    with open(NMC_CSV, 'r', encoding='utf-8-sig') as f:
        lines = f.readlines()
        
    header_idx = 0
    for i, line in enumerate(lines[:10]):
        if "State" in line and "Name of college" in line:
            header_idx = i
            break
            
    reader = csv.DictReader(lines[header_idx:])
    for row in reader:
        state = row.get('State', '').strip()
        raw_name = row.get('Name of college', '').strip()
        if not state or not raw_name: continue
            
        mgt = row.get("Management of college", "")
        if not mgt and "Management  of\ncollege" in row:
            mgt = row.get("Management  of\ncollege", "")
        elif not mgt and None in row:
            mgt = list(row.values())[3] if len(row.values()) > 3 else ""
            
        seats = ""
        for k in row.keys():
            if k and "seats" in k.lower():
                seats = row[k]
                break
        
        mgt = str(mgt).strip().replace('\n', ' ')
        name = clean_college_name(raw_name, state)
        filter_type = determine_mbbs_filter_type(mgt, name)
            
        cid = generate_id(state, name)
        if cid not in db:
            db[cid] = {}
            
        db[cid].update({
            'state': state,
            'name': name,
            'course': 'MBBS',
            'sub_course': 'MBBS',
            'type': mgt,
            'filterType': filter_type,
            'seats': seats.strip(),
            'link': db[cid].get('link', f"{state.lower().replace(' ', '-')}-mbbs-counselling.html")
        })
        count += 1
    print(f"Imported/Updated {count} MBBS colleges from NMC CSV.")

STATE_MAP = {
    "andhra-pradesh": "Andhra Pradesh",
    "arunachal-pradesh": "Arunachal Pradesh",
    "assam": "Assam",
    "bihar": "Bihar",
    "chhattisgarh": "Chhattisgarh",
    "delhi": "Delhi",
    "goa": "Goa",
    "gujarat": "Gujarat",
    "haryana": "Haryana",
    "himachal-pradesh": "Himachal Pradesh",
    "jammu-kashmir": "Jammu Kashmir",
    "jharkhand": "Jharkhand",
    "karnataka": "Karnataka",
    "kerala": "Kerala",
    "madhya-pradesh": "Madhya Pradesh",
    "maharashtra": "Maharashtra",
    "manipur": "Manipur",
    "meghalaya": "Meghalaya",
    "mizoram": "Mizoram",
    "nagaland": "Nagaland",
    "odisha": "Odisha",
    "puducherry": "Puducherry",
    "punjab": "Punjab",
    "rajasthan": "Rajasthan",
    "sikkim": "Sikkim",
    "tamil-nadu": "Tamil Nadu",
    "telangana": "Telangana",
    "tripura": "Tripura",
    "up": "Uttar Pradesh",
    "uttar-pradesh": "Uttar Pradesh",
    "uttarakhand": "Uttarakhand",
    "west-bengal": "West Bengal",
    "mp": "Madhya Pradesh",
    "j-k": "Jammu Kashmir",
}

def import_mbbs_from_html(db):
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    mbbs_files = [f for f in os.listdir(base_dir) if f.endswith("-mbbs-counselling.html")]

    # Match the entire <tr>...</tr> block that contains td-name (i.e. data rows only)
    tr_pattern = re.compile(r'<tr>(.*?)</tr>', re.DOTALL)
    # Extract td-name and optional mgt tag
    name_pattern = re.compile(r'<div class="td-name">([^<]+)(?:<span[^>]*>\(([^)]*)\)</span>)?\s*</div>', re.DOTALL)
    # Extract the fee cell
    fee_pattern = re.compile(r'<td class="fee-(?:govt|pvt)">([^<]*)</td>')
    # Extract seat-pill
    seat_pattern = re.compile(r'<span class="seat-pill">([^<]*)</span>')
    # All plain td values (not the name cell or the seat pill cell)
    plain_td_pattern = re.compile(r'<td>([^<]*)</td>')

    count = 0
    for fname in mbbs_files:
        slug = fname.replace("-mbbs-counselling.html", "")
        state = STATE_MAP.get(slug, slug.replace("-", " ").title())
        link = fname

        filepath = os.path.join(base_dir, fname)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        for tr_match in tr_pattern.finditer(content):
            row_html = tr_match.group(1)

            # Must have td-name to be a data row
            name_m = name_pattern.search(row_html)
            if not name_m:
                continue

            fee_m = fee_pattern.search(row_html)
            seat_m = seat_pattern.search(row_html)
            if not fee_m or not seat_m:
                continue

            name_raw = name_m.group(1).strip()
            mgt_tag = (name_m.group(2) or "").strip()
            fee = fee_m.group(1).strip()
            seats = seat_m.group(1).strip()

            # Remaining plain <td> values (could be city, est, or city at end)
            plain_tds = [v.strip() for v in plain_td_pattern.findall(row_html)]

            # Guess city = longest non-numeric plain td; est = 4-digit year
            city = ""
            est = ""
            for v in plain_tds:
                if re.match(r'^\d{4}$', v):
                    est = v
                elif v and not re.match(r'^\d+$', v) and len(v) > 2:
                    city = v

            clean_name = re.sub(r'\s*\(.*?\)', '', name_raw).strip()
            if not clean_name:
                continue

            cid = generate_id(state, clean_name)
            mgt_combined = f"{mgt_tag} {clean_name}"
            filter_type = determine_mbbs_filter_type(mgt_combined, clean_name)

            if cid not in db:
                db[cid] = {}

            db[cid].update({
                'state': state,
                'name': clean_name,
                'course': 'MBBS',
                'sub_course': 'MBBS',
                'city': city,
                'est': est,
                'seats': seats,
                'fee': fee,
                'type': mgt_tag if mgt_tag else fee,
                'filterType': filter_type,
                'link': link,
            })
            count += 1

    print(f"Imported/Updated {count} MBBS colleges from HTML pages.")


if __name__ == "__main__":
    db = init_db()
    # 1. Extract MBBS colleges from HTML state pages (clean, structured source of truth)
    import_mbbs_from_html(db)
    # 2. Add/Overwrite BAMS with official NCISM data
    import_bams(db)
    # 3. Add/Overwrite BHMS with official data
    import_ayush_common(db, BHMS_CSV, "AYUSH", "BHMS")
    # 4. Add/Overwrite BUMS with official data
    import_ayush_common(db, BUMS_CSV, "AYUSH", "BUMS")
    # 5. Add/Overwrite BSMS with official data
    import_ayush_common(db, BSMS_CSV, "AYUSH", "BSMS")
    
    # Strip dupes in names just in case
    for cid in db:
        if 'name' in db[cid]:
            db[cid]['name'] = db[cid]['name'].strip()
    
    save_db(db)
    print("Database saved.")
