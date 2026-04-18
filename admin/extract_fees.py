import os
import re
import json

def get_sub_course(name):
    lower_cname = name.lower()
    if 'homoeopathic' in lower_cname or 'homeopathic' in lower_cname:
        return 'BHMS'
    if 'unani' in lower_cname:
        return 'BUMS'
    if 'siddha' in lower_cname:
        return 'BSMS'
    return 'BAMS'
    
def generate_id(state, name):
    s = str(state) + str(name)
    return re.sub(r'[^a-z0-9]', '', s.lower())

def clean_college_name(name, state=""):
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r',?\s*Distt?\.?\s*[-\w\s]+', '', name, flags=re.IGNORECASE)
    name = re.sub(r',?\s*District\s*[-\w\s]+', '', name, flags=re.IGNORECASE)
    name = re.sub(r',[-\w\s]+-\s*\d{6}.*', '', name)
    name = re.sub(r'-\s*\d{6}.*', '', name)
    if state:
        name = re.sub(f',\\s*{state}.*', '', name, flags=re.IGNORECASE)
    name = " ".join(name.split())
    return name

def extract_fees():
    base_dir = "../"
    db_file = "college_master_db.json"
    
    if not os.path.exists(db_file):
        print("college_master_db.json not found. Run import_data.py first.")
        return
        
    with open(db_file, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    extracted_count = 0
    # Match the row structure. Example:
    # <tr><td class="td-sn">1</td><td><div class="td-name">College Name <span...</span></div></td><td>City</td><td>1911</td><td><span class="seat-pill">250</span></td><td class="fee-govt">₹54,600</td></tr>
    # We will match td-name up to the <span or </div>, and then capture fee.
    row_pattern = re.compile(
        r'<div class="td-name">([^<]+).*?</div>'  # capture Name
        r'.*?'
        r'<td class="fee-(?:govt|pvt)">([^<]+)</td>', # capture fee
        re.DOTALL
    )
    
    # Process all html files in base_dir
    html_files = [f for f in os.listdir(base_dir) if f.endswith('.html') and ('counselling' in f or f == 'index.html')]
    
    for html_file in html_files:
        filepath = os.path.join(base_dir, html_file)
        # Determine likely state and course
        parts = html_file.split('-')
        state = parts[0].replace('-', ' ').title()
        if "jammu" in html_file:
            state = "Jammu Kashmir"
        if "andhra" in html_file:
            state = "Andhra Pradesh"
        if "tamil" in html_file:
            state = "Tamil Nadu"
        if "madhya" in html_file:
            state = "Madhya Pradesh"
        if "uttar" in html_file:
            if "pradesh" in html_file:
                state = "Uttar Pradesh"
            else:
                state = "Uttarakhand"
        if "west" in html_file:
            state = "West Bengal"
        if "himachal" in html_file:
            state = "Himachal Pradesh"
            
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        matches = row_pattern.findall(content)
        for name_raw, fee_raw in matches:
            name = name_raw.strip()
            fee = fee_raw.strip()
            
            clean_name = clean_college_name(name, state)
            cid = generate_id(state, clean_name)
            
            # Fallback fuzzy mapping if exact id doesn't match
            if cid in db:
                db[cid]['fee'] = fee
                extracted_count += 1
            else:
                # try without state
                cid_no_state = generate_id("", clean_name)
                found = False
                for db_cid, c in db.items():
                    if c['state'].lower().replace(' ', '') == state.lower().replace(' ', '') or c['state'] in state or state in c['state']:
                        if generate_id("", clean_college_name(c['name'], c['state'])) == cid_no_state:
                            c['fee'] = fee
                            extracted_count += 1
                            found = True
                            break
                            
                # Let's try exact substring matching
                if not found:
                    for db_cid, c in db.items():
                        if name.lower() in c['name'].lower() or c['name'].lower() in name.lower():
                            if abs(len(c['name']) - len(name)) < 20: # Make sure they aren't totally different
                                c['fee'] = fee
                                extracted_count += 1
                                found = True
                                break
                                
    print(f"Successfully extracted and mapped {extracted_count} fees to DB.")
    with open(db_file, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)

if __name__ == "__main__":
    extract_fees()
