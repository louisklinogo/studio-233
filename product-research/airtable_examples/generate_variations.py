#!/usr/bin/env python3
"""
Script to generate Ghanaian model variations based on reference images.
"""

import os
import base64
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

# Load environment variables from .env file
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Directories
REFERENCE_IMAGES_DIR = "downloaded_images"
VARIATIONS_DIR = "ghanaian_variations"
os.makedirs(VARIATIONS_DIR, exist_ok=True)

def initialize_gemini_model():
    """
    Initialize the gemini-2.5-flash-image-preview model.
    """
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
        print("Gemini 2.5 Flash Image model initialized successfully.")
        return model
    except Exception as e:
        print(f"[ERROR] Failed to initialize Gemini model: {e}")
        return None

def generate_ghanaian_variation(model, reference_image, reference_name, index):
    """
    Generate a Ghanaian variation based on a reference image.
    """
    try:
        print(f"Generating Ghanaian variation #{index} based on {reference_name}...")
        
        # Create a prompt that asks for a Ghanaian version with similar style
        prompt = f"""
        Based on this reference image, create a completely new photorealistic portrait of a Ghanaian model 
        that captures the same professional photography style, lighting, and composition.
        
        Maintain similar:
        - Overall pose and body language
        - Lighting style and quality
        - Professional photography aesthetic
        - Image composition and framing
        
        But with distinctly Ghanaian features:
        - Authentic Ghanaian facial structure and features
        - Natural African hair texture and styling
        - Appropriate skin tones for Ghanaian ethnicity
        - Ghanaian ethnic characteristics
        
        The result should be a brand new image of a Ghanaian model that captures the same 
        professional, high-quality photography style as the reference, but is entirely original.
        Do not simply modify the reference image - create a completely new portrait.
        """
        
        # Generate the variation by sending both the prompt and reference image
        response = model.generate_content(
            [prompt, reference_image],
            generation_config=genai.GenerationConfig(
                temperature=0.7,  # Higher temperature for more creative variation
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
                    
                    print(f"Successfully generated Ghanaian variation #{index} from {reference_name}")
                    return image_bytes
        
        print(f"[ERROR] No image generated for variation #{index} from {reference_name}")
        return None
        
    except Exception as e:
        print(f"[ERROR] Failed to generate variation #{index} from {reference_name}: {e}")
        return None

def save_variation(image_bytes, reference_name, index):
    """
    Save the generated variation to a file.
    """
    try:
        # Create filename
        filename = f"ghanaian_variation_{reference_name}_{index:02d}.jpg"
        filepath = os.path.join(VARIATIONS_DIR, filename)
        
        # Save the image
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
            
        print(f"Saved variation: {filename}")
        return filepath
        
    except Exception as e:
        print(f"[ERROR] Failed to save variation #{index}: {e}")
        return None

def generate_variations(count=10):
    """
    Generate Ghanaian variations based on reference images.
    """
    try:
        # Initialize Gemini model
        gemini_model = initialize_gemini_model()
        if not gemini_model:
            return False
            
        # Get list of reference images
        if not os.path.exists(REFERENCE_IMAGES_DIR):
            print(f"Reference images directory '{REFERENCE_IMAGES_DIR}' not found.")
            return False
            
        reference_images = [f for f in os.listdir(REFERENCE_IMAGES_DIR) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        if not reference_images:
            print("No reference images found.")
            return False
            
        print(f"Found {len(reference_images)} reference images.")
        
        # Generate variations
        generated_count = 0
        for i in range(1, count + 1):
            # Cycle through reference images
            reference_index = (i - 1) % len(reference_images)
            reference_filename = reference_images[reference_index]
            reference_filepath = os.path.join(REFERENCE_IMAGES_DIR, reference_filename)
            
            # Load the reference image
            try:
                reference_image = Image.open(reference_filepath)
                reference_name = os.path.splitext(reference_filename)[0]
            except Exception as e:
                print(f"[ERROR] Failed to load reference image {reference_filename}: {e}")
                continue
            
            # Generate the variation
            image_bytes = generate_ghanaian_variation(gemini_model, reference_image, reference_name, i)
            if not image_bytes:
                continue
                
            # Save the generated image
            image_filepath = save_variation(image_bytes, reference_name, i)
            if not image_filepath:
                continue
                
            generated_count += 1
            print(f"Successfully generated and saved variation #{i}")
        
        print(f"\nGenerated {generated_count} Ghanaian variations successfully!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to generate variations: {e}")
        return False

def main():
    """
    Main function to generate Ghanaian variations based on reference images.
    """
    print("Generating Ghanaian Model Variations from Reference Images")
    print("=" * 55)
    print("Using downloaded model images as references...")
    print("Generating 10 Ghanaian variations...")
    print()
    
    success = generate_variations(10)
    
    if success:
        print("\nGhanaian variation generation completed successfully!")
        print(f"Check the '{VARIATIONS_DIR}' directory for all generated variations.")
        print("These are new images inspired by your reference images but featuring Ghanaian models.")
    else:
        print("\nGhanaian variation generation failed!")

if __name__ == "__main__":
    main()