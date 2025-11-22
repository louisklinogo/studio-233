#!/usr/bin/env python3
"""
Veo 3 Video Generator for Fashion Products
Uses Google Veo 3 API to generate product showcase videos from processed fashion images.
Creates realistic e-commerce videos: 360 rotations, detail shots, catalog views, texture focus.
"""

import os
import sys
import time
import logging
from pathlib import Path
from typing import Optional, List, Dict
from dotenv import load_dotenv
from google import genai
from PIL import Image

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('veo3_video_generation.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class Veo3VideoGenerator:
    def __init__(self):
        """Initialize the Veo 3 video generator."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")

        # Initialize Google GenAI client
        self.client = genai.Client(api_key=self.api_key)

        # Directory paths
        self.base_dir = Path("product-assets")
        self.processed_dir = self.base_dir / "processed"
        self.videos_dir = self.base_dir / "videos"

        # Video subdirectories
        self.rotations_dir = self.videos_dir / "360_rotations"
        self.detail_dir = self.videos_dir / "detail_shots"
        self.catalog_dir = self.videos_dir / "catalog_views"
        self.texture_dir = self.videos_dir / "texture_focus"

        # Ensure directories exist
        for directory in [self.rotations_dir, self.detail_dir, self.catalog_dir, self.texture_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        logger.info("Veo 3 Video Generator initialized:")
        logger.info(f"  - Processed images: {self.processed_dir}")
        logger.info(f"  - Video outputs: {self.videos_dir}")

    def get_fashion_prompts(self) -> Dict[str, List[str]]:
        """Get realistic fashion video prompts for different product types."""
        return {
            "360_rotations": [
                "Slow 360 degree rotation of garment on mannequin, clean white background, professional studio lighting",
                "Smooth rotating view showing all angles of the clothing item, neutral presentation",
                "Complete rotation view of fashion product on mannequin, even lighting, minimalist style"
            ],
            "detail_shots": [
                "Close-up zoom on fabric texture and stitching details, professional product photography",
                "Macro shot focusing on garment details like buttons, zippers, or patterns",
                "Detailed close-up view of material quality and construction, clean background"
            ],
            "catalog_views": [
                "E-commerce catalog style presentation, front and back view transition, white background",
                "Professional product catalog video showing fit and form, studio lighting",
                "Clean retail presentation with subtle camera movement, minimalist aesthetic"
            ],
            "texture_focus": [
                "Focus on fabric drape and movement, highlighting material quality, soft lighting",
                "Texture showcase video emphasizing fabric quality and finish",
                "Material demonstration showing how the fabric moves and feels"
            ]
        }

    def generate_video_from_local_image(self, image_path: str, prompt: str, output_path: str) -> bool:
        """
        Generate a video from a local product image using Veo 3.

        Args:
            image_path: Path to the local image file
            prompt: Video generation prompt
            output_path: Path to save the generated video

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info(f"Generating video from local image: {Path(image_path).name}")

            # Load the local image file as bytes
            with open(image_path, "rb") as f:
                image_bytes = f.read()

            # Determine MIME type
            if image_path.lower().endswith('.png'):
                mime_type = "image/png"
            else:
                mime_type = "image/jpeg"

            logger.info("Starting video generation...")

            # Generate video using Veo 3 with local image
            operation = self.client.models.generate_videos(
                model="veo-3.0-generate-001",
                prompt=prompt,
                image={
                    "imageBytes": image_bytes,
                    "mimeType": mime_type
                }
            )

            # Wait for completion
            logger.info("Waiting for video generation to complete...")
            while not operation.done:
                time.sleep(10)
                operation = self.client.operations.get(operation)

            # Download the generated video
            generated_video = operation.response.generated_videos[0]
            video_data = self.client.files.download(file=generated_video.video)

            # Save the video
            with open(output_path, 'wb') as f:
                f.write(video_data)

            logger.info(f"Video saved to {output_path}")
            return True

        except Exception as e:
            logger.error(f"Error generating video for {image_path}: {str(e)}")
            return False

    def generate_text_to_video(self, prompt: str, output_path: str) -> bool:
        """
        Generate a video from text prompt using Veo 3.

        Args:
            prompt: Text description for video generation
            output_path: Path to save the generated video

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            logger.info(f"Generating text-to-video with prompt: {prompt[:100]}...")

            # Generate video using Veo 3
            operation = self.client.models.generate_videos(
                model="veo-3.0-generate-001",
                prompt=prompt,
            )

            # Wait for completion
            logger.info("Waiting for video generation to complete...")
            while not operation.done:
                time.sleep(10)
                operation = self.client.operations.get(operation)

            # Download the generated video
            generated_video = operation.response.generated_videos[0]
            video_data = self.client.files.download(file=generated_video.video)

            # Save the video
            with open(output_path, 'wb') as f:
                f.write(video_data)

            logger.info(f"Video saved to {output_path}")
            return True

        except Exception as e:
            logger.error(f"Error generating text-to-video: {str(e)}")
            return False

    def process_single_image(self, image_path: str, video_types: List[str] = None) -> Dict[str, bool]:
        """
        Process a single image to generate multiple types of videos.

        Args:
            image_path: Path to the input image
            video_types: List of video types to generate

        Returns:
            Dict: Results for each video type
        """
        if video_types is None:
            video_types = ["360_rotations", "detail_shots", "catalog_views", "texture_focus"]

        results = {}
        image_name = Path(image_path).stem
        prompts = self.get_fashion_prompts()

        for video_type in video_types:
            if video_type in prompts:
                # Use the first prompt for this video type
                prompt = prompts[video_type][0]

                # Generate output path
                output_dir = getattr(self, f"{video_type.split('_')[0]}_dir", self.catalog_dir)
                output_path = output_dir / f"{image_name}_{video_type}.mp4"

                # Generate video
                success = self.generate_video_from_image(
                    image_path, prompt, str(output_path), video_type
                )
                results[video_type] = success

                # Add delay to avoid rate limiting
                time.sleep(2)

        return results

    def batch_process_images(self, image_paths: List[str], video_types: List[str] = None) -> Dict[str, Dict[str, bool]]:
        """
        Process multiple images to generate videos.

        Args:
            image_paths: List of image paths to process
            video_types: List of video types to generate

        Returns:
            Dict: Results for each image and video type
        """
        all_results = {}

        for i, image_path in enumerate(image_paths):
            logger.info(f"Processing image {i+1}/{len(image_paths)}: {Path(image_path).name}")

            results = self.process_single_image(image_path, video_types)
            all_results[image_path] = results

            # Add delay between images to avoid rate limiting
            if i < len(image_paths) - 1:
                time.sleep(5)

        return all_results

    def get_processed_images(self, limit: int = 5) -> List[str]:
        """
        Get a list of processed images to test with.

        Args:
            limit: Maximum number of images to return

        Returns:
            List: Paths to processed images
        """
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            image_files.extend(self.processed_dir.glob(ext))

        # Sort by modification time (newest first) and limit
        image_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        return [str(f) for f in image_files[:limit]]

def main():
    """Main function to test Veo 3 video generation with actual product images."""
    generator = Veo3VideoGenerator()

    # Select 5 representative images for testing
    selected_images = [
        "product-assets/processed/processed_2024-06-10_photo_original_001.jpg",
        "product-assets/processed/processed_2024-07-01_screenshot_instagram_002.jpg",
        "product-assets/processed/processed_2025-04-04_generated_style_transfer_blvck_001.jpg",
        "product-assets/processed/processed_2024-05-27_photo_instasave_001.jpg",
        "product-assets/processed/processed_2023-11-04_photo_original_001.jpg"
    ]

    logger.info(f"Selected {len(selected_images)} representative images for video generation")

    # Get all available video types and prompts
    prompts = generator.get_fashion_prompts()
    total_videos = len(selected_images) * len(prompts)
    logger.info(f"Will generate {total_videos} total videos ({len(prompts)} types per image)")

    results = {}
    video_count = 0

    # Process each image
    for i, image_path in enumerate(selected_images):
        logger.info(f"=== Processing Image {i+1}/{len(selected_images)}: {Path(image_path).name} ===")

        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            continue

        image_results = {}

        # Generate all video types for this image
        for video_type, prompt_list in prompts.items():
            video_count += 1
            logger.info(f"Generating {video_type} ({video_count}/{total_videos})")

            if prompt_list:
                prompt = prompt_list[0]  # Use first prompt for each type

                # Generate output path
                output_dir = getattr(generator, f"{video_type.split('_')[0]}_dir", generator.catalog_dir)
                image_name = Path(image_path).stem
                output_path = output_dir / f"{image_name}_{video_type}.mp4"

                # Generate video
                success = generator.generate_video_from_local_image(image_path, prompt, str(output_path))
                image_results[video_type] = success

                logger.info(f"  {video_type}: {'SUCCESS' if success else 'FAILED'}")

                # Add delay between requests to avoid rate limiting
                if video_count < total_videos:
                    time.sleep(5)

        results[image_path] = image_results

    # Print final summary
    logger.info("=== Video Generation Summary ===")
    successful_images = sum(1 for image_result in results.values() if any(image_result.values()))
    total_videos_generated = sum(sum(image_result.values()) for image_result in results.values())

    logger.info(f"Images processed: {successful_images}/{len(selected_images)}")
    logger.info(f"Total videos generated: {total_videos_generated}/{total_videos}")
    logger.info("Check the video output directories for generated files.")

    # Print detailed results
    for image_path, image_results in results.items():
        successful_types = sum(image_results.values())
        logger.info(f"{Path(image_path).name}: {successful_types}/{len(prompts)} videos successful")

if __name__ == "__main__":
    main()