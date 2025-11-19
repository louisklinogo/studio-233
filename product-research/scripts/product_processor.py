#!/usr/bin/env python3
"""
Product Shoot Standardization Script
Uses Google Gemini 2.5 Flash Image Preview model to standardize product images
by removing people and placing clothing on neutral mannequins.
"""

import os
import sys
import shutil
from pathlib import Path
from PIL import Image
from google import genai
from google.genai import types
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

class ProductImageProcessor:
    def __init__(self):
        """Initialize the processor with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Create new SDK client
        self.client = genai.Client(api_key=self.api_key)
        self.model_id = "gemini-2.5-flash-image"
        
        logger.info("New SDK configuration complete:")
        logger.info(f"  - Model: {self.model_id}")
        logger.info("  - Aspect ratio: 2:3 (832x1248 -> upscaled to 1664x2496)")
        
        # Directory paths
        self.base_dir = Path('whatsapp-from-edward')
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
        
        # Comprehensive processing prompt - LUXURY HIGH-FIDELITY FOCUS WITH XML STRUCTURE
        self.processing_prompt = """<role>You are a LUXURY FASHION IMAGING SPECIALIST working for a HIGH-END AFRICAN FASHION BRAND.</role>

<inputs>
<reference_mannequin>Black body with rose gold head - your professional canvas</reference_mannequin>
<original_product_photo>The luxury garment to extract and transfer</original_product_photo>
</inputs>

<mission>
Create a PHOTOREALISTIC, MUSEUM-QUALITY product image by transferring the clothing onto the reference mannequin with ABSOLUTE FIDELITY to the original garment's luxury appearance.
</mission>

<critical_priority_1>
<title>REMOVE ALL TAGS, LABELS, AND BRANDING</title>
<execution_order>FIRST - Before anything else</execution_order>

<items_to_remove>
- ALL metallic tags (gold, silver, bronze from original manufacturers)
- ALL brand labels, logos, manufacturer names
- ALL price tags, barcode stickers, retail labels
- ALL hanging tags attached to garments
- ALL care instruction labels visible on clothing
- ANY text, QR codes, or branding from original companies
</items_to_remove>

<scan_locations>
Check collar, sleeves, hem, waistband, pockets, inside visible areas, neckline, cuffs
</scan_locations>

<removal_quality>
Remove CLEANLY with no trace remaining - blend the area seamlessly into surrounding fabric
</removal_quality>
</critical_priority_1>

<critical_priority_2>
<title>PHOTOREALISTIC LUXURY RENDERING</title>

<brand_standard>PREMIUM LUXURY AFRICAN FASHION HOUSE</brand_standard>

<output_quality_requirements>
<photography_standard>Professional studio photography for high-end fashion e-commerce</photography_standard>
<camera_specification>High-resolution DSLR quality (Canon EOS R5, 45MP+)</camera_specification>
<lighting>Perfect studio lighting with soft shadows and natural highlights</lighting>
<focus>SHARP focus - every stitch, thread, and texture visible</focus>
<color_accuracy>Rich, accurate colors matching the original EXACTLY</color_accuracy>
<fabric_appearance>Luxurious - silk looks silky, cotton crisp, embroidery dimensional</fabric_appearance>
</output_quality_requirements>

<fabric_texture_fidelity>
<weave_patterns>Preserve EXACT weave patterns and material appearance</weave_patterns>
<finish>Maintain shine/matte finish exactly as in original</finish>
<draping>Keep all fabric draping, folds, and natural movement</draping>
<weight>Show fabric weight and body (heavy fabrics hang differently than light)</weight>
</fabric_texture_fidelity>
</critical_priority_2>

<critical_priority_3>
<title>PRESERVE EVERY DESIGN DETAIL EXACTLY</title>
<garment_type>HANDCRAFTED LUXURY PIECE - Do NOT simplify or alter</garment_type>

<sleeve_details>
<length>EXACT sleeve length (short=short, long=long, 3/4=3/4) - NO CHANGES</length>
<cuffs>Exact cuff style, buttons, closures</cuffs>
<embellishments>Any embroidery, piping, or trim on sleeves</embellishments>
</sleeve_details>

<embellishments_and_embroidery>
<patterns>All embroidered patterns with EXACT thread colors and placement</patterns>
<beadwork>All beadwork, sequins, appliqués preserved</beadwork>
<trim>All piping, trim, braiding, decorative stitching</trim>
<dimensionality>Maintain dimensional quality - embroidery should look raised</dimensionality>
</embellishments_and_embroidery>

<closures_and_fastenings>
<buttons>Exact button placement, size, style, and number</buttons>
<zippers>Zipper positions and styles</zippers>
<other>Hooks, ties, toggles, snaps in exact positions</other>
<types>Decorative vs functional closures preserved</types>
</closures_and_fastenings>

<structural_details>
<neckline>Exact neckline shape and depth</neckline>
<collar>Collar style and construction</collar>
<pockets>Pocket placement, size, and style</pockets>
<seams>Seam lines and construction details</seams>
<hem>Hem length and finish</hem>
</structural_details>

<patterns_and_prints>
<repeat>Exact pattern repeat and scale</repeat>
<colors>Color accuracy in multi-color patterns</colors>
<alignment>Pattern alignment and flow</alignment>
<gradients>Any gradient or ombre effects</gradients>
</patterns_and_prints>
</critical_priority_3>

<execution_steps>
<step_1>
<action>SCAN FOR TAGS</action>
<instructions>Look at EVERY part - collar, sleeves, hem, waistband, pockets, inside visible areas. Remove ALL tags completely.</instructions>
</step_1>

<step_2>
<action>IDENTIFY GARMENT</action>
<check>Full outfit (top + bottom) or just top? Single person or multiple people?</check>
</step_2>

<step_3>
<action>EXTRACT GARMENT WITH PRECISION</action>
<remove>Person, hanger, background completely</remove>
<keep>EVERY design detail, texture, embellishment</keep>
<preserve>Exact colors, fabric appearance, luxury feel</preserve>
</step_3>

<step_4>
<action>ADD MATCHING BOTTOMS (IF NEEDED)</action>
<condition>If original shows ONLY a top/shirt/tunic/blouse WITHOUT bottoms</condition>
<then>
  <add>Elegant matching trousers or pants</add>
  <match>Fabric quality, color family, style sophistication</match>
  <ensure>Bottoms complement the top's luxury aesthetic</ensure>
</then>
<else>If outfit is complete, proceed as-is</else>
</step_4>

<step_5>
<action>HANDLE MULTIPLE OUTFITS</action>
<condition>If 2+ people in original wearing different outfits</condition>
<then>
  <create>2+ mannequins side-by-side</create>
  <extract>Each outfit separately with same luxury standards</extract>
  <space>Space mannequins naturally</space>
</then>
</step_5>

<step_6>
<action>TRANSFER TO MANNEQUIN WITH LUXURY FIT</action>
<dress>Dress the black mannequin (rose gold head) in the garment</dress>
<draping>Ensure garment drapes naturally with proper fabric physics</draping>
<silhouette>Maintain the garment's intended silhouette and fit</silhouette>
<positioning>Show garment sitting properly on mannequin body</positioning>
</step_6>

<step_7>
<action>REMOVE ACCESSORIES & JEWELRY</action>
<jewelry>Remove ALL jewelry (necklaces, earrings, bracelets, rings)</jewelry>
<accessories>Remove watches, belts (unless integral to design), footwear, bags, hats</accessories>
<draping_items>Remove scarves, shawls (unless part of outfit design)</draping_items>
</step_7>

<step_8>
<action>FINAL COMPOSITION</action>
<positioning>Position mannequin(s) centrally</positioning>
<background>Pure white background (RGB 255,255,255)</background>
<framing>Full mannequin visible from head to toe</framing>
<lighting>Professional studio lighting</lighting>
<focus>Sharp focus on every detail</focus>
</step_8>
</execution_steps>

<absolute_requirements>
<must_have>
- Output MUST be photorealistic luxury quality
- Output MUST show clothing ON the mannequin (not empty, not just original)
- Output MUST have ZERO tags, labels, or original branding visible
- Output MUST preserve EXACT design details from original
- Output MUST look like original garment (same colors, textures, details)
- Output MUST be high-fidelity - sharp, clear, professional
- Mannequin MUST be completely black body with rose gold head
- Background MUST be pure white
</must_have>

<must_not>
- Do NOT add designs not in original (except complementary bottoms)
- Do NOT simplify intricate details
- Do NOT alter sleeve lengths, patterns, or embellishments
- Do NOT leave any tags or labels visible
- Do NOT produce low-quality or simplified renderings
</must_not>
</absolute_requirements>

<brand_mandate>
This represents a LUXURY AFRICAN FASHION HOUSE. Every image must exude quality, craftsmanship, and sophistication. High-fidelity reproduction of the original garment is NON-NEGOTIABLE.
</brand_mandate>"""
        
        # Verification prompt
        self.verification_prompt = """Verify this product image meets ALL requirements:

CORE REQUIREMENTS:
1. Clothing is visible on the mannequin (not empty mannequin)
2. Black mannequin body with rose gold head
3. Full mannequin visible from head to toe
4. Clean white background
5. No jewelry, watches, or accessories visible
6. No footwear visible
7. No metallic tags, brand labels, or price tags visible on clothing
8. If outfit appears to be only a top, appropriate matching bottoms should be present
9. Design details preserved accurately (correct sleeve length, patterns, embroidery, closures)

CHECK IN THIS ORDER:
- Is there actual clothing on the mannequin? (FAIL if empty mannequin)
- Is the mannequin body black with rose gold head?
- Is the full mannequin visible?
- Is the background clean and white?
- Are there any jewelry, accessories, or footwear visible? (FAIL if present)
- Are there any visible tags, labels, or branding from original manufacturers? (FAIL if present)
- If the outfit is a top only, are matching bottoms present? (FAIL if missing bottoms)
- Do design details look accurate? Check sleeve length, patterns, embroidery (FAIL if altered)

Respond with:
PASS: All requirements met
FAIL: [specific missing requirements or issues found]"""
        
        logger.info("ProductImageProcessor initialized successfully")

    def upscale_image(self, image_data, target_width=1664, target_height=2496):
        """Upscale generated image using high-quality PIL resampling.
        
        Args:
            image_data: Raw image bytes from Gemini API
            target_width: Target width (default 1664)
            target_height: Target height (default 2496)
            
        Returns:
            Upscaled image as bytes
        """
        try:
            # Load image from bytes
            img = Image.open(BytesIO(image_data))
            
            # Ensure RGB mode
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Get current dimensions
            current_width, current_height = img.size
            logger.info(f"Upscaling from {current_width}x{current_height} to {target_width}x{target_height}")
            
            # Use LANCZOS (high-quality) resampling
            upscaled_img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # Convert to bytes
            output = BytesIO()
            upscaled_img.save(output, format='JPEG', quality=95)
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error upscaling image: {e}")
            # Return original if upscaling fails
            return image_data

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

    
    def verify_generated_image(self, image_data):
        """Verify if generated image meets all requirements."""
        try:
            # Create PIL image for verification
            image = Image.open(BytesIO(image_data))
            
            # Send to model for verification using new SDK
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[self.verification_prompt, image]
            )
            
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
                    prompt += "\nThe reference mannequin is perfect - focus on the specific requirements for this processing type."
                
                # Load original image as PIL Image
                original_img = Image.open(image_path)
                if original_img.mode != 'RGB':
                    original_img = original_img.convert('RGB')
                
                # Load reference mannequin as PIL Image
                ref_mannequin_img = Image.open(BytesIO(self.reference_mannequin_data))
                
                # Configure 2:3 aspect ratio (832x1248 output from Gemini)
                config = types.GenerateContentConfig(
                    image_config=types.ImageConfig(
                        aspect_ratio="2:3",
                    )
                )
                
                # Send to model with new SDK
                response = self.client.models.generate_content(
                    model=self.model_id,
                    contents=[prompt, ref_mannequin_img, original_img],
                    config=config
                )
                
                # Process response
                if response and response.parts:
                    for part in response.parts:
                        if part.inline_data is not None:
                            # Get generated image data
                            generated_image_data = part.inline_data.data
                            if isinstance(generated_image_data, str):
                                generated_image_data = base64.b64decode(generated_image_data)
                            
                            # Upscale image to target dimensions (1664x2496)
                            logger.info(f"Upscaling generated image for {image_path.name}")
                            generated_image_data = self.upscale_image(generated_image_data)
                            
                            # Verify the generated image
                            logger.info(f"Verifying generated image for {image_path.name}")
                            verification_passed, verification_result = self.verify_generated_image(generated_image_data)
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
            'processing_log': 'product_processing.log'
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
        processor = ProductImageProcessor()
        
        # Organize source images
        processor.organize_source_images()
        
        # Process all remaining images (excluding the 5 already processed)
        logger.info("Starting full batch processing of remaining images...")
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