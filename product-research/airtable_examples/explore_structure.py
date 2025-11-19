#!/usr/bin/env python3
"""
Script to explore Airtable structure and check for prompt field.
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

def explore_airtable_structure():
    """
    Explore the Airtable structure to see all fields.
    """
    try:
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Get table schema
        schema = table.schema()
        print("Airtable Table Structure:")
        print("=" * 30)
        print(f"Table Name: {TABLE_NAME}")
        print(f"Fields:")
        for field in schema.fields:
            print(f"  - {field.name} ({field.type})")
        
        # Get sample records to see data
        print("\nSample Records:")
        print("=" * 30)
        records = table.all(max_records=3)
        for i, record in enumerate(records, 1):
            print(f"\nRecord {i}:")
            print(f"  ID: {record['id']}")
            print("  Fields:")
            for field_name, field_value in record['fields'].items():
                if isinstance(field_value, list) and len(field_value) > 0 and isinstance(field_value[0], dict) and 'filename' in field_value[0]:
                    # Attachment field
                    print(f"    {field_name}: {len(field_value)} attachment(s)")
                else:
                    print(f"    {field_name}: {field_value}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to explore Airtable structure: {e}")
        return False

def main():
    """
    Main function to explore Airtable structure.
    """
    print("Exploring Airtable Structure")
    print("=" * 30)
    
    explore_airtable_structure()

if __name__ == "__main__":
    main()