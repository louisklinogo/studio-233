#!/usr/bin/env python3
"""
Watermark Removal Script
Uses Google Gemini 2.5 Flash Image Preview model to remove star watermarks 
from the bottom right corner of generated product images.
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
        logging.FileHandler('watermark_removal.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class WatermarkRemover:
    def __init__(self):
        """Initialize the watermark remover with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')
        
        # Directory paths
        self.processed_dir = Path('product-assets/processed')
        self.cleaned_dir = Path('product-assets/cleaned')
        self.cleaned_dir.mkdir(exist_ok=True)
        
        # Watermark removal prompt
        self.watermark_prompt = """You are given an image that has a star-shaped watermark in the bottom right corner.

YOUR TASK: Remove the star watermark from the bottom right corner while preserving the original image content.

SPECIFIC INSTRUCTIONS:
1. Identify and remove any star, asterisk, or similar symbol/watermark in the bottom right corner
2. Keep all the main image content unchanged (clothing, mannequin, background)
3. Fill the removed watermark area with appropriate background that matches the surrounding area
4. Ensure the final image looks natural without any trace of the watermark
5. Do not alter any other part of the image
6. Maintain the original image quality, colors, and composition

CRITICAL: The result should be the original image with ONLY the star watermark removed from the bottom right corner."""
        
        # Verification prompt
        self.verification_prompt = """Verify this image has been properly cleaned:

REQUIREMENTS:
1. No star, asterisk, or similar symbol/watermark visible in bottom right corner
2. Main image content (clothing, mannequin) preserved and unchanged
3. Background looks natural without watermark traces
4. Image quality and colors maintained
5. No other alterations to the original image

CHECK IN THIS ORDER:
- Is the bottom right corner free of any star watermark?
- Is the main image content preserved?
- Does the background look natural without artifacts?
- Is the overall image quality maintained?

Respond with:
PASS: All requirements met - watermark removed
FAIL: [specific issues found]"""
        
        logger.info("WatermarkRemover initialized successfully")

    def find_watermarked_images(self):
        """Find images with 'Generated Image' prefix in processed directory."""
        logger.info("Finding watermarked images...")
        
        watermarked_images = []
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        
        for file_path in self.processed_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                if file_path.name.startswith('Generated Image'):
                    watermarked_images.append(file_path)
        
        logger.info(f"Found {len(watermarked_images)} watermarked images")
        return watermarked_images

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

    def verify_cleaned_image(self, image_data):
        """Verify if watermark has been properly removed."""
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

    def remove_watermark_single_image(self, image_path, max_retries=5):
        """Remove watermark from a single image with retry logic."""
        logger.info(f"Removing watermark from {image_path.name}...")
        
        # Load image data
        img_data = self.load_image_data(image_path)
        if not img_data:
            return False, "Failed to load image"
        
        # Enhanced prompt for stubborn images
        enhanced_prompt = self.watermark_prompt + """

ADDITIONAL INSTRUCTIONS FOR STUBBORN WATERMARKS:
- If you see ANY small symbol, dot, star, or mark in the bottom right corner, REMOVE IT
- Fill the area with clean background matching the surroundings
- The goal is to make the bottom right corner completely clean
- Do NOT return the original image unchanged
- You MUST generate a cleaned version with the watermark removed"""
        
        # Process with retries
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries} for {image_path.name}")
                
                # Use enhanced prompt for later attempts
                if attempt >= 2:
                    current_prompt = enhanced_prompt
                else:
                    current_prompt = self.watermark_prompt
                
                response = self.model.generate_content([
                    current_prompt,
                    {"mime_type": "image/jpeg", "data": img_data}
                ])
                
                if response and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                            # Get generated image data
                            generated_image_data = part.inline_data.data
                            if isinstance(generated_image_data, str):
                                generated_image_data = base64.b64decode(generated_image_data)
                            
                            # Verify the cleaned image
                            logger.info(f"Verifying cleaned image for {image_path.name}")
                            verification_passed, verification_result = self.verify_cleaned_image(generated_image_data)
                            
                            if verification_passed:
                                # Save cleaned image
                                cleaned_filename = f"cleaned_{image_path.name}"
                                cleaned_path = self.cleaned_dir / cleaned_filename
                                
                                with open(cleaned_path, 'wb') as f:
                                    f.write(generated_image_data)
                                
                                logger.info(f"Successfully cleaned {image_path.name} -> {cleaned_filename}")
                                return True, cleaned_path
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
        
        return False, f"Failed to clean {image_path.name} after {max_retries} attempts"

    def batch_remove_watermarks(self, max_images=None):
        """Remove watermarks from all images in processed directory."""
        logger.info("Starting batch watermark removal...")
        
        # Find watermarked images
        watermarked_images = self.find_watermarked_images()
        
        if max_images:
            watermarked_images = watermarked_images[:max_images]
        
        if not watermarked_images:
            logger.info("No watermarked images found")
            return 0, 0
        
        logger.info(f"Processing {len(watermarked_images)} watermarked images")
        
        successful = 0
        failed = 0
        
        for i, image_path in enumerate(watermarked_images, 1):
            logger.info(f"Processing image {i}/{len(watermarked_images)}: {image_path.name}")
            
            success, result = self.remove_watermark_single_image(image_path)
            
            if success:
                successful += 1
            else:
                failed += 1
                logger.warning(f"Failed to clean {image_path.name}: {result}")
            
            # Rate limiting
            if i < len(watermarked_images):
                time.sleep(0.5)
        
        logger.info(f"Batch watermark removal complete: {successful}/{len(watermarked_images)} successful")
        return successful, failed

    def retry_failed_image(self, image_name):
        """Retry processing a specific failed image."""
        logger.info(f"Retrying failed image: {image_name}")
        
        image_path = self.processed_dir / image_name
        if not image_path.exists():
            logger.error(f"Image not found: {image_path}")
            return False
        
        success, result = self.remove_watermark_single_image(image_path, max_retries=5)
        
        if success:
            logger.info(f"Successfully retried {image_name}")
        else:
            logger.error(f"Retry failed for {image_name}: {result}")
        
        return success

def main():
    """Main execution function."""
    try:
        remover = WatermarkRemover()
        
        # Process all watermarked images
        logger.info("Starting watermark removal process...")
        successful, failed = remover.batch_remove_watermarks()
        
        logger.info("Watermark Removal Summary:")
        logger.info(f"Total processed: {successful + failed}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Success rate: {successful / (successful + failed) * 100:.1f}%")
        
        if successful > 0:
            logger.info(f"Cleaned images saved to: {remover.cleaned_dir}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()