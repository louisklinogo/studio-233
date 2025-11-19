#!/usr/bin/env python3
"""
Script to remove 'cleaned_' prefix from image filenames in the cleaned directory.
"""

import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def remove_cleaned_prefix():
    """Remove 'cleaned_' prefix from all files in the cleaned directory."""
    
    cleaned_dir = Path('product-assets/cleaned')
    
    if not cleaned_dir.exists():
        logger.error(f"Directory not found: {cleaned_dir}")
        return
    
    # Find all files with 'cleaned_' prefix
    cleaned_files = list(cleaned_dir.glob('cleaned_*'))
    
    if not cleaned_files:
        logger.info("No files with 'cleaned_' prefix found")
        return
    
    logger.info(f"Found {len(cleaned_files)} files to rename")
    
    renamed_count = 0
    failed_count = 0
    
    for old_path in cleaned_files:
        # Create new filename without 'cleaned_' prefix
        new_name = old_path.name.replace('cleaned_', '', 1)
        new_path = cleaned_dir / new_name
        
        # Check if new filename already exists
        if new_path.exists():
            logger.warning(f"Cannot rename {old_path.name} - {new_name} already exists")
            failed_count += 1
            continue
        
        try:
            # Rename the file
            old_path.rename(new_path)
            logger.info(f"Renamed: {old_path.name} → {new_name}")
            renamed_count += 1
        except Exception as e:
            logger.error(f"Failed to rename {old_path.name}: {e}")
            failed_count += 1
    
    logger.info(f"Renaming complete: {renamed_count} successful, {failed_count} failed")

if __name__ == "__main__":
    remove_cleaned_prefix()