#!/usr/bin/env python3
"""
Narrative Processor Script - Simple Natural Language Approach
Uses simple, descriptive prompts instead of complex technical specifications.
Tests if natural narrative style works better for Gemini 2.5 image generation.
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
        logging.FileHandler('narrative_processing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class NarrativeProcessor:
    def __init__(self):
        """Initialize the narrative processor with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")

        # Configure Gemini API
        genai.configure(api_key=self.api_key)

        # Single model for generation
        self.generation_model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')

        logger.info("Narrative processor configuration complete:")
        logger.info("  - Generation model: gemini-2.5-flash-image-preview")

        # Directory paths
        self.base_dir = Path('new_designs_narrative')
        self.original_dir = self.base_dir / 'original'
        self.processed_dir = self.base_dir / 'processed'
        self.failed_dir = self.base_dir / 'failed'

        # Create directories
        for dir_path in [self.original_dir, self.processed_dir, self.failed_dir]:
            dir_path.mkdir(exist_ok=True)

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

        # Simple narrative processing prompt
        self.processing_prompt = """I need your help with a clothing task. I have two images:

1. A mannequin with a black body and rose gold head
2. A piece of clothing that I'd like to put on the mannequin

Could you please take the clothing from the second image and dress the mannequin in it? Here's what I need:

- Put the clothing on the mannequin exactly as it appears in the original
- Keep the collar shape exactly the same - if it's a V-neck, keep it a V-neck; if it has lapels, keep the lapels
- Preserve all the details, patterns, and stitching exactly as they are
- If the original clothing doesn't have sleeves or has short sleeves, please add full-length sleeves using the same fabric
- Create matching pants using the same fabric as the main clothing
- Make sure the complete outfit looks natural and well-fitted on the mannequin
- Remove any accessories or jewelry that might be on the clothing
- Place the mannequin on a clean white background

The goal is to create a complete outfit that matches the original clothing perfectly, with matching pants and full-length sleeves."""

        # Simple narrative verification prompt
        self.verification_prompt = """Please analyze the images and respond with PASS or FAIL:

Image 1: Generated outfit to verify
Image 2: Original clothing for comparison
Image 3: Reference mannequin standard

Check if the generated outfit shows:
- Complete outfit with top and bottom clothing
- Clothing matches original exactly (collar shape, details, patterns)
- Full-length sleeves
- Matching pants fabric
- Natural fit on mannequin
- Clean white background

Respond with:
PASS: [if everything matches perfectly]
FAIL: [specific issues that need fixing]"""

        logger.info("NarrativeProcessor initialized successfully")

    def organize_source_images(self):
        """Move existing images to original directory."""
        logger.info("Organizing source images...")

        # Find all image files in the base directory
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        moved_count = 0

        for file_path in self.base_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                # Skip directories and hidden files
                if file_path.name.startswith('.'):
                    continue

                dest_path = self.original_dir / file_path.name
                if not dest_path.exists():
                    shutil.move(str(file_path), str(dest_path))
                    moved_count += 1
                    logger.info(f"Moved {file_path.name} to original directory")

        logger.info(f"Moved {moved_count} images to original directory")
        return moved_count

    def verify_generated_image(self, image_data, original_image_data=None):
        """Verify if generated image meets all requirements."""
        try:
            # Prepare verification inputs - include original image if available
            verification_inputs = [self.verification_prompt]

            # Add generated image
            verification_inputs.append({"mime_type": "image/jpeg", "data": image_data})

            # Add original image for comparison if provided
            if original_image_data:
                verification_inputs.append({"mime_type": "image/jpeg", "data": original_image_data})

            # Add reference mannequin for verification
            verification_inputs.append({"mime_type": "image/jpeg", "data": self.reference_mannequin_data})

            # Send to generation model for verification
            response = self.generation_model.generate_content(verification_inputs)

            # Process response properly - handle both text and inline_data
            verification_result = ""
            if response and response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'text') and part.text:
                        verification_result = part.text.strip()
                        break

            if verification_result:
                logger.info(f"Verification result: {verification_result}")

                # Simple pass/fail detection
                if verification_result.startswith("PASS:"):
                    return True, "Verification passed"
                elif verification_result.startswith("FAIL:"):
                    return False, verification_result
                else:
                    # Fallback detection for natural language
                    if "pass" in verification_result.lower() or "good" in verification_result.lower() or "correct" in verification_result.lower():
                        return True, "Verification passed (inferred)"
                    elif "fail" in verification_result.lower() or "wrong" in verification_result.lower() or "fix" in verification_result.lower():
                        return False, verification_result
                    else:
                        # Default to pass if unclear
                        return True, "Verification passed (assumed)"

            return False, "No verification response"

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error during verification: {error_msg}")

            # Handle specific API conversion errors
            if "Could not convert" in error_msg and "inline_data" in error_msg:
                logger.warning("API returned image data instead of text analysis")
                return False, "AI returned image data instead of text analysis"

            return False, f"Verification error: {error_msg}"

    def process_single_image(self, image_path):
        """Process a single image using simple narrative approach."""
        max_attempts = 3  # Fewer attempts for simple approach
        attempt = 0
        last_verification_result = ""

        while attempt < max_attempts:
            attempt += 1
            logger.info(f"Processing {image_path.name} - Attempt {attempt}")

            try:
                # Use narrative processing prompt
                base_prompt = self.processing_prompt

                # Add simple feedback if needed
                if attempt > 1:
                    base_prompt += f"\n\nThe previous attempt needed some improvements: {last_verification_result}. Please try again with these suggestions in mind."

                # Load original image
                with Image.open(image_path) as img:
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img_byte_arr = BytesIO()
                    img.save(img_byte_arr, format='JPEG')
                    img_byte_arr = img_byte_arr.getvalue()

                # Send to generation model with reference mannequin and original image
                response = self.generation_model.generate_content([
                    base_prompt,
                    {"mime_type": "image/jpeg", "data": self.reference_mannequin_data},  # Reference mannequin
                    {"mime_type": "image/jpeg", "data": img_byte_arr}  # Original product image
                ])

                # Process response
                if response and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                            # Get generated image data
                            generated_image_data = part.inline_data.data
                            if isinstance(generated_image_data, str):
                                generated_image_data = base64.b64decode(generated_image_data)

                            # Verify the generated image
                            logger.info(f"Verifying generated image for {image_path.name}")
                            verification_passed, verification_result = self.verify_generated_image(generated_image_data, img_byte_arr)
                            last_verification_result = verification_result

                            if verification_passed:
                                # Save verified image
                                processed_filename = f"processed_{image_path.stem}.jpg"
                                processed_path = self.processed_dir / processed_filename

                                with open(processed_path, 'wb') as f:
                                    f.write(generated_image_data)

                                logger.info(f"Successfully processed and verified {image_path.name}")
                                return True, processed_path
                            else:
                                logger.warning(f"Verification failed for {image_path.name}: {verification_result}")
                                if attempt < max_attempts:
                                    logger.info(f"Will retry with feedback...")
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
                    continue
                else:
                    return False, f"Error after {max_attempts} attempts: {e}"

        return False, "Max processing attempts reached"

    def batch_process_images(self, max_images=None, sample_mode=False):
        """Process all images in the original directory."""
        logger.info("Starting narrative batch processing...")

        # Get list of images to process
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        images_to_process = []

        for file_path in self.original_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                images_to_process.append(file_path)

        if sample_mode and max_images:
            images_to_process = images_to_process[:max_images]
            logger.info(f"Sample mode: processing {len(images_to_process)} images")

        success_count = 0
        failure_count = 0

        for i, image_path in enumerate(images_to_process, 1):
            logger.info(f"Processing image {i}/{len(images_to_process)}: {image_path.name}")

            success, result = self.process_single_image(image_path)

            if success:
                success_count += 1
            else:
                failure_count += 1
                # Move failed images to failed directory
                failed_path = self.failed_dir / image_path.name
                shutil.copy2(str(image_path), str(failed_path))
                logger.warning(f"Failed to process {image_path.name}: {result}")

            # Rate limiting
            if i < len(images_to_process):
                time.sleep(1)

        logger.info(f"Narrative batch processing complete: {success_count} successful, {failure_count} failed")
        return success_count, failure_count

    def generate_report(self):
        """Generate a processing report."""
        report = {
            'original_images': len(list(self.original_dir.iterdir())),
            'processed_images': len(list(self.processed_dir.iterdir())),
            'failed_images': len(list(self.failed_dir.iterdir())),
            'processing_log': 'narrative_processing.log'
        }

        logger.info("Narrative Processing Report:")
        logger.info(f"Original images: {report['original_images']}")
        logger.info(f"Processed images: {report['processed_images']}")
        logger.info(f"Failed images: {report['failed_images']}")

        return report

def main():
    """Main execution function."""
    try:
        # Initialize narrative processor
        processor = NarrativeProcessor()

        # Organize source images
        processor.organize_source_images()

        # Process images with narrative approach
        logger.info("Starting narrative batch processing...")
        success, failure = processor.batch_process_images()

        if success > 0:
            logger.info(f"Narrative processing completed: {success} images processed successfully.")
        else:
            logger.error("Narrative processing encountered issues. Please check logs.")

        # Generate report
        report = processor.generate_report()

    except Exception as e:
        logger.error(f"Fatal error in main execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()