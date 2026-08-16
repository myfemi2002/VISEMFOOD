# Heritage Hearth - Design System Document (.PMD)

## Brand Identity
**Name:** Heritage Hearth
**Concept:** Premium African Hospitality & Culinary Heritage.
**Voice:** Sophisticated, warm, professional, and authentic.
**Aesthetic:** Traditional warmth meets modern usability. Balanced use of rich earth tones and generous white space.

---

## Visual Tokens

### Typography
- **Primary Font:** `Libre Caslon Text` (Serif)
  - *Usage:* Headlines, brand titles, hero sections. Evokes heritage and premium quality.
- **Secondary Font:** `Outfit` (Sans-Serif) or `Inter`
  - *Usage:* Body copy, labels, navigation, admin interface. Ensures high readability and modern feel.

### Color Palette
- **Primary:** `#d95d39` (Terracotta) - Represents the "Hearth," warmth, and appetite.
- **Surface:** `#fbf9f1` (Off-white/Bone) - Backgrounds for a clean, premium feel.
- **Surface-Dim:** `#dcdad2` - Subtitle backgrounds and subtle borders.
- **On-Surface:** `#3e2723` (Deep Cocoa) - Text and high-contrast elements.
- **Secondary/Accent:** `#5d7b44` (Olive) - Status indicators (e.g., "In Stock") and success states.

### Spacing & Layout
- **Grid:** 12-column grid for desktop; 1-column for mobile.
- **Margins:** `px-margin-desktop` (typically 80-120px) / `px-margin-mobile` (16-24px).
- **Radius:** `ROUND_EIGHT` (8px corners) for cards, buttons, and inputs.
- **Elevation:** Low elevation (`shadow-sm`) for interactive cards; flat for structural elements.

---

## Core Components

### 1. Navigation
- **Public TopNav:** Centered or right-aligned links. Primary CTA: "ORDER ONLINE" in Terracotta.
- **Admin Sidebar:** Full-height, `#f5f4ec` background. Icons for Dashboard, Bulk Orders, Catering, Catalog, and Analytics.

### 2. Product Cards
- **Customer View:** Large images, serif titles, clear price display, tactile "+" buttons for bulk items.
- **Admin View:** Toggle for visibility, inline price editing, and stock status indicators.

### 3. Data Tables & Lists (Admin)
- **Status Chips:** Light background with colored text (e.g., Orange for "Prep," Green for "Delivered").
- **Actions:** Icon buttons for "Edit," "Export CSV," and "Generate Kitchen Ticket."

### 4. Forms
- **Catering Inquiry:** Multi-step layout with generous padding, clear labeling, and focus states that highlight the terracotta primary color.

---

## Interaction Design
- **Buttons:** Subtle scale down (98%) on click.
- **Hover States:** Color shift to darker terracotta or subtle background lift.
- **Transitions:** Standard 200ms ease-in-out for all hover states.

---

## Content Strategy
- **Verbatim Requirement:** Always use "VISEMFOOD" in caps for branding.
- **Tone:** Use editorial-style headings (e.g., "Our Story," "Trays, Coolers & Bulk Orders") rather than purely functional labels.
- **Imagery:** High-quality, warm-toned food photography with natural lighting.