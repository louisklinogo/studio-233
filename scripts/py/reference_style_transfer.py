#!/usr/bin/env python3
"""
Reference Style Transfer Script
Applies the background, mood, grain, and lighting characteristics from a reference image
to all other images in the output directory using Gemini 2.5 Flash Image Preview model.
"""

import os
import base64
import sys
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
import logging

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('reference_style_transfer.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
OUTPUT_DIR = Path('output')
STYLED_DIR = Path('output/styled_images')
STYLED_DIR.mkdir(exist_ok=True)

def initialize_gemini_model():
    """
    Initialize the gemini-2.5-flash-image-preview model.
    """
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
        logger.info("Gemini 2.5 Flash Image model initialized successfully.")
        return model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Image model: {e}")
        return None

def load_image_as_base64(image_path):
    """
    Load an image file and convert it to base64 string.
    """
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to load image {image_path}: {e}")
        return None

def apply_reference_style(model, reference_path, target_path, output_path):
    """
    Apply reference image style to target image using Gemini.
    """
    try:
        logger.info(f"Processing {target_path.name}...")
        
        # Load both images
        reference_base64 = load_image_as_base64(reference_path)
        target_base64 = load_image_as_base64(target_path)
        
        if not reference_base64 or not target_base64:
            return None
        
        # Create the style transfer prompt
        prompt = f"""
        I need you to apply the visual style characteristics from the first image (reference) to the second image (target).
        
        Please maintain the exact subject matter, clothing, products, and people from the target image, 
        but transform these visual elements to match the reference image's style:
        
        **Style elements to transfer:**
        - Background color, texture, and atmosphere
        - Overall mood and aesthetic feel
        - Grain texture and film quality
        - Lighting direction, intensity, and color temperature
        - Color grading and tonal characteristics
        - Shadow and highlight rendering
        - Overall visual atmosphere and mood
        
        **What to preserve:**
        - All subject matter (people, products, clothing)
        - Composition and framing
        - Essential details and features
        - Text and legible elements
        
        **What to transform:**
        - Background environment
        - Lighting quality and direction
        - Color palette and grading
        - Texture and grain characteristics
        - Overall mood and atmosphere
        
        Please create a professional, high-quality image that seamlessly blends the target content 
        with the reference style. The result should look natural and cohesive.
        """
        
        # Create the content parts with both images
        reference_image = {
            "mime_type": "image/png",
            "data": reference_base64
        }
        
        target_image = {
            "mime_type": "image/png",
            "data": target_base64
        }
        
        # Generate the styled image
        response = model.generate_content([prompt, reference_image, target_image])
        
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
                    
                    logger.info(f"Successfully styled: {target_path.name}")
                    return image_bytes
        
        logger.error(f"No image generated for {target_path.name}")
        return None
        
    except Exception as e:
        logger.error(f"Failed to apply reference style to {target_path.name}: {e}")
        return None

def save_styled_image(image_bytes, output_path):
    """
    Save the generated styled image to a file.
    """
    try:
        with open(output_path, 'wb') as f:
            f.write(image_bytes)
        logger.info(f"Saved styled image: {output_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save styled image {output_path}: {e}")
        return False

def get_target_images():
    """
    Get list of target images (excluding reference image).
    """
    reference_image = "composite_2ba93f513aa77332347739561a4d5bc7.png"
    
    target_images = []
    for file_path in OUTPUT_DIR.iterdir():
        if file_path.is_file() and file_path.suffix == '.png' and file_path.name != reference_image:
            target_images.append(file_path)
    
    return target_images

def test_with_sample(model, reference_path, sample_size=3):
    """
    Test the style transfer with a small sample of images.
    """
    logger.info(f"Testing style transfer with sample of {sample_size} images...")
    
    target_images = get_target_images()
    test_images = target_images[:sample_size]
    
    successful = 0
    failed = 0
    
    for i, target_path in enumerate(test_images, 1):
        logger.info(f"Test {i}/{sample_size}: {target_path.name}")
        
        output_path = STYLED_DIR / f"test_{target_path.name}"
        image_bytes = apply_reference_style(model, reference_path, target_path, output_path)
        
        if image_bytes and save_styled_image(image_bytes, output_path):
            successful += 1
        else:
            failed += 1
    
    logger.info(f"Test complete: {successful}/{sample_size} successful")
    return successful, failed

def batch_process_images(model, reference_path, max_images=None):
    """
    Process all images with reference style transfer.
    """
    logger.info("Starting batch style transfer...")
    
    target_images = get_target_images()
    
    # Limit processing if specified
    if max_images:
        target_images = target_images[:max_images]
        logger.info(f"Sample mode: processing {len(target_images)} images")
    else:
        logger.info(f"Found {len(target_images)} images to process")
    
    successful = 0
    failed = 0
    
    for i, target_path in enumerate(target_images, 1):
        logger.info(f"Processing image {i}/{len(target_images)}: {target_path.name}")
        
        output_path = STYLED_DIR / target_path.name
        image_bytes = apply_reference_style(model, reference_path, target_path, output_path)
        
        if image_bytes and save_styled_image(image_bytes, output_path):
            successful += 1
        else:
            failed += 1
        
        # Progress update every 5 images (slower process)
        if i % 5 == 0:
            logger.info(f"Progress: {successful}/{i} successful")
    
    logger.info(f"Batch style transfer complete: {successful}/{len(target_images)} successful")
    return successful, failed

def main():
    """
    Main function to apply reference style to all images.
    """
    logger.info("Reference Style Transfer")
    logger.info("=" * 40)
    
    # File paths
    reference_path = OUTPUT_DIR / "composite_2ba93f513aa77332347739561a4d5bc7.png"
    
    # Check if reference image exists
    if not reference_path.exists():
        logger.error(f"Reference image not found: {reference_path}")
        return
    
    # Initialize Gemini model
    gemini_model = initialize_gemini_model()
    if not gemini_model:
        return
    
    # Test with sample first
    logger.info("Running test with sample images...")
    test_success, test_total = test_with_sample(gemini_model, reference_path, sample_size=2)
    
    if test_success == test_total:
        logger.info("Test passed! Processing all images...")
        successful, failed = batch_process_images(gemini_model, reference_path)
    else:
        logger.warning("Test had issues. Processing with caution...")
        successful, failed = batch_process_images(gemini_model, reference_path)
    
    # Summary
    logger.info("Reference Style Transfer Summary:")
    logger.info(f"Total processed: {successful + failed}")
    logger.info(f"Successful: {successful}")
    logger.info(f"Failed: {failed}")
    logger.info(f"Success rate: {successful / (successful + failed) * 100:.1f}%")
    
    if successful > 0:
        logger.info(f"Styled images saved to: {STYLED_DIR}")

if __name__ == "__main__":
    main()