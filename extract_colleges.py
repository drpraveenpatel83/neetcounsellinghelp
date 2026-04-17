import glob, re, json

colleges = []
files = glob.glob('*-counselling.html')

for file in files:
    # Skip non-state counselling files
    if 'aaccc' in file or 'mcc' in file or 'vci' in file or file == 'neet-counselling.html':
        continue
        
    course = 'MBBS' if '-mbbs-' in file else 'AYUSH'
    
    # Capitalize state name properly
    state_str = file.split('-mbbs-')[0].split('-ayush-')[0].replace('-', ' ')
    state = state_str.title()
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try looking for tables with class 'ctbl'
    tables = re.findall(r'<table class=\"ctbl\">(.*?)</table>', content, re.DOTALL)
    for table in tables:
        rows = re.findall(r'<tr>(.*?)</tr>', table, re.DOTALL)
        for row in rows:
            cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
            if not cells: continue
            
            def clear_tags(t):
                # Remove spans, divs, etc.
                t = re.sub(r'<[^>]+>', '', t)
                # Decode entities
                t = t.replace('&amp;', '&').replace('&nbsp;', ' ').strip()
                # Remove extra spaces
                return re.sub(r'\s+', ' ', t)
            
            clean_cells = [clear_tags(c) for c in cells]
            
            if len(clean_cells) >= 5:
                # Based on standard table: SN, College Name, City, Est., Seats, Type
                # Sometimes est is missing, or city is missing, but usually 6 cells.
                if 'Fee' in table and len(clean_cells) == 2:
                    continue # Fee table
                
                if 'SN' in clean_cells[0] or 'College' in clean_cells[1] or 'College Name' in clean_cells[0]:
                    continue # header row caught somehow? No, headers use th, but just in case.
                
                try:
                    # Sn = clean_cells[0]
                    name = clean_cells[1]
                    city = clean_cells[2] if len(clean_cells) > 2 else ""
                    est = clean_cells[3] if len(clean_cells) > 3 else ""
                    seats = clean_cells[4] if len(clean_cells) > 4 else ""
                    ctype = clean_cells[5] if len(clean_cells) > 5 else ""
                    
                    # Ensure it's not a generic table text row
                    if not name or len(name) < 5: continue
                    
                    # Unify type for filtering (Govt, Private, Deemed, Central)
                    filter_type = 'Private'
                    ctype_lower = ctype.lower()
                    if 'govt' in ctype_lower or 'government' in ctype_lower or 'state' in ctype_lower:
                        filter_type = 'Govt'
                    if 'deem' in ctype_lower:
                        filter_type = 'Deemed'
                    if 'central' in ctype_lower or 'aiims' in name.lower() or 'jipmer' in name.lower() or 'amu' in name.lower() or 'bhu' in name.lower():
                        filter_type = 'Govt' # Categorize AIIMS/Central as Govt for simplicity, or "Central Govt."
                        
                    colleges.append({
                        'state': state,
                        'course': course,
                        'name': name,
                        'city': city,
                        'est': est,
                        'seats': seats,
                        'type': ctype,
                        'filterType': filter_type,
                        'link': file
                    })
                except Exception as e:
                    pass

print("Generated {} colleges".format(len(colleges)))

with open('colleges-data.js', 'w', encoding='utf-8') as f:
    f.write('const collegeData = ' + json.dumps(colleges, indent=2) + ';\n')

