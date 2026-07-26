import os
import re
from bs4 import BeautifulSoup

# Configuration
INPUT_FOLDER = os.path.expanduser("~/Desktop/bdlaws_html")
OUTPUT_FOLDER = os.path.expanduser("~/Desktop/bdlaws_txt")
START_NUMBER = 32635

# Create output folder
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

processed_count = 0
skipped_count = 0
error_count = 0

print(f"Processing HTML files from {INPUT_FOLDER}")
print(f"Saving clean text to {OUTPUT_FOLDER}")
print("=" * 60)

for i in range(START_NUMBER, 0, -1):
    filename = f"act-print-{i}.html"
    input_path = os.path.join(INPUT_FOLDER, filename)
    output_filename = f"act-print-{i}.txt"
    output_path = os.path.join(OUTPUT_FOLDER, output_filename)
    
    # Skip if HTML file doesn't exist
    if not os.path.exists(input_path):
        continue
    
    # Skip if already processed
    if os.path.exists(output_path):
        skipped_count += 1
        continue
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract title from <title> tag or from page header
        title = ""
        title_tag = soup.find('title')
        if title_tag:
            title_text = title_tag.get_text(strip=True)
            if title_text and title_text != "404":
                title = title_text
        
        # If no title from <title>, try to get from h3 heading
        if not title:
            h3 = soup.find('h3')
            if h3:
                title = h3.get_text(strip=True)
        
        # Extract date from #date div or publish-date
        date = ""
        date_div = soup.find('div', id='date')
        if date_div:
            date = date_div.get_text(strip=True)
        
        if not date:
            publish_date = soup.find('p', class_='publish-date')
            if publish_date:
                date = publish_date.get_text(strip=True)
                # Clean up brackets
                date = date.strip('[]').strip()
        
        # Extract act number from h4
        act_number = ""
        h4 = soup.find('h4')
        if h4:
            act_number = h4.get_text(strip=True)
        
        # Extract main content paragraphs
        paragraphs = []
        
        # Get text from txt-details divs (main content sections)
        for detail_div in soup.find_all('div', class_='txt-details'):
            # Get all paragraphs within
            for p in detail_div.find_all('p'):
                text = p.get_text(strip=True)
                if text and len(text) > 5:  # Filter out very short fragments
                    paragraphs.append(text)
        
        # Also get text from txt-head divs (section headers)
        section_headers = []
        for head_div in soup.find_all('div', class_='txt-head'):
            text = head_div.get_text(strip=True)
            if text and text not in ['[Repealed]', '[Omitted]']:
                section_headers.append(text)
        
        # Get footnotes
        footnotes = []
        footnote_div = soup.find('div', class_='footnoteListAll')
        if footnote_div:
            for li in footnote_div.find_all('li'):
                text = li.get_text(strip=True)
                if text:
                    footnotes.append(text)
        
        # Build clean text output
        lines = []
        
        if title:
            lines.append(f"TITLE: {title}")
            lines.append("")
        
        if act_number:
            lines.append(f"ACT NUMBER: {act_number}")
            lines.append("")
        
        if date:
            lines.append(f"DATE: {date}")
            lines.append("")
        
        # Add section headers and paragraphs
        if section_headers or paragraphs:
            lines.append("CONTENT:")
            lines.append("")
            
            # Interleave section headers with paragraphs when possible
            content_idx = 0
            for idx, header in enumerate(section_headers):
                lines.append(f"SECTION: {header}")
                lines.append("")
                # Add some paragraphs after this header
                while content_idx < len(paragraphs):
                    lines.append(paragraphs[content_idx])
                    lines.append("")
                    content_idx += 1
                    # Stop if we have more headers coming
                    if idx + 1 < len(section_headers) and content_idx < len(paragraphs):
                        # Check if next paragraph looks like it belongs to next section
                        if content_idx < len(paragraphs) - 1:
                            break
            
            # Add remaining paragraphs
            while content_idx < len(paragraphs):
                lines.append(paragraphs[content_idx])
                lines.append("")
                content_idx += 1
        
        # Add footnotes
        if footnotes:
            lines.append("-" * 40)
            lines.append("FOOTNOTES:")
            lines.append("")
            for fn in footnotes:
                lines.append(fn)
                lines.append("")
        
        # Write output
        if lines:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))
            processed_count += 1
            if processed_count <= 5 or processed_count % 100 == 0:
                print(f"[PROCESSED {processed_count}] {filename} -> {output_filename}")
        else:
            # If no content extracted, skip
            skipped_count += 1
            
    except Exception as e:
        error_count += 1
        print(f"[ERROR] {filename}: {e}")

print("=" * 60)
print(f"Done!")
print(f"  Processed: {processed_count}")
print(f"  Skipped (already exists or empty): {skipped_count}")
print(f"  Errors: {error_count}")
print(f"Output folder: {OUTPUT_FOLDER}")