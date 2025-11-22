#!/usr/bin/env python3
"""
Organize Corrected Images Script
Creates paired directories with source and corrected images for easy comparison.
"""

import os
import shutil
import json
from pathlib import Path
from typing import Dict, List, Tuple
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ImageOrganizer:
    def __init__(self):
        """Initialize the image organizer."""
        self.base_dir = Path('product-assets')
        self.processed_dir = self.base_dir / 'processed'
        self.corrected_dir = self.base_dir / 'corrected'
        self.pairs_dir = self.processed_dir / 'corrected_pairs'
        self.mapping_file = self.pairs_dir / 'image_mapping.json'
        
        logger.info("Image Organizer initialized")

    def get_corrected_images(self) -> List[Path]:
        """Get list of corrected image files."""
        if not self.corrected_dir.exists():
            logger.error(f"Corrected directory not found: {self.corrected_dir}")
            return []
        
        corrected_files = []
        for file in self.corrected_dir.glob('corrected_*.jpg'):
            corrected_files.append(file)
        
        corrected_files.sort()
        logger.info(f"Found {len(corrected_files)} corrected images")
        return corrected_files

    def find_source_image(self, corrected_file: Path) -> Path:
        """Find the corresponding source image in the processed directory."""
        # Remove 'corrected_' prefix to get original filename
        original_filename = corrected_file.name[len('corrected_'):]
        source_path = self.processed_dir / original_filename
        
        if source_path.exists():
            return source_path
        else:
            logger.warning(f"Source image not found: {source_path}")
            return None

    def create_pair_folder(self, pair_number: int) -> Path:
        """Create a numbered pair folder."""
        pair_folder = self.pairs_dir / f"pair_{pair_number:03d}"
        pair_folder.mkdir(parents=True, exist_ok=True)
        return pair_folder

    def copy_image_pair(self, source_file: Path, corrected_file: Path, pair_folder: Path) -> bool:
        """Copy source and corrected images to pair folder."""
        try:
            # Copy source image with original filename
            source_dest = pair_folder / f'source_{source_file.name}'
            shutil.copy2(source_file, source_dest)
            
            # Copy corrected image with original filename
            corrected_dest = pair_folder / f'corrected_{corrected_file.name}'
            shutil.copy2(corrected_file, corrected_dest)
            
            logger.info(f"Copied pair to {pair_folder}")
            return True
            
        except Exception as e:
            logger.error(f"Error copying images to {pair_folder}: {e}")
            return False

    def create_mapping_file(self, mapping_data: List[Dict]) -> None:
        """Create a JSON mapping file showing filename relationships."""
        try:
            with open(self.mapping_file, 'w', encoding='utf-8') as f:
                json.dump(mapping_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Created mapping file: {self.mapping_file}")
        except Exception as e:
            logger.error(f"Error creating mapping file: {e}")

    def organize_images(self) -> None:
        """Main method to organize all corrected images."""
        logger.info("Starting image organization...")
        
        # Get all corrected images
        corrected_files = self.get_corrected_images()
        if not corrected_files:
            logger.error("No corrected images found")
            return
        
        mapping_data = []
        successful_pairs = 0
        
        for i, corrected_file in enumerate(corrected_files, 1):
            logger.info(f"Processing pair {i}/{len(corrected_files)}: {corrected_file.name}")
            
            # Find source image
            source_file = self.find_source_image(corrected_file)
            if not source_file:
                logger.warning(f"Skipping {corrected_file.name} - no source found")
                continue
            
            # Create pair folder
            pair_folder = self.create_pair_folder(i)
            
            # Copy images to pair folder
            if self.copy_image_pair(source_file, corrected_file, pair_folder):
                successful_pairs += 1
                
                # Add to mapping data
                mapping_data.append({
                    'pair_number': i,
                    'pair_folder': str(pair_folder),
                    'original_filename': source_file.name,
                    'corrected_filename': corrected_file.name,
                    'source_path': str(source_file),
                    'corrected_path': str(corrected_file)
                })
            else:
                logger.error(f"Failed to create pair for {corrected_file.name}")
        
        # Create mapping file
        if mapping_data:
            self.create_mapping_file(mapping_data)
        
        logger.info(f"Image organization complete: {successful_pairs}/{len(corrected_files)} pairs created")

def main():
    """Main execution function."""
    try:
        organizer = ImageOrganizer()
        organizer.organize_images()
        
    except Exception as e:
        logger.error(f"Fatal error in image organization: {e}")
        raise

if __name__ == "__main__":
    main()