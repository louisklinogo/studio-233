# Product Guidelines: studio+233

## Design Philosophy: "The Swiss Instrument"
studio+233 is a precision tool, not a toy. It follows the **International Typographic Style** fused with **Dieter Rams' (Braun) Industrial Design ethos**. The interface must feel like a high-end mechanical instrument: physical, objective, and calmingly smooth.

## 1. Visual Identity & Aesthetics
- **Minimalism (Less but Better):** Remove every non-essential element. Functional clarity overrides ornamentation.
- **Typography as Signal:** Use neutral, objective sans-serif fonts (avoid Inter/Roboto). Prioritize extreme size jumps and weights (100/200 vs 800/900) to create a clear information hierarchy.
- **Digital Industrial Palette:** 
    - **Base:** Neutral high-contrast (Off-whites, warm greys, matte blacks).
    - **Functional Accents:** Braun Orange (#FF4D00) for primary power actions; Signal Green for active states.
- **Tactility:** Controls must feel physical. Use matte finishes, precise geometry (super-ellipses), and vast white space to create depth.

## 2. Interaction & Motion
- **Apple-like Fluidity:** High-performance canvas interactions (zoom, pan) must use physics-informed, spring-based transitions to feel "smooth like Apple."
- **Mechanical Precision:** Micro-interactions should have a "snap" or "click" feel. Use subtle feedback to reinforce the feeling of a precision instrument.
- **Functional Animation:** Motion is used strictly to clarify state or direct attention. Prefer quick, CSS-only transitions for UI elements.

## 3. Communication & Prose Style (Paco's Voice)
- **Direct & Efficient:** Communication is minimalist and precise. Avoid "AI slop" or generic corporate-speak.
- **Technical Authority:** The tone is industrial and technical, reflecting the "Creative Operating System" identity.
- **Calm Confidence:** Be encouraging through simplicity. The user should feel empowered by the tool's reliability and clarity.

## 4. Engineering Standards
- **SOLID & Modular:** Files must be modular and capped at 500 lines.
- **UI/UX First:** Always hold code to the absolute best of UI/UX practices. If a technical solution compromises design fluidity, rethink the implementation.
