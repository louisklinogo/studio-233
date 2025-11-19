#!/usr/bin/env python3
"""
Accessory and Label Detection Script
Uses Google Gemini 2.5 Pro to detect labels, metallic tags, accessories, and unwanted elements
in processed product images for batch removal workflow.
"""

import os
import sys
import csv
import json
from pathlib import Path
from PIL import Image
import google.generativeai as genai
from dotenv import load_dotenv
from io import BytesIO
import time
import logging
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('accessory_detection.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class AccessoryDetector:
    def __init__(self):
        """Initialize the detector with API configuration."""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        # Configure Gemini API with 2.5 Pro model
        genai.configure(api_key=self.api_key)
        
        # Use Gemini 2.5 Pro for enhanced detection
        self.detection_model = genai.GenerativeModel('models/gemini-2.5-pro')
        
        logger.info("Accessory Detector initialized with Gemini 2.5 Pro")
        
        # Directory paths
        self.processed_dir = Path('product-assets/processed')
        self.output_dir = Path('detection_results')
        
        # Create output directory
        self.output_dir.mkdir(exist_ok=True)
        
        # Comprehensive detection prompt
        self.detection_prompt = """You are an expert fashion product analyst specialized in detecting unwanted elements in clothing images.

TASK: Analyze this product image and identify ALL unwanted elements that should be removed for a clean, professional product presentation.

DETECTION TARGETS:
1. BRAND LABELS & TAGS
   - Brand names, logos, labels, tags or trademarks
   - Care labels, size tags, composition tags
   - Price tags, hang tags, security tags
   - Paper tags, cardboard tags, plastic tags

2. METALLIC ELEMENTS
   - Shiny metallic tags or embellishments not part of actual attire
   - Reflective elements, metallic threads

3. ACCESSORIES
   - Jewelry (necklaces, earrings, bracelets)
   - Watches, fitness trackers, smart devices
   - Belts, belt buckles, suspenders
   - Scarves
   - Bags, purses, clutches
   - EXCLUDE: Pocket squares (considered part of formal attire)

4. CLOTHING INTEGRITY ISSUES
   - Missing sleeves on suits and attires (sleeveless garments when sleeves expected)
   - Missing trousers/pants (when full outfit expected)
   - Incomplete clothing items
   - Damaged or incomplete garment sections

5. OTHER UNWANTED ELEMENTS
   - Safety pins, clips, fasteners
   - Decorative pins, brooches
   - Patches, appliqués (non-essential)
   - Watermarks, copyright symbols
   - QR codes, barcodes

LOCATION DESCRIPTION:
For each detected item, provide:
- SPECIFIC LOCATION: collar, neckline, chest, waist, sleeve, hem, pocket, etc.
- PRECISE COORDINATES: x,y coordinates of center point and approximate size
- CONFIDENCE LEVEL: high, medium, low

RESPONSE FORMAT:
Return a structured JSON response with the following format:
{
  "detected_items": [
    {
      "item_type": "brand_label",
      "description": "Nike swoosh logo",
      "location": "left_chest",
      "coordinates": {"x": 120, "y": 85, "width": 40, "height": 15},
      "confidence": 0.95,
      "removal_priority": "high"
    }
  ],
  "clothing_integrity": {
    "missing_sleeves": false,
    "missing_trousers": false,
    "garment_complete": true,
    "issues_found": []
  },
  "summary": {
    "total_items": 3,
    "high_priority": 2,
    "medium_priority": 1,
    "clean_areas": ["back", "right_sleeve"]
  }
}

IMPORTANT:
- Be extremely thorough in detection
- Provide precise location data
- Include confidence levels for each detection
- Prioritize items that most affect product presentation
- EXCLUDE pocket squares from detection (considered part of formal attire)
- Check clothing integrity for missing sleeves or trousers
- If no unwanted elements found, return empty detected_items array
- Always include clothing_integrity section in response"""

    def load_image_data(self, image_path):
        """Load and convert image to bytes."""
        try:
            with Image.open(image_path) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Get image dimensions for coordinate reference
                width, height = img.size
                
                img_byte_arr = BytesIO()
                img.save(img_byte_arr, format='JPEG')
                img_data = img_byte_arr.getvalue()
                
                return img_data, width, height
        except Exception as e:
            logger.error(f"Error loading image {image_path}: {e}")
            return None, None, None

    def detect_accessories(self, image_path):
        """Detect unwanted elements in a single image."""
        logger.info(f"Processing {image_path.name}")
        
        # Load image data
        img_data, width, height = self.load_image_data(image_path)
        if not img_data:
            return None
        
        try:
            # Send to detection model
            response = self.detection_model.generate_content([
                self.detection_prompt,
                {"mime_type": "image/jpeg", "data": img_data}
            ])
            
            if response and response.text:
                # Parse the response
                result_text = response.text.strip()
                
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
                if json_match:
                    try:
                        result_json = json.loads(json_match.group())
                        return result_json
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid JSON in response for {image_path.name}")
                        # Fallback to text parsing
                        return self.parse_text_response(result_text, image_path.name)
                else:
                    # Fallback to text parsing
                    return self.parse_text_response(result_text, image_path.name)
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting accessories in {image_path.name}: {e}")
            return None

    def parse_text_response(self, response_text, image_name):
        """Parse text response when JSON is not available."""
        # Simple fallback parsing
        detected_items = []
        
        lines = response_text.split('\n')
        current_item = {}
        
        for line in lines:
            line = line.strip().lower()
            if 'label' in line or 'tag' in line or 'metal' in line or 'zipper' in line:
                if current_item:
                    detected_items.append(current_item)
                current_item = {
                    'item_type': 'unknown',
                    'description': line,
                    'location': 'unknown',
                    'confidence': 0.7,
                    'removal_priority': 'medium'
                }
            elif 'chest' in line or 'collar' in line or 'neck' in line:
                if current_item:
                    current_item['location'] = line
            elif 'high' in line:
                if current_item:
                    current_item['confidence'] = 0.9
                    current_item['removal_priority'] = 'high'
        
        if current_item:
            detected_items.append(current_item)
        
        return {
            'detected_items': detected_items,
            'clothing_integrity': {
                'missing_sleeves': False,
                'missing_trousers': False,
                'garment_complete': True,
                'issues_found': []
            },
            'summary': {
                'total_items': len(detected_items),
                'high_priority': sum(1 for item in detected_items if item.get('removal_priority') == 'high'),
                'medium_priority': sum(1 for item in detected_items if item.get('removal_priority') == 'medium'),
                'clean_areas': []
            }
        }

    def process_all_images(self, sample_mode=False, max_images=None):
        """Process all images in the processed directory."""
        logger.info("Starting accessory detection for all processed images...")
        
        # Get list of images to process
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'}
        images_to_process = []
        
        for file_path in self.processed_dir.iterdir():
            if file_path.is_file() and file_path.suffix in image_extensions:
                images_to_process.append(file_path)
        
        if sample_mode and max_images:
            images_to_process = images_to_process[:max_images]
            logger.info(f"Sample mode: processing {len(images_to_process)} images")
        
        # Prepare CSV outputs
        csv_file = self.output_dir / 'accessory_detection_results.csv'
        integrity_file = self.output_dir / 'clothing_integrity_report.csv'
        csv_data = []
        integrity_data = []
        
        processed_count = 0
        for i, image_path in enumerate(images_to_process, 1):
            logger.info(f"Processing image {i}/{len(images_to_process)}: {image_path.name}")
            
            # Detect accessories
            result = self.detect_accessories(image_path)
            
            if result and 'detected_items' in result:
                # Add items to CSV data
                for item in result['detected_items']:
                    csv_data.append({
                        'image_filename': image_path.name,
                        'item_type': item.get('item_type', 'unknown'),
                        'description': item.get('description', ''),
                        'location_on_attire': item.get('location', 'unknown'),
                        'confidence_score': item.get('confidence', 0.5),
                        'removal_priority': item.get('removal_priority', 'medium'),
                        'coordinates': json.dumps(item.get('coordinates', {}))
                    })
                
                # Add clothing integrity data
                if 'clothing_integrity' in result:
                    integrity = result['clothing_integrity']
                    integrity_data.append({
                        'image_filename': image_path.name,
                        'missing_sleeves': str(integrity.get('missing_sleeves', False)),
                        'missing_trousers': str(integrity.get('missing_trousers', False)),
                        'garment_complete': str(integrity.get('garment_complete', True)),
                        'issues_found': str(integrity.get('issues_found', ''))
                    })
                
                processed_count += 1
                logger.info(f"Found {len(result['detected_items'])} items in {image_path.name}")
            else:
                logger.info(f"No items detected in {image_path.name}")
            
            # Rate limiting
            if i < len(images_to_process):
                time.sleep(0.5)
        
        # Write CSV files
        if csv_data:
            with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'image_filename', 'item_type', 'description', 'location_on_attire',
                    'confidence_score', 'removal_priority', 'coordinates'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(csv_data)
            
            logger.info(f"Accessory detection results saved to {csv_file}")
        
        # Write clothing integrity report
        if integrity_data:
            with open(integrity_file, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [
                    'image_filename', 'missing_sleeves', 'missing_trousers', 
                    'garment_complete', 'issues_found'
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(integrity_data)
            
            logger.info(f"Clothing integrity report saved to {integrity_file}")
        
        # Generate summary report
        self.generate_summary_report(csv_data, integrity_data, processed_count, len(images_to_process))
        
        return len(csv_data), processed_count

    def generate_summary_report(self, csv_data, integrity_data, processed_count, total_images):
        """Generate a summary report of detection results."""
        report_file = self.output_dir / 'detection_summary.txt'
        
        # Analyze accessory data
        item_types = {}
        locations = {}
        priorities = {'high': 0, 'medium': 0, 'low': 0}
        
        for row in csv_data:
            item_type = row['item_type']
            location = row['location_on_attire']
            priority = row['removal_priority']
            
            item_types[item_type] = item_types.get(item_type, 0) + 1
            locations[location] = locations.get(location, 0) + 1
            priorities[priority] = priorities.get(priority, 0) + 1
        
        # Analyze integrity data
        integrity_issues = {
            'missing_sleeves': 0,
            'missing_trousers': 0,
            'incomplete_garments': 0
        }
        
        for row in integrity_data:
            if row['missing_sleeves']:
                integrity_issues['missing_sleeves'] += 1
            if row['missing_trousers']:
                integrity_issues['missing_trousers'] += 1
            if not row['garment_complete']:
                integrity_issues['incomplete_garments'] += 1
        
        # Write report
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("Accessory & Clothing Integrity Detection Report\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"Total Images Processed: {processed_count}/{total_images}\n")
            f.write(f"Total Accessories Detected: {len(csv_data)}\n")
            f.write(f"Images with Integrity Issues: {sum(integrity_issues.values())}\n\n")
            
            f.write("Accessory Detection Statistics:\n")
            f.write("-" * 40 + "\n")
            f.write(f"Images with accessories: {processed_count}\n")
            f.write(f"Clean images: {total_images - processed_count}\n")
            f.write(f"Average accessories per image: {len(csv_data) / max(processed_count, 1):.2f}\n\n")
            
            f.write("Clothing Integrity Statistics:\n")
            f.write("-" * 40 + "\n")
            f.write(f"Missing sleeves: {integrity_issues['missing_sleeves']}\n")
            f.write(f"Missing trousers: {integrity_issues['missing_trousers']}\n")
            f.write(f"Incomplete garments: {integrity_issues['incomplete_garments']}\n")
            f.write(f"Complete garments: {len(integrity_data) - integrity_issues['incomplete_garments']}\n\n")
            
            f.write("Accessory Types Found:\n")
            f.write("-" * 30 + "\n")
            for item_type, count in sorted(item_types.items(), key=lambda x: x[1], reverse=True):
                f.write(f"{item_type}: {count}\n")
            
            f.write("\nLocation Distribution:\n")
            f.write("-" * 30 + "\n")
            for location, count in sorted(locations.items(), key=lambda x: x[1], reverse=True):
                f.write(f"{location}: {count}\n")
            
            f.write("\nPriority Distribution:\n")
            f.write("-" * 30 + "\n")
            for priority, count in priorities.items():
                f.write(f"{priority}: {count}\n")
        
        logger.info(f"Summary report saved to {report_file}")

def main():
    """Main execution function."""
    try:
        # Initialize detector
        detector = AccessoryDetector()
        
        # Process all processed images
        logger.info("Starting accessory detection for all processed images...")
        
        # Process in sample mode first to test
        total_items, processed_images = detector.process_all_images(sample_mode=False)
        
        logger.info(f"Detection complete: {total_items} items found in {processed_images} images")
        logger.info(f"Results saved to detection_results/ directory")
        
    except Exception as e:
        logger.error(f"Fatal error in detection: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()