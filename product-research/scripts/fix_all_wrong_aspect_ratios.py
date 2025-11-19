#!/usr/bin/env python3
"""
Fix aspect ratios for all images that don't match 2:3 (1664x2496)
Then add unified logos to the corrected images
"""

import sys
from pathlib import Path
from PIL import Image
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AspectRatioFixer:
    def __init__(self):
        self.chosen_dir = Path('whatsapp-from-edward/chosen')
        self.output_dir = Path('whatsapp-from-edward/with_unified_logos')
        self.output_dir.mkdir(exist_ok=True)
        
        # Target dimensions (2:3 aspect ratio)
        self.target_width = 1664
        self.target_height = 2496
        self.target_ratio = self.target_width / self.target_height
        
        # Load logo
        self.logo_path = Path('logos/unified-logo.jpg')
        self.process_logo()
        
    def process_logo(self):
        """Load and process the unified logo."""
        logo = Image.open(self.logo_path)
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Convert to black on transparent
        transparent_logo = Image.new('RGBA', logo.size)
        for x in range(logo.width):
            for y in range(logo.height):
                r, g, b, a = logo.getpixel((x, y))
                
                if r > 240 and g > 240 and b > 240:
                    transparent_logo.putpixel((x, y), (0, 0, 0, 0))
                elif r < 50 and g < 50 and b < 50:
                    transparent_logo.putpixel((x, y), (0, 0, 0, 255))
                else:
                    darkness = 1 - ((r + g + b) / 3) / 255
                    alpha = int(darkness * 255)
                    transparent_logo.putpixel((x, y), (0, 0, 0, alpha))
        
        self.logo = transparent_logo
        logger.info("Logo processed")
    
    def add_logo(self, img):
        """Add logo to image."""
        # Calculate logo size (35% of image width)
        logo_width = int(img.width * 0.35)
        logo_width = max(200, min(logo_width, 700))
        logo_height = int(logo_width * self.logo.height / self.logo.width)
        
        resized_logo = self.logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        
        # Position at bottom right
        logo_x = img.width - resized_logo.width - 15
        logo_y = img.height - resized_logo.height - 15
        
        # Composite
        img_rgba = img.convert('RGBA')
        img_rgba.paste(resized_logo, (logo_x, logo_y), resized_logo)
        
        return img_rgba.convert('RGB')
    
    def check_and_fix_image(self, image_path):
        """Check if image needs fixing and fix it."""
        try:
            img = Image.open(image_path)
            current_width, current_height = img.size
            current_ratio = current_width / current_height
            
            # Check if aspect ratio is correct (with small tolerance)
            needs_fix = abs(current_ratio - self.target_ratio) > 0.01
            
            if needs_fix:
                logger.info(f"FIXING {image_path.name}: {current_width}x{current_height} (ratio {current_ratio:.3f})")
                
                # Ensure RGB
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize to correct aspect ratio
                img = img.resize((self.target_width, self.target_height), Image.Resampling.LANCZOS)
                
                # Add logo
                img = self.add_logo(img)
                
                # Save
                output_path = self.output_dir / image_path.name
                img.save(output_path, 'JPEG', quality=95)
                logger.info(f"  ✓ Saved corrected image to {output_path}")
                
                return True, "fixed"
            else:
                logger.info(f"OK {image_path.name}: {current_width}x{current_height} (correct aspect ratio)")
                return True, "already_correct"
                
        except Exception as e:
            logger.error(f"Error processing {image_path.name}: {e}")
            return False, str(e)
    
    def process_all(self):
        """Process all images in chosen directory."""
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        images = [f for f in self.chosen_dir.iterdir() 
                 if f.is_file() and f.suffix in image_extensions]
        
        logger.info(f"Found {len(images)} images to check")
        logger.info("=" * 60)
        
        fixed_count = 0
        correct_count = 0
        error_count = 0
        
        for img_path in images:
            success, status = self.check_and_fix_image(img_path)
            if success:
                if status == "fixed":
                    fixed_count += 1
                else:
                    correct_count += 1
            else:
                error_count += 1
        
        logger.info("=" * 60)
        logger.info(f"SUMMARY:")
        logger.info(f"  Fixed: {fixed_count}")
        logger.info(f"  Already correct: {correct_count}")
        logger.info(f"  Errors: {error_count}")

def main():
    try:
        fixer = AspectRatioFixer()
        fixer.process_all()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
