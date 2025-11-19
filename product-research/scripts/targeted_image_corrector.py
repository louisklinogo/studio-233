#!/usr/bin/env python3
"""
Simple Targeted Image Correction Script
Corrects specific issues in processed images based on detection data.
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
from typing import List, Dict, Any

# Import detection components
from detection_data_loader import DetectionDataLoader, DetectionItem, IntegrityIssue
from targeted_removal_prompts import TargetedRemovalPromptGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('targeted_correction.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class TargetedImageCorrector:
    def __init__(self):
        """Initialize the targeted image corrector."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')
        
        # Directory paths
        self.processed_dir = Path('product-assets/processed')
        self.corrected_dir = Path('product-assets/corrected')
        self.corrected_dir.mkdir(exist_ok=True)
        
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
        
        # Initialize detection components
        self.detection_loader = DetectionDataLoader()
        self.prompt_generator = TargetedRemovalPromptGenerator()
        
        # Load detection data
        logger.info("Loading detection data...")
        self.detection_loader.load_all_data()
        
        logger.info("Targeted Image Corrector initialized")

    def load_image_data(self, image_path: Path):
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

    def generate_correction_prompt(self, image_filename: str) -> str:
        """Generate a simple correction prompt for an image."""
        detections = self.detection_loader.get_detections_for_image(image_filename)
        integrity = self.detection_loader.get_integrity_for_image(image_filename)
        
        if not detections and (not integrity or integrity.garment_complete):
            return None  # No corrections needed
        
        prompt = "Clean up this product image:\n\n"
        
        # Add specific removal instructions
        if detections:
            prompt += "REMOVE these unwanted elements:\n"
            for detection in detections:
                location = detection.location_on_attire.replace('_', ' ')
                prompt += f"- Remove {detection.item_type} from {location}\n"
        
        # Add integrity fixes
        if integrity and not integrity.garment_complete:
            prompt += "\nFIX these issues:\n"
            if integrity.missing_trousers:
                prompt += "- Add appropriate trousers\n"
            if integrity.missing_sleeves:
                prompt += "- Add sleeves if missing\n"
        
        prompt += "\nMake sure the final result shows the clothing properly on the black mannequin with rose gold head."
        return prompt

    def correct_single_image(self, image_filename: str, max_retries: int = 3) -> bool:
        """Correct a single image based on detection data."""
        logger.info(f"Correcting {image_filename}...")
        
        # Check if correction is needed
        prompt = self.generate_correction_prompt(image_filename)
        if not prompt:
            logger.info(f"No corrections needed for {image_filename}")
            return True
        
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
                
                response = self.model.generate_content([
                    prompt,
                    {"mime_type": "image/jpeg", "data": self.reference_mannequin_data},
                    {"mime_type": "image/jpeg", "data": img_data}
                ])
                
                if response and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                            # Get generated image data
                            generated_image_data = part.inline_data.data
                            if isinstance(generated_image_data, str):
                                generated_image_data = base64.b64decode(generated_image_data)
                            
                            # Save corrected image
                            output_path = self.corrected_dir / f"corrected_{image_filename}"
                            with open(output_path, 'wb') as f:
                                f.write(generated_image_data)
                            
                            logger.info(f"Corrected image saved to {output_path}")
                            return True
                    
                    logger.warning(f"No image data found in response for {image_filename}")
                else:
                    logger.warning(f"No valid response for {image_filename}")
                
            except Exception as e:
                logger.error(f"Error correcting {image_filename} (attempt {attempt + 1}): {e}")
                
                if "Could not convert" in str(e):
                    logger.warning("API conversion error, trying simpler prompt...")
                    # Try with very simple prompt
                    try:
                        simple_response = self.model.generate_content([
                            "Clean up this clothing image and put it on a black mannequin",
                            {"mime_type": "image/jpeg", "data": self.reference_mannequin_data},
                            {"mime_type": "image/jpeg", "data": img_data}
                        ])
                        
                        if simple_response and simple_response.candidates and simple_response.candidates[0].content.parts:
                            for part in simple_response.candidates[0].content.parts:
                                if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                                    generated_image_data = part.inline_data.data
                                    if isinstance(generated_image_data, str):
                                        generated_image_data = base64.b64decode(generated_image_data)
                                    
                                    output_path = self.corrected_dir / f"corrected_{image_filename}"
                                    with open(output_path, 'wb') as f:
                                        f.write(generated_image_data)
                                    
                                    logger.info(f"Simple correction saved for {image_filename}")
                                    return True
                    except Exception as simple_e:
                        logger.error(f"Simple approach failed: {simple_e}")
                
                time.sleep(1)
            
            if attempt < max_retries - 1:
                time.sleep(0.5)
        
        logger.error(f"Failed to correct {image_filename} after {max_retries} attempts")
        return False

    def run_targeted_corrections(self, max_images: int = 5) -> Dict[str, Any]:
        """Run corrections on images that need them."""
        logger.info("Starting targeted image corrections...")
        
        # Get images that need processing
        images_needing_correction = self.detection_loader.get_images_needing_processing()
        
        if max_images:
            images_needing_correction = images_needing_correction[:max_images]
        
        logger.info(f"Found {len(images_needing_correction)} images needing correction")
        
        successful = 0
        failed = 0
        
        for i, image_filename in enumerate(images_needing_correction, 1):
            logger.info(f"Processing image {i}/{len(images_needing_correction)}: {image_filename}")
            
            if self.correct_single_image(image_filename):
                successful += 1
            else:
                failed += 1
            
            # Rate limiting
            if i < len(images_needing_correction):
                time.sleep(0.5)
        
        results = {
            'total_processed': len(images_needing_correction),
            'successful': successful,
            'failed': failed,
            'success_rate': successful / len(images_needing_correction) if images_needing_correction else 0
        }
        
        logger.info(f"Correction complete: {successful}/{len(images_needing_correction)} successful")
        return results

def main():
    """Main execution function."""
    try:
        corrector = TargetedImageCorrector()
        
        # Show what needs correction
        images_needing_correction = corrector.detection_loader.get_images_needing_processing()
        logger.info(f"Images needing correction: {len(images_needing_correction)}")
        
        # Run corrections
        results = corrector.run_targeted_corrections(max_images=3)
        
        logger.info("Correction Summary:")
        logger.info(f"Total processed: {results['total_processed']}")
        logger.info(f"Successful: {results['successful']}")
        logger.info(f"Failed: {results['failed']}")
        logger.info(f"Success rate: {results['success_rate']:.2%}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()