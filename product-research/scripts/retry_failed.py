#!/usr/bin/env python3
"""
Retry failed watermark removal for the specific image that failed.
"""

from watermark_remover import WatermarkRemover
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    try:
        remover = WatermarkRemover()
        
        # Retry the failed image
        failed_image = "Generated Image September 10, 2025 - 4_28PM.png"
        
        logger.info(f"Retrying failed image: {failed_image}")
        
        success = remover.retry_failed_image(failed_image)
        
        if success:
            logger.info("✅ Successfully cleaned the previously failed image!")
        else:
            logger.error("❌ Still failed to clean the image")
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")

if __name__ == "__main__":
    main()