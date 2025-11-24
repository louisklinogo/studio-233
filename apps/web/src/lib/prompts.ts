export const MANNEQUIN_TRANSFER_PROMPTS = {
	PROCESSING: `You are given TWO images:
1. A reference mannequin (black body, rose gold head)
2. An original product image containing clothing

YOUR TASK: Extract the main clothing item from the original image, put it on the reference mannequin, AND create matching trousers/pants using the same fabric.

EMERGENCY DIRECTIVE: THIS IS A COLLAR-PRESERVATION-CRITICAL TASK. THE AI MODEL HAS A KNOWN BIAS TOWARDS CREATING CHINESE COLLARS. YOU MUST FIGHT THIS BIAS AND PRESERVE THE ORIGINAL COLLAR EXACTLY.

STEP-BY-STEP INSTRUCTIONS:
1. Identify the main clothing item in the original image (suit jacket, shirt, kaftan, etc.)
2. Carefully extract ONLY the exact clothing with its unique styles, texture, fabrics, designs - remove any person, hanger, or background
3. Analyze the fabric patterns, colors, and texture of the extracted clothing
4. COLLAR ANALYSIS STEP: Before proceeding, carefully examine and document the EXACT collar/neckline style, shape, size, and design of the original clothing item. Memorize every detail.
5. CRITICAL ANTI-CHINESE COLLAR INSTRUCTION: UNDER NO CIRCUMSTANCES create chinese-style collars, mandarin collars, or any asian-style necklines. This is STRICTLY FORBIDDEN and will cause immediate rejection.
6. MANDATORY COLLAR PRESERVATION: Create a PERFECT EXACT REPLICA of the original clothing item's collar/neckline EXACTLY as it appears - ZERO collar modifications allowed. The collar must be identical down to the millimeter.
7. Create a PERFECT EXACT REPLICA of the original clothing item and transfer it onto the reference mannequin (as top/shirt/jacket) - PRESERVE ALL original details, patterns, textures, stitching, buttons, zippers, and collar designs and any other design elements EXACTLY as they appear
8. CREATE matching trousers or pants using the EXACT same fabric patterns, colors, and texture as the main clothing item
9. ENSURE the top item has FULL-LENGTH SLEEVES extending to cuff/wrist length - if original is sleeveless or short-sleeved, convert it to have appropriate full-length sleeves using the same fabric, but DO NOT modify any other aspects of the original design
10. COLLAR VERIFICATION: Double-check that the collar is EXACTLY identical to the original - NO rounding, NO straightening, NO cultural adaptations, NO style changes
11. EXTREMELY CRITICAL: DO NOT create chinese-style collars, mandarin collars, or any asian-style necklines. MAINTAIN original collar/neckline style EXACTLY as it appears, ZERO cultural adaptations allowed.
12. Ensure the trousers/pants complement the top item in style and fit
13. Ensure proper fit - both top and bottom should look natural on the mannequin
14. Remove ALL tags, lapel pins, jewelry, watches, accessories, and footwear from the clothing
15. Keep the original clothing colors, patterns, and details for both top and bottom - MAINTAIN PERFECT EXACT REPLICATION of the original item
16. Position the mannequin centrally on a clean white background
17. Show the full mannequin from head to toe with complete outfit

CRITICAL: The original clothing item must be a PERFECT EXACT REPLICA with ZERO modifications to its design elements, patterns, textures, or styling. ONLY TWO changes are permitted:
1. Adding matching trousers/pants (using same fabric)
2. Adjusting sleeve length to full cuff-length (if needed)

COLLAR PRESERVATION IS THE HIGHEST PRIORITY: The collar/neckline must be replicated EXACTLY as it appears in the original image. ANY deviation, no matter how small, is unacceptable.

EMERGENCY ANTI-BIAS MEASURES: The AI model has demonstrated a persistent bias towards converting collars to chinese-style necklines. You MUST actively resist this bias. If the original has a V-neck, maintain the V-neck. If it has a spread collar, maintain the spread collar. If it has a round neck, maintain the round neck. EXACT replication is required.

CRITICAL: The result MUST show the reference mannequin WEARING a complete outfit:
- PERFECT EXACT REPLICA of original clothing item as top/shirt/jacket
- ZERO modifications to original design elements, patterns, textures, stitching, or details
- ABSOLUTE COLLAR PRESERVATION - collar/neckline must be EXACTLY as in original (ZERO collar changes)
- FULL-LENGTH SLEEVES extending to cuff/wrist length (NO sleeveless designs)
- Matching trousers/pants made from same fabric
- Both items must coordinate perfectly
- Sleeves must match the fabric of the main clothing item
- IGNORE cultural associations - focus ONLY on visual elements

PERMITTED MODIFICATIONS (ONLY these two changes allowed):
1. Adding matching trousers/pants using same fabric as original item
2. Adjusting sleeve length to full cuff-length (if original is sleeveless/short-sleeved)

STRICTLY FORBIDDEN:
- ANY modifications to original design elements, patterns, or textures
- Changing colors, styling, or details of the original clothing item
- Adding or removing design features from the original item
- Altering the original clothing in ANY way except sleeve length adjustment
- COLLAR MODIFICATIONS OF ANY KIND - ZERO collar changes allowed
- Cultural style adaptations or interpretations
- Changing neckline or collar shape, size, or style
- CREATING CHINESE-STYLE COLLARS, MANDARIN COLLARS, OR ANY ASIAN-STYLE NECKLINES - THIS IS ABSOLUTELY FORBIDDEN
- ANY chinese, asian, or cultural collar adaptations - STRICTLY PROHIBITED
- Converting original collar to any cultural style neckline
- Rounding, straightening, or otherwise modifying collar shape
- ANY deviation from the original collar design

Do NOT return just the empty reference mannequin!
Do NOT return just the original image!
Do NOT create a cutout of original clothing
The complete outfit must be visibly on the mannequin body
The trousers/pants MUST match the fabric exactly and look natural
SLEEVES MUST be full-length extending to wrists - NO sleeveless or short-sleeve designs allowed
ORIGINAL CLOTHING MUST BE PERFECT EXACT REPLICA - NO UNAUTHORIZED MODIFICATIONS

EMERGENCY FINAL WARNING: IF YOU CREATE ANY CHINESE-STYLE COLLAR, MANDARIN COLLAR, OR ANY ASIAN-STYLE NECKLINE, THE RESULT WILL BE IMMEDIATELY REJECTED. THE AI MODEL'S BIAS TOWARDS CULTURAL ADAPTATION IS KNOWN AND MUST BE ACTIVELY RESISTED. MAINTAIN ORIGINAL COLLAR EXACTLY AS IT APPEARS - ZERO CULTURAL ADAPTATIONS PERMITTED UNDER ANY CIRCUMSTANCES.`,

	VERIFICATION: `COMPARATIVE VERIFICATION: You will receive 3 images:
1. Generated image (to verify)
2. Original product image (for comparison)
3. Reference mannequin (for verification)

YOUR TASK: Compare generated image against original image to ensure perfect replication while meeting all requirements.

IMAGE ORDER ANALYSIS:
- First image: Generated result to verify
- Second image: Original product for exact comparison
- Third image: Reference mannequin standard

CORE REQUIREMENTS:
1. Complete outfit visible on mannequin (top AND bottom clothing)
2. Black mannequin body with rose gold head
3. Full mannequin visible from head to toe
4. Clean white background
5. No jewelry, watches, or accessories
6. No footwear
7. PERFECT EXACT REPLICA of original clothing item with ZERO unauthorized modifications
8. ABSOLUTE COLLAR PRESERVATION - collar/neckline EXACTLY as original (ZERO collar changes)
9. Matching fabric patterns between top and bottom clothing
10. Trousers/pants must be present and match the top item's fabric
11. FULL-LENGTH SLEEVES extending to cuff/wrist length (NO sleeveless or short-sleeve)
12. Sleeves must match the fabric of the main clothing item
13. ALL original design elements, patterns, textures, and details preserved exactly

CRITICAL COMPARISON CHECK: Compare generated image (Image 1) against original image (Image 2):
- Is the collar/neckline EXACTLY identical to the original?
- Are all design elements, patterns, textures preserved perfectly?
- Has ANY unauthorized modification been made to the original design?
- Does the top clothing match the original clothing exactly?

CHECK IN THIS ORDER:
- Is there a complete outfit with both top AND bottom clothing? (FAIL if missing trousers/pants)
- CRITICAL COMPARISON: Does generated image match original image exactly? (FAIL if any deviations)
- COLLAR PRESERVATION: Is the collar/neckline EXACTLY identical to the original image? (IMMEDIATE FAIL if any changes)
- Is the top clothing item a PERFECT EXACT REPLICA of the original? (FAIL if any unauthorized modifications)
- Does the top item have FULL-LENGTH sleeves extending to wrists? (FAIL if sleeveless or short-sleeve)
- Do the top and bottom items have matching fabric patterns/colors?
- Do the sleeves match the fabric of the main clothing item?
- Are ALL original design elements, patterns, textures, and details preserved exactly?
- Is the mannequin body black with rose gold head?
- Is the full mannequin visible?
- Is the background clean and white?
- Are there any jewelry, accessories, or footwear?
- Do the trousers/pants look natural and coordinate with the top?

COMPARISON FAILURE RESPONSES:
- If generated doesn't match original: "FAIL: Generated image does not match original exactly"
- If collar modified: "FAIL: Collar modified - must maintain original collar exactly"
- If design changed: "FAIL: Design elements modified from original"

Respond with:
PASS: Generated image matches original exactly and meets all requirements
FAIL: [specific differences or missing requirements]`,
};
