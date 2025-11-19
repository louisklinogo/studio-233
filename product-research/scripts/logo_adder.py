#!/usr/bin/env python3
"""
Logo Addition Script
Adds the chesspiece logo (inverted to black text on white background) 
to the bottom right corner of all processed images.
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageEnhance
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logo_addition.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class LogoAdder:
    def __init__(self):
        """Initialize the logo adder."""
        # Directory paths
        self.processed_dir = Path('product-assets/processed')
        self.with_logos_dir = Path('product-assets/with_logos_enhanced')
        self.with_logos_dir.mkdir(exist_ok=True)
        
        # Logo path
        self.logo_path = Path('logos/chesspiece-name.jpg')
        if not self.logo_path.exists():
            raise ValueError(f"Logo not found: {self.logo_path}")
        
        # Logo configuration (ENHANCED)
        self.logo_width_ratio = 0.40  # 40% of image width (significantly increased)
        self.min_logo_width = 250     # Minimum logo width in pixels (much larger)
        self.max_logo_width = 800     # Maximum logo width in pixels (larger)
        self.padding_bottom = 10      # Bottom padding (reduced to push logo further down)
        self.padding_right = 15       # Right padding (reduced to move logo closer to edge)
        
        # Load and process logo
        self.process_logo()
        
        logger.info("LogoAdder initialized successfully")

    def process_logo(self):
        """Load and process the logo (convert to black text on transparent background)."""
        try:
            # Load the original logo
            self.original_logo = Image.open(self.logo_path)
            
            # Convert to RGBA for transparency support
            if self.original_logo.mode != 'RGBA':
                self.original_logo = self.original_logo.convert('RGBA')
            
            # Convert to black text on transparent background
            transparent_logo = Image.new('RGBA', self.original_logo.size)
            for x in range(self.original_logo.width):
                for y in range(self.original_logo.height):
                    r, g, b, a = self.original_logo.getpixel((x, y))
                    
                    # If pixel is white (original text), make it black with full opacity
                    if r > 200 and g > 200 and b > 200:  # White-ish pixels
                        transparent_logo.putpixel((x, y), (0, 0, 0, 255))  # Black text
                    # If pixel is black (original background), make it transparent
                    elif r < 50 and g < 50 and b < 50:  # Black-ish pixels
                        transparent_logo.putpixel((x, y), (0, 0, 0, 0))  # Transparent
                    # For other colors (anti-aliased pixels), make them black with reduced opacity
                    else:
                        # Calculate darkness and use as alpha
                        darkness = 1 - ((r + g + b) / 3) / 255
                        alpha = int(darkness * 255)
                        transparent_logo.putpixel((x, y), (0, 0, 0, alpha))
            
            self.processed_logo = transparent_logo
            logger.info(f"Logo processed: {self.original_logo.size} -> black text on transparent background")
            
        except Exception as e:
            logger.error(f"Error processing logo: {e}")
            raise

    def calculate_logo_size(self, image_size):
        """Calculate appropriate logo size based on image dimensions."""
        img_width, img_height = image_size
        
        # Calculate logo width based on ratio
        logo_width = int(img_width * self.logo_width_ratio)
        
        # Apply min/max constraints
        logo_width = max(self.min_logo_width, min(logo_width, self.max_logo_width))
        
        # Calculate height maintaining aspect ratio
        logo_height = int(logo_width * self.processed_logo.height / self.processed_logo.width)
        
        return (logo_width, logo_height)

    def position_logo(self, image_size, logo_size):
        """Calculate logo position in bottom right corner with enhanced positioning."""
        img_width, img_height = image_size
        logo_width, logo_height = logo_size
        
        # Calculate position with separate padding for bottom and right
        x = img_width - logo_width - self.padding_right
        y = img_height - logo_height - self.padding_bottom
        
        return (x, y)

    def add_logo_to_image(self, image_path):
        """Add logo to a single image."""
        try:
            # Load the image
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Calculate logo size and position
                logo_size = self.calculate_logo_size(img.size)
                logo_position = self.position_logo(img.size, logo_size)
                
                # Resize logo
                resized_logo = self.processed_logo.resize(logo_size, Image.Resampling.LANCZOS)
                
                # Create a copy of the image to avoid modifying the original
                result_img = img.copy()
                
                # Paste the logo onto the image
                result_img.paste(resized_logo, logo_position, resized_logo)
                
                return result_img
                
        except Exception as e:
            logger.error(f"Error adding logo to {image_path.name}: {e}")
            return None

    def process_single_image(self, image_path):
        """Process a single image and save result."""
        logger.info(f"Processing {image_path.name}...")
        
        # Add logo to image
        result_img = self.add_logo_to_image(image_path)
        
        if result_img is not None:
            # Save the result
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

    def batch_process_images(self, max_images=None):
        """Process all images in the processed directory."""
        logger.info("Starting batch logo addition...")
        
        # Find all JPG images
        image_extensions = {'.jpg', '.jpeg', '.JPG', '.JPEG'}
        images_to_process = []
        
        for file_path in self.processed_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                images_to_process.append(file_path)
        
        # Limit processing if specified
        if max_images:
            images_to_process = images_to_process[:max_images]
            logger.info(f"Sample mode: processing {len(images_to_process)} images")
        else:
            logger.info(f"Found {len(images_to_process)} images to process")
        
        successful = 0
        failed = 0
        
        for i, image_path in enumerate(images_to_process, 1):
            logger.info(f"Processing image {i}/{len(images_to_process)}: {image_path.name}")
            
            if self.process_single_image(image_path):
                successful += 1
            else:
                failed += 1
            
            # Progress update every 10 images
            if i % 10 == 0:
                logger.info(f"Progress: {successful}/{i} successful")
        
        logger.info(f"Batch logo addition complete: {successful}/{len(images_to_process)} successful")
        return successful, failed

    def test_with_sample(self, sample_size=3):
        """Test the logo addition with a small sample of images."""
        logger.info(f"Testing with sample of {sample_size} images...")
        
        # Find all JPG images
        image_extensions = {'.jpg', '.jpeg', '.JPG', '.JPEG'}
        all_images = []
        
        for file_path in self.processed_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                all_images.append(file_path)
        
        # Take first few images for testing
        test_images = all_images[:sample_size]
        
        successful = 0
        failed = 0
        
        for i, image_path in enumerate(test_images, 1):
            logger.info(f"Test {i}/{sample_size}: {image_path.name}")
            
            if self.process_single_image(image_path):
                successful += 1
            else:
                failed += 1
        
        logger.info(f"Test complete: {successful}/{sample_size} successful")
        return successful, failed

def main():
    """Main execution function."""
    try:
        adder = LogoAdder()
        
        # Test with sample first
        logger.info("Running test with sample images...")
        test_success, test_total = adder.test_with_sample(sample_size=3)
        
        if test_success == test_total:
            logger.info("Test passed! Processing all images...")
            successful, failed = adder.batch_process_images()
        else:
            logger.warning("Test had issues. Proceeding with caution...")
            # Continue with full processing automatically
            successful, failed = adder.batch_process_images()
        
        logger.info("Logo Addition Summary:")
        logger.info(f"Total processed: {successful + failed}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Success rate: {successful / (successful + failed) * 100:.1f}%")
        
        if successful > 0:
            logger.info(f"Images with logos saved to: {adder.with_logos_dir}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()