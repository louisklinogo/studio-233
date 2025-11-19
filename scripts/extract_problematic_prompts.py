#!/usr/bin/env python3
"""
Extract prompts for problematic images from the main image_prompts.csv file.
"""

import csv
from pathlib import Path

def extract_problematic_images_prompts():
    """Extract prompts for specific problematic images."""
    
    # List of problematic images
    problematic_images = [
        "processed_1980-01-01_photo_spiffy_004.jpg",
        "processed_2024-04-14_photo_original_004.jpg",
        "processed_2024-04-14_photo_original_003.jpg",
        "processed_2024-05-30_photo_original_002.jpg",
        "processed_2024-05-30_photo_original_003.jpg",
        "processed_2024-05-30_photo_original_005.jpg",
        "processed_2024-05-30_photo_original_006.jpg",
        "processed_2024-06-08_photo_original_001.jpg",
        "processed_2024-07-01_screenshot_instagram_007.jpg",
        "processed_2024-07-01_screenshot_instagram_009.jpg",
        "processed_2024-07-02_screenshot_instagram_006.jpg",
        "processed_2024-07-02_screenshot_instagram_007.jpg",
        "processed_2024-07-02_screenshot_instagram_009.jpg",
        "processed_2024-07-02_screenshot_instagram_010.jpg"
    ]
    
    # Read the original CSV
    input_file = Path("detection_results/image_prompts.csv")
    output_file = Path("detection_results/problematic_images_prompts.csv")
    
    extracted_data = []
    
    # Try different encodings
    encodings = ['utf-8', 'latin-1', 'cp1252']
    content = None
    
    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            print(f"Successfully read file with {encoding} encoding")
            break
        except UnicodeDecodeError:
            continue
    
    if content is None:
        print("Error: Could not read the CSV file with any encoding")
        return
    
    # Parse the CSV content
    lines = content.strip().split('\n')
    
    # Skip header if it exists
    start_line = 1 if lines[0].startswith('image_filename') else 0
    
    for line in lines[start_line:]:
        # Split by comma but handle quoted prompts
        parts = line.split(',', 1)
        if len(parts) >= 2:
            filename = parts[0]
            prompt = parts[1].strip('"')
            if filename in problematic_images:
                extracted_data.append([filename, prompt])
                print(f"Found: {filename}")
    
    # Write the extracted data to new CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['image_filename', 'prompt'])  # Header
        writer.writerows(extracted_data)
    
    print(f"\nExtracted {len(extracted_data)} problematic images to {output_file}")
    
    # Show which images were not found
    found_images = {row[0] for row in extracted_data}
    missing_images = set(problematic_images) - found_images
    
    if missing_images:
        print(f"\nWarning: These images were not found in the original CSV:")
        for img in missing_images:
            print(f"  - {img}")

if __name__ == "__main__":
    extract_problematic_images_prompts()