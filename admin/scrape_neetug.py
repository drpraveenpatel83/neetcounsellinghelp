"""
Scraper for neetugguidance.in
Fetches: College Info, Seat Matrix, Cutoff 2025, Fees
URL pattern: https://www.neetugguidance.in/institutes.php?coldesc_id=X&colser_id=Y
colser_id: 10=Home/Info, 5=Seat Matrix, 7=Cutoff, 6=Fees
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import csv

BASE_URL = "https://www.neetugguidance.in/institutes.php"
HOME_URL = "https://www.neetugguidance.in/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Referer": "https://www.neetugguidance.in/",
}

# Global session — reuse cookies
SESSION = requests.Session()
SESSION.headers.update(HEADERS)

OUTPUT_FILE = "neetug_colleges_raw.json"
# Range to scrape - will auto stop when page is blank
MAX_ID = 600

def init_session():
    """Visit homepage first to get session cookies"""
    try:
        SESSION.get(HOME_URL, timeout=15)
        print("Session initialized with cookies")
    except Exception as e:
        print(f"Warning: Could not init session: {e}")

def fetch_page(coldesc_id, colser_id, retries=3):
    params = {"coldesc_id": coldesc_id, "colser_id": colser_id}
    for attempt in range(retries):
        try:
            r = SESSION.get(BASE_URL, params=params, timeout=15)
            if r.status_code == 200:
                return r.text
            print(f"  HTTP {r.status_code} for id={coldesc_id} ser={colser_id}")
        except Exception as e:
            print(f"  Error attempt {attempt+1}: {e}")
        time.sleep(2)
    return None

def parse_table(html):
    """Extract all tables from a page and return as list of dicts"""
    soup = BeautifulSoup(html, "html.parser")
    tables = []
    for table in soup.find_all("table"):
        rows_data = []
        headers = []
        all_rows = table.find_all("tr")

        for i, row in enumerate(all_rows):
            # Check for <th> header row first
            ths = row.find_all("th")
            tds = row.find_all("td")

            if ths and not headers:
                headers = [th.get_text(separator=" ", strip=True) for th in ths]
                continue

            cells = [td.get_text(separator=" ", strip=True) for td in tds]
            if not cells or all(c == "" for c in cells):
                continue

            # First row with data becomes header if no <th> found
            if not headers:
                headers = cells
                continue

            if len(cells) == len(headers):
                rows_data.append(dict(zip(headers, cells)))
            elif cells:
                rows_data.append({"_raw": cells})

        if rows_data:
            tables.append({"headers": headers, "rows": rows_data})
    return tables

def extract_college_name(html):
    soup = BeautifulSoup(html, "html.parser")
    # Try h1, h2, title, or any heading
    for tag in ["h1", "h2", "h3"]:
        el = soup.find(tag)
        if el and el.get_text(strip=True):
            return el.get_text(strip=True)
    # Try page title
    title = soup.find("title")
    if title:
        return title.get_text(strip=True)
    return ""

def is_valid_page(html):
    """Check if a college page actually has content"""
    if not html:
        return False
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(strip=True)
    # If page is too short or says "not found" / "no data" it's invalid
    if len(text) < 200:
        return False
    if "no record" in text.lower() or "page not found" in text.lower():
        return False
    return True

def scrape_all():
    init_session()
    all_colleges = {}
    consecutive_empty = 0

    print(f"Starting scrape up to coldesc_id={MAX_ID}...")

    for cid in range(1, MAX_ID + 1):
        print(f"\n[{cid}] Fetching college info...")

        # 1. Home/Info page (colser_id=10)
        home_html = fetch_page(cid, 10)
        if not is_valid_page(home_html):
            consecutive_empty += 1
            print(f"  -> No valid page, skipping (empty count: {consecutive_empty})")
            if consecutive_empty >= 15:
                print("15 consecutive empty pages, stopping.")
                break
            time.sleep(0.5)
            continue

        consecutive_empty = 0
        name = extract_college_name(home_html)
        print(f"  -> College: {name}")

        college = {
            "coldesc_id": cid,
            "name": name,
            "info_tables": parse_table(home_html),
        }

        # 2. Seat Matrix (colser_id=5)
        time.sleep(1)
        seat_html = fetch_page(cid, 5)
        if seat_html:
            college["seat_matrix"] = parse_table(seat_html)

        # 3. Cutoff (colser_id=7)
        time.sleep(1)
        cutoff_html = fetch_page(cid, 7)
        if cutoff_html:
            college["cutoff"] = parse_table(cutoff_html)

        # 4. Fees (colser_id=6)
        time.sleep(1)
        fees_html = fetch_page(cid, 6)
        if fees_html:
            college["fees"] = parse_table(fees_html)

        all_colleges[cid] = college

        # Save progress every 10 colleges
        if cid % 10 == 0:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_colleges, f, indent=2, ensure_ascii=False)
            print(f"  >> Progress saved ({len(all_colleges)} colleges so far)")

        time.sleep(1.5)  # Polite delay between colleges

    # Final save
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_colleges, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Done! Scraped {len(all_colleges)} colleges → {OUTPUT_FILE}")
    return all_colleges

def extract_cutoff_2025(all_colleges):
    """Extract just the 2025 cutoff data into a clean CSV"""
    rows = []
    for cid, college in all_colleges.items():
        name = college.get("name", "")
        cutoff_tables = college.get("cutoff", [])
        for table in cutoff_tables:
            for row in table.get("rows", []):
                # Look for 2025 cutoff data
                row_str = json.dumps(row).lower()
                if "2025" in row_str:
                    row["_college_name"] = name
                    row["_coldesc_id"] = cid
                    rows.append(row)

    if rows:
        with open("cutoff_2025.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        print(f"✅ Cutoff 2025 extracted → cutoff_2025.csv ({len(rows)} rows)")
    else:
        print("❌ No 2025 cutoff data found")

if __name__ == "__main__":
    # Step 1: Scrape all
    data = scrape_all()

    # Step 2: Extract 2025 cutoffs
    extract_cutoff_2025(data)
