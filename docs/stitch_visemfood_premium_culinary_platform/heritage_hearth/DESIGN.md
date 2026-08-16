---
name: Heritage Hearth
colors:
  surface: '#fbf9f1'
  surface-dim: '#dcdad2'
  surface-bright: '#fbf9f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ec'
  surface-container: '#f0eee6'
  surface-container-high: '#eae8e0'
  surface-container-highest: '#e4e3db'
  on-surface: '#1b1c17'
  on-surface-variant: '#58423c'
  inverse-surface: '#30312c'
  inverse-on-surface: '#f3f1e9'
  outline: '#8b716a'
  outline-variant: '#dfc0b7'
  surface-tint: '#a73918'
  primary: '#a43716'
  on-primary: '#ffffff'
  primary-container: '#c54f2c'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a0'
  secondary: '#745853'
  on-secondary: '#ffffff'
  secondary-container: '#fed7d0'
  on-secondary-container: '#795c57'
  tertiary: '#4d6328'
  on-tertiary: '#ffffff'
  tertiary-container: '#657c3e'
  on-tertiary-container: '#faffe8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#862201'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#e3beb8'
  on-secondary-fixed: '#2b1613'
  on-secondary-fixed-variant: '#5b403c'
  tertiary-fixed: '#d2eca2'
  tertiary-fixed-dim: '#b6d088'
  on-tertiary-fixed: '#131f00'
  on-tertiary-fixed-variant: '#394d14'
  background: '#fbf9f1'
  on-background: '#1b1c17'
  surface-variant: '#e4e3db'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system is built upon the pillars of **Premium African Hospitality** and **Modern Editorial Elegance**. It bridges the gap between traditional Nigerian culinary heritage and a high-end US consumer experience. The visual language is deeply rooted in a **Minimalist-Editorial** style, characterized by intentional whitespace, sophisticated typography, and a "warm-light" interface that evokes the feeling of a sun-drenched upscale kitchen.

The UI should feel grounded and authentic, avoiding generic corporate aesthetics in favor of a tactile, high-craft sensibility. Movement should be fluid and graceful, mirroring the pouring of oils or the steam from a freshly prepared dish. The target audience expects the efficiency of a modern e-commerce platform delivered through the lens of a luxury boutique brand.

## Colors

The palette is inspired by the natural ingredients and spices of Nigerian cuisine. 

- **Primary (Burnt Orange):** Used for primary actions, highlights, and appetizing call-outs. It represents the heat and vibrancy of the food.
- **Secondary (Cocoa Brown):** Provides grounding and professional depth. Used for high-level headings and primary text to ensure a softer, more premium contrast than pure black.
- **Tertiary (Olive Green):** Evokes freshness and organic sourcing. Best used for secondary badges, success states, or botanical accents.
- **Backgrounds:** The interface relies on **Warm Cream** for the main canvas to provide a soft, inviting glow, with **Soft White** used for elevated cards and containers to create a subtle layered depth.
- **Accents:** **Gold** is reserved for premium tier indicators and fine borders, while **Plum** is used sparingly for deep shadows or unique category highlights.

## Typography

This design system employs a sophisticated pairing of **Libre Caslon Text** and **Plus Jakarta Sans**. 

- **Headings:** Use Libre Caslon Text for all editorial headings and product titles. This serif face conveys authority, history, and premium quality. Tighten letter spacing slightly for larger display sizes to maintain a modern, "magazine" feel.
- **Body & Interface:** Plus Jakarta Sans provides a friendly, contemporary contrast. Its open counters and soft terminals ensure high legibility in menu descriptions and e-commerce checkout flows.
- **Labels:** Use uppercase Plus Jakarta Sans with increased tracking for buttons, category labels, and small metadata to provide clear hierarchy without overwhelming the serif headings.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop to maintain an editorial, structured feel, transitioning to a **Fluid Grid** for mobile devices.

- **Rhythm:** A strict 8px base unit governs all padding and margins.
- **Whitespace:** Use generous vertical spacing (`section-gap`) between content blocks to allow photography to "breathe."
- **Grid:** On desktop, utilize a 12-column grid with wide 64px outer margins. On mobile, transition to a 4-column grid with 16px margins.
- **African Patterns:** Use subtle geometric patterns (inspired by Adinkra or Ankara motifs) as thin dividers or background watermarks with an opacity of 5-10% to reinforce brand identity without cluttering the UI.

## Elevation & Depth

This design system uses **Tonal Layers** combined with **Ambient Shadows** to create a soft, tactile hierarchy.

1.  **Base (Level 0):** Warm Cream (#FFFDF5) canvas. No shadow.
2.  **Raised (Level 1):** Soft White (#FFFFFF) surfaces used for cards and main content areas. Use a very soft, diffused shadow: `0px 4px 20px rgba(62, 39, 35, 0.05)`.
3.  **Floating (Level 2):** Overlays, dropdowns, and active cart drawers. Use a more defined shadow with a slight Plum tint: `0px 12px 32px rgba(74, 21, 75, 0.08)`.

Avoid heavy black shadows. All depth should feel light and airy, as if components are gently resting on a cloth surface.

## Shapes

The shape language is defined by **Soft Fluidity**. UI elements use substantial corner radii to mirror the organic nature of food and ingredients.

- **Small Elements (Chips, Inputs):** 8px radius.
- **Medium Elements (Buttons, Small Cards):** 16px radius.
- **Large Elements (Product Hero Cards, Modals):** 24px radius.
- **Icons:** Use a medium-weight stroke (2px) with rounded caps and corners to match the typography and shape language.

## Components

- **Buttons:** Primary buttons use the Burnt Orange background with White text. They should have a 16px radius. Secondary buttons use a Cocoa Brown outline with an 8px radius for a sharper, more functional feel.
- **Input Fields:** Soft White backgrounds with a subtle Cocoa Brown 1px border. On focus, the border transitions to Burnt Orange with a soft glow.
- **Cards:** Food cards should feature full-width photography at the top with a 24px radius. Content below should be padded with 24px of whitespace using Libre Caslon for the dish title.
- **Chips/Badges:** Use Olive Green with 20% opacity and dark Olive text for dietary tags (e.g., "Vegan", "Gluten-Free"). Use Gold for "Chef's Special" tags.
- **Dividers:** Instead of simple lines, use 2px thick bars of Burnt Orange or subtle African geometric patterns that fade out at the edges.
- **Product Lists:** Use a clean, list-based layout for catering menus, prioritizing price and portion size in bold Plus Jakarta Sans.