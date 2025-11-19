#!/usr/bin/env python3
"""
Script to generate prompts based on model descriptions and store them in Airtable.
Follows the exact format from Grok Imagine Android 1.0.36.txt
"""

import os
import json
from dotenv import load_dotenv
from pyairtable import Api
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configuration
API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID')
TABLE_NAME = os.getenv('AIRTABLE_TABLE_NAME')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Example prompt structure from Grok Imagine file
EXAMPLE_PROMPT_FORMAT = """
High-fashion editorial, full-body portrait of a confident Ghanaian model standing in [setting description]. [Background details]. [Outfit description based on model's features]: [clothing items]. [Hair description], [gaze and stance details]. Lighting: [lighting description]. Camera language: [camera details]. [Color palette and emphasis details].
"negative_prompt": "text, words, logos, watermark, extra or fused fingers, warped hands, duplicate limbs, distorted anatomy, over-smooth skin, heavy bloom, cartoon, anime, color tinting",
"width": 1024,
"height": 1536,
"style_preset": "Photographic",
"seed": -1
"""

def initialize_gemini():
    """
    Initialize the Gemini 2.5 Flash model.
    """
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("Gemini 2.5 Flash model initialized successfully.")
        return model
    except Exception as e:
        print(f"[ERROR] Failed to initialize Gemini model: {e}")
        return None

def generate_prompt_from_description(model, description, model_name):
    """
    Generate a fashion prompt based on the physical description following Grok Imagine format.
    """
    try:
        prompt = f"""
        Based on the following physical description of a Ghanaian model, create a high-fashion editorial prompt in the EXACT format as shown in the example.
        
        FORMAT TO FOLLOW EXACTLY:
        High-fashion editorial, full-body portrait of a confident Ghanaian model standing in [setting description]. [Background details]. [Outfit description based on model's features]: [clothing items]. [Hair description], [gaze and stance details]. Lighting: [lighting description]. Camera language: [camera details]. [Color palette and emphasis details].
        "negative_prompt": "text, words, logos, watermark, extra or fused fingers, warped hands, duplicate limbs, distorted anatomy, over-smooth skin, heavy bloom, cartoon, anime, color tinting",
        "width": 1024,
        "height": 1536,
        "style_preset": "Photographic",
        "seed": -1
        
        The prompt should:
        1. Be from a Ghanaian cultural perspective
        2. Highlight the model's Ghanaian features
        3. Include rich cultural and fashion elements
        4. Specify professional photography details
        5. Focus on high-end fashion editorial style
        
        Physical Description:
        {description}
        
        Generate ONLY the prompt text in the exact format shown above, without any additional explanation or formatting.
        """
        
        print(f"Generating prompt for {model_name}...")
        response = model.generate_content(prompt)
        
        if response and response.text:
            generated_prompt = response.text.strip()
            print(f"Successfully generated prompt for {model_name}")
            return generated_prompt
        else:
            print(f"[ERROR] No response from Gemini for {model_name}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to generate prompt for {model_name}: {e}")
        return None

def update_airtable_prompt(record_id, prompt):
    """
    Update an Airtable record with the generated prompt.
    """
    try:
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Update the record with the prompt
        table.update(record_id, {"prompt": prompt})
        print(f"Updated record with prompt")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to update record with prompt: {e}")
        return False

def generate_prompts():
    """
    Generate prompts for all models with descriptions.
    """
    try:
        # Initialize Gemini model
        gemini_model = initialize_gemini()
        if not gemini_model:
            return False
            
        # Connect to Airtable
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Fetch all records
        records = table.all()
        
        # Process records with descriptions but no prompts
        processed_count = 0
        for record in records:
            record_id = record['id']
            name = record['fields'].get('name', 'Unknown')
            description = record['fields'].get('description')
            existing_prompt = record['fields'].get('prompt')
            
            # Check if record has a description and no existing prompt
            if description and not existing_prompt:
                print(f"\nGenerating prompt for {name} (ID: {record_id})")
                
                # Generate the prompt
                prompt = generate_prompt_from_description(gemini_model, description, name)
                if not prompt:
                    continue
                    
                # Update the record with the prompt
                if update_airtable_prompt(record_id, prompt):
                    processed_count += 1
                    print(f"Successfully processed {name}")
                else:
                    print(f"Failed to update {name}")
            elif existing_prompt:
                print(f"Skipping {name} - prompt already exists")
            elif not description:
                print(f"Skipping {name} - no description available")
        
        print(f"\nGenerated prompts for {processed_count} records successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to generate prompts: {e}")
        return False

def main():
    """
    Main function to generate prompts based on descriptions.
    """
    print("Generating Fashion Prompts from Model Descriptions")
    print("=" * 50)
    print("Creating prompts in Ghanaian perspective with Grok Imagine format...")
    print()
    
    success = generate_prompts()
    
    if success:
        print("\nPrompt generation completed successfully!")
        print("Check your Airtable table to see the generated prompts.")
    else:
        print("\nPrompt generation failed!")

if __name__ == "__main__":
    main()