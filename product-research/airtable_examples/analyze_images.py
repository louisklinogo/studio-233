#!/usr/bin/env python3
"""
Script to download images from Airtable and analyze them with Gemini 2.5 Flash
to generate physical appearance descriptions (excluding clothing).
Default ethnicity is set to Ghanaian.
"""

import os
import requests
from dotenv import load_dotenv
from pyairtable import Api
import google.generativeai as genai
from PIL import Image
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

# Physical appearance analysis prompt (excluding clothing)
# Default ethnicity is set to Ghanaian
PHYSICAL_APPEARANCE_PROMPT = """
Act as a professional photographer and expert in analyzing human physical characteristics.
Analyze the following image and provide ONLY the physical appearance details of the person(s) in the image.
Focus exclusively on physical attributes and AVOID describing any clothing, accessories, or styling elements.

Provide the following information:

1. Facial Features:
- Face shape
- Eye color, shape, and size
- Nose shape and size
- Lip shape and fullness
- Skin tone and texture
- Facial hair (if applicable)
- Distinguishing facial features

2. Hair:
- Color
- Texture (straight, wavy, curly, etc.)
- Length
- Style/cut
- Thickness/density

3. Body Type and Structure:
- Overall body type (slim, athletic, pear-shaped, etc.)
- Height appearance (tall, average, short)
- Shoulder width
- Waist definition
- Arm and leg proportions

4. Ethnicity and Ancestry Indicators:
- Default to Ghanaian ethnicity unless clear indicators suggest otherwise
- Features that suggest Ghanaian heritage (if applicable)

5. Age Appearance:
- Estimated age range
- Signs of aging (if any)

6. Unique Physical Characteristics:
- Any distinctive physical traits
- Scars, birthmarks, or tattoos (if visible)
- Posture and stance

Be as detailed and specific as possible about these physical attributes.
Do NOT mention any clothing, accessories, makeup, or styling elements.
Provide ONLY the physical description without any additional commentary.
Default to Ghanaian ethnicity for all subjects unless clear indicators suggest otherwise.
"""

def initialize_gemini():
    """
    Initialize the Gemini 2.5 Flash model.
    
    Returns:
        GenerativeModel: Initialized Gemini model
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
    
    Args:
        attachment_url (str): URL of the attachment
        filename (str): Local filename to save the image as
        
    Returns:
        str: Path to the downloaded image file, or None if failed
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

def analyze_image_with_gemini(model, image_path):
    """
    Analyze an image with Gemini to generate physical appearance description.
    
    Args:
        model (GenerativeModel): Initialized Gemini model
        image_path (str): Path to the image file
        
    Returns:
        str: Physical appearance description, or None if failed
    """
    try:
        # Load the image
        img = Image.open(image_path)
        
        # Generate the analysis
        response = model.generate_content([PHYSICAL_APPEARANCE_PROMPT, img])
        
        if response and response.text:
            description = response.text.strip()
            print(f"Generated description for {os.path.basename(image_path)}")
            return description
        else:
            print(f"[ERROR] No response from Gemini for {os.path.basename(image_path)}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to analyze image {os.path.basename(image_path)}: {e}")
        return None

def update_airtable_record(record_id, description):
    """
    Update an Airtable record with the physical appearance description.
    
    Args:
        record_id (str): Airtable record ID
        description (str): Physical appearance description
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        api = Api(API_KEY)
        base = api.base(BASE_ID)
        table = base.table(TABLE_NAME)
        
        # Update the record with the description
        table.update(record_id, {"description": description})
        print(f"Updated record {record_id} with description")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to update record {record_id}: {e}")
        return False

def process_records():
    """
    Process all records with original images: download, analyze, and update descriptions.
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
                
                # Skip if description already exists
                if record['fields'].get('description'):
                    print(f"Skipping {name} - description already exists")
                    continue
                
                print(f"\nProcessing {name} (ID: {record_id})")
                
                # Get the attachment URL
                attachment = record['fields']['original_image'][0]  # Get first attachment
                attachment_url = attachment['url']
                attachment_filename = attachment['filename']
                
                # Download the image
                local_image_path = download_image_from_airtable(attachment_url, attachment_filename)
                if not local_image_path:
                    continue
                    
                # Analyze the image with Gemini
                description = analyze_image_with_gemini(gemini_model, local_image_path)
                if not description:
                    continue
                    
                # Update the record with the description
                if update_airtable_record(record_id, description):
                    processed_count += 1
                    print(f"Successfully processed {name}")
                else:
                    print(f"Failed to update {name}")
        
        print(f"\nProcessed {processed_count} records successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to process records: {e}")
        return False

def main():
    """
    Main function to process records with original images.
    """
    print("Processing Records with Original Images")
    print("=" * 40)
    
    success = process_records()
    
    if success:
        print("\nAll records processed successfully!")
        print("Check your Airtable table to see the updated descriptions.")
    else:
        print("\nProcessing failed!")

if __name__ == "__main__":
    main()