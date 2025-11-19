#!/usr/bin/env python3
"""
Targeted Removal Prompt Generation System
Generates specialized prompts for removing unwanted elements based on detection data.
"""

import logging
from typing import List, Dict, Any
from detection_data_loader import DetectionItem, IntegrityIssue

logger = logging.getLogger(__name__)

class TargetedRemovalPromptGenerator:
    """Generates specialized prompts for targeted removal of unwanted elements."""
    
    def __init__(self):
        self.removal_strategies = {
            'brand_label': {
                'description': 'brand label, logo, or tag',
                'action': 'Remove completely and restore fabric texture seamlessly',
                'technique': 'Carefully remove while preserving underlying fabric pattern and texture'
            },
            'metallic_element': {
                'description': 'metallic tag, pin, or decorative element',
                'action': 'Remove seamlessly with surrounding material',
                'technique': 'Eliminate metallic sheen and blend with surrounding fabric'
            },
            'decorative_pin': {
                'description': 'decorative pin or brooch',
                'action': 'Remove completely and repair any damage',
                'technique': 'Remove pin and restore fabric to original condition'
            },
            'watermark': {
                'description': 'watermark or copyright symbol',
                'action': 'Remove completely and restore background',
                'technique': 'Eliminate watermark and match surrounding texture perfectly'
            },
            'other_unwanted_element': {
                'description': 'unwanted element',
                'action': 'Remove completely and restore area',
                'technique': 'Remove element and ensure seamless integration'
            },
            'accessory': {
                'description': 'accessory item',
                'action': 'Remove accessory and restore background',
                'technique': 'Remove accessory while preserving garment integrity'
            }
        }
        
        self.location_descriptors = {
            'left_lapel': 'left lapel area',
            'right_lapel': 'right lapel area',
            'left_chest': 'left chest area',
            'right_chest': 'right chest area',
            'left_chest_pocket': 'left chest pocket area',
            'right_chest_pocket': 'right chest pocket area',
            'center_chest': 'center chest area',
            'chest_placket': 'chest placket area',
            'center_chest_placket': 'center chest placket area',
            'collar': 'collar area',
            'neckline': 'neckline area',
            'left_sleeve_cuff': 'left sleeve cuff area',
            'right_sleeve_cuff': 'right sleeve cuff area',
            'left_sleeve_hem': 'left sleeve hem area',
            'right_sleeve_hem': 'right sleeve hem area',
            'waist_pocket': 'waist pocket area',
            'lower_right_pocket': 'lower right pocket area',
            'top_right_corner': 'top right corner of image',
            'bottom_left_corner': 'bottom left corner of image',
            'bottom_right_corner': 'bottom right corner of image',
            'head': 'head area',
            'head_area': 'head area'
        }
    
    def generate_coordinate_description(self, coordinates: Dict[str, int]) -> str:
        """Generate a human-readable coordinate description."""
        if not coordinates or all(v == 0 for v in coordinates.values()):
            return "location not specified"
        
        x, y = coordinates.get('x', 0), coordinates.get('y', 0)
        width, height = coordinates.get('width', 0), coordinates.get('height', 0)
        
        if width > 0 and height > 0:
            return f"at coordinates ({x}, {y}) with size {width}x{height}px"
        else:
            return f"near coordinates ({x}, {y})"
    
    def generate_removal_instruction(self, detection: DetectionItem) -> str:
        """Generate a removal instruction for a single detection item."""
        strategy = self.removal_strategies.get(detection.item_type, self.removal_strategies['other_unwanted_element'])
        location_desc = self.location_descriptors.get(detection.location_on_attire, detection.location_on_attire)
        coord_desc = self.generate_coordinate_description(detection.coordinates)
        
        instruction = f"{detection.removal_priority.upper().replace('_', ' ')} PRIORITY: Remove {strategy['description']} at {location_desc} {coord_desc}\n"
        instruction += f"   - Item: {detection.description}\n"
        instruction += f"   - Action: {strategy['action']}\n"
        instruction += f"   - Technique: {strategy['technique']}\n"
        instruction += f"   - Confidence: {detection.confidence_score:.2f}\n"
        
        return instruction
    
    def generate_integrity_fix_instruction(self, integrity: IntegrityIssue) -> str:
        """Generate instructions for fixing clothing integrity issues."""
        instructions = []
        
        if integrity.missing_trousers:
            instructions.append("HIGH PRIORITY: Add appropriate trousers to complete the outfit")
            instructions.append("   - Match trouser style to garment type (formal/traditional)")
            instructions.append("   - Ensure proper color coordination with existing garment")
            instructions.append("   - Maintain cultural appropriateness for traditional attire")
        
        if integrity.missing_sleeves:
            instructions.append("HIGH PRIORITY: Restore sleeves to garment")
            instructions.append("   - Match sleeve style to garment design")
            instructions.append("   - Ensure proper fit and proportion")
            instructions.append("   - Maintain fabric consistency")
        
        if not integrity.garment_complete and not integrity.missing_sleeves and not integrity.missing_trousers:
            instructions.append("MEDIUM PRIORITY: Complete garment presentation")
            instructions.append("   - Address any incomplete elements")
            instructions.append("   - Ensure professional product presentation")
        
        return "\n".join(instructions)
    
    def generate_enhanced_processing_prompt(self, 
                                          image_filename: str,
                                          detections: List[DetectionItem],
                                          integrity: IntegrityIssue = None) -> str:
        """Generate an enhanced processing prompt with targeted removal instructions."""
        
        prompt = f"""ENHANCED PRODUCT PROCESSING WITH TARGETED REMOVAL
===========================================================

IMAGE: {image_filename}

REFERENCE MANNEQUIN: Black body with rose gold head

TARGETED REMOVAL INSTRUCTIONS:
"""
        
        if detections:
            # Group detections by priority
            high_priority = [d for d in detections if d.removal_priority == 'high']
            medium_priority = [d for d in detections if d.removal_priority == 'medium']
            low_priority = [d for d in detections if d.removal_priority == 'low']
            
            if high_priority:
                prompt += "\nHIGH PRIORITY REMOVALS:\n"
                for detection in high_priority:
                    prompt += f"\n{self.generate_removal_instruction(detection)}"
            
            if medium_priority:
                prompt += "\nMEDIUM PRIORITY REMOVALS:\n"
                for detection in medium_priority:
                    prompt += f"\n{self.generate_removal_instruction(detection)}"
            
            if low_priority:
                prompt += "\nLOW PRIORITY REMOVALS:\n"
                for detection in low_priority:
                    prompt += f"\n{self.generate_removal_instruction(detection)}"
        else:
            prompt += "\nNo unwanted elements detected for removal.\n"
        
        # Add integrity fix instructions
        if integrity and (integrity.missing_sleeves or integrity.missing_trousers or not integrity.garment_complete):
            prompt += f"\n\nCLOTHING INTEGRITY FIXES:\n{self.generate_integrity_fix_instruction(integrity)}\n"
        else:
            prompt += "\n\nCLOTHING INTEGRITY: No issues detected.\n"
        
        prompt += f"""
STANDARD PROCESSING REQUIREMENTS:
1. Extract the cleaned clothing from the original image
2. Remove ALL unwanted elements as specified above
3. Fix any clothing integrity issues as specified above
4. Transfer the cleaned and completed clothing to the reference mannequin
5. Ensure proper fit, proportions, and professional presentation
6. Maintain original fabric textures, patterns, and colors
7. Remove any background elements, focusing solely on the garment
8. Ensure the final image shows only the cleaned garment on the black mannequin with rose gold head

QUALITY STANDARDS:
- Complete removal of all specified unwanted elements
- Seamless integration where elements were removed
- Professional product presentation suitable for e-commerce
- Consistent lighting and shadows
- Clear focus on the garment without distractions

PROCESS THE IMAGE WITH THESE SPECIFIC INSTRUCTIONS."""
        
        return prompt
    
    def generate_batch_summary(self, image_detections: Dict[str, List[DetectionItem]]) -> str:
        """Generate a summary of batch processing requirements."""
        total_items = sum(len(detections) for detections in image_detections.values())
        high_priority_count = sum(sum(1 for d in detections if d.removal_priority == 'high') 
                                for detections in image_detections.values())
        
        summary = f"""
BATCH PROCESSING SUMMARY:
========================
Total images to process: {len(image_detections)}
Total items to remove: {total_items}
High priority items: {high_priority_count}
Average items per image: {total_items / len(image_detections):.1f}

ITEM TYPE DISTRIBUTION:
"""
        
        # Count item types
        item_types = {}
        for detections in image_detections.values():
            for detection in detections:
                item_types[detection.item_type] = item_types.get(detection.item_type, 0) + 1
        
        for item_type, count in sorted(item_types.items(), key=lambda x: x[1], reverse=True):
            summary += f"- {item_type}: {count}\n"
        
        return summary
    
    def prioritize_detections(self, detections: List[DetectionItem]) -> List[DetectionItem]:
        """Sort detections by priority and confidence."""
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        
        return sorted(detections, 
                     key=lambda d: (priority_order.get(d.removal_priority, 0), d.confidence_score),
                     reverse=True)
    
    def validate_prompt_quality(self, prompt: str) -> bool:
        """Validate that the generated prompt meets quality standards."""
        required_elements = [
            'TARGETED REMOVAL INSTRUCTIONS',
            'STANDARD PROCESSING REQUIREMENTS',
            'QUALITY STANDARDS'
        ]
        
        for element in required_elements:
            if element not in prompt:
                logger.warning(f"Prompt missing required element: {element}")
                return False
        
        return True

# Example usage and testing
if __name__ == "__main__":
    # Test the prompt generator
    from detection_data_loader import DetectionDataLoader
    
    # Load detection data
    loader = DetectionDataLoader()
    loader.load_all_data()
    
    # Create prompt generator
    generator = TargetedRemovalPromptGenerator()
    
    # Get priority images
    priority_images = loader.get_priority_images(3)
    
    for image_filename in priority_images:
        detections = loader.get_detections_for_image(image_filename)
        integrity = loader.get_integrity_for_image(image_filename)
        
        print(f"\n{'='*60}")
        print(f"PROCESSING: {image_filename}")
        print(f"{'='*60}")
        
        prompt = generator.generate_enhanced_processing_prompt(image_filename, detections, integrity)
        print(prompt)
        
        # Validate prompt
        is_valid = generator.validate_prompt_quality(prompt)
        print(f"\nPrompt validation: {'PASS' if is_valid else 'FAIL'}")
        
        if len(priority_images) > 1:
            print("\n" + "="*60 + "\n")