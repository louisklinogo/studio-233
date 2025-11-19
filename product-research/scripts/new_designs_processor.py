#!/usr/bin/env python3
"""
New Designs Processing Script
Uses Google Gemini 2.5 Flash Image Preview model to standardize new fashion designs
by removing people and placing clothing on neutral mannequins.
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
        logging.FileHandler('new_designs_processing.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class NewDesignsProcessor:
    def __init__(self):
        """Initialize the processor with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")

        # Configure Gemini API
        genai.configure(api_key=self.api_key)

        # Single model for generation
        self.generation_model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')

        logger.info("Single model configuration complete:")
        logger.info("  - Generation model: gemini-2.5-flash-image-preview")

        # Directory paths
        self.base_dir = Path('new_designs')
        self.original_dir = self.base_dir / 'original'
        self.processed_dir = self.base_dir / 'processed'
        self.failed_dir = self.base_dir / 'failed'

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

YOUR TASK: Extract the main clothing item from the original image, put it on the reference mannequin, AND create matching trousers/pants using the same fabric.

EMERGENCY DIRECTIVE: THIS IS A COLLAR-PRESERVATION-CRITICAL TASK. THE AI MODEL HAS A KNOWN BIAS TOWARDS CREATING CHINESE COLLARS. YOU MUST FIGHT THIS BIAS AND PRESERVE THE ORIGINAL COLLAR EXACTLY.

STEP-BY-STEP INSTRUCTIONS:
1. Identify the main clothing item in the original image (suit jacket, shirt, kaftan, etc.)
2. Carefully extract ONLY the exact clothing with its unique styles, texture, fabrics, designs - remove any person, hanger, or background
3. Analyze the fabric patterns, colors, and texture of the extracted clothing
4. COLLAR ANALYSIS STEP: Before proceeding, carefully examine and document the EXACT collar/neckline style, shape, size, and design of the original clothing item. Memorize every detail.
5. CRITICAL ANTI-CHINESE COLLAR INSTRUCTION: UNDER NO CIRCUMSTANCES create chinese-style collars, mandarin collars, or any asian-style necklines. This is STRICTLY FORBIDDEN and will cause immediate rejection.
6. MANDATORY COLLAR PRESERVATION: Create a PERFECT EXACT REPLICA of the original clothing item's collar/neckline EXACTLY as it appears - ZERO collar modifications allowed. The collar must be identical down to the millimeter.
7. Create a PERFECT EXACT REPLICA of the original clothing item and transfer it onto the reference mannequin (as top/shirt/jacket) - PRESERVE ALL original details, patterns, textures, stitching, buttons, zippers, and collar designs and any other design elements EXACTLY as they appear
8. CREATE matching trousers or pants using the EXACT same fabric patterns, colors, and texture as the main clothing item
9. ENSURE the top item has FULL-LENGTH SLEEVES extending to cuff/wrist length - if original is sleeveless or short-sleeved, convert it to have appropriate full-length sleeves using the same fabric, but DO NOT modify any other aspects of the original design
10. COLLAR VERIFICATION: Double-check that the collar is EXACTLY identical to the original - NO rounding, NO straightening, NO cultural adaptations, NO style changes
11. EXTREMELY CRITICAL: DO NOT create chinese-style collars, mandarin collars, or any asian-style necklines. MAINTAIN original collar/neckline style EXACTLY as it appears, ZERO cultural adaptations allowed.
12. Ensure the trousers/pants complement the top item in style and fit
13. Ensure proper fit - both top and bottom should look natural on the mannequin
14. Remove ALL tags, lapel pins, jewelry, watches, accessories, and footwear from the clothing
15. Keep the original clothing colors, patterns, and details for both top and bottom - MAINTAIN PERFECT EXACT REPLICATION of the original item
16. Position the mannequin centrally on a clean white background
17. Show the full mannequin from head to toe with complete outfit

CRITICAL: The original clothing item must be a PERFECT EXACT REPLICA with ZERO modifications to its design elements, patterns, textures, or styling. ONLY TWO changes are permitted:
1. Adding matching trousers/pants (using same fabric)
2. Adjusting sleeve length to full cuff-length (if needed)

COLLAR PRESERVATION IS THE HIGHEST PRIORITY: The collar/neckline must be replicated EXACTLY as it appears in the original image. ANY deviation, no matter how small, is unacceptable.

EMERGENCY ANTI-BIAS MEASURES: The AI model has demonstrated a persistent bias towards converting collars to chinese-style necklines. You MUST actively resist this bias. If the original has a V-neck, maintain the V-neck. If it has a spread collar, maintain the spread collar. If it has a round neck, maintain the round neck. EXACT replication is required.

CRITICAL: The result MUST show the reference mannequin WEARING a complete outfit:
- PERFECT EXACT REPLICA of original clothing item as top/shirt/jacket
- ZERO modifications to original design elements, patterns, textures, stitching, or details
- ABSOLUTE COLLAR PRESERVATION - collar/neckline must be EXACTLY as in original (ZERO collar changes)
- FULL-LENGTH SLEEVES extending to cuff/wrist length (NO sleeveless designs)
- Matching trousers/pants made from same fabric
- Both items must coordinate perfectly
- Sleeves must match the fabric of the main clothing item
- IGNORE cultural associations - focus ONLY on visual elements

PERMITTED MODIFICATIONS (ONLY these two changes allowed):
1. Adding matching trousers/pants using same fabric as original item
2. Adjusting sleeve length to full cuff-length (if original is sleeveless/short-sleeved)

STRICTLY FORBIDDEN:
- ANY modifications to original design elements, patterns, or textures
- Changing colors, styling, or details of the original clothing item
- Adding or removing design features from the original item
- Altering the original clothing in ANY way except sleeve length adjustment
- COLLAR MODIFICATIONS OF ANY KIND - ZERO collar changes allowed
- Cultural style adaptations or interpretations
- Changing neckline or collar shape, size, or style
- CREATING CHINESE-STYLE COLLARS, MANDARIN COLLARS, OR ANY ASIAN-STYLE NECKLINES - THIS IS ABSOLUTELY FORBIDDEN
- ANY chinese, asian, or cultural collar adaptations - STRICTLY PROHIBITED
- Converting original collar to any cultural style neckline
- Rounding, straightening, or otherwise modifying collar shape
- ANY deviation from the original collar design

Do NOT return just the empty reference mannequin!
Do NOT return just the original image!
Do NOT create a cutout of original clothing
The complete outfit must be visibly on the mannequin body
The trousers/pants MUST match the fabric exactly and look natural
SLEEVES MUST be full-length extending to wrists - NO sleeveless or short-sleeve designs allowed
ORIGINAL CLOTHING MUST BE PERFECT EXACT REPLICA - NO UNAUTHORIZED MODIFICATIONS

EMERGENCY FINAL WARNING: IF YOU CREATE ANY CHINESE-STYLE COLLAR, MANDARIN COLLAR, OR ANY ASIAN-STYLE NECKLINE, THE RESULT WILL BE IMMEDIATELY REJECTED. THE AI MODEL'S BIAS TOWARDS CULTURAL ADAPTATION IS KNOWN AND MUST BE ACTIVELY RESISTED. MAINTAIN ORIGINAL COLLAR EXACTLY AS IT APPEARS - ZERO CULTURAL ADAPTATIONS PERMITTED UNDER ANY CIRCUMSTANCES."""

        # Verification prompt
        self.verification_prompt = """COMPARATIVE VERIFICATION: You will receive 3 images:
1. Generated image (to verify)
2. Original product image (for comparison)
3. Reference mannequin (for verification)

YOUR TASK: Compare generated image against original image to ensure perfect replication while meeting all requirements.

IMAGE ORDER ANALYSIS:
- First image: Generated result to verify
- Second image: Original product for exact comparison
- Third image: Reference mannequin standard

CORE REQUIREMENTS:
1. Complete outfit visible on mannequin (top AND bottom clothing)
2. Black mannequin body with rose gold head
3. Full mannequin visible from head to toe
4. Clean white background
5. No jewelry, watches, or accessories
6. No footwear
7. PERFECT EXACT REPLICA of original clothing item with ZERO unauthorized modifications
8. ABSOLUTE COLLAR PRESERVATION - collar/neckline EXACTLY as original (ZERO collar changes)
9. Matching fabric patterns between top and bottom clothing
10. Trousers/pants must be present and match the top item's fabric
11. FULL-LENGTH SLEEVES extending to cuff/wrist length (NO sleeveless or short-sleeve)
12. Sleeves must match the fabric of the main clothing item
13. ALL original design elements, patterns, textures, and details preserved exactly

CRITICAL COMPARISON CHECK: Compare generated image (Image 1) against original image (Image 2):
- Is the collar/neckline EXACTLY identical to the original?
- Are all design elements, patterns, textures preserved perfectly?
- Has ANY unauthorized modification been made to the original design?
- Does the top clothing match the original clothing exactly?

CHECK IN THIS ORDER:
- Is there a complete outfit with both top AND bottom clothing? (FAIL if missing trousers/pants)
- CRITICAL COMPARISON: Does generated image match original image exactly? (FAIL if any deviations)
- COLLAR PRESERVATION: Is the collar/neckline EXACTLY identical to the original image? (IMMEDIATE FAIL if any changes)
- Is the top clothing item a PERFECT EXACT REPLICA of the original? (FAIL if any unauthorized modifications)
- Does the top item have FULL-LENGTH sleeves extending to wrists? (FAIL if sleeveless or short-sleeve)
- Do the top and bottom items have matching fabric patterns/colors?
- Do the sleeves match the fabric of the main clothing item?
- Are ALL original design elements, patterns, textures, and details preserved exactly?
- Is the mannequin body black with rose gold head?
- Is the full mannequin visible?
- Is the background clean and white?
- Are there any jewelry, accessories, or footwear?
- Do the trousers/pants look natural and coordinate with the top?

COMPARISON FAILURE RESPONSES:
- If generated doesn't match original: "FAIL: Generated image does not match original exactly"
- If collar modified: "FAIL: Collar modified - must maintain original collar exactly"
- If design changed: "FAIL: Design elements modified from original"

Respond with:
PASS: Generated image matches original exactly and meets all requirements
FAIL: [specific differences or missing requirements]"""

        logger.info("NewDesignsProcessor initialized successfully")

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


    def parse_collar_feedback(self, verification_result):
        """Parse verification result to extract specific collar feedback."""
        feedback = []

        # Detect collar type differences
        if "standard suit collar" in verification_result.lower():
            feedback.append("ORIGINAL_HAS_STANDARD_SUIT_COLLAR")
        if "lapels" in verification_result.lower():
            feedback.append("ORIGINAL_HAS_LAPELS")
        if "v-neck" in verification_result.lower():
            feedback.append("ORIGINAL_HAS_V_NECK")
        if "spread collar" in verification_result.lower():
            feedback.append("ORIGINAL_HAS_SPREAD_COLLAR")
        if "round neck" in verification_result.lower():
            feedback.append("ORIGINAL_HAS_ROUND_NECK")

        # Detect generated collar problems
        if "mandarin-style collar" in verification_result.lower():
            feedback.append("GENERATED_HAS_MANDARIN_COLLAR")
        if "chinese-style collar" in verification_result.lower():
            feedback.append("GENERATED_HAS_CHINESE_COLLAR")
        if "asian-style neckline" in verification_result.lower():
            feedback.append("GENERATED_HAS_ASIAN_NECKLINE")

        return feedback

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
        """Process a single image using reference mannequin with enhanced feedback loop."""
        max_attempts = 7  # Optimized limit based on log analysis - most successes occur within 7 attempts
        attempt = 0
        last_verification_result = ""
        collar_feedback = []

        while attempt < max_attempts:
            attempt += 1
            logger.info(f"Processing {image_path.name} - Attempt {attempt}")

            try:
                # Use comprehensive processing prompt
                base_prompt = self.processing_prompt

                # Build enhanced prompt with feedback
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
                    if "trousers" in last_verification_result.lower() or "pants" in last_verification_result.lower():
                        prompt += "- CREATE matching trousers/pants using the EXACT same fabric as the top clothing item\n"
                        prompt += "- Ensure the trousers/pants coordinate perfectly with the top item\n"
                        prompt += "- The fabric patterns and colors MUST match exactly\n"
                    if "complete outfit" in last_verification_result.lower():
                        prompt += "- Ensure BOTH top AND bottom clothing items are present\n"
                        prompt += "- Create matching trousers/pants that complement the top item\n"
                    if "fabric" in last_verification_result.lower() and "match" in last_verification_result.lower():
                        prompt += "- Ensure the trousers/pants use the EXACT same fabric patterns and colors as the top\n"
                        prompt += "- The coordination between top and bottom must be perfect\n"
                    if "sleeve" in last_verification_result.lower() or "sleeveless" in last_verification_result.lower():
                        prompt += "- ENSURE the top item has FULL-LENGTH SLEEVES extending to cuff/wrist length\n"
                        prompt += "- NO sleeveless or short-sleeve designs allowed\n"
                        prompt += "- Sleeves must use the EXACT same fabric as the main clothing item\n"
                        prompt += "- Convert any sleeveless design to have appropriate full-length sleeves\n"
                    if "collar" in last_verification_result.lower() or "neckline" in last_verification_result.lower() or "chinese" in last_verification_result.lower() or "mandarin" in last_verification_result.lower() or "asian" in last_verification_result.lower():
                        prompt += "- COLLAR EMERGENCY: The collar has been modified - THIS IS ABSOLUTELY FORBIDDEN\n"
                        prompt += "- You MUST examine the original image collar EXTREMELY carefully and replicate it EXACTLY\n"
                        prompt += "- The collar MUST be identical to the original - ZERO modifications permitted\n"
                        prompt += "- DO NOT create chinese-style collars, mandarin collars, or asian necklines\n"
                        prompt += "- The AI model has a bias towards cultural adaptation - you MUST RESIST this bias\n"

                        # Add specific collar type detection and preservation
                        if "standard suit collar" in last_verification_result.lower() or "lapels" in last_verification_result.lower():
                            prompt += "- ORIGINAL HAS STANDARD SUIT COLLAR WITH LAPELS - REPLICATE THIS EXACTLY\n"
                            prompt += "- DO NOT convert to mandarin collar - maintain the pointed lapel structure\n"
                        if "v-neck" in last_verification_result.lower():
                            prompt += "- ORIGINAL HAS V-NECK - MAINTAIN V-SHAPE EXACTLY\n"
                        if "spread collar" in last_verification_result.lower():
                            prompt += "- ORIGINAL HAS SPREAD COLLAR - MAINTAIN SPREAD ANGLE EXACTLY\n"
                        if "round neck" in last_verification_result.lower():
                            prompt += "- ORIGINAL HAS ROUND NECK - MAINTAIN CURVED SHAPE EXACTLY\n"

                        prompt += "- NO rounding, NO straightening, NO cultural adaptations, NO style changes\n"
                        prompt += "- The collar must be PERFECT EXACT REPLICA down to the millimeter\n"
                        prompt += "- Compare the collar shape pixel by pixel between original and generated\n"

                        # Add specific feedback based on parsed collar analysis
                        if "ORIGINAL_HAS_STANDARD_SUIT_COLLAR" in collar_feedback:
                            prompt += "- CRITICAL: Original has standard suit collar with lapels - you MUST replicate this exact structure\n"
                        if "ORIGINAL_HAS_LAPELS" in collar_feedback:
                            prompt += "- CRITICAL: Original has lapels - maintain the pointed lapel structure exactly\n"
                        if "GENERATED_HAS_MANDARIN_COLLAR" in collar_feedback:
                            prompt += "- ERROR: You created a mandarin collar - this is WRONG\n"
                            prompt += "- You MUST create the original collar type, NOT a mandarin collar\n"
                        if "GENERATED_HAS_CHINESE_COLLAR" in collar_feedback:
                            prompt += "- ERROR: You created a chinese-style collar - this is WRONG\n"
                            prompt += "- Study the original image collar and replicate it EXACTLY\n"
                    if "replica" in last_verification_result.lower() or "exact" in last_verification_result.lower() or "modification" in last_verification_result.lower():
                        prompt += "- Create a PERFECT EXACT REPLICA of the original clothing item\n"
                        prompt += "- ZERO modifications to original design elements, patterns, textures, or details\n"
                        prompt += "- Preserve ALL original styling, buttons, zippers, stitching, and features exactly\n"
                        prompt += "- ONLY permitted changes: adding matching trousers/pants and sleeve length adjustment\n"
                        prompt += "- DO NOT alter any aspect of the original clothing except sleeve length\n"
                    if "cultural" in last_verification_result.lower() or "chinese" in last_verification_result.lower() or "mandarin" in last_verification_result.lower() or "asian" in last_verification_result.lower() or "style" in last_verification_result.lower():
                        prompt += "- CULTURAL BIAS EMERGENCY: The AI is making cultural adaptations - THIS IS FORBIDDEN\n"
                        prompt += "- IGNORE ALL cultural associations and style interpretations\n"
                        prompt += "- Focus ONLY on visual elements, NOT cultural context\n"
                        prompt += "- DO NOT adapt to cultural styles - maintain original design exactly\n"
                        prompt += "- The AI model has a known bias towards chinese collar conversion - RESIST THIS BIAS\n"
                        prompt += "- Perfect replication requires ignoring ALL cultural bias\n"
                        prompt += "- Examine the original image and replicate it EXACTLY without cultural interpretation\n"
                    prompt += "\nThe reference mannequin is perfect - focus on creating a PERFECT EXACT REPLICA of the original clothing with ABSOLUTE collar preservation and NO cultural style adaptations."

                # Add visual comparison instructions for collar failures
                if any(keyword in last_verification_result.lower() for keyword in ["collar", "neckline", "chinese", "mandarin", "asian"]):
                    prompt += "\n\nVISUAL COMPARISON INSTRUCTIONS:\n"
                    prompt += "- Place original and generated images side by side\n"
                    prompt += "- Compare collar shape line by line, curve by curve\n"
                    prompt += "- Measure the angle and depth of the collar opening\n"
                    prompt += "- Count the number of collar points if applicable\n"
                    prompt += "- Match the exact curve radius and length\n"
                    prompt += "- If original has pointed lapels, replicate exact point shape\n"
                    prompt += "- If original has rounded collar, match exact curve radius\n"
                    prompt += "- ZERO tolerance for collar shape deviations\n"

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

                            # Parse specific collar feedback for better retry instructions
                            collar_feedback = self.parse_collar_feedback(verification_result)
                            if collar_feedback:
                                logger.info(f"Collar feedback detected: {collar_feedback}")

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

                                # Special handling for collar failures - these are critical
                                if any(keyword in verification_result.lower() for keyword in ["collar", "neckline", "chinese", "mandarin", "asian", "cultural"]):
                                    logger.error(f"COLLAR FAILURE DETECTED for {image_path.name}: {verification_result}")
                                    logger.error("This indicates AI model bias - retrying with emergency collar instructions")
                                    if attempt < max_attempts:
                                        logger.info(f"Emergency collar retry - attempt {attempt + 1}")
                                        # Force immediate retry with enhanced collar focus
                                        continue
                                    else:
                                        logger.error(f"Max attempts reached for {image_path.name} - collar preservation failed")
                                        return False, f"COLLAR FAILURE after {max_attempts} attempts: {verification_result}"
                                else:
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
                    continue
                else:
                    return False, f"Error after {max_attempts} attempts: {e}"

        return False, "Max processing attempts reached"

    def batch_process_images(self, max_images=None, sample_mode=False):
        """Process all images in the original directory."""
        logger.info("Starting batch processing...")

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

            # Rate limiting - avoid API quota issues
            if i < len(images_to_process):
                time.sleep(1)

        logger.info(f"Batch processing complete: {success_count} successful, {failure_count} failed")
        return success_count, failure_count

    def generate_report(self):
        """Generate a processing report."""
        report = {
            'original_images': len(list(self.original_dir.iterdir())),
            'processed_images': len(list(self.processed_dir.iterdir())),
            'failed_images': len(list(self.failed_dir.iterdir())),
            'processing_log': 'new_designs_processing.log'
        }

        logger.info("Processing Report:")
        logger.info(f"Original images: {report['original_images']}")
        logger.info(f"Processed images: {report['processed_images']}")
        logger.info(f"Failed images: {report['failed_images']}")

        return report

def main():
    """Main execution function."""
    try:
        # Initialize processor
        processor = NewDesignsProcessor()

        # Organize source images
        processor.organize_source_images()

        # Process all images
        logger.info("Starting full batch processing of new designs...")
        success, failure = processor.batch_process_images()

        if success > 0:
            logger.info(f"Full batch processing completed: {success} images processed successfully.")
        else:
            logger.error("Batch processing encountered issues. Please check logs.")

        # Generate report
        report = processor.generate_report()

    except Exception as e:
        logger.error(f"Fatal error in main execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()