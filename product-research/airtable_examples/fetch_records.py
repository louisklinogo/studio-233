#!/usr/bin/env python3
"""
Script to fetch records with original images from Airtable.
"""

import os
from dotenv import load_dotenv
from pyairtable import Api

# Load environment variables from .env file
load_dotenv()

# Airtable configuration
API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID')
TABLE_NAME = os.getenv('AIRTABLE_TABLE_NAME')

def fetch_records_with_original_images():
    """
    Fetch records from Airtable that have original images.
    
    Returns:
        list: List of records with original images
    """
    try:
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Fetch all records
        records = table.all()
        
        # Filter records that have original images
        records_with_images = []
        for record in records:
            # Check if the record has an 'original_image' field with attachments
            if 'original_image' in record['fields'] and record['fields']['original_image']:
                records_with_images.append(record)
        
        print(f"Found {len(records_with_images)} records with original images")
        return records_with_images
        
    except Exception as e:
        print(f"[ERROR] Failed to fetch records: {e}")
        return []

def main():
    """
    Main function to fetch records with original images.
    """
    print("Fetching Records with Original Images from Airtable")
    print("=" * 50)
    
    records = fetch_records_with_original_images()
    
    if records:
        print("\nRecords with original images:")
        for record in records:
            name = record['fields'].get('name', 'N/A')
            description = record['fields'].get('description', 'N/A')
            has_original_image = 'original_image' in record['fields'] and len(record['fields']['original_image']) > 0
            has_generated_image = 'generated_image' in record['fields'] and len(record['fields']['generated_image']) > 0
            
            print(f"  - ID: {record['id']}")
            print(f"    Name: {name}")
            print(f"    Description: {description}")
            print(f"    Has Original Image: {has_original_image}")
            print(f"    Has Generated Image: {has_generated_image}")
            print()
    else:
        print("No records with original images found.")

if __name__ == "__main__":
    main()