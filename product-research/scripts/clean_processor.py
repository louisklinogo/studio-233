#!/usr/bin/env python3
"""
Clean Processor Script - Reverse Psychology Approach
Tests if avoiding negative reinforcement reduces AI bias towards cultural adaptations.
Focuses only on positive instructions without mentioning prohibitions.
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
        logging.FileHandler('clean_processing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class CleanProcessor:
    def __init__(self):
        """Initialize the clean processor with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")

        # Configure Gemini API
        genai.configure(api_key=self.api_key)

        # Single model for generation
        self.generation_model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')

        logger.info("Clean processor configuration complete:")
        logger.info("  - Generation model: gemini-2.5-flash-image-preview")

        # Directory paths
        self.base_dir = Path('new_designs_clean')
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

        # Clean processing prompt - NO negative language, NO prohibitions
        self.processing_prompt = """You are given TWO images:
1. A reference mannequin (black body, rose gold head)
2. An original product image containing clothing

YOUR TASK: Extract the main clothing item from the original image, put it on the reference mannequin, AND create matching trousers/pants using the same fabric.

STEP-BY-STEP INSTRUCTIONS:
1. Identify the main clothing item in the original image (suit jacket, shirt, kaftan, etc.)
2. Carefully extract the exact clothing with its unique styles, texture, fabrics, designs
3. Analyze the fabric patterns, colors, and texture of the extracted clothing
4. Create a perfect replica of the original clothing item and transfer it onto the reference mannequin
5. Ensure the collar and neckline match the original exactly
6. Preserve all original design elements, patterns, textures, stitching, buttons, and details
7. Create matching trousers or pants using the same fabric patterns, colors, and texture
8. Ensure the top item has full-length sleeves extending to cuff/wrist length
9. Position the complete outfit naturally on the mannequin
10. Ensure proper fit for both top and bottom items
11. Remove any tags, jewelry, watches, or accessories
12. Maintain original colors and patterns throughout
13. Position the mannequin centrally on a clean white background
14. Show the full mannequin from head to toe

PERFECT REPLICATION REQUIREMENTS:
- The original clothing design must be replicated exactly
- Collar and neckline shape must match the original perfectly
- All patterns, textures, and details should be preserved
- The outfit should look natural and well-fitted on the mannequin
- Sleeves should be full-length and match the main fabric
- Trousers/pants should coordinate perfectly with the top item

The result should show the reference mannequin wearing a complete, well-coordinated outfit."""

        # Clean verification prompt
        self.verification_prompt = """COMPARATIVE VERIFICATION: You will receive 3 images:
1. Generated image (to verify)
2. Original product image (for comparison)
3. Reference mannequin (for verification)

YOUR TASK: Compare generated image against original image to ensure perfect replication.

IMAGE ORDER ANALYSIS:
- First image: Generated result to verify
- Second image: Original product for exact comparison
- Third image: Reference mannequin standard

QUALITY REQUIREMENTS:
1. Complete outfit visible on mannequin (top AND bottom clothing)
2. Black mannequin body with rose gold head
3. Full mannequin visible from head to toe
4. Clean white background
5. No jewelry, watches, or accessories
6. Perfect replication of original clothing item
7. Collar/neckline matches original exactly
8. Matching fabric patterns between top and bottom
9. Full-length sleeves extending to wrists
10. All original design elements preserved

COMPARISON CHECK: Compare generated image (Image 1) against original image (Image 2):
- Does the collar/neckline match exactly?
- Are all design elements preserved?
- Does the clothing match the original perfectly?

Respond with:
PASS: Generated image meets all quality requirements and matches original exactly
FAIL: [specific differences or missing requirements]"""

        logger.info("CleanProcessor initialized successfully")

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

            if response and response.text:
                verification_result = response.text.strip().upper()
                logger.info(f"Verification result: {verification_result}")

                if verification_result.startswith("PASS:"):
                    return True, "Verification passed"
                elif verification_result.startswith("FAIL:"):
                    return False, verification_result
                else:
                    # If unclear response, check for key indicators
                    if "pass" in response.text.lower():
                        return True, "Verification passed (inferred)"
                    else:
                        return False, f"Unclear verification: {response.text}"

            return False, "No verification response"

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error during verification: {error_msg}")

            # Handle specific API conversion errors
            if "Could not convert" in error_msg and "inline_data" in error_msg:
                logger.warning("API conversion error - retrying with same image")
                return False, "API conversion error - retrying"

            return False, f"Verification error: {error_msg}"

    def process_single_image(self, image_path):
        """Process a single image using reference mannequin with clean approach."""
        max_attempts = 5  # Fewer attempts for clean approach
        attempt = 0
        last_verification_result = ""

        while attempt < max_attempts:
            attempt += 1
            logger.info(f"Processing {image_path.name} - Attempt {attempt}")

            try:
                # Use clean processing prompt
                base_prompt = self.processing_prompt

                # Build enhanced prompt with feedback (clean approach)
                if attempt == 1:
                    prompt = base_prompt
                else:
                    prompt = base_prompt + f"\n\nPREVIOUS ATTEMPT NEEDS IMPROVEMENT: {last_verification_result}\n\nPlease focus on:\n"
                    if "trousers" in last_verification_result.lower() or "pants" in last_verification_result.lower():
                        prompt += "- Create matching trousers/pants using the same fabric\n"
                    if "complete outfit" in last_verification_result.lower():
                        prompt += "- Ensure both top and bottom clothing are present\n"
                    if "sleeve" in last_verification_result.lower():
                        prompt += "- Ensure full-length sleeves extending to wrists\n"
                    if "collar" in last_verification_result.lower() or "neckline" in last_verification_result.lower():
                        prompt += "- Ensure collar and neckline match original exactly\n"
                    if "match" in last_verification_result.lower() or "replica" in last_verification_result.lower():
                        prompt += "- Focus on perfect replication of the original design\n"
                    prompt += "\nContinue with clean, precise replication."

                # Load original image
                with Image.open(image_path) as img:
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    img_byte_arr = BytesIO()
                    img.save(img_byte_arr, format='JPEG')
                    img_byte_arr = img_byte_arr.getvalue()

                # Send to generation model with reference mannequin and original image
                response = self.generation_model.generate_content([
                    prompt,
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

                            # Verify the generated image with original image for comparison
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
                                    logger.info(f"Will retry with improvement feedback...")
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
        logger.info("Starting clean batch processing...")

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

        logger.info(f"Clean batch processing complete: {success_count} successful, {failure_count} failed")
        return success_count, failure_count

    def generate_report(self):
        """Generate a processing report."""
        report = {
            'original_images': len(list(self.original_dir.iterdir())),
            'processed_images': len(list(self.processed_dir.iterdir())),
            'failed_images': len(list(self.failed_dir.iterdir())),
            'processing_log': 'clean_processing.log'
        }

        logger.info("Clean Processing Report:")
        logger.info(f"Original images: {report['original_images']}")
        logger.info(f"Processed images: {report['processed_images']}")
        logger.info(f"Failed images: {report['failed_images']}")

        return report

def main():
    """Main execution function."""
    try:
        # Initialize clean processor
        processor = CleanProcessor()

        # Organize source images
        processor.organize_source_images()

        # Process images with clean approach
        logger.info("Starting clean batch processing...")
        success, failure = processor.batch_process_images()

        if success > 0:
            logger.info(f"Clean processing completed: {success} images processed successfully.")
        else:
            logger.error("Clean processing encountered issues. Please check logs.")

        # Generate report
        report = processor.generate_report()

    except Exception as e:
        logger.error(f"Fatal error in main execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()