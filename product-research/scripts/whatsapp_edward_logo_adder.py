#!/usr/bin/env python3
"""
WhatsApp Edward Logo Adder
Custom version of unified_logo_adder.py for whatsapp-from-edward directory.
Adds the unified logo to processed images.
"""

import os
import sys
from pathlib import Path
from PIL import Image
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('whatsapp_edward_logo_addition.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class WhatsAppEdwardLogoAdder:
    def __init__(self):
        """Initialize the logo adder."""
        # Directory paths - all within whatsapp-from-edward
        self.base_dir = Path('whatsapp-from-edward')
        self.processed_dir = self.base_dir / 'processed'
        self.with_logos_dir = self.base_dir / 'with_unified_logos'
        self.with_logos_dir.mkdir(exist_ok=True)
        
        # Logo path
        self.logo_path = Path('logos/unified-logo.jpg')
        if not self.logo_path.exists():
            raise ValueError(f"Unified logo not found: {self.logo_path}")
        
        # Logo configuration
        self.logo_width_ratio = 0.35  # 35% of image width
        self.min_logo_width = 200
        self.max_logo_width = 700
        self.padding_bottom = 15
        self.padding_right = 15
        
        # Load and process logo
        self.process_logo()
        
        logger.info("WhatsAppEdwardLogoAdder initialized successfully")

    def process_logo(self):
        """Load and process the unified logo (convert to black content on transparent background)."""
        try:
            self.original_logo = Image.open(self.logo_path)
            
            if self.original_logo.mode != 'RGBA':
                self.original_logo = self.original_logo.convert('RGBA')
            
            # Convert to black content on transparent background
            transparent_logo = Image.new('RGBA', self.original_logo.size)
            for x in range(self.original_logo.width):
                for y in range(self.original_logo.height):
                    r, g, b, a = self.original_logo.getpixel((x, y))
                    
                    # White-ish pixels -> transparent
                    if r > 240 and g > 240 and b > 240:
                        transparent_logo.putpixel((x, y), (0, 0, 0, 0))
                    # Black-ish pixels -> keep black
                    elif r < 50 and g < 50 and b < 50:
                        transparent_logo.putpixel((x, y), (0, 0, 0, 255))
                    # Anti-aliased pixels -> black with reduced opacity
                    else:
                        darkness = 1 - ((r + g + b) / 3) / 255
                        alpha = int(darkness * 255)
                        transparent_logo.putpixel((x, y), (0, 0, 0, alpha))
            
            self.processed_logo = transparent_logo
            logger.info(f"Logo processed: {self.original_logo.size} -> black on transparent")
            
        except Exception as e:
            logger.error(f"Error processing logo: {e}")
            raise

    def calculate_logo_size(self, image_size):
        """Calculate appropriate logo size based on image dimensions."""
        img_width, img_height = image_size
        
        logo_width = int(img_width * self.logo_width_ratio)
        logo_width = max(self.min_logo_width, min(logo_width, self.max_logo_width))
        logo_height = int(logo_width * self.processed_logo.height / self.processed_logo.width)
        
        return (logo_width, logo_height)

    def position_logo(self, image_size, logo_size):
        """Calculate logo position in bottom right corner."""
        img_width, img_height = image_size
        logo_width, logo_height = logo_size
        
        x = img_width - logo_width - self.padding_right
        y = img_height - logo_height - self.padding_bottom
        
        return (x, y)

    def add_logo_to_image(self, image_path):
        """Add unified logo to a single image."""
        try:
            with Image.open(image_path) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                logo_size = self.calculate_logo_size(img.size)
                logo_position = self.position_logo(img.size, logo_size)
                
                resized_logo = self.processed_logo.resize(logo_size, Image.Resampling.LANCZOS)
                
                result_img = img.copy()
                result_img.paste(resized_logo, logo_position, resized_logo)
                
                return result_img
                
        except Exception as e:
            logger.error(f"Error adding logo to {image_path.name}: {e}")
            return None

    def process_single_image(self, image_path):
        """Process a single image and save result."""
        logger.info(f"Processing {image_path.name}...")
        
        result_img = self.add_logo_to_image(image_path)
        
        if result_img is not None:
            output_path = self.with_logos_dir / image_path.name
            
            try:
                result_img.save(output_path, 'JPEG', quality=95)
                logger.info(f"Successfully processed: {image_path.name}")
                return True
            except Exception as e:
                logger.error(f"Error saving {image_path.name}: {e}")
                return False
        else:
            return False

    def batch_process_images(self):
        """Process all images in the processed directory."""
        logger.info("Starting batch logo addition...")
        
        image_extensions = {'.jpg', '.jpeg', '.JPG', '.JPEG'}
        images_to_process = []
        
        for file_path in self.processed_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                images_to_process.append(file_path)
        
        logger.info(f"Found {len(images_to_process)} images to process")
        
        successful = 0
        failed = 0
        
        for i, image_path in enumerate(images_to_process, 1):
            logger.info(f"Processing image {i}/{len(images_to_process)}: {image_path.name}")
            
            if self.process_single_image(image_path):
                successful += 1
            else:
                failed += 1
            
            if i % 10 == 0:
                logger.info(f"Progress: {successful}/{i} successful")
        
        logger.info(f"Batch logo addition complete: {successful}/{len(images_to_process)} successful")
        return successful, failed

def main():
    """Main execution function."""
    try:
        adder = WhatsAppEdwardLogoAdder()
        
        successful, failed = adder.batch_process_images()
        
        logger.info("Logo Addition Summary:")
        logger.info(f"Total processed: {successful + failed}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        if successful + failed > 0:
            logger.info(f"Success rate: {successful / (successful + failed) * 100:.1f}%")
        
        if successful > 0:
            logger.info(f"Images with logos saved to: {adder.with_logos_dir}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
