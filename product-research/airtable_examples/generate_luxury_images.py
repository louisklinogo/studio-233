#!/usr/bin/env python3
"""
Script to generate images based on the luxury fashion prompts stored in Airtable.
"""

import os
import base64
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

# Directory for generated images
LUXURY_IMAGES_DIR = "luxury_fashion_images"
os.makedirs(LUXURY_IMAGES_DIR, exist_ok=True)

def initialize_gemini_image_model():
    """
    Initialize the gemini-2.5-flash-image-preview model.
    """
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
        print("Gemini 2.5 Flash Image model initialized successfully.")
        return model
    except Exception as e:
        print(f"[ERROR] Failed to initialize Gemini Image model: {e}")
        return None

def extract_main_prompt(prompt):
    """
    Extract the main prompt text from the full prompt structure.
    """
    # Find the first line which contains the main prompt
    lines = prompt.split('\n')
    for line in lines:
        if line.startswith('High-fashion editorial'):
            return line
    # If not found, return the first line
    return lines[0] if lines else ""

def generate_image_from_luxury_prompt(model, prompt_text, model_name):
    """
    Generate an image based on the luxury fashion prompt text.
    """
    try:
        print(f"Generating luxury fashion image for {model_name}...")
        print(f"Prompt: {prompt_text[:100]}...")
        
        # Generate the image
        response = model.generate_content(
            [prompt_text],
            generation_config=genai.GenerationConfig(
                temperature=1,
                top_p=0.95,
                top_k=40
            )
        )
        
        if response and response.candidates and response.candidates[0].content.parts:
            # Extract the image data
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and hasattr(part.inline_data, 'mime_type') and part.inline_data.mime_type.startswith('image/'):
                    # Get the image data
                    image_data = part.inline_data.data
                    
                    # Decode if it's a base64 string
                    if isinstance(image_data, str):
                        image_bytes = base64.b64decode(image_data)
                    else:
                        image_bytes = image_data
                    
                    print(f"Successfully generated luxury fashion image for {model_name}")
                    return image_bytes
        
        print(f"[ERROR] No image generated for {model_name}")
        return None
        
    except Exception as e:
        print(f"[ERROR] Failed to generate luxury fashion image for {model_name}: {e}")
        return None

def save_luxury_image(image_bytes, model_name):
    """
    Save the generated luxury fashion image to a file.
    """
    try:
        # Create filename
        filename = f"{model_name.replace(' ', '_')}_luxury_fashion.jpg"
        filepath = os.path.join(LUXURY_IMAGES_DIR, filename)
        
        # Save the image
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
            
        print(f"Saved luxury fashion image: {filename}")
        return filepath
        
    except Exception as e:
        print(f"[ERROR] Failed to save luxury fashion image for {model_name}: {e}")
        return None

def upload_luxury_image_to_airtable(record_id, image_filepath):
    """
    Upload the generated luxury fashion image to the generated_image field in Airtable.
    """
    try:
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Upload the image as an attachment
        table.upload_attachment(
            record_id=record_id,
            field='generated_image',
            filename=image_filepath
        )
        print(f"Uploaded luxury fashion image to Airtable")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to upload luxury fashion image to Airtable: {e}")
        return False

def generate_luxury_images_from_prompts():
    """
    Generate luxury fashion images based on prompts stored in Airtable.
    """
    try:
        # Initialize Gemini image model
        gemini_model = initialize_gemini_image_model()
        if not gemini_model:
            return False
            
        # Connect to Airtable
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Fetch all records
        records = table.all()
        
        # Process records with prompts
        processed_count = 0
        for record in records:
            record_id = record['id']
            name = record['fields'].get('name', 'Unknown')
            prompt = record['fields'].get('prompt')
            existing_generated_image = record['fields'].get('generated_image')
            
            # Check if record has a prompt
            if prompt:
                print(f"\nGenerating luxury fashion image for {name} (ID: {record_id})")
                
                # Extract the main prompt text
                prompt_text = extract_main_prompt(prompt)
                
                # Generate the image
                image_bytes = generate_image_from_luxury_prompt(gemini_model, prompt_text, name)
                if not image_bytes:
                    continue
                    
                # Save the generated image
                image_filepath = save_luxury_image(image_bytes, name)
                if not image_filepath:
                    continue
                    
                # Upload the generated image to Airtable
                if upload_luxury_image_to_airtable(record_id, image_filepath):
                    processed_count += 1
                    print(f"Successfully processed {name}")
                else:
                    print(f"Failed to upload image for {name}")
            elif not prompt:
                print(f"Skipping {name} - no prompt available")
        
        print(f"\nGenerated luxury fashion images for {processed_count} records successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to generate luxury fashion images from prompts: {e}")
        return False

def main():
    """
    Main function to generate luxury fashion images based on prompts.
    """
    print("Generating Luxury Fashion Images from Airtable Prompts")
    print("=" * 55)
    print("Using luxury fashion prompts to generate new images...")
    print()
    
    success = generate_luxury_images_from_prompts()
    
    if success:
        print("\nLuxury fashion image generation completed successfully!")
        print(f"Check the '{LUXURY_IMAGES_DIR}' directory for generated images.")
        print("Luxury fashion images have also been uploaded to Airtable.")
    else:
        print("\nLuxury fashion image generation failed!")

if __name__ == "__main__":
    main()