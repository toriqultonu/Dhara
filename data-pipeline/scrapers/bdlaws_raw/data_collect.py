import os
import requests
import time

# Configuration
BASE_URL = "http://bdlaws.minlaw.gov.bd"
OUTPUT_FOLDER = os.path.expanduser("~/Desktop/bdlaws_html")

# Create output folder
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

saved_count = 0
failed_count = 0

def safe_print(text):
    """Return text safe for printing (handles Unicode)"""
    return text.encode('ascii', 'ignore').decode('ascii')

print(f"Starting direct download from {BASE_URL}")
print("=" * 50)

# Loop through act-print-1.html to act-print-1000000.html
for i in range(32519, 1000001):
    url = f"{BASE_URL}/act-print-{i}.html"
    filename = f"act-print-{i}.html"
    filepath = os.path.join(OUTPUT_FOLDER, filename)
    
    # Skip if already downloaded
    if os.path.exists(filepath):
        print(f"[SKIP] {filename} already exists")
        continue
    
    try:
        resp = requests.get(url, timeout=30)
        
        # Check if page exists (HTTP 200)
        if resp.status_code == 200:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(resp.text)
            saved_count += 1
            print(f"[SAVE {saved_count}] {filename}")
        else:
            # Page doesn't exist (404 or other error)
            failed_count += 1
            print(f"[MISSING {failed_count}] {filename} (Status: {resp.status_code})")
            
            # Optional: Stop after N consecutive failures to save time
            # if failed_count > 100:
            #     print("Too many consecutive failures. Stopping...")
            #     break
        
        # Polite delay
        time.sleep(0.5)
        
    except Exception as e:
        failed_count += 1
        print(f"[ERROR {failed_count}] {safe_print(filename)}: {e}")
        time.sleep(1)

print("=" * 50)
print(f"Done! Saved: {saved_count} pages | Missing/Failed: {failed_count}")
print(f"Output folder: {OUTPUT_FOLDER}")