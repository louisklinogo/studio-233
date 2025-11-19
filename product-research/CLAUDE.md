# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fashion product research and image processing project focused on AI-powered fashion image generation, correction, and standardization. The project uses Google's Gemini 2.5 Flash Image Preview model for various image processing tasks including:

- Product image standardization (removing people, placing clothing on mannequins)
- Logo addition and watermark removal
- Image correction and enhancement
- Style transfer and fashion generation
- Airtable integration for fashion data management

## Key Technologies

- **Python** with PIL/Pillow for image processing
- **Google Gemini 2.5 Flash Image Preview** for AI image generation and manipulation
- **Airtable API** for fashion data management via pyairtable
- **Environmental configuration** using .env file

## Common Commands

### Running Scripts
```bash
# Main product processing pipeline
python scripts/product_processor.py

# New designs processing pipeline
python scripts/new_designs_processor.py

# Logo addition scripts
python scripts/unified_logo_adder.py
python scripts/new_designs_logo_adder.py
python scripts/dual_logo_adder.py

# Image correction and enhancement
python scripts/targeted_image_corrector.py
python scripts/image_correction_implementer.py

# Airtable operations
python airtable_examples/generate_improved_images.py
python airtable_examples/generate_luxury_images.py
```

### Environment Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (minimal, just shadcn)
npm install
```

## Architecture Overview

### Core Components

1. **Image Processing Pipeline** (`scripts/product_processor.py`, `scripts/new_designs_processor.py`)
   - Main entry point for product image standardization
   - Uses Gemini 2.5 Flash Image Preview for AI processing
   - Handles batch processing of fashion images
   - Supports both main product assets and new designs

2. **Logo Management** (`scripts/unified_logo_adder.py`, `scripts/new_designs_logo_adder.py`, `scripts/dual_logo_adder.py`)
   - Adds unified chesspiece logo to product images
   - Handles logo sizing and positioning (35% of image width)
   - Supports multiple logo variations
   - Works with both main product assets and new designs

3. **Airtable Integration** (`airtable_examples/`)
   - Fetches fashion data from Airtable
   - Generates prompts for AI image generation
   - Manages fashion model and product information

4. **Image Correction System** (`scripts/targeted_image_corrector.py`)
   - Identifies and fixes image quality issues
   - Uses paired image mapping for reference-based correction
   - Supports batch processing with retry mechanisms

### Directory Structure

- `product-assets/` - Source images and processed outputs
- `product-assets/processed/` - Standardized product images
- `product-assets/corrected/` - Enhanced/corrected images
- `product-assets/with_unified_logos/` - Final images with branding
- `new_designs/` - New fashion design processing pipeline
- `new_designs/original/` - Source design images
- `new_designs/processed/` - AI-processed design images
- `new_designs/with_logos/` - Final design images with branding
- `new_designs/failed/` - Failed processing attempts
- `scripts/` - Python processing scripts
- `airtable_examples/` - Airtable integration examples
- `logos/` - Brand assets and logo files
- `output/` - Generated image outputs

### Configuration

Environment variables (stored in `.env`):
- `GOOGLE_API_KEY` - Gemini API access
- `AIRTABLE_API_KEY` - Airtable authentication
- `AIRTABLE_BASE_ID` - Airtable base identifier
- `AIRTABLE_TABLE_NAME` - Target table name
- `PRODUCT_ASSETS_DIR` - Source images directory
- `MODEL_IMAGE` - Reference model image
- `STYLE_REFERENCE` - Style reference image

## Image Processing Workflow

1. **Input**: Raw fashion photos with models/people
2. **Standardization**: Remove people, place clothing on neutral mannequins
3. **Correction**: Fix image quality issues using reference pairs
4. **Logo Addition**: Add unified chesspiece branding
5. **Output**: Final product images ready for e-commerce

## Key Scripts

### Primary Processing
- `scripts/product_processor.py` - Main standardization pipeline
- `scripts/new_designs_processor.py` - New designs standardization pipeline
- `scripts/unified_logo_adder.py` - Logo branding integration
- `scripts/new_designs_logo_adder.py` - New designs logo branding
- `scripts/targeted_image_corrector.py` - Image quality enhancement

### Airtable Integration
- `airtable_examples/generate_improved_images.py` - AI image generation from prompts
- `airtable_examples/generate_luxury_images.py` - Luxury fashion generation
- `airtable_examples/analyze_images.py` - Image analysis and insights

### Supporting Utilities
- `scripts/accessory_detector.py` - Product accessory detection
- `scripts/watermark_remover.py` - Watermark removal tools
- `scripts/reference_style_transfer.py` - Style transfer capabilities

## Development Notes

- All Python scripts include comprehensive logging configuration
- Error handling and retry mechanisms are implemented throughout
- Image processing follows consistent naming conventions
- Batch processing is supported for large-scale operations
- Environment-specific configuration is managed through .env file