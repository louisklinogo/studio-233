#!/usr/bin/env python3
"""
Script to generate images based on prompts without complex configuration.
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
IMPROVED_IMAGES_DIR = "improved_fashion_images"
os.makedirs(IMPROVED_IMAGES_DIR, exist_ok=True)

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

def generate_image_from_prompt(model, prompt_text, model_name):
    """
    Generate an image based on the prompt text without complex configuration.
    """
    try:
        print(f"Generating image for {model_name}...")
        print(f"Prompt: {prompt_text[:100]}...")
        
        # Generate the image with default settings
        response = model.generate_content([prompt_text])
        
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
                    
                    print(f"Successfully generated image for {model_name}")
                    return image_bytes
        
        print(f"[ERROR] No image generated for {model_name}")
        return None
        
    except Exception as e:
        print(f"[ERROR] Failed to generate image for {model_name}: {e}")
        return None

def save_improved_image(image_bytes, model_name):
    """
    Save the generated image to a file.
    """
    try:
        # Create filename
        filename = f"{model_name.replace(' ', '_')}_improved.jpg"
        filepath = os.path.join(IMPROVED_IMAGES_DIR, filename)
        
        # Save the image
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
            
        print(f"Saved improved image: {filename}")
        return filepath
        
    except Exception as e:
        print(f"[ERROR] Failed to save improved image for {model_name}: {e}")
        return None

def upload_image_to_airtable(record_id, image_filepath):
    """
    Upload the generated image to the generated_image field in Airtable.
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
        print(f"Uploaded image to Airtable")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to upload image to Airtable: {e}")
        return False

def generate_improved_images():
    """
    Generate images based on prompts with simplified approach.
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
            
            # Check if record has a prompt
            if prompt:
                print(f"\nGenerating improved image for {name} (ID: {record_id})")
                
                # Extract the main prompt text
                prompt_text = extract_main_prompt(prompt)
                
                # Generate the image
                image_bytes = generate_image_from_prompt(gemini_model, prompt_text, name)
                if not image_bytes:
                    continue
                    
                # Save the generated image
                image_filepath = save_improved_image(image_bytes, name)
                if not image_filepath:
                    continue
                    
                # Upload the generated image to Airtable
                if upload_image_to_airtable(record_id, image_filepath):
                    processed_count += 1
                    print(f"Successfully processed {name}")
                else:
                    print(f"Failed to upload image for {name}")
            elif not prompt:
                print(f"Skipping {name} - no prompt available")
        
        print(f"\nGenerated improved images for {processed_count} records successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to generate improved images: {e}")
        return False

def main():
    """
    Main function to generate improved images.
    """
    print("Generating Improved Images from Prompts")
    print("=" * 40)
    print("Using simplified approach without complex configuration...")
    print()
    
    success = generate_improved_images()
    
    if success:
        print("\nImproved image generation completed successfully!")
        print(f"Check the '{IMPROVED_IMAGES_DIR}' directory for generated images.")
        print("Images have also been uploaded to Airtable.")
    else:
        print("\nImproved image generation failed!")

if __name__ == "__main__":
    main()