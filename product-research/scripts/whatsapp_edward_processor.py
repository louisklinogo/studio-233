#!/usr/bin/env python3
"""
WhatsApp Edward Images Processor
Custom version of product_processor.py for whatsapp-from-edward directory.
Uses Google Gemini 2.5 Flash Image Preview model to standardize product images.
"""

import os
import sys
import shutil
from pathlib import Path
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from io import BytesIO
import time
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('whatsapp_edward_processing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class WhatsAppEdwardProcessor:
    def __init__(self):
        """Initialize the processor with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        
        # Single model for generation
        self.generation_model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')
        
        logger.info("Model configuration complete: gemini-2.5-flash-image-preview")
        
        # Directory paths - all within whatsapp-from-edward
        self.base_dir = Path('whatsapp-from-edward')
        self.original_dir = self.base_dir / 'original'
        self.processed_dir = self.base_dir / 'processed'
        self.failed_dir = self.base_dir / 'failed'
        
        # Create directories
        self.original_dir.mkdir(exist_ok=True)
        self.processed_dir.mkdir(exist_ok=True)
        self.failed_dir.mkdir(exist_ok=True)
        
        # Load reference mannequin
        self.reference_mannequin_path = Path('ideal.jpg')
        if not self.reference_mannequin_path.exists():
            raise ValueError("ideal.jpg reference mannequin not found")
        
        # Load reference mannequin image data
        with Image.open(self.reference_mannequin_path) as ref_img:
            if ref_img.mode != 'RGB':
                ref_img = ref_img.convert('RGB')
            ref_byte_arr = BytesIO()
            ref_img.save(ref_byte_arr, format='JPEG')
            self.reference_mannequin_data = ref_byte_arr.getvalue()
        
        # Comprehensive processing prompt
        self.processing_prompt = """You are given TWO images:
1. A reference mannequin (black body, rose gold head)
2. An original product image containing clothing

YOUR TASK: Extract the clothing from the original image and put it on the reference mannequin.

STEP-BY-STEP INSTRUCTIONS:
1. Identify the main clothing item in the original image (suit, dress, kaftan, etc.)
2. Carefully extract ONLY the exact clothing with its unique styles, texture, fabrics, designs - remove any person, hanger, or background
3. Transfer the exact extracted clothing with its unique styles, texture, fabrics, designs onto the reference mannequin
4. Ensure proper fit - the clothing should look natural on the mannequin
5. Remove ALL jewelry, watches, accessories, and footwear from the clothing
6. Keep the original clothing colors, patterns, and details
7. Position the mannequin centrally on a clean white background
8. Show the full mannequin from head to toe

CRITICAL: The result MUST show the reference mannequin WEARING the extracted clothing.
Do NOT return just the empty reference mannequin!
Do NOT return just the original image!
Do NOT add any design not originally on product image
Do NOT create a cutout of original clothing
The clothing must be visibly on the mannequin body."""
        
        # Verification prompt
        self.verification_prompt = """Verify this product image meets the core requirements:

CORE REQUIREMENTS:
1. Clothing is visible on the mannequin (not empty mannequin)
2. Black mannequin body with rose gold head
3. Full mannequin visible from head to toe
4. Clean white background
5. No jewelry, watches, or accessories
6. No footwear

CHECK IN THIS ORDER:
- Is there actual clothing on the mannequin? (FAIL if empty mannequin)
- Is the mannequin body black with rose gold head?
- Is the full mannequin visible?
- Is the background clean and white?
- Are there any jewelry, accessories, or footwear?

Respond with:
PASS: All core requirements met
FAIL: [specific missing requirements, starting with clothing presence]"""
        
        logger.info("WhatsAppEdwardProcessor initialized successfully")

    def organize_source_images(self):
        """Move existing images from base directory to original directory."""
        logger.info("Organizing source images...")
        
        # Find all image files in the base directory
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        moved_count = 0
        
        for file_path in self.base_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                # Skip if already in subdirectory
                if file_path.name.startswith('.'):
                    continue
                
                dest_path = self.original_dir / file_path.name
                if not dest_path.exists():
                    shutil.move(str(file_path), str(dest_path))
                    moved_count += 1
                    logger.info(f"Moved {file_path.name} to original directory")
        
        logger.info(f"Moved {moved_count} images to original directory")
        return moved_count

    def verify_generated_image(self, image_data):
        """Verify if generated image meets all requirements."""
        try:
            response = self.generation_model.generate_content([
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
            error_msg = str(e)
            logger.error(f"Error during verification: {error_msg}")
            
            if "Could not convert" in error_msg and "inline_data" in error_msg:
                logger.warning("API conversion error - retrying with same image")
                return False, "API conversion error - retrying"
            
            return False, f"Verification error: {error_msg}"

    def process_single_image(self, image_path):
        """Process a single image using reference mannequin with enhanced feedback loop."""
        max_attempts = 7
        attempt = 0
        last_verification_result = ""
        
        while attempt < max_attempts:
            attempt += 1
            logger.info(f"Processing {image_path.name} - Attempt {attempt}")
            
            try:
                base_prompt = self.processing_prompt
                
                if attempt == 1:
                    prompt = base_prompt
                else:
                    prompt = base_prompt + f"\n\nPREVIOUS ATTEMPT FAILED because: {last_verification_result}\n\nPLEASE FIX THESE SPECIFIC ISSUES:\n"
                    if "jewelry" in last_verification_result.lower():
                        prompt += "- Remove ALL jewelry from the clothing\n"
                    if "footwear" in last_verification_result.lower():
                        prompt += "- Remove ALL footwear from the clothing\n"
                    if "accessories" in last_verification_result.lower():
                        prompt += "- Remove ALL accessories from the clothing\n"
                    if "black" in last_verification_result.lower():
                        prompt += "- Ensure the reference mannequin remains completely black with rose gold head\n"
                    if "full body" in last_verification_result.lower():
                        prompt += "- Ensure full mannequin body is visible\n"
                
                # Load original image
                with Image.open(image_path) as img:
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img_byte_arr = BytesIO()
                    img.save(img_byte_arr, format='JPEG')
                    img_byte_arr = img_byte_arr.getvalue()
                
                # Send to generation model
                response = self.generation_model.generate_content([
                    prompt,
                    {"mime_type": "image/jpeg", "data": self.reference_mannequin_data},
                    {"mime_type": "image/jpeg", "data": img_byte_arr}
                ])
                
                if response and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                            generated_image_data = part.inline_data.data
                            if isinstance(generated_image_data, str):
                                generated_image_data = base64.b64decode(generated_image_data)
                            
                            logger.info(f"Verifying generated image for {image_path.name}")
                            verification_passed, verification_result = self.verify_generated_image(generated_image_data)
                            last_verification_result = verification_result
                            
                            if verification_passed:
                                processed_filename = f"processed_{image_path.stem}.jpg"
                                processed_path = self.processed_dir / processed_filename
                                
                                with open(processed_path, 'wb') as f:
                                    f.write(generated_image_data)
                                
                                logger.info(f"Successfully processed and verified {image_path.name}")
                                return True, processed_path
                            else:
                                logger.warning(f"Verification failed for {image_path.name}: {verification_result}")
                                if attempt < max_attempts:
                                    logger.info(f"Will retry with specific feedback...")
                                    continue
                                else:
                                    logger.error(f"Max attempts reached for {image_path.name}")
                                    return False, f"Failed verification after {max_attempts} attempts: {verification_result}"
                
                logger.warning(f"No image generated for {image_path.name} - attempt {attempt}")
                if attempt < max_attempts:
                    continue
                else:
                    return False, "No image generated after max attempts"
                    
            except Exception as e:
                logger.error(f"Error processing {image_path.name} - attempt {attempt}: {e}")
                if attempt < max_attempts:
                    time.sleep(2)
                    continue
                else:
                    return False, f"Error after {max_attempts} attempts: {e}"
        
        return False, "Max processing attempts reached"

    def batch_process_images(self):
        """Process all images in the original directory."""
        logger.info("Starting batch processing...")
        
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        images_to_process = []
        
        for file_path in self.original_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                images_to_process.append(file_path)
        
        logger.info(f"Found {len(images_to_process)} images to process")
        
        success_count = 0
        failure_count = 0
        
        for i, image_path in enumerate(images_to_process, 1):
            logger.info(f"Processing image {i}/{len(images_to_process)}: {image_path.name}")
            
            success, result = self.process_single_image(image_path)
            
            if success:
                success_count += 1
            else:
                failure_count += 1
                failed_path = self.failed_dir / image_path.name
                shutil.copy2(str(image_path), str(failed_path))
                logger.warning(f"Failed to process {image_path.name}: {result}")
            
            if i < len(images_to_process):
                time.sleep(1)
        
        logger.info(f"Batch processing complete: {success_count} successful, {failure_count} failed")
        return success_count, failure_count

def main():
    """Main execution function."""
    try:
        processor = WhatsAppEdwardProcessor()
        
        # Organize source images
        moved = processor.organize_source_images()
        logger.info(f"Organized {moved} images")
        
        # Process all images
        logger.info("Starting batch processing...")
        success, failure = processor.batch_process_images()
        
        logger.info("Processing Summary:")
        logger.info(f"Successful: {success}")
        logger.info(f"Failed: {failure}")
        logger.info(f"Success rate: {success / (success + failure) * 100:.1f}%")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
