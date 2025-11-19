#!/usr/bin/env python3
"""
Aggressive retry for the specific failed image with multiple prompt strategies.
"""

from watermark_remover import WatermarkRemover
import google.generativeai as genai
import base64
from io import BytesIO
from PIL import Image
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def aggressive_retry():
    try:
        remover = WatermarkRemover()
        
        # The problematic image
        failed_image = "Generated Image September 10, 2025 - 4_28PM.png"
        image_path = remover.processed_dir / failed_image
        
        if not image_path.exists():
            logger.error(f"Image not found: {image_path}")
            return
        
        # Load the image
        img_data = remover.load_image_data(image_path)
        if not img_data:
            logger.error("Failed to load image")
            return
        
        # Try multiple different prompt strategies
        prompts = [
            # Strategy 1: Very direct and simple
            """Remove any watermark, symbol, or mark from the bottom right corner of this image. Keep everything else exactly the same. Return the cleaned image.""",
            
            # Strategy 2: More specific about the area
            """Look at the bottom right corner of this image. If you see any small symbol, star, dot, or watermark there, remove it and fill that area with background that matches the surroundings. Return the modified image.""",
            
            # Strategy 3: Force generation approach
            """This image may have a small watermark in the bottom right corner. I need you to create a version of this image with the bottom right corner completely clean, no matter what is there now. Return the cleaned image.""",
            
            # Strategy 4: Step-by-step instruction
            """Please do the following:
1. Look at the bottom right corner of this image
2. If you see any small symbol, mark, or watermark, remove it
3. Fill the area with appropriate background
4. Return the final cleaned image"""
        ]
        
        logger.info(f"Trying {len(prompts)} different prompt strategies for {failed_image}")
        
        for i, prompt in enumerate(prompts, 1):
            logger.info(f"Strategy {i}: {prompt[:100]}...")
            
            try:
                response = remover.model.generate_content([
                    prompt,
                    {"mime_type": "image/jpeg", "data": img_data}
                ])
                
                if response and response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data.mime_type.startswith('image/'):
                            # Get generated image data
                            generated_image_data = part.inline_data.data
                            if isinstance(generated_image_data, str):
                                generated_image_data = base64.b64decode(generated_image_data)
                            
                            # Save the result
                            cleaned_filename = f"cleaned_strategy_{i}_{failed_image}"
                            cleaned_path = remover.cleaned_dir / cleaned_filename
                            
                            with open(cleaned_path, 'wb') as f:
                                f.write(generated_image_data)
                            
                            logger.info(f"✅ Strategy {i} SUCCESS! Saved as {cleaned_filename}")
                            return
                
                logger.warning(f"Strategy {i} - No image generated")
                
            except Exception as e:
                logger.error(f"Strategy {i} - Error: {e}")
            
            # Brief pause between attempts
            if i < len(prompts):
                time.sleep(1)
        
        logger.error("❌ All strategies failed")
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")

if __name__ == "__main__":
    aggressive_retry()