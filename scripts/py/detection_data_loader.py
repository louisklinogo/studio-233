#!/usr/bin/env python3
"""
Detection Data Loader and Integration System
Loads CSV detection data and integrates it with the image generation pipeline
for targeted removal of unwanted elements.
"""

import os
import csv
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class DetectionItem:
    """Represents a single detected unwanted item."""
    image_filename: str
    item_type: str
    description: str
    location_on_attire: str
    confidence_score: float
    removal_priority: str
    coordinates: Dict[str, int]
    
    def __post_init__(self):
        # Convert coordinates to integers if they're strings
        if isinstance(self.coordinates, str):
            try:
                self.coordinates = json.loads(self.coordinates.replace('""', '"'))
            except json.JSONDecodeError:
                self.coordinates = {'x': 0, 'y': 0, 'width': 0, 'height': 0}
        
        # Convert coordinates to integers
        for key in self.coordinates:
            if isinstance(self.coordinates[key], str):
                try:
                    self.coordinates[key] = int(self.coordinates[key])
                except (ValueError, TypeError):
                    self.coordinates[key] = 0

@dataclass
class IntegrityIssue:
    """Represents a clothing integrity issue."""
    image_filename: str
    missing_sleeves: bool
    missing_trousers: bool
    garment_complete: bool
    issues_found: List[str]
    
    def __post_init__(self):
        # Convert string representations to proper types
        if isinstance(self.missing_sleeves, str):
            self.missing_sleeves = self.missing_sleeves.upper() == 'TRUE'
        if isinstance(self.missing_trousers, str):
            self.missing_trousers = self.missing_trousers.upper() == 'TRUE'
        if isinstance(self.garment_complete, str):
            self.garment_complete = self.garment_complete.upper() == 'TRUE'
        if isinstance(self.issues_found, str):
            try:
                self.issues_found = json.loads(self.issues_found.replace('""', '"'))
            except json.JSONDecodeError:
                self.issues_found = []

class DetectionDataLoader:
    """Loads and manages detection data from CSV files."""
    
    def __init__(self, detection_results_dir: str = "detection_results"):
        self.detection_results_dir = Path(detection_results_dir)
        self.accessory_detection_file = self.detection_results_dir / "accessory_detection_results.csv"
        self.integrity_report_file = self.detection_results_dir / "clothing_integrity_report.csv"
        
        # Data storage
        self.detection_items: List[DetectionItem] = []
        self.integrity_issues: List[IntegrityIssue] = []
        self.image_to_detections: Dict[str, List[DetectionItem]] = {}
        self.image_to_integrity: Dict[str, IntegrityIssue] = {}
        
        logger.info("Detection Data Loader initialized")
    
    def load_accessory_detections(self) -> None:
        """Load accessory detection results from CSV."""
        if not self.accessory_detection_file.exists():
            logger.warning(f"Accessory detection file not found: {self.accessory_detection_file}")
            return
        
        try:
            with open(self.accessory_detection_file, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    detection_item = DetectionItem(
                        image_filename=row['image_filename'],
                        item_type=row['item_type'],
                        description=row['description'],
                        location_on_attire=row['location_on_attire'],
                        confidence_score=float(row['confidence_score']),
                        removal_priority=row['removal_priority'],
                        coordinates=row['coordinates']
                    )
                    
                    self.detection_items.append(detection_item)
                    
                    # Add to image mapping
                    if detection_item.image_filename not in self.image_to_detections:
                        self.image_to_detections[detection_item.image_filename] = []
                    self.image_to_detections[detection_item.image_filename].append(detection_item)
            
            logger.info(f"Loaded {len(self.detection_items)} accessory detections from {len(self.image_to_detections)} images")
            
        except Exception as e:
            logger.error(f"Error loading accessory detections: {e}")
    
    def load_integrity_issues(self) -> None:
        """Load clothing integrity issues from CSV."""
        if not self.integrity_report_file.exists():
            logger.warning(f"Integrity report file not found: {self.integrity_report_file}")
            return
        
        try:
            with open(self.integrity_report_file, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    integrity_issue = IntegrityIssue(
                        image_filename=row['image_filename'],
                        missing_sleeves=row['missing_sleeves'],
                        missing_trousers=row['missing_trousers'],
                        garment_complete=row['garment_complete'],
                        issues_found=row['issues_found']
                    )
                    
                    self.integrity_issues.append(integrity_issue)
                    self.image_to_integrity[integrity_issue.image_filename] = integrity_issue
            
            logger.info(f"Loaded {len(self.integrity_issues)} integrity issues")
            
        except Exception as e:
            logger.error(f"Error loading integrity issues: {e}")
    
    def load_all_data(self) -> None:
        """Load all detection data from CSV files."""
        logger.info("Loading all detection data...")
        self.load_accessory_detections()
        self.load_integrity_issues()
        logger.info(f"Data loading complete. {len(self.image_to_detections)} images with detections, {len(self.image_to_integrity)} images with integrity issues")
    
    def get_detections_for_image(self, image_filename: str) -> List[DetectionItem]:
        """Get all detection items for a specific image."""
        return self.image_to_detections.get(image_filename, [])
    
    def get_integrity_for_image(self, image_filename: str) -> Optional[IntegrityIssue]:
        """Get integrity issues for a specific image."""
        return self.image_to_integrity.get(image_filename)
    
    def get_images_with_detections(self) -> List[str]:
        """Get list of all images that have detection items."""
        return list(self.image_to_detections.keys())
    
    def get_images_with_integrity_issues(self) -> List[str]:
        """Get list of all images that have integrity issues."""
        return list(self.image_to_integrity.keys())
    
    def get_images_needing_processing(self) -> List[str]:
        """Get list of all images that need processing (detections or integrity issues)."""
        detection_images = set(self.get_images_with_detections())
        integrity_images = set(self.get_images_with_integrity_issues())
        return sorted(list(detection_images.union(integrity_images)))
    
    def get_priority_images(self, limit: int = 10) -> List[str]:
        """Get images sorted by priority (high priority items first)."""
        images_with_priority = []
        
        for image_filename in self.get_images_needing_processing():
            detections = self.get_detections_for_image(image_filename)
            
            # Calculate priority score
            high_priority_count = sum(1 for d in detections if d.removal_priority == 'high')
            medium_priority_count = sum(1 for d in detections if d.removal_priority == 'medium')
            low_priority_count = sum(1 for d in detections if d.removal_priority == 'low')
            
            # Check for integrity issues
            integrity = self.get_integrity_for_image(image_filename)
            has_integrity_issues = integrity and not integrity.garment_complete
            
            priority_score = (high_priority_count * 3) + (medium_priority_count * 2) + low_priority_count
            if has_integrity_issues:
                priority_score += 5  # Integrity issues are high priority
            
            images_with_priority.append((image_filename, priority_score))
        
        # Sort by priority score (descending) and return top N
        images_with_priority.sort(key=lambda x: x[1], reverse=True)
        return [img[0] for img in images_with_priority[:limit]]
    
    def generate_detection_summary(self) -> Dict[str, Any]:
        """Generate a summary of loaded detection data."""
        item_types = {}
        locations = {}
        priorities = {'high': 0, 'medium': 0, 'low': 0}
        
        for detection in self.detection_items:
            item_types[detection.item_type] = item_types.get(detection.item_type, 0) + 1
            locations[detection.location_on_attire] = locations.get(detection.location_on_attire, 0) + 1
            priorities[detection.removal_priority] = priorities.get(detection.removal_priority, 0) + 1
        
        integrity_stats = {
            'missing_sleeves': sum(1 for issue in self.integrity_issues if issue.missing_sleeves),
            'missing_trousers': sum(1 for issue in self.integrity_issues if issue.missing_trousers),
            'incomplete_garments': sum(1 for issue in self.integrity_issues if not issue.garment_complete)
        }
        
        return {
            'total_images_with_detections': len(self.image_to_detections),
            'total_images_with_integrity_issues': len(self.image_to_integrity),
            'total_detection_items': len(self.detection_items),
            'total_integrity_issues': len(self.integrity_issues),
            'item_types': item_types,
            'locations': locations,
            'priorities': priorities,
            'integrity_stats': integrity_stats
        }

# Example usage and testing
if __name__ == "__main__":
    # Test the detection data loader
    loader = DetectionDataLoader()
    loader.load_all_data()
    
    # Print summary
    summary = loader.generate_detection_summary()
    print("Detection Data Summary:")
    print(f"Images with detections: {summary['total_images_with_detections']}")
    print(f"Images with integrity issues: {summary['total_images_with_integrity_issues']}")
    print(f"Total detection items: {summary['total_detection_items']}")
    print(f"Item types: {summary['item_types']}")
    print(f"Priorities: {summary['priorities']}")
    
    # Show priority images
    priority_images = loader.get_priority_images(5)
    print(f"\nTop 5 priority images: {priority_images}")
    
    # Show details for first priority image
    if priority_images:
        image = priority_images[0]
        detections = loader.get_detections_for_image(image)
        integrity = loader.get_integrity_for_image(image)
        
        print(f"\nDetails for {image}:")
        print(f"Detections: {len(detections)}")
        for detection in detections:
            print(f"  - {detection.item_type} at {detection.location_on_attire} ({detection.removal_priority} priority)")
        
        if integrity:
            print(f"Integrity issues: Missing sleeves={integrity.missing_sleeves}, Missing trousers={integrity.missing_trousers}, Complete={integrity.garment_complete}")