# Design System Documentation: The Ethereal Manuscript

## 1. Overview & Creative North Star
**Creative North Star: The Ethereal Manuscript**
This design system is not a utility; it is a digital sanctuary. We are moving away from the "SaaS dashboard" aesthetic toward a "High-End Editorial" experience. The goal is to present Vedic Astrology—a complex, ancient science—with the clarity of a premium morning publication.

We break the "template" look through **intentional asymmetry** and **tonal depth**. Layouts should feel like they are breathing. We achieve this through generous whitespace (negative space is a functional element here, not an absence of content) and overlapping elements that suggest the layering of celestial charts.

---

## 2. Colors & Surface Architecture
The palette is rooted in the transition from dawn to daylight. It uses high-contrast neutrals to maintain readability while utilizing gold and lavender to signify spiritual "moments of truth."

### Core Palette (Tokens)
*   **Surface (Background):** `surface` (#fbf9f5) — Our "Soft Cream" canvas.
*   **Primary (Warm Gold):** `primary` (#775a19) — Used for authoritative actions and celestial highlights.
*   **Secondary (Soft Lavender):** `secondary` (#674bb5) — Reserved for spiritual insights, planetary transits, and "mystical" interactions.
*   **On-Surface (Text):** `on-surface` (#1b1c1a) — Our "Deep Charcoal" for absolute legibility.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. To define boundaries, designers must use **Background Color Shifts**. 
*   Place a `surface-container-low` section against a `surface` background to create a "zone." 
*   The transition should be felt, not seen as a harsh line.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine vellum paper.
*   **Level 0:** `surface` (The base sheet).
*   **Level 1:** `surface-container-low` (Nested modules or sidebar containers).
*   **Level 2:** `surface-container-highest` (Used for focused cards or interactive modals).

### The "Glass & Gradient" Rule
To add "soul" to the interface, use Glassmorphism for floating elements (e.g., navigation bars or tooltips). Apply `surface` at 80% opacity with a `12px` backdrop blur. For Hero CTAs, use a subtle radial gradient transitioning from `primary` (#775a19) to `primary_container` (#c5a059) to simulate the glow of a rising sun.

---

## 3. Typography
The typography system is a dialogue between the ancient (Serif) and the contemporary (Sans-Serif).

*   **Display & Headlines (Noto Serif):** These are our "Editorial Voices." Use `display-lg` and `headline-md` with generous letter-spacing to convey authority and wisdom. Headlines should often be center-aligned to create a sense of balance and "sacred geometry."
*   **Body & Labels (Manrope):** A clean, breathable sans-serif. Manrope provides the "Scientific Precision" needed for astrological data. 
*   **Scale Usage:** 
    *   `display-lg` (3.5rem): Used for single-word thematic anchors.
    *   `title-md` (1.125rem): Used for data point headers in natal charts.
    *   `body-md` (0.875rem): Standard reading size for astrological interpretations.

---

## 4. Elevation & Depth
In this design system, depth is organic, not artificial.

*   **The Layering Principle:** Avoid shadows where a color shift can work. A `surface-container-lowest` card sitting on a `surface-container` background creates a natural, soft lift.
*   **Ambient Shadows:** If an element must float (e.g., a "Quick Chart" modal), use a highly diffused shadow: `box-shadow: 0 20px 40px rgba(27, 28, 26, 0.05)`. Notice the use of the `on-surface` color at a very low opacity—never use pure black for shadows.
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility, use the `outline_variant` token at **15% opacity**. This creates a "whisper" of a line that defines space without cluttering the visual field.

---

## 5. Components

### Buttons
*   **Primary:** A solid `primary` (#775a19) fill with `on_primary` text. Use `roundness-lg` (1rem) for a sophisticated, pebble-like feel.
*   **Secondary:** No fill. Use a "Ghost Border" (15% `outline_variant`) and `primary` text.
*   **Tertiary:** Purely typographic. Use `label-md` with a subtle underline in `secondary_container`.

### Input Fields
*   **Style:** Minimalist. No background fill—only a bottom border using `outline_variant`.
*   **Focus State:** The bottom border transitions to `primary` (Gold), and the label (using `label-sm`) floats above with a `0.05em` letter-spacing.

### Cards & Lists
*   **No Dividers:** Never use horizontal rules to separate list items. Use **Vertical Spacing** (24px - 32px) or alternating `surface-container-low` backgrounds.
*   **The "Insight" Card:** For astrological readings, use a `surface-container-lowest` card with a `roundness-xl` (1.5rem) and a subtle 2px left-accent border in `secondary` (Lavender).

### Additional Component: The "Transit" Chip
*   **Usage:** To highlight planetary movements. 
*   **Style:** A small, pill-shaped chip (`roundness-full`) using `secondary_fixed` background and `on_secondary_fixed` text.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Place a large headline on the left and a small data card offset to the right. It feels curated, not auto-generated.
*   **Use Texture:** Apply a very faint "grain" overlay (2% opacity) to the `surface` background to mimic high-quality cotton paper.
*   **Prioritize White Space:** If you think there is enough space, add 16px more.

### Don't:
*   **No Heavy Glows:** Avoid "Neon" spiritual aesthetics. This is Vedic, not Cyberpunk.
*   **No Pure Black:** Ensure all "dark" elements use the `on-surface` charcoal (#1b1c1a).
*   **No Sharp Corners:** Avoid the `none` or `sm` roundedness tokens for main UI containers. Everything should feel soft and approachable.

---

*Director's Note: Remember, we are not just building a SaaS; we are building a ritual. Every interaction should feel like turning the page of a rare, expensive book.*