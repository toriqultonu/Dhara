import os

# Configuration
FOLDER = os.path.expanduser("~/Desktop/bdlaws_html")
START_NUMBER = 32635  # Files start from this number

# Signatures of the 404 error page to detect
ERROR_SIGNATURES = [
    "Oops!</h1>",
    "404 Not Found",
    "Sorry, an error has occured, Requested page not found!"
]

deleted_count = 0
kept_count = 0
missing_count = 0

print(f"Scanning folder: {FOLDER}")
print(f"Checking files from act-print-{START_NUMBER}.html down to act-print-1.html...")
print("=" * 60)

# Loop from START_NUMBER down to 1
for i in range(START_NUMBER, 0, -1):
    filename = f"act-print-{i}.html"
    filepath = os.path.join(FOLDER, filename)
    
    # Check if file exists
    if not os.path.exists(filepath):
        missing_count += 1
        if missing_count <= 5 or i % 5000 == 0:
            print(f"[MISSING] {filename}")
        continue
    
    try:
        # Read file content
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if it's a 404 error page
        is_404 = any(signature in content for signature in ERROR_SIGNATURES)
        
        if is_404:
            # Delete the file
            os.remove(filepath)
            deleted_count += 1
            print(f"[DELETED {deleted_count}] {filename} — 404 error page")
        else:
            kept_count += 1
            if kept_count <= 5 or i % 5000 == 0:
                print(f"[KEEP] {filename} — valid content")
                
    except Exception as e:
        print(f"[ERROR] {filename}: {e}")

print("=" * 60)
print(f"Done!")
print(f"  Deleted (404 pages): {deleted_count}")
print(f"  Kept (valid content): {kept_count}")
print(f"  Missing (not downloaded): {missing_count}")
print(f"  Total checked: {deleted_count + kept_count + missing_count}")