#!/usr/bin/env python3
"""
Script to generate better prompts that effectively incorporate the precise physical descriptions.
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

# Example of luxury fashion brand style (PRADA/BOTTEGA VENETA style)
LUXURY_FASHION_EXAMPLE = """
High-fashion editorial, full-body portrait of a confident Ghanaian model standing in a minimalist luxury atelier with clean architectural lines. 
Sleek marble floors and floor-to-ceiling windows with soft natural light. 
Outfit from reference: bespoke tailored single-breasted suit in rich midnight blue virgin wool with subtle pinstripe, 
crafted with impeccable precision. The jacket features clean lines, sharp shoulders, and a modern silhouette. 
Paired with a crisp white dress shirt with French cuffs, secured with minimalist platinum cufflinks. 
Luxury leather oxford shoes in deep burgundy calf leather. 
Hair styled with precision, clean lines, and modern elegance. 
Direct gaze with an air of sophisticated confidence. 
Lighting: soft, even natural light with subtle highlights that emphasize the luxurious fabric textures and clean tailoring. 
Camera language: medium format camera, 85mm lens, eye-level, shallow depth of field. 
Monochromatic palette with rich navy, crisp white, and luxurious burgundy. 
Emphasis on clean lines, precision tailoring, and understated luxury.
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

def generate_better_prompt(model, description, model_name):
    """
    Generate a better prompt that effectively incorporates the physical description.
    """
    try:
        prompt = f"""
        Based on the following detailed physical description of a Ghanaian model, create a high-fashion editorial prompt 
        for a luxury European fashion brand (like PRADA or BOTTEGA VENETA) with a Ghanaian perspective.
        
        KEY INSTRUCTIONS:
        - The prompt should showcase the MODEL'S NATURAL PHYSICAL FEATURES as the star
        - Let the model's inherent characteristics drive the aesthetic choices
        - Use the physical description to inform casting, styling, and photography decisions
        - Focus on how the model's features can be highlighted through luxury fashion
        - Create a narrative that celebrates the model's unique physical attributes
        
        PHYSICAL DESCRIPTION TO INCORPORATE:
        {description}
        
        FORMAT TO FOLLOW EXACTLY:
        High-fashion editorial, full-body portrait of a confident Ghanaian model standing in [setting that complements the model's features]. [Background details that enhance the model's characteristics]. [Outfit description that highlights the model's physical attributes]: [bespoke suit details that complement the model's structure]. [Shirt and accessory details that accentuate the model's features]. [Hair styling that works with the model's natural texture]. [Gaze and stance that reflect the model's natural energy], [Lighting that flatters the model's features]. Camera language: [technical details that showcase the model]. [Color palette and emphasis that celebrates the model's characteristics].
        "negative_prompt": "text, words, logos, watermark, extra or fused fingers, warped hands, duplicate limbs, distorted anatomy, over-smooth skin, heavy bloom, cartoon, anime, color tinting",
        "width": 1024,
        "height": 1536,
        "style_preset": "Photographic",
        "seed": -1
        
        Generate ONLY the prompt text in the exact format shown above, without any additional explanation or formatting.
        """
        
        print(f"Generating better prompt for {model_name}...")
        response = model.generate_content(prompt)
        
        if response and response.text:
            generated_prompt = response.text.strip()
            print(f"Successfully generated better prompt for {model_name}")
            return generated_prompt
        else:
            print(f"[ERROR] No response from Gemini for {model_name}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to generate better prompt for {model_name}: {e}")
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
        print(f"Updated record with better prompt")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to update record with prompt: {e}")
        return False

def generate_better_prompts():
    """
    Generate better prompts that effectively incorporate physical descriptions.
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
        
        # Process records with descriptions
        processed_count = 0
        for record in records:
            record_id = record['id']
            name = record['fields'].get('name', 'Unknown')
            description = record['fields'].get('description')
            
            # Check if record has a description
            if description:
                print(f"\nGenerating better prompt for {name} (ID: {record_id})")
                
                # Generate the better prompt
                prompt = generate_better_prompt(gemini_model, description, name)
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
        
        print(f"\nGenerated better prompts for {processed_count} records successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to generate better prompts: {e}")
        return False

def main():
    """
    Main function to generate better prompts.
    """
    print("Generating Better Prompts that Incorporate Physical Descriptions")
    print("=" * 65)
    print("Creating prompts that showcase the models' natural features...")
    print()
    
    success = generate_better_prompts()
    
    if success:
        print("\nBetter prompt generation completed successfully!")
        print("Check your Airtable table to see the improved prompts.")
    else:
        print("\nBetter prompt generation failed!")

if __name__ == "__main__":
    main()