#!/usr/bin/env python3
"""
AI-Powered Prompt Generator for Image Correction
Uses Gemini Pro to generate optimized correction prompts based on detection data.
"""

import os
import csv
import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('prompt_generation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class AIPromptGenerator:
    def __init__(self):
        """Initialize the AI prompt generator."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-pro')  # Using Gemini Pro for text generation
        
        self.combined_data_file = Path('detection_results/combined_detection_data.csv')
        
        logger.info("AI Prompt Generator initialized with Gemini Pro")

    def load_combined_data(self) -> List[Dict[str, Any]]:
        """Load combined detection data from CSV."""
        data = []
        
        if not self.combined_data_file.exists():
            logger.error(f"Combined data file not found: {self.combined_data_file}")
            return data
        
        try:
            with open(self.combined_data_file, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    # Parse JSON fields
                    row['detection_items'] = json.loads(row['detection_items_json']) if row['detection_items_json'] else []
                    row['integrity_issues'] = json.loads(row['integrity_issues_json']) if row['integrity_issues_json'] else []
                    row['combined_priority_score'] = int(row['combined_priority_score'])
                    row['needs_processing'] = row['needs_processing'].lower() == 'true'
                    
                    data.append(row)
            
            logger.info(f"Loaded {len(data)} combined detection records")
            
        except Exception as e:
            logger.error(f"Error loading combined data: {e}")
        
        return data

    def create_detection_context(self, row: Dict[str, Any]) -> str:
        """Create a detailed context from detection data."""
        context = f"Image: {row['image_filename']}\n\n"
        
        # Add detection items
        if row['detection_items']:
            context += "UNWANTED ELEMENTS TO REMOVE:\n"
            for detection in row['detection_items']:
                location = detection['location_on_attire'].replace('_', ' ').title()
                context += f"- {detection['item_type']}: {detection['description']}\n"
                context += f"  Location: {location}\n"
                context += f"  Priority: {detection['removal_priority']}\n"
                context += f"  Confidence: {detection['confidence_score']:.2f}\n"
                context += f"  Coordinates: {detection['coordinates']}\n\n"
        
        # Add integrity issues
        if row['has_integrity_issues'] == 'True' and not row['garment_complete']:
            context += "CLOTHING INTEGRITY ISSUES TO FIX:\n"
            if row['missing_trousers'] == 'True':
                context += "- Missing trousers: Add appropriate formal/traditional trousers\n"
            if row['missing_sleeves'] == 'True':
                context += "- Missing sleeves: Restore proper sleeves\n"
            
            if row['integrity_issues']:
                context += "Additional issues:\n"
                for issue in row['integrity_issues']:
                    if isinstance(issue, dict):
                        context += f"- {issue.get('description', 'Unknown issue')}\n"
                    else:
                        context += f"- {issue}\n"
        
        context += f"\nPriority Score: {row['combined_priority_score']}\n"
        
        return context

    def generate_ai_prompt(self, row: Dict[str, Any]) -> str:
        """Generate an AI-optimized correction prompt using Gemini Pro."""
        detection_context = self.create_detection_context(row)
        
        system_prompt = """You are an expert fashion image correction specialist. Your task is to generate detailed, effective prompts for AI image generation models to clean up product images.

The generated prompt should:
1. Be specific about what needs to be removed and where
2. Include cultural and fashion context for traditional garments
3. Provide clear instructions for seamless removal and restoration
4. Ensure professional e-commerce quality results
5. Consider the garment type and cultural significance

Reference mannequin: Black body with rose gold head on white background.

Your response should be ONLY the generated prompt, nothing else."""

        user_prompt = f"""Generate a detailed correction prompt for this product image based on the following detection data:

{detection_context}

Generate a comprehensive prompt that will guide an AI image model to:
1. Remove all specified unwanted elements seamlessly
2. Fix any integrity issues 
3. Place the corrected garment on the reference mannequin
4. Ensure professional e-commerce presentation

The prompt should be detailed, specific, and actionable."""

        try:
            logger.info(f"Generating AI prompt for {row['image_filename']}")
            
            response = self.model.generate_content([
                system_prompt,
                user_prompt
            ])
            
            if response and response.text:
                generated_prompt = response.text.strip()
                logger.info(f"Successfully generated prompt for {row['image_filename']}")
                return generated_prompt
            else:
                logger.warning(f"No response from Gemini Pro for {row['image_filename']}")
                return self.generate_fallback_prompt(row)
                
        except Exception as e:
            logger.error(f"Error generating AI prompt for {row['image_filename']}: {e}")
            return self.generate_fallback_prompt(row)

    def generate_fallback_prompt(self, row: Dict[str, Any]) -> str:
        """Generate a fallback prompt if AI generation fails."""
        prompt_parts = ["Clean up this product image and place it on a black mannequin with rose gold head."]
        
        if row['detection_items']:
            prompt_parts.append("Remove these unwanted elements:")
            for detection in row['detection_items']:
                location = detection['location_on_attire'].replace('_', ' ')
                prompt_parts.append(f"- {detection['item_type']} from {location}")
        
        if row['has_integrity_issues'] == 'True' and not row['garment_complete']:
            prompt_parts.append("Fix these issues:")
            if row['missing_trousers'] == 'True':
                prompt_parts.append("- Add appropriate trousers")
            if row['missing_sleeves'] == 'True':
                prompt_parts.append("- Restore sleeves")
        
        prompt_parts.append("Ensure professional e-commerce presentation on white background.")
        
        return " ".join(prompt_parts)

    def update_combined_data(self, data: List[Dict[str, Any]]) -> None:
        """Update the combined data file with generated prompts."""
        logger.info(f"Updating {len(data)} records with generated prompts")
        
        # Create backup
        backup_file = self.combined_data_file.with_suffix('.csv.backup')
        if self.combined_data_file.exists():
            self.combined_data_file.rename(backup_file)
            logger.info(f"Created backup: {backup_file}")
        
        try:
            with open(self.combined_data_file, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'image_filename',
                    'detection_count',
                    'detection_items_json',
                    'has_integrity_issues',
                    'missing_sleeves',
                    'missing_trousers',
                    'garment_complete',
                    'integrity_issues_json',
                    'combined_priority_score',
                    'needs_processing',
                    'generated_prompt'
                ]
                
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for row in data:
                    # Create output row with generated prompt
                    output_row = {
                        'image_filename': row['image_filename'],
                        'detection_count': row['detection_count'],
                        'detection_items_json': json.dumps(row['detection_items']),
                        'has_integrity_issues': row['has_integrity_issues'],
                        'missing_sleeves': row['missing_sleeves'],
                        'missing_trousers': row['missing_trousers'],
                        'garment_complete': row['garment_complete'],
                        'integrity_issues_json': json.dumps(row['integrity_issues']),
                        'combined_priority_score': row['combined_priority_score'],
                        'needs_processing': row['needs_processing'],
                        'generated_prompt': row.get('generated_prompt', '')
                    }
                    
                    writer.writerow(output_row)
            
            logger.info("Combined data file updated successfully")
            
        except Exception as e:
            logger.error(f"Error updating combined data file: {e}")
            # Restore backup if available
            if backup_file.exists():
                backup_file.rename(self.combined_data_file)
                logger.info("Restored backup file")

    def generate_prompts_batch(self, max_images: int = 10, high_priority_only: bool = True) -> Dict[str, Any]:
        """Generate prompts for a batch of images."""
        logger.info("Starting batch prompt generation...")
        
        # Load data
        data = self.load_combined_data()
        
        # Filter images needing processing
        images_needing_processing = [row for row in data if row['needs_processing']]
        
        if high_priority_only:
            # Sort by priority score and take top N
            images_needing_processing.sort(key=lambda x: x['combined_priority_score'], reverse=True)
        
        if max_images:
            images_needing_processing = images_needing_processing[:max_images]
        
        logger.info(f"Generating prompts for {len(images_needing_processing)} images")
        
        successful = 0
        failed = 0
        
        for i, row in enumerate(images_needing_processing, 1):
            logger.info(f"Processing image {i}/{len(images_needing_processing)}: {row['image_filename']}")
            
            try:
                # Generate AI prompt
                generated_prompt = self.generate_ai_prompt(row)
                row['generated_prompt'] = generated_prompt
                
                successful += 1
                logger.info(f"Generated prompt for {row['image_filename']}")
                
            except Exception as e:
                logger.error(f"Failed to generate prompt for {row['image_filename']}: {e}")
                row['generated_prompt'] = self.generate_fallback_prompt(row)
                failed += 1
            
            # Rate limiting
            if i < len(images_needing_processing):
                time.sleep(0.5)
        
        # Update the combined data file
        self.update_combined_data(data)
        
        results = {
            'total_processed': len(images_needing_processing),
            'successful': successful,
            'failed': failed,
            'success_rate': successful / len(images_needing_processing) if images_needing_processing else 0
        }
        
        logger.info(f"Batch prompt generation complete: {successful}/{len(images_needing_processing)} successful")
        return results

    def show_sample_prompts(self, count: int = 3) -> None:
        """Show sample generated prompts."""
        data = self.load_combined_data()
        images_with_prompts = [row for row in data if row.get('generated_prompt')]
        
        if not images_with_prompts:
            logger.info("No generated prompts found")
            return
        
        print(f"\n{'='*80}")
        print("SAMPLE GENERATED PROMPTS")
        print(f"{'='*80}")
        
        for i, row in enumerate(images_with_prompts[:count], 1):
            print(f"\n--- Image {i}: {row['image_filename']} ---")
            print(f"Priority Score: {row['combined_priority_score']}")
            print(f"Detection Items: {row['detection_count']}")
            print(f"Integrity Issues: {row['has_integrity_issues']}")
            print(f"\nGenerated Prompt:")
            print(f"{row['generated_prompt']}")
            print(f"\n{'-'*80}")

    def run(self, max_images: int = 5, high_priority_only: bool = True) -> None:
        """Run the complete prompt generation process."""
        try:
            logger.info("Starting AI prompt generation process...")
            
            # Generate prompts
            results = self.generate_prompts_batch(max_images, high_priority_only)
            
            # Show results
            print(f"\n{'='*60}")
            print("AI PROMPT GENERATION SUMMARY")
            print(f"{'='*60}")
            print(f"Total processed: {results['total_processed']}")
            print(f"Successful: {results['successful']}")
            print(f"Failed: {results['failed']}")
            print(f"Success rate: {results['success_rate']:.2%}")
            print(f"{'='*60}")
            
            # Show sample prompts
            self.show_sample_prompts(2)
            
            logger.info("AI prompt generation process completed successfully")
            
        except Exception as e:
            logger.error(f"Error in AI prompt generation: {e}")
            raise

def main():
    """Main execution function."""
    try:
        generator = AIPromptGenerator()
        generator.run(max_images=5, high_priority_only=True)
        
    except Exception as e:
        logger.error(f"Fatal error in AI prompt generation: {e}")
        raise

if __name__ == "__main__":
    main()