#!/usr/bin/env python3
"""
Dual Logo Addition Script
Combines two logos (name-black.jpg and chesspiece.jpg) and adds them
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
        logging.FileHandler('dual_logo_addition.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class DualLogoAdder:
    def __init__(self):
        """Initialize the dual logo adder."""
        # Directory paths
        self.processed_dir = Path('product-assets/processed')
        self.with_logos_dir = Path('product-assets/with_dual_logos')
        self.with_logos_dir.mkdir(exist_ok=True)
        
        # Logo paths
        self.name_logo_path = Path('logos/name-black.jpg')
        self.chesspiece_logo_path = Path('logos/chesspiece.jpg')
        
        # Validate logo files
        if not self.name_logo_path.exists():
            raise ValueError(f"Name logo not found: {self.name_logo_path}")
        if not self.chesspiece_logo_path.exists():
            raise ValueError(f"Chesspiece logo not found: {self.chesspiece_logo_path}")
        
        # Logo configuration
        self.logo_width_ratio = 0.35  # 35% of image width
        self.min_logo_width = 200     # Minimum logo width in pixels
        self.max_logo_width = 700     # Maximum logo width in pixels
        self.padding_bottom = 15      # Bottom padding
        self.padding_right = 15       # Right padding
        self.logo_spacing = 10         # Spacing between name and chesspiece logos
        
        # Load and process logos
        self.process_logos()
        
        logger.info("DualLogoAdder initialized successfully")

    def process_logo_to_transparent(self, logo_path):
        """Load and process a logo to make white background transparent."""
        try:
            # Load the original logo
            original_logo = Image.open(logo_path)
            
            # Convert to RGBA for transparency support
            if original_logo.mode != 'RGBA':
                original_logo = original_logo.convert('RGBA')
            
            # Convert to black content on transparent background
            transparent_logo = Image.new('RGBA', original_logo.size)
            for x in range(original_logo.width):
                for y in range(original_logo.height):
                    r, g, b, a = original_logo.getpixel((x, y))
                    
                    # If pixel is white (background), make it transparent
                    if r > 240 and g > 240 and b > 240:  # White-ish pixels
                        transparent_logo.putpixel((x, y), (0, 0, 0, 0))  # Transparent
                    # If pixel is black (content), keep it black with full opacity
                    elif r < 50 and g < 50 and b < 50:  # Black-ish pixels
                        transparent_logo.putpixel((x, y), (0, 0, 0, 255))  # Black content
                    # For other colors (anti-aliased pixels), make them black with reduced opacity
                    else:
                        # Calculate darkness and use as alpha
                        darkness = 1 - ((r + g + b) / 3) / 255
                        alpha = int(darkness * 255)
                        transparent_logo.putpixel((x, y), (0, 0, 0, alpha))
            
            logger.info(f"Logo processed: {logo_path.name} -> black content on transparent background")
            return transparent_logo
            
        except Exception as e:
            logger.error(f"Error processing logo {logo_path.name}: {e}")
            raise

    def process_logos(self):
        """Load and process both logos."""
        # Calculate chesspiece logo size relative to name logo first
        self.chesspiece_size_ratio = 0.6  # Chesspiece logo is 60% of name logo width
        
        # Process name logo
        self.name_logo = self.process_logo_to_transparent(self.name_logo_path)
        
        # Process chesspiece logo
        self.chesspiece_logo = self.process_logo_to_transparent(self.chesspiece_logo_path)

    def calculate_logo_sizes(self, image_size):
        """Calculate appropriate logo sizes based on image dimensions."""
        img_width, img_height = image_size
        
        # Calculate name logo width based on ratio
        name_logo_width = int(img_width * self.logo_width_ratio)
        
        # Apply min/max constraints
        name_logo_width = max(self.min_logo_width, min(name_logo_width, self.max_logo_width))
        
        # Calculate name logo height maintaining aspect ratio
        name_logo_height = int(name_logo_width * self.name_logo.height / self.name_logo.width)
        
        # Calculate chesspiece logo size
        chesspiece_logo_width = int(name_logo_width * self.chesspiece_size_ratio)
        chesspiece_logo_height = int(chesspiece_logo_width * self.chesspiece_logo.height / self.chesspiece_logo.width)
        
        return (name_logo_width, name_logo_height), (chesspiece_logo_width, chesspiece_logo_height)

    def position_logos(self, image_size, name_logo_size, chesspiece_logo_size):
        """Calculate logo positions in bottom right corner."""
        img_width, img_height = image_size
        name_logo_width, name_logo_height = name_logo_size
        chesspiece_logo_width, chesspiece_logo_height = chesspiece_logo_size
        
        # Calculate name logo position
        name_x = img_width - name_logo_width - self.padding_right
        name_y = img_height - name_logo_height - self.padding_bottom
        
        # Calculate chesspiece logo position (above name logo)
        chesspiece_x = img_width - chesspiece_logo_width - self.padding_right
        chesspiece_y = name_y - chesspiece_logo_height - self.logo_spacing
        
        return (name_x, name_y), (chesspiece_x, chesspiece_y)

    def create_combined_logo(self, name_logo_size, chesspiece_logo_size):
        """Create a combined logo with both logos."""
        name_logo_width, name_logo_height = name_logo_size
        chesspiece_logo_width, chesspiece_logo_height = chesspiece_logo_size
        
        # Calculate combined logo dimensions
        combined_width = max(name_logo_width, chesspiece_logo_width)
        combined_height = name_logo_height + chesspiece_logo_height + self.logo_spacing
        
        # Create transparent canvas for combined logo
        combined_logo = Image.new('RGBA', (combined_width, combined_height), (0, 0, 0, 0))
        
        # Resize logos
        resized_name_logo = self.name_logo.resize(name_logo_size, Image.Resampling.LANCZOS)
        resized_chesspiece_logo = self.chesspiece_logo.resize(chesspiece_logo_size, Image.Resampling.LANCZOS)
        
        # Position logos on combined canvas
        name_x = (combined_width - name_logo_width) // 2
        name_y = combined_height - name_logo_height  # Name logo at bottom
        
        chesspiece_x = (combined_width - chesspiece_logo_width) // 2
        chesspiece_y = name_y - chesspiece_logo_height - self.logo_spacing  # Chesspiece above name
        
        # Paste logos onto combined canvas
        combined_logo.paste(resized_name_logo, (name_x, name_y), resized_name_logo)
        combined_logo.paste(resized_chesspiece_logo, (chesspiece_x, chesspiece_y), resized_chesspiece_logo)
        
        return combined_logo

    def add_dual_logos_to_image(self, image_path):
        """Add dual logos to a single image."""
        try:
            # Load the image
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Calculate logo sizes and positions
                name_logo_size, chesspiece_logo_size = self.calculate_logo_sizes(img.size)
                
                # Create combined logo
                combined_logo = self.create_combined_logo(name_logo_size, chesspiece_logo_size)
                
                # Calculate position for combined logo
                name_pos, chesspiece_pos = self.position_logos(img.size, name_logo_size, chesspiece_logo_size)
                combined_logo_x = name_pos[0]  # Use name logo x position
                combined_logo_y = chesspiece_pos[1]  # Use chesspiece logo y position (top position)
                
                # Create a copy of the image to avoid modifying the original
                result_img = img.copy()
                
                # Paste the combined logo onto the image
                result_img.paste(combined_logo, (combined_logo_x, combined_logo_y), combined_logo)
                
                return result_img
                
        except Exception as e:
            logger.error(f"Error adding dual logos to {image_path.name}: {e}")
            return None

    def process_single_image(self, image_path):
        """Process a single image and save result."""
        logger.info(f"Processing {image_path.name}...")
        
        # Add dual logos to image
        result_img = self.add_dual_logos_to_image(image_path)
        
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
        logger.info("Starting batch dual logo addition...")
        
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
        
        logger.info(f"Batch dual logo addition complete: {successful}/{len(images_to_process)} successful")
        return successful, failed

    def test_with_sample(self, sample_size=3):
        """Test the dual logo addition with a small sample of images."""
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
        adder = DualLogoAdder()
        
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
        
        logger.info("Dual Logo Addition Summary:")
        logger.info(f"Total processed: {successful + failed}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Success rate: {successful / (successful + failed) * 100:.1f}%")
        
        if successful > 0:
            logger.info(f"Images with dual logos saved to: {adder.with_logos_dir}")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()