#!/usr/bin/env python3
"""
Image Correction Implementation Script
Uses the generated prompts to instruct the image model to implement fixes on actual images.
"""

import os
import csv
import time
import logging
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from io import BytesIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('image_correction.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class ImageCorrectionImplementer:
    def __init__(self, prompts_file: str = 'detection_results/image_prompts.csv'):
        """Initialize the image correction implementer.
        
        Args:
            prompts_file: Path to the CSV file containing image prompts
        """
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.image_model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')
        
        # Directory paths
        self.processed_dir = Path('product-assets/processed')
        self.corrected_dir = Path('product-assets/corrected')
        self.corrected_dir.mkdir(exist_ok=True)
        
        # Load prompts
        self.prompts_file = Path(prompts_file)
        self.prompts_data = self.load_prompts()
        
        logger.info("Image Correction Implementer initialized")
        logger.info(f"Using prompts file: {self.prompts_file}")

    def load_prompts(self) -> Dict[str, str]:
        """Load prompts from CSV file."""
        prompts = {}
        
        if not self.prompts_file.exists():
            logger.error(f"Prompts file not found: {self.prompts_file}")
            return prompts
        
        try:
            # Try different encodings to handle the Windows-1252 characters
            encodings = ['utf-8', 'windows-1252', 'iso-8859-1', 'cp1252']
            content = None
            
            for encoding in encodings:
                try:
                    with open(self.prompts_file, 'r', encoding=encoding) as csvfile:
                        content = csvfile.read()
                        logger.info(f"Successfully read CSV with {encoding} encoding")
                        break
                except UnicodeDecodeError:
                    continue
            
            if content is None:
                logger.error("Could not read CSV file with any encoding")
                return prompts
            
            # Parse the CSV content
            lines = content.strip().split('\n')
            if len(lines) < 2:
                logger.error("CSV file is empty or missing header")
                return prompts
            
            # Parse header
            header = lines[0].strip().split(',')
            if len(header) < 2:
                logger.error("CSV header must have at least 2 columns")
                return prompts
            
            # Parse data rows
            for line in lines[1:]:
                if not line.strip():
                    continue
                
                # Handle quoted fields
                parts = []
                current_part = ""
                in_quotes = False
                
                for char in line:
                    if char == '"':
                        in_quotes = not in_quotes
                    elif char == ',' and not in_quotes:
                        parts.append(current_part.strip())
                        current_part = ""
                    else:
                        current_part += char
                
                parts.append(current_part.strip())
                
                if len(parts) >= 2:
                    image_filename = parts[0].strip('"')
                    prompt = parts[1].strip('"')
                    if image_filename and prompt:
                        prompts[image_filename] = prompt
            
            logger.info(f"Loaded {len(prompts)} prompts")
            
        except Exception as e:
            logger.error(f"Error loading prompts: {e}")
        
        return prompts

    def load_image_data(self, image_path: Path) -> Optional[bytes]:
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

    def correct_single_image(self, image_filename: str, prompt: str, max_retries: int = 3) -> bool:
        """Correct a single image using the generated prompt."""
        logger.info(f"Correcting {image_filename}...")
        
        # Load image data
        image_path = self.processed_dir / image_filename
        if not image_path.exists():
            logger.error(f"Image not found: {image_path}")
            return False
        
        img_data = self.load_image_data(image_path)
        if not img_data:
            return False
        
        # Process with retries
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempt {attempt + 1}/{max_retries} for {image_filename}")
                
                response = self.image_model.generate_content([
                    prompt,
                    {"mime_type": "image/jpeg", "data": img_data}
                ])
                
                if response and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                            # Get corrected image data
                            corrected_image_data = part.inline_data.data
                            if isinstance(corrected_image_data, str):
                                corrected_image_data = base64.b64decode(corrected_image_data)
                            
                            # Save corrected image
                            output_path = self.corrected_dir / f"corrected_{image_filename}"
                            with open(output_path, 'wb') as f:
                                f.write(corrected_image_data)
                            
                            logger.info(f"Corrected image saved to {output_path}")
                            return True
                    
                    logger.warning(f"No image data found in response for {image_filename}")
                else:
                    logger.warning(f"No valid response for {image_filename}")
                
            except Exception as e:
                logger.error(f"Error correcting {image_filename} (attempt {attempt + 1}): {e}")
                
                if "quota" in str(e).lower():
                    logger.error("API quota exceeded, stopping processing")
                    break
                else:
                    logger.warning(f"General error, continuing to next attempt...")
            
            if attempt < max_retries - 1:
                time.sleep(0.5)
        
        logger.error(f"Failed to correct {image_filename} after {max_retries} attempts")
        return False

    def run_correction(self, max_images: int = 10) -> Dict[str, Any]:
        """Run the correction process."""
        logger.info("Starting image correction implementation...")
        
        # Get images to process
        images_to_process = list(self.prompts_data.items())
        
        # Filter images that actually exist in the processed directory
        existing_images = []
        for image_filename, prompt in images_to_process:
            image_path = self.processed_dir / image_filename
            if image_path.exists():
                existing_images.append((image_filename, prompt))
            else:
                logger.warning(f"Image file not found: {image_path}")
        
        if max_images and len(existing_images) > max_images:
            existing_images = existing_images[:max_images]
        
        logger.info(f"Found {len(existing_images)} images to correct (out of {len(images_to_process)} in prompts)")
        
        successful = 0
        failed = 0
        processing_details = []
        
        for i, (image_filename, prompt) in enumerate(existing_images, 1):
            logger.info(f"Processing image {i}/{len(existing_images)}: {image_filename}")
            logger.info(f"Prompt: {prompt}")
            
            if self.correct_single_image(image_filename, prompt):
                successful += 1
                processing_details.append({
                    'image': image_filename,
                    'status': 'success',
                    'prompt': prompt
                })
            else:
                failed += 1
                processing_details.append({
                    'image': image_filename,
                    'status': 'failed',
                    'prompt': prompt
                })
            
            # Rate limiting
            if i < len(existing_images):
                time.sleep(0.5)
        
        results = {
            'total_processed': len(existing_images),
            'successful': successful,
            'failed': failed,
            'success_rate': successful / len(existing_images) if existing_images else 0,
            'processing_details': processing_details
        }
        
        logger.info(f"Image correction complete: {successful}/{len(existing_images)} successful")
        return results

    def print_summary(self, results: Dict[str, Any]) -> None:
        """Print a human-readable summary."""
        print(f"\n{'='*60}")
        print("IMAGE CORRECTION IMPLEMENTATION SUMMARY")
        print(f"{'='*60}")
        print(f"Total processed: {results['total_processed']}")
        print(f"Successful: {results['successful']}")
        print(f"Failed: {results['failed']}")
        print(f"Success rate: {results['success_rate']:.2%}")
        
        if results['processing_details']:
            print(f"\nSuccessful corrections:")
            for detail in results['processing_details']:
                if detail['status'] == 'success':
                    print(f"  [SUCCESS] {detail['image']}")
                    print(f"    Prompt: {detail['prompt'][:100]}...")
            
            if results['failed'] > 0:
                print(f"\nFailed corrections:")
                for detail in results['processing_details']:
                    if detail['status'] == 'failed':
                        print(f"  [FAILED] {detail['image']}")
                        print(f"    Prompt: {detail['prompt'][:100]}...")
        
        print(f"{'='*60}")

    def run(self, max_images: int = 5) -> None:
        """Run the complete image correction process."""
        try:
            logger.info("Starting image correction implementation process...")
            
            # Run correction
            results = self.run_correction(max_images)
            
            # Print summary
            self.print_summary(results)
            
            logger.info("Image correction implementation process completed successfully")
            
        except Exception as e:
            logger.error(f"Error in image correction implementation: {e}")
            raise

def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description='Implement image corrections using prompts from CSV file')
    parser.add_argument('--prompts-file', '-p', 
                       default='detection_results/image_prompts.csv',
                       help='Path to CSV file containing image prompts')
    parser.add_argument('--max-images', '-m', 
                       type=int, 
                       default=60,
                       help='Maximum number of images to process (default: 60)')
    
    args = parser.parse_args()
    
    try:
        implementer = ImageCorrectionImplementer(args.prompts_file)
        implementer.run(max_images=args.max_images)
        
    except Exception as e:
        logger.error(f"Fatal error in image correction implementation: {e}")
        raise

if __name__ == "__main__":
    main()