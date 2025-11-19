#!/usr/bin/env python3
"""
Script to view the generated prompts in Airtable.
"""

import os
from dotenv import load_dotenv
from pyairtable import Api

# Load environment variables from .env file
load_dotenv()

# Configuration
API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID')
TABLE_NAME = os.getenv('AIRTABLE_TABLE_NAME')

def view_prompts():
    """
    View the generated prompts in Airtable.
    """
    try:
        # Connect to Airtable
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Fetch all records
        records = table.all()
        
        # Display prompts
        print("Generated Prompts:")
        print("=" * 20)
        for record in records:
            name = record['fields'].get('name', 'Unknown')
            prompt = record['fields'].get('prompt')
            
            if prompt:
                print(f"\n{name}:")
                print("-" * len(name))
                print(prompt)
                print()
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to view prompts: {e}")
        return False

def main():
    """
    Main function to view generated prompts.
    """
    print("Viewing Generated Fashion Prompts")
    print("=" * 35)
    
    view_prompts()

if __name__ == "__main__":
    main()