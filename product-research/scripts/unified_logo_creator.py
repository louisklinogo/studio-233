#!/usr/bin/env python3
"""
Script to create a unified logo by combining two logo files using Gemini 2.5 Flash Image Preview model.
"""

import os
import base64
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configuration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
LOGOS_DIR = "logos"
OUTPUT_DIR = "logos"

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
        print(f"[ERROR] Failed to initialize Gemini Image model: {e}")
        return None

def load_image_as_base64(image_path):
    """
    Load an image file and convert it to base64 string.
    """
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"[ERROR] Failed to load image {image_path}: {e}")
        return None

def create_unified_logo(model, chesspiece_path, name_path, output_path):
    """
    Create a unified logo by combining the two logo files using Gemini.
    """
    try:
        print("Loading logo images...")
        
        # Load both images
        chesspiece_base64 = load_image_as_base64(chesspiece_path)
        name_base64 = load_image_as_base64(name_path)
        
        if not chesspiece_base64 or not name_base64:
            return None
        
        print("Creating prompt for unified logo...")
        
        # Create the prompt with both images
        prompt = f"""
        I need you to create a unified logo by combining these two logo elements:

        1. The first image contains a chess piece icon
        2. The second image contains text

        Please create a single, unified logo with these specifications:
        - Position the chess piece icon directly above the text with minimal spacing
        - Maintain the black color scheme (both logos are black on white background)
        - Ensure proper alignment and proportions
        - The final output should be one clean, professional logo
        - Save as a high-quality JPEG image
        - Make sure the composition is balanced and visually appealing

        The chess piece should be positioned above the text maintaining original fonts and brand identity to create a single cohesive logo design.
        """
        
        # Create the content parts with both images
        chesspiece_image = {
            "mime_type": "image/jpeg",
            "data": chesspiece_base64
        }
        
        name_image = {
            "mime_type": "image/jpeg", 
            "data": name_base64
        }
        
        print("Generating unified logo...")
        
        # Generate the unified logo
        response = model.generate_content([prompt, chesspiece_image, name_image])
        
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
                    
                    print("Successfully generated unified logo!")
                    return image_bytes
        
        print("[ERROR] No image generated")
        return None
        
    except Exception as e:
        print(f"[ERROR] Failed to create unified logo: {e}")
        return None

def save_unified_logo(image_bytes, output_path):
    """
    Save the generated unified logo to a file.
    """
    try:
        # Save the image
        with open(output_path, 'wb') as f:
            f.write(image_bytes)
            
        print(f"Saved unified logo: {output_path}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to save unified logo: {e}")
        return False

def main():
    """
    Main function to create the unified logo.
    """
    print("Creating Unified Logo")
    print("=" * 40)
    
    # File paths
    chesspiece_path = os.path.join(LOGOS_DIR, "chesspiece.jpg")
    name_path = os.path.join(LOGOS_DIR, "name-black.jpg")
    output_path = os.path.join(OUTPUT_DIR, "unified-logo.jpg")
    
    # Check if input files exist
    if not os.path.exists(chesspiece_path):
        print(f"[ERROR] Chesspiece logo not found: {chesspiece_path}")
        return
    
    if not os.path.exists(name_path):
        print(f"[ERROR] Name logo not found: {name_path}")
        return
    
    # Initialize Gemini model
    gemini_model = initialize_gemini_model()
    if not gemini_model:
        return
    
    # Create unified logo
    image_bytes = create_unified_logo(gemini_model, chesspiece_path, name_path, output_path)
    if not image_bytes:
        return
    
    # Save the unified logo
    if save_unified_logo(image_bytes, output_path):
        print("\nUnified logo created successfully!")
        print(f"Output saved to: {output_path}")
    else:
        print("\nFailed to save unified logo!")

if __name__ == "__main__":
    main()