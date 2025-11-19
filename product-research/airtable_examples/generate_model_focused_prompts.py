#!/usr/bin/env python3
"""
Script to generate prompts that better incorporate the precise physical descriptions of models.
"""

import os
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

def generate_model_focused_prompt(model, description, model_name):
    """
    Generate a prompt that focuses on the model's physical features.
    """
    try:
        prompt = f"""
        Based on the following detailed physical description of a Ghanaian model, create a high-fashion editorial prompt 
        that emphasizes the model's distinctive physical characteristics while placing them in a luxury fashion context.
        
        KEY INSTRUCTIONS:
        - The primary focus should be on showcasing the model's unique physical features
        - The setting and clothing should complement and highlight these features
        - Create a prompt that would result in an image where the model is the clear focal point
        - Use luxury fashion aesthetics (PRADA/BOTTEGA VENETA style) but make it about the model
        - NO traditional Ghanaian textiles or cultural references
        - Focus on bespoke tailoring and contemporary luxury
        
        FORMAT TO FOLLOW EXACTLY:
        High-fashion editorial, full-body portrait of a confident Ghanaian model [with specific physical characteristics] standing in [setting that complements features]. [Background details that don't distract from model]. [Outfit that accentuates the model's features]: [bespoke suit details]. [Shirt and accessory details that complement the model]. [Hair styling that enhances facial features], [gaze and stance that express the model's character]. Lighting: [lighting that highlights the model's features]. Camera language: [technical details that capture the model]. [Color palette and emphasis on the model's features].
        "negative_prompt": "text, words, logos, watermark, extra or fused fingers, warped hands, duplicate limbs, distorted anatomy, over-smooth skin, heavy bloom, cartoon, anime, color tinting",
        "width": 1024,
        "height": 1536,
        "style_preset": "Photographic",
        "seed": -1
        
        Physical Description:
        {description}
        
        Generate ONLY the prompt text in the exact format shown above, without any additional explanation or formatting.
        """
        
        print(f"Generating model-focused prompt for {model_name}...")
        response = model.generate_content(prompt)
        
        if response and response.text:
            generated_prompt = response.text.strip()
            print(f"Successfully generated model-focused prompt for {model_name}")
            return generated_prompt
        else:
            print(f"[ERROR] No response from Gemini for {model_name}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to generate model-focused prompt for {model_name}: {e}")
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
        print(f"Updated record with model-focused prompt")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to update record with prompt: {e}")
        return False

def generate_model_focused_prompts():
    """
    Generate prompts that better focus on the models' physical features.
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
        
        # Process all records to generate model-focused prompts
        processed_count = 0
        for record in records:
            record_id = record['id']
            name = record['fields'].get('name', 'Unknown')
            description = record['fields'].get('description')
            
            # Check if record has a description
            if description:
                print(f"\nGenerating model-focused prompt for {name} (ID: {record_id})")
                
                # Generate the model-focused prompt
                prompt = generate_model_focused_prompt(gemini_model, description, name)
                if not prompt:
                    continue
                    
                # Update the record with the new prompt
                if update_airtable_prompt(record_id, prompt):
                    processed_count += 1
                    print(f"Successfully processed {name}")
                else:
                    print(f"Failed to update {name}")
            elif not description:
                print(f"Skipping {name} - no description available")
        
        print(f"\nGenerated model-focused prompts for {processed_count} records successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to generate model-focused prompts: {e}")
        return False

def main():
    """
    Main function to generate model-focused prompts.
    """
    print("Generating Model-Focused Prompts")
    print("=" * 35)
    print("Creating prompts that emphasize the models' physical features...")
    print()
    
    success = generate_model_focused_prompts()
    
    if success:
        print("\nModel-focused prompt generation completed successfully!")
        print("Check your Airtable table to see the updated prompts.")
    else:
        print("\nModel-focused prompt generation failed!")

if __name__ == "__main__":
    main()