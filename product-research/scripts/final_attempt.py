#!/usr/bin/env python3
"""
Final attempt: convert PNG to JPEG and try watermark removal
"""

from watermark_remover import WatermarkRemover
from PIL import Image
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def final_attempt():
    try:
        remover = WatermarkRemover()
        
        # The problematic image
        failed_image = "Generated Image September 10, 2025 - 4_28PM.png"
        original_path = remover.processed_dir / failed_image
        
        if not original_path.exists():
            logger.error(f"Image not found: {original_path}")
            return
        
        # Convert PNG to JPEG first
        jpeg_path = remover.processed_dir / "temp_conversion.jpg"
        
        try:
            # Open PNG and convert to JPEG
            with Image.open(original_path) as img:
                # Convert RGBA to RGB (remove transparency)
                if img.mode == 'RGBA':
                    # Create white background
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    # Paste the image on the background
                    background.paste(img, mask=img.split()[-1])
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Save as JPEG
                img.save(jpeg_path, 'JPEG', quality=95)
                
            logger.info(f"Converted PNG to JPEG: {jpeg_path}")
            
            # Try processing the JPEG version
            success, result = remover.remove_watermark_single_image(jpeg_path, max_retries=3)
            
            if success:
                # Rename the result to match original naming
                cleaned_jpeg = remover.cleaned_dir / f"cleaned_{failed_image.replace('.png', '.jpg')}"
                if os.path.exists(result):
                    os.rename(result, cleaned_jpeg)
                    logger.info(f"Successfully processed converted image: {cleaned_jpeg}")
                else:
                    logger.error(f"Result file not found: {result}")
            else:
                logger.error(f"Failed to process converted image: {result}")
                
        except Exception as e:
            logger.error(f"Error during conversion: {e}")
        
        finally:
            # Clean up temporary file
            if jpeg_path.exists():
                jpeg_path.unlink()
                logger.info("Cleaned up temporary file")
                
    except Exception as e:
        logger.error(f"Fatal error: {e}")

if __name__ == "__main__":
    final_attempt()