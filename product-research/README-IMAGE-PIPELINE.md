# Product Image Processing Pipeline

This document explains the automated pipeline for processing fashion product images from raw photos to final branded product shots.

## Pipeline Overview

```
Original Photos → AI Processing → Logo Addition → Final Images
     (raw)      product_processor.py  unified_logo_adder.py  (ready)
```

## Step 1: Image Standardization
**Script:** `scripts/product_processor.py`

### Input
- **Directory:** `product-assets/original/`
- **Content:** Raw product photos containing clothing on people or hangers

### Process
1. Uses **Google Gemini 2.5 Flash Image Preview** AI model
2. Removes people and backgrounds from original photos
3. Extracts clothing with exact styles, textures, fabrics, and designs
4. Transfers clothing onto reference mannequin (`ideal.jpg`)
   - Black mannequin body with rose gold head
5. Removes all jewelry, watches, accessories, and footwear
6. Places mannequin centrally on clean white background
7. Verifies each image meets quality requirements (up to 7 attempts with feedback loop)

### Output
- **Directory:** `product-assets/processed/`
- **Content:** Standardized product images with clothing on neutral mannequin
- **Failed Images:** `product-assets/failed/` (for manual review)
- **Log:** `product_processing.log`

### Run Command
```bash
python scripts/product_processor.py
```

---

## Step 2: Logo Addition
**Script:** `scripts/unified_logo_adder.py`

### Input
- **Directory:** `product-assets/processed/`
- **Content:** Standardized product images from Step 1

### Process
1. Loads unified logo from `logos/unified-logo.jpg`
2. Converts logo to black content on transparent background (removes white)
3. Resizes logo to 35% of image width (min 200px, max 700px)
4. Positions logo in bottom right corner with 15px padding
5. Pastes logo onto each processed image

### Output
- **Directory:** `product-assets/with_unified_logos/`
- **Content:** Final branded product images ready for e-commerce
- **Log:** `unified_logo_addition.log`

### Run Command
```bash
python scripts/unified_logo_adder.py
```

---

## Complete Pipeline Execution

To process images from start to finish:

```bash
# Step 1: Place raw product photos in product-assets/original/
# Step 2: Run AI processing
python scripts/product_processor.py

# Step 3: Run logo addition
python scripts/unified_logo_adder.py

# Final images will be in product-assets/with_unified_logos/
```

---

## Directory Structure

```
product-assets/
├── original/              # Raw product photos (input)
├── processed/             # AI-standardized images (intermediate)
├── with_unified_logos/    # Final branded images (output)
└── failed/                # Failed processing attempts (for review)

logos/
└── unified-logo.jpg       # Brand logo for addition

ideal.jpg                  # Reference mannequin for AI processing
```

---

## Requirements

- Python 3.x with PIL/Pillow
- Google Gemini API access (API key in `.env`)
- Dependencies: `google-generativeai`, `python-dotenv`, `Pillow`

```bash
pip install -r requirements.txt
```

---

## Quality Assurance

### Product Processor
- Automatic verification of generated images
- Retry with feedback (up to 7 attempts)
- Comprehensive logging for troubleshooting

### Logo Adder
- Test mode with sample images before full batch
- Maintains aspect ratio and quality
- Consistent positioning across all images

---

## Troubleshooting

### Check logs
- `product_processing.log` - AI processing details
- `unified_logo_addition.log` - Logo addition details

### Common issues
- **API errors:** Check `GOOGLE_API_KEY` in `.env`
- **Failed images:** Review `product-assets/failed/` directory
- **Missing logo:** Ensure `logos/unified-logo.jpg` exists
- **Missing reference:** Ensure `ideal.jpg` exists
