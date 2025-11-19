#!/usr/bin/env python3
"""
Script to generate more precise physical descriptions of models focusing on their features.
"""

import os
from dotenv import load_dotenv
from pyairtable import Api
import google.generativeai as genai
from PIL import Image
import requests
from io import BytesIO

# Load environment variables from .env file
load_dotenv()

# Configuration
API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID')
TABLE_NAME = os.getenv('AIRTABLE_TABLE_NAME')
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Create directory for downloaded images
IMAGES_DIR = "downloaded_images"
os.makedirs(IMAGES_DIR, exist_ok=True)

# More precise physical analysis prompt focused on the model themselves
PRECISE_PHYSICAL_PROMPT = """
Act as a professional fashion photographer and expert in analyzing human physical characteristics.
Analyze the following image and provide ONLY the physical appearance details of the person in the image.
Focus EXCLUSIVELY on the model's physical features and characteristics.

Provide the following information in a structured format:

**FACIAL FEATURES:**
- Face shape and structure
- Eye characteristics (color, shape, size, position)
- Nose characteristics (shape, size, bridge, tip)
- Lip characteristics (shape, fullness, cupid's bow)
- Skin tone, texture, and quality
- Jawline and chin definition
- Cheekbones and facial bone structure
- Brow characteristics (shape, thickness, arch)
- Any distinctive facial marks (moles, scars, etc.)

**HAIR:**
- Color and natural highlights
- Texture and curl pattern
- Density and thickness
- Natural part and growth pattern
- Facial hair (if applicable) - texture, density, styling

**BODY STRUCTURE:**
- Overall body type and proportions
- Height appearance (tall, average, short)
- Shoulder width and slope
- Waist definition and shape
- Hip structure and width
- Arm and leg proportions
- Posture and stance characteristics
- Muscle definition and tone

**DISTINGUISHING CHARACTERISTICS:**
- Any unique physical traits
- Symmetry or asymmetry features
- Gestures or mannerisms
- Expressive qualities of the face
- Movement and energy characteristics

**ETHNIC FEATURES:**
- Features that suggest ethnic background
- Distinctive heritage characteristics

Be extremely detailed and specific about these physical attributes.
Avoid any mention of clothing, accessories, makeup, or styling.
Focus ONLY on the person's inherent physical characteristics.
Provide ONLY the physical description without any additional commentary.
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

def download_image_from_airtable(attachment_url, filename):
    """
    Download an image from Airtable attachment URL.
    """
    try:
        response = requests.get(attachment_url)
        response.raise_for_status()
        
        filepath = os.path.join(IMAGES_DIR, filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)
            
        print(f"Downloaded image: {filename}")
        return filepath
    except Exception as e:
        print(f"[ERROR] Failed to download image {filename}: {e}")
        return None

def analyze_model_precisely(model, image_path):
    """
    Analyze a model with extreme precision focusing on physical features.
    """
    try:
        # Load the image
        img = Image.open(image_path)
        
        # Generate the analysis
        response = model.generate_content([PRECISE_PHYSICAL_PROMPT, img])
        
        if response and response.text:
            description = response.text.strip()
            print(f"Generated precise description for {os.path.basename(image_path)}")
            return description
        else:
            print(f"[ERROR] No response from Gemini for {os.path.basename(image_path)}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to analyze model {os.path.basename(image_path)}: {e}")
        return None

def update_airtable_record(record_id, description):
    """
    Update an Airtable record with the precise physical description.
    """
    try:
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Update the record with the description
        table.update(record_id, {"description": description})
        print(f"Updated record with precise description")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to update record: {e}")
        return False

def generate_precise_descriptions():
    """
    Generate more precise physical descriptions focusing on the models themselves.
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
        
        # Process records with original images
        processed_count = 0
        for record in records:
            # Check if the record has an 'original_image' field with attachments
            if 'original_image' in record['fields'] and record['fields']['original_image']:
                record_id = record['id']
                name = record['fields'].get('name', 'Unknown')
                
                print(f"\nGenerating precise description for {name} (ID: {record_id})")
                
                # Get the attachment URL
                attachment = record['fields']['original_image'][0]  # Get first attachment
                attachment_url = attachment['url']
                attachment_filename = attachment['filename']
                
                # Download the image
                local_image_path = download_image_from_airtable(attachment_url, attachment_filename)
                if not local_image_path:
                    continue
                    
                # Analyze the model with extreme precision
                description = analyze_model_precisely(gemini_model, local_image_path)
                if not description:
                    continue
                    
                # Update the record with the precise description
                if update_airtable_record(record_id, description):
                    processed_count += 1
                    print(f"Successfully processed {name}")
                else:
                    print(f"Failed to update {name}")
        
        print(f"\nGenerated precise descriptions for {processed_count} records successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to generate precise descriptions: {e}")
        return False

def main():
    """
    Main function to generate precise physical descriptions.
    """
    print("Generating Precise Physical Descriptions of Models")
    print("=" * 50)
    print("Focusing on detailed physical features of the models themselves...")
    print()
    
    success = generate_precise_descriptions()
    
    if success:
        print("\nPrecise description generation completed successfully!")
        print("Check your Airtable table to see the updated detailed descriptions.")
    else:
        print("\nPrecise description generation failed!")

if __name__ == "__main__":
    main()