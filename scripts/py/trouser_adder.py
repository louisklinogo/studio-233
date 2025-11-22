#!/usr/bin/env python3
"""
Trouser Addition Script
Uses Google Gemini 2.5 Flash Image Preview model to add matching trousers
to images that are currently without trousers.
"""

import os
import sys
import time
from pathlib import Path
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from io import BytesIO
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('trouser_addition.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class TrouserAdder:
    def __init__(self):
        """Initialize the trouser adder with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')
        
        # Directory paths
        self.processed_dir = Path('product-assets/processed')
        self.with_trousers_dir = Path('product-assets/with_trousers')
        self.with_trousers_dir.mkdir(exist_ok=True)
        
        # Target images that need trousers
        self.target_images = [
            'processed_2023-05-31_photo_original_002.jpg',
            'processed_2023-05-31_photo_original_005.jpg',
            'processed_2024-04-18_photo_original_001.jpg',
            'processed_2024-05-08_photo_original_001.jpg',
            'processed_2024-07-10_screenshot_instagram_002.jpg',
            'processed_1980-01-01_photo_original_002.jpg',
            'processed_1980-01-01_photo_original_003.jpg'
        ]
        
        # Trouser addition prompt
        self.trouser_prompt = """You are given an image of clothing on a mannequin that is missing trousers.

YOUR TASK: Add matching trousers to complete the outfit.

STEP-BY-STEP INSTRUCTIONS:
1. Analyze the existing clothing (shirt, jacket, blazer, etc.) to determine:
   - The style (formal, casual, business, traditional, etc.)
   - The color palette and patterns
   - The fabric type and texture
   - The overall aesthetic

2. Create matching trousers that:
   - Complement the existing clothing perfectly
   - Match the color scheme and style
   - Fit the mannequin naturally
   - Look like they belong with the outfit

3. Specific requirements:
   - For formal/business tops: Add dress pants or suit trousers
   - For casual tops: Add appropriate casual trousers or jeans
   - For traditional/cultural tops: Add matching traditional bottoms ONLY (DO NOT ROLL UPPER GARMENT, TUCK SHIRT, TUNIC OR AGBADA in TROUSERS)
   - For patterned tops: Use solid colors that complement the patterns
   - For bright colors: Use complementary or neutral tones

4. Technical requirements:
   - Maintain proper lighting and shadows
   - Ensure realistic fabric appearance
   - Keep natural folds and draping
   - Preserve the original image quality
   - Ensure seamless integration with existing clothing

5. What NOT to do:
   - Do not alter the existing upper clothing
   - Do not change the background
   - Do not modify the mannequin appearance
   - Do not add any accessories or footwear

CRITICAL: The result must show the complete outfit with natural-looking, well-matched trousers that appear to be part of the original ensemble."""
        
        # Verification prompt
        self.verification_prompt = """Verify this image now has proper trousers added:

REQUIREMENTS:
1. Original upper clothing preserved unchanged
2. Matching trousers added that complement the existing clothing
3. Trousers fit the mannequin naturally
4. Colors and styles match appropriately
5. Overall complete and cohesive outfit appearance
6. No alterations to background or mannequin
7. No unrealistic or poorly integrated elements

CHECK IN THIS ORDER:
- Are trousers visible and properly formed?
- Do the trousers match the style and color of the existing clothing?
- Is the integration seamless and natural?
- Is the original upper clothing unchanged?
- Does the complete outfit look cohesive?

Respond with:
PASS: All requirements met - trousers added successfully
FAIL: [specific issues found]"""
        
        logger.info("TrouserAdder initialized successfully")

    def load_image_data(self, image_path):
        """Load and convert image to bytes."""
        try:
            with Image.open(image_path) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                img_byte_arr = BytesIO()
                img.save(img_byte_arr, format='JPEG')
                return img_byte_arr.getvalue()
                
        except Exception as e:
            logger.error(f"Error loading image {image_path}: {e}")
            return None

    def verify_trousers_added(self, image_data):
        """Verify if trousers have been properly added."""
        try:
            response = self.model.generate_content([
                self.verification_prompt,
                {"mime_type": "image/jpeg", "data": image_data}
            ])
            
            if response and response.text:
                verification_result = response.text.strip().upper()
                logger.info(f"Verification result: {verification_result}")
                
                if verification_result.startswith("PASS:"):
                    return True, "Verification passed"
                elif verification_result.startswith("FAIL:"):
                    return False, verification_result
                else:
                    if "pass" in response.text.lower():
                        return True, "Verification passed (inferred)"
                    else:
                        return False, f"Unclear verification: {response.text}"
            
            return False, "No verification response"
            
        except Exception as e:
            logger.error(f"Error during verification: {e}")
            return False, f"Verification error: {e}"

    def add_trousers_single_image(self, image_path, max_retries=3):
        """Add trousers to a single image with retry logic."""
        logger.info(f"Adding trousers to {image_path.name}...")
        
        # Load image data
        img_data = self.load_image_data(image_path)
        if not img_data:
            return False, "Failed to load image"
        
        # Process with retries
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries} for {image_path.name}")
                
                response = self.model.generate_content([
                    self.trouser_prompt,
                    {"mime_type": "image/jpeg", "data": img_data}
                ])
                
                if response and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                            # Get generated image data
                            generated_image_data = part.inline_data.data
                            if isinstance(generated_image_data, str):
                                generated_image_data = base64.b64decode(generated_image_data)
                            
                            # Verify the enhanced image
                            logger.info(f"Verifying trousers added for {image_path.name}")
                            verification_passed, verification_result = self.verify_trousers_added(generated_image_data)
                            
                            if verification_passed:
                                # Save enhanced image
                                enhanced_filename = f"with_trousers_{image_path.name}"
                                enhanced_path = self.with_trousers_dir / enhanced_filename
                                
                                with open(enhanced_path, 'wb') as f:
                                    f.write(generated_image_data)
                                
                                logger.info(f"Successfully added trousers to {image_path.name} -> {enhanced_filename}")
                                return True, enhanced_path
                            else:
                                logger.warning(f"Verification failed for {image_path.name}: {verification_result}")
                                if attempt < max_retries - 1:
                                    continue
                                else:
                                    return False, f"Failed verification after {max_retries} attempts: {verification_result}"
                
                logger.warning(f"No image generated for {image_path.name} - attempt {attempt + 1}")
                
            except Exception as e:
                logger.error(f"Error processing {image_path.name} - attempt {attempt + 1}: {e}")
                if attempt < max_retries - 1:
                    continue
                else:
                    return False, f"Error after {max_retries} attempts: {e}"
            
            if attempt < max_retries - 1:
                time.sleep(0.5)
        
        return False, f"Failed to add trousers to {image_path.name} after {max_retries} attempts"

    def batch_add_trousers(self):
        """Add trousers to all target images."""
        logger.info("Starting batch trouser addition...")
        
        successful = 0
        failed = 0
        
        for i, image_name in enumerate(self.target_images, 1):
            image_path = self.processed_dir / image_name
            
            if not image_path.exists():
                logger.warning(f"Image not found: {image_name}")
                failed += 1
                continue
            
            logger.info(f"Processing image {i}/{len(self.target_images)}: {image_name}")
            
            success, result = self.add_trousers_single_image(image_path)
            
            if success:
                successful += 1
            else:
                failed += 1
                logger.warning(f"Failed to add trousers to {image_name}: {result}")
            
            # Rate limiting
            if i < len(self.target_images):
                time.sleep(0.5)
        
        logger.info(f"Batch trouser addition complete: {successful}/{len(self.target_images)} successful")
        return successful, failed

def main():
    """Main execution function."""
    try:
        adder = TrouserAdder()
        
        # Process all target images
        logger.info("Starting trouser addition process...")
        successful, failed = adder.batch_add_trousers()
        
        logger.info("Trouser Addition Summary:")
        logger.info(f"Total processed: {successful + failed}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Success rate: {successful / (successful + failed) * 100:.1f}%")
        
        if successful > 0:
            logger.info(f"Enhanced images saved to: {adder.with_trousers_dir}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()