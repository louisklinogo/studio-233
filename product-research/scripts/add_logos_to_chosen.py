#!/usr/bin/env python3
"""
Add unified logos to all images in whatsapp-from-edward/chosen/
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

class LogoAdder:
    def __init__(self):
        """Initialize the logo adder."""
        # Directory paths
        self.chosen_dir = Path('whatsapp-from-edward/chosen')
        self.with_logos_dir = Path('whatsapp-from-edward/with_unified_logos')
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
        
        logger.info("LogoAdder initialized")

    def process_logo(self):
        """Load and process the unified logo (convert to black content on transparent background)."""
        # Load the original logo
        self.original_logo = Image.open(self.logo_path)
        
        # Convert to RGBA for transparency support
        if self.original_logo.mode != 'RGBA':
            self.original_logo = self.original_logo.convert('RGBA')
        
        # Convert to black content on transparent background
        transparent_logo = Image.new('RGBA', self.original_logo.size)
        for x in range(self.original_logo.width):
            for y in range(self.original_logo.height):
                r, g, b, a = self.original_logo.getpixel((x, y))
                
                # If pixel is white (background), make it transparent
                if r > 240 and g > 240 and b > 240:
                    transparent_logo.putpixel((x, y), (0, 0, 0, 0))
                # If pixel is black (content), keep it black with full opacity
                elif r < 50 and g < 50 and b < 50:
                    transparent_logo.putpixel((x, y), (0, 0, 0, 255))
                # For other colors (anti-aliased pixels), make them black with reduced opacity
                else:
                    darkness = 1 - ((r + g + b) / 3) / 255
                    alpha = int(darkness * 255)
                    transparent_logo.putpixel((x, y), (0, 0, 0, alpha))
        
        self.processed_logo = transparent_logo
        logger.info(f"Logo processed: {self.original_logo.size}")

    def calculate_logo_size(self, image_size):
        """Calculate appropriate logo size based on image dimensions."""
        img_width, img_height = image_size
        
        logo_width = int(img_width * self.logo_width_ratio)
        logo_width = max(self.min_logo_width, min(logo_width, self.max_logo_width))
        logo_height = int(logo_width * self.processed_logo.height / self.processed_logo.width)
        
        return (logo_width, logo_height)

    def add_logo_to_image(self, image_path):
        """Add unified logo to a single image."""
        try:
            # Load the product image
            product_img = Image.open(image_path)
            
            # Ensure RGB mode
            if product_img.mode != 'RGB':
                product_img = product_img.convert('RGB')
            
            # Convert to RGBA for compositing
            product_img_rgba = product_img.convert('RGBA')
            
            # Calculate logo size
            logo_size = self.calculate_logo_size(product_img.size)
            resized_logo = self.processed_logo.resize(logo_size, Image.Resampling.LANCZOS)
            
            # Calculate logo position (bottom right)
            logo_x = product_img.width - resized_logo.width - self.padding_right
            logo_y = product_img.height - resized_logo.height - self.padding_bottom
            
            # Create composite
            product_img_rgba.paste(resized_logo, (logo_x, logo_y), resized_logo)
            
            # Convert back to RGB
            final_img = product_img_rgba.convert('RGB')
            
            # Save with logo
            output_path = self.with_logos_dir / image_path.name
            final_img.save(output_path, 'JPEG', quality=95)
            
            logger.info(f"Added logo to {image_path.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding logo to {image_path.name}: {e}")
            return False

    def process_all_images(self):
        """Process all images in chosen directory."""
        # Get all images
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        images = [f for f in self.chosen_dir.iterdir() 
                 if f.is_file() and f.suffix in image_extensions]
        
        logger.info(f"Found {len(images)} images in chosen directory")
        
        success_count = 0
        for img_path in images:
            if self.add_logo_to_image(img_path):
                success_count += 1
        
        logger.info(f"Logo addition complete: {success_count}/{len(images)} successful")
        return success_count, len(images)

def main():
    """Main execution."""
    try:
        adder = LogoAdder()
        success, total = adder.process_all_images()
        
        if success == total:
            logger.info("All images processed successfully!")
        else:
            logger.warning(f"Processed {success} out of {total} images")
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
