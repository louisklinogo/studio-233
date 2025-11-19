#!/usr/bin/env python3
"""
CSV Prompt Generator with Gemini 2.5 Pro
Analyzes detection data from two CSV files and creates a single CSV with image filenames and prompts.
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

class CSVPromptGenerator:
    def __init__(self):
        """Initialize the CSV prompt generator."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('models/gemini-2.5-pro')
        
        # File paths
        self.accessory_file = Path('detection_results/accessory_detection_results.csv')
        self.integrity_file = Path('detection_results/clothing_integrity_report.csv')
        self.output_file = Path('detection_results/image_prompts.csv')
        
        logger.info("CSV Prompt Generator initialized with Gemini 2.5 Pro")

    def load_accessory_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load accessory detection data."""
        data = {}
        
        if not self.accessory_file.exists():
            logger.error(f"Accessory detection file not found: {self.accessory_file}")
            return data
        
        try:
            with open(self.accessory_file, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    filename = row['image_filename']
                    if filename not in data:
                        data[filename] = []
                    
                    # Parse coordinates
                    try:
                        coordinates = json.loads(row['coordinates'].replace('""', '"'))
                    except:
                        coordinates = {'x': 0, 'y': 0, 'width': 0, 'height': 0}
                    
                    data[filename].append({
                        'type': 'accessory',
                        'item_type': row['item_type'],
                        'description': row['description'],
                        'location': row['location_on_attire'],
                        'confidence': float(row['confidence_score']),
                        'priority': row['removal_priority'],
                        'coordinates': coordinates
                    })
            
            logger.info(f"Loaded accessory data for {len(data)} images")
            
        except Exception as e:
            logger.error(f"Error loading accessory data: {e}")
        
        return data

    def load_integrity_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load clothing integrity data."""
        data = {}
        
        if not self.integrity_file.exists():
            logger.error(f"Integrity report file not found: {self.integrity_file}")
            return data
        
        try:
            with open(self.integrity_file, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    filename = row['image_filename']
                    if filename not in data:
                        data[filename] = []
                    
                    # Parse issues found
                    try:
                        issues_found = json.loads(row['issues_found'].replace('""', '"'))
                    except:
                        issues_found = [row['issues_found']] if row['issues_found'] else []
                    
                    data[filename].append({
                        'type': 'integrity',
                        'missing_sleeves': row['missing_sleeves'].upper() == 'TRUE',
                        'missing_trousers': row['missing_trousers'].upper() == 'TRUE',
                        'garment_complete': row['garment_complete'].upper() == 'TRUE',
                        'issues_found': issues_found
                    })
            
            logger.info(f"Loaded integrity data for {len(data)} images")
            
        except Exception as e:
            logger.error(f"Error loading integrity data: {e}")
        
        return data

    def combine_detection_data(self) -> Dict[str, Dict[str, Any]]:
        """Combine data from both sources, ensuring no duplicates."""
        accessory_data = self.load_accessory_data()
        integrity_data = self.load_integrity_data()
        
        # Get all unique image filenames
        all_images = set(accessory_data.keys()) | set(integrity_data.keys())
        
        combined_data = {}
        
        for image_filename in all_images:
            accessories = accessory_data.get(image_filename, [])
            integrity = integrity_data.get(image_filename, [])
            
            combined_data[image_filename] = {
                'accessories': accessories,
                'integrity': integrity
            }
        
        logger.info(f"Combined detection data for {len(combined_data)} unique images")
        return combined_data

    def generate_prompt_for_image(self, image_filename: str, detection_data: Dict[str, Any]) -> str:
        """Generate a prompt for a single image using Gemini 2.5 Pro."""
        
        # Create context for Gemini
        context = f"Image: {image_filename}\n\n"
        
        # Add accessory information
        if detection_data['accessories']:
            context += "UNWANTED ELEMENTS TO REMOVE:\n"
            for accessory in detection_data['accessories']:
                context += f"- {accessory['item_type']}: {accessory['description']}\n"
                context += f"  Location: {accessory['location'].replace('_', ' ').title()}\n"
                context += f"  Priority: {accessory['priority']}\n"
                context += f"  Confidence: {accessory['confidence']:.2f}\n\n"
        
        # Add integrity information
        if detection_data['integrity']:
            for integrity in detection_data['integrity']:
                if not integrity['garment_complete']:
                    context += "CLOTHING INTEGRITY ISSUES TO FIX:\n"
                    if integrity['missing_trousers']:
                        context += "- Missing trousers: Add appropriate formal/traditional trousers\n"
                    if integrity['missing_sleeves']:
                        context += "- Missing sleeves: Restore proper sleeves\n"
                    
                    if integrity['issues_found']:
                        context += "Additional issues:\n"
                        for issue in integrity['issues_found']:
                            if isinstance(issue, dict):
                                context += f"- {issue.get('description', 'Unknown issue')}\n"
                            else:
                                context += f"- {issue}\n"
        
        system_prompt = """You are a specialist in image correction. Your task is to generate concise, focused prompts for AI image models to correct specific anomalies in product images.

Requirements:
1. Focus ONLY on correcting the specific issues mentioned
2. Be direct and concise - no extra e-commerce presentation details
3. Just address the actual problems that need fixing
4. Keep prompts short and to the point but with precision

Your response should be ONLY the correction prompt, nothing else."""

        user_prompt = f"""Generate a concise correction prompt for this product image based on the following detection data:

{context}

Generate a focused prompt that only addresses:
1. Removing the specific unwanted elements mentioned with precision
2. Fixing the specific integrity issues mentioned with precision
3. Keep it brief and focused only on the corrections needed

Do not include background changes, lighting, or other presentation details - just focus on correcting the anomalies."""

        try:
            logger.info(f"Generating prompt for {image_filename}")
            
            response = self.model.generate_content([
                system_prompt,
                user_prompt
            ])
            
            if response and response.text:
                generated_prompt = response.text.strip()
                logger.info(f"Successfully generated prompt for {image_filename}")
                return generated_prompt
            else:
                logger.warning(f"No response from Gemini Pro for {image_filename}")
                return self.generate_fallback_prompt(detection_data)
                
        except Exception as e:
            logger.error(f"Error generating prompt for {image_filename}: {e}")
            return self.generate_fallback_prompt(detection_data)

    def generate_fallback_prompt(self, detection_data: Dict[str, Any]) -> str:
        """Generate a fallback prompt if AI generation fails."""
        prompt_parts = ["Remove unwanted elements and fix integrity issues:"]
        
        if detection_data['accessories']:
            for accessory in detection_data['accessories']:
                location = accessory['location'].replace('_', ' ')
                prompt_parts.append(f"Remove {accessory['item_type']} from {location}")
        
        if detection_data['integrity']:
            for integrity in detection_data['integrity']:
                if not integrity['garment_complete']:
                    if integrity['missing_trousers']:
                        prompt_parts.append("Add appropriate trousers")
                    if integrity['missing_sleeves']:
                        prompt_parts.append("Restore sleeves")
        
        return " ".join(prompt_parts)

    def generate_prompts_batch(self, max_images: int = 50) -> Dict[str, Any]:
        """Generate prompts for a batch of images."""
        logger.info("Starting batch prompt generation...")
        
        # Combine detection data
        combined_data = self.combine_detection_data()
        
        # Limit number of images if specified
        if max_images and len(combined_data) > max_images:
            # Sort by number of issues (more issues first)
            sorted_images = sorted(
                combined_data.items(),
                key=lambda x: len(x[1]['accessories']) + len(x[1]['integrity']),
                reverse=True
            )
            combined_data = dict(sorted_images[:max_images])
        
        logger.info(f"Generating prompts for {len(combined_data)} images")
        
        prompts = {}
        successful = 0
        failed = 0
        
        for i, (image_filename, detection_data) in enumerate(combined_data.items(), 1):
            logger.info(f"Processing image {i}/{len(combined_data)}: {image_filename}")
            
            try:
                # Generate AI prompt
                prompt = self.generate_prompt_for_image(image_filename, detection_data)
                prompts[image_filename] = prompt
                successful += 1
                
            except Exception as e:
                logger.error(f"Failed to generate prompt for {image_filename}: {e}")
                # Use fallback prompt
                prompts[image_filename] = self.generate_fallback_prompt(detection_data)
                failed += 1
            
            # Rate limiting
            if i < len(combined_data):
                time.sleep(0.5)
        
        results = {
            'total_processed': len(combined_data),
            'successful': successful,
            'failed': failed,
            'success_rate': successful / len(combined_data) if combined_data else 0,
            'prompts': prompts
        }
        
        logger.info(f"Batch prompt generation complete: {successful}/{len(combined_data)} successful")
        return results

    def save_prompts_to_csv(self, prompts: Dict[str, str]) -> None:
        """Save prompts to CSV file."""
        logger.info(f"Saving prompts to {self.output_file}")
        
        try:
            with open(self.output_file, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['image_filename', 'prompt']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                
                for image_filename, prompt in prompts.items():
                    writer.writerow({
                        'image_filename': image_filename,
                        'prompt': prompt
                    })
            
            logger.info(f"Prompts saved successfully to {self.output_file}")
            
        except Exception as e:
            logger.error(f"Error saving prompts to CSV: {e}")
            raise

    def show_sample_prompts(self, prompts: Dict[str, str], count: int = 3) -> None:
        """Show sample generated prompts."""
        print(f"\n{'='*80}")
        print("SAMPLE GENERATED PROMPTS")
        print(f"{'='*80}")
        
        for i, (image_filename, prompt) in enumerate(list(prompts.items())[:count], 1):
            print(f"\n--- Image {i}: {image_filename} ---")
            print(f"Generated Prompt:")
            print(f"{prompt}")
            print(f"\n{'-'*80}")

    def run(self, max_images: int = 50) -> None:
        """Run the complete prompt generation process."""
        try:
            logger.info("Starting CSV prompt generation process...")
            
            # Generate prompts
            results = self.generate_prompts_batch(max_images)
            
            # Save to CSV
            self.save_prompts_to_csv(results['prompts'])
            
            # Show results
            print(f"\n{'='*60}")
            print("CSV PROMPT GENERATION SUMMARY")
            print(f"{'='*60}")
            print(f"Total processed: {results['total_processed']}")
            print(f"Successful: {results['successful']}")
            print(f"Failed: {results['failed']}")
            print(f"Success rate: {results['success_rate']:.2%}")
            print(f"Output file: {self.output_file}")
            print(f"{'='*60}")
            
            # Show sample prompts
            self.show_sample_prompts(results['prompts'], 2)
            
            logger.info("CSV prompt generation process completed successfully")
            
        except Exception as e:
            logger.error(f"Error in CSV prompt generation: {e}")
            raise

def main():
    """Main execution function."""
    try:
        generator = CSVPromptGenerator()
        generator.run(max_images=51)
        
    except Exception as e:
        logger.error(f"Fatal error in CSV prompt generation: {e}")
        raise

if __name__ == "__main__":
    main()