#!/usr/bin/env python3
"""
Fix aspect ratio for a single image - resize to 2:3 portrait (1664x2496)
"""

import sys
from pathlib import Path
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_aspect_ratio(input_path, output_dir):
    """Resize image to 2:3 aspect ratio (1664x2496)."""
    try:
        # Load image
        img = Image.open(input_path)
        logger.info(f"Original size: {img.size}")
        
        # Target dimensions (2:3 portrait)
        target_width = 1664
        target_height = 2496
        
        # Ensure RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize using high-quality LANCZOS resampling
        resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Save to output directory
        output_path = Path(output_dir) / input_path.name
        resized.save(output_path, 'JPEG', quality=95)
        
        logger.info(f"Resized to {target_width}x{target_height} and saved to {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python fix_single_aspect_ratio.py <image_filename>")
        print("Example: python fix_single_aspect_ratio.py 'processed_WhatsApp Image 2025-10-31 at 08.50.01_01f11d7d.jpg'")
        sys.exit(1)
    
    filename = sys.argv[1]
    input_path = Path('whatsapp-from-edward/chosen') / filename
    output_dir = Path('whatsapp-from-edward/with_unified_logos')
    
    if not input_path.exists():
        logger.error(f"File not found: {input_path}")
        sys.exit(1)
    
    fix_aspect_ratio(input_path, output_dir)
