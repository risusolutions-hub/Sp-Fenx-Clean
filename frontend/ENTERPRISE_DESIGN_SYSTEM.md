# Enterprise Design System Implementation Guide

## Overview
This document outlines the professional, business-grade design system implemented for the LaserService complaint management platform. The design follows corporate enterprise standards with minimal, clean aesthetics.

## Design Philosophy

### Core Principles
1. **Clarity First** - Information hierarchy over decoration
2. **Minimal & Focused** - No gradients, excessive shadows, or playful elements
3. **Professional Tone** - Serious, trustworthy, corporate appearance
4. **Efficiency** - Optimized for fast operations and billing workflows
5. **Enterprise Standard** - Used by retailers, accountants, and managers

---

## Color Palette

### Primary Colors
```
Primary Navy (Primary Actions): #3D5A8C (primary-600)
- Used for buttons, links, active states
- Conveys trust and professionalism
- Variants: 50 (lightest) to 900 (darkest)

Neutral (Text & Backgrounds): #F9FAFB to #111827
- Neutral-50 to 100: Light backgrounds, alt surfaces
- Neutral-200-300: Borders
- Neutral-600-700: Primary text
- Neutral-800-900: Headings, dark mode
```

### Status Colors (Muted Professional)
```
Success: #059669 (green)  - Confirmations, resolved
Warning: #D97706 (amber)  - Cautions, warnings
Error:   #DC2626 (red)    - Errors, critical issues
Info:    #0891B2 (cyan)   - Information, notifications
```

### What NOT to Use
- ❌ Bright colors (#FF0000, #00FF00, #FFFF00)
- ❌ Gradients or color blends
- ❌ Drop shadows > 10px radius
- ❌ Rounded corners > 8px
- ❌ Emojis or illustrations

---

## Typography

### Font Family
```
Primary: Inter (fallback: Roboto, Open Sans, system fonts)
Monospace: Monaco, Menlo, Ubuntu Mono
```

### Font Sizes & Weights
```
4xl (28px):  Page main titles - bold (700)
3xl (24px):  Section headers - bold (700)
2xl (20px):  Dashboard headers - semibold (600)
xl  (18px):  Card headers - semibold (600)
lg  (16px):  Large text, subheadings - semibold (600)
base (14px): Body text - normal (400)
sm  (13px):  Small text, labels - normal (400)
xs  (12px):  Captions, timestamps - normal (400)

Weights: light (300) | normal (400) | medium (500) | semibold (600) | bold (700)

Letter Spacing:
- All-caps labels: +0.05em
- Headlines: -0.02em (tight)
- Body: 0em (normal)
```

### Line Height
```
Headlines: 1.25 (tight)
Body: 1.5 (normal)
Relaxed: 1.75 (longer text)
```

---

## Layout & Spacing

### Base Grid
```
Base unit: 4px
Multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

Standard Spacing:
- Element to element: 16px (4)
- Section to section: 24px (6)
- Page padding: 24px (6)
- Inside cards: 12px (3)
```

### Component Dimensions
```
Sidebar width: 256px (fixed)
Header height: 64px (fixed)
Max content width: 1440px
Button height: 40px (32-44px based on size)
Input height: 40px
Table row height: 44px (36px for compact)
```

---

## Components

### Buttons

#### Primary Button
```
Background: primary-600 (#3D5A8C)
Text: white, 13px, semibold
Padding: 8px 16px (40px height)
Border: none
Border-radius: 4px
Hover: primary-700
Active: primary-800
Focus: ring 2px primary-500, offset 1px
```

#### Secondary Button
```
Background: white
Border: 1px neutral-300
Text: neutral-600, 13px, semibold
Padding: 8px 16px (40px height)
Border-radius: 4px
Hover: background neutral-50, border neutral-400
Focus: ring 2px primary-500, offset 1px
```

#### Tertiary (Text) Button
```
Background: transparent
Text: primary-500, 13px, semibold
Hover: background primary-50
Focus: ring 2px primary-500
```

#### Danger Button
```
Background: error-500 (#DC2626)
Text: white, 13px, semibold
Hover: error-600
```

**Rules:**
- No shadows on buttons
- Rounded corners only 4px max
- Never use gradients
- Include focus ring for accessibility
- Transition: 150ms ease-out

---

### Inputs & Forms

#### Text Input
```
Background: white
Border: 1px neutral-300
Padding: 8px 12px (40px height total)
Border-radius: 4px
Font: 14px, normal
Placeholder: neutral-400
Text: neutral-900
Focus: ring 2px primary-500, border primary-600
Disabled: background neutral-100, text neutral-400
Transition: 150ms ease-out
```

#### Label
```
Font: 13px, semibold (600), neutral-700
Margin-bottom: 4px
Display: block
Required indicator: * in error-500 color
```

#### Form Layout
```
Structure:
- Label (above input)
- Input field
- Help text or error message (below)

Spacing:
- Label to input: 4px gap
- Between form groups: 16px
- Error message: 12px, error-500 color
- Helper text: 12px, neutral-500 color
```

---

### Tables

#### Table Header
```
Background: neutral-50
Border-bottom: 1px neutral-200
Text: 12px, semibold (600), neutral-700
Padding: 12px 16px
Text-transform: uppercase
Letter-spacing: +0.05em
Text-align: left
```

#### Table Rows
```
Background: white (or alternating neutral-50)
Border-bottom: 1px rgba(0,0,0,0.04)
Text: 14px, normal (400), neutral-600
Padding: 12px 16px
Height: 44px (36px for compact)

Hover: background neutral-100, cursor pointer
```

#### Table Sorting Indicators
```
Arrow icons (▲▼) next to header
Active: color primary-600
Inactive: color neutral-300
```

---

### Cards & Panels

#### Card
```
Background: white
Border: 1px neutral-200
Border-radius: 6px
Padding: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.08)
Margin-bottom: 16px
```

#### Card Header
```
Font: 16px, semibold (600), neutral-800
Padding-bottom: 12px
Border-bottom: 1px neutral-200 (optional)
```

#### Card Content
```
Padding: 12px (internal)
Font: 14px, normal (400)
```

#### Stat Card
```
Number: 24px, bold (700), neutral-900
Label: 13px, normal (400), neutral-500
Padding: 16px
Optional: border-left 3px primary-600
Background: can use light colored (primary-50)
```

---

### Modals & Dialogs

#### Modal Overlay
```
Background: rgba(0,0,0,0.5)
Backdrop-filter: optional blur(4px)
Z-index: 50+
```

#### Modal Box
```
Background: white
Border: 1px neutral-200
Border-radius: 8px
Shadow: 0 20px 25px rgba(0,0,0,0.1)
Width: 90% (mobile), 600px (desktop)
Max-width: 90vw
Padding: 24px
Position: centered
```

#### Modal Header
```
Font: 20px, semibold (600), neutral-900
Border-bottom: 1px neutral-200 (optional)
Padding-bottom: 16px
Close button: top-right, 24px, color neutral-500
```

#### Modal Footer
```
Border-top: 1px neutral-200
Padding-top: 16px
Button spacing: 8px gap
Align: right
Order: Primary (right), Secondary (left)
```

---

### Navigation & Sidebar

#### Sidebar
```
Width: 256px (fixed)
Background: neutral-900 (#111827)
Border-right: 1px neutral-800
Text: neutral-400 (secondary), white (headings)
Height: 100vh
Position: fixed, left, top
Overflow-y: auto
```

#### Sidebar Header
```
Height: 64px
Padding: 16px
Border-bottom: 1px neutral-800
Font: 18px, bold (700), white (title)
Layout: flex, gap 12px
```

#### Nav Item (Inactive)
```
Padding: 12px 16px
Margin: 4px 12px
Font: 14px, semibold (600), neutral-400
Border-radius: 4px
Background: transparent
Border-left: 2px transparent
Hover: background neutral-800, text neutral-200
```

#### Nav Item (Active)
```
Background: primary-600/15 (transparent primary)
Text: primary-300
Border-left: 3px primary-600
```

#### Header (Top Bar)
```
Height: 64px
Background: white
Border-bottom: 1px neutral-200
Padding: 0 24px
Layout: flex, justify-between, align-center
Position: sticky, top 0
Z-index: 10
```

---

### Status Indicators

#### Badge
```
Padding: 4px 8px
Border-radius: 3px
Font: 11px, semibold (600), uppercase
Variants:
- Success: bg success-50, text success-700, border success-200
- Warning: bg warning-50, text warning-700, border warning-200
- Error: bg error-50, text error-700, border error-200
- Info: bg info-50, text info-700, border info-200
- Neutral: bg neutral-100, text neutral-700, border neutral-200
```

#### Status Dot
```
Size: 8px
Border-radius: 50%
Inline with text
Color matches badge
```

#### Progress Bar
```
Height: 4px
Background: neutral-200
Fill: primary-600
Border-radius: 2px
Transition: 300ms ease-out
```

---

## Accessibility & Interactions

### Focus States (All Interactive Elements)
```
Ring: 2px solid primary-500 (#4A6FA5)
Ring-offset: 1px white
Never remove focus outline
Minimum contrast ratio: 3:1
```

### Hover States
```
Subtle background color change (max 5% darker)
Transition: 150ms ease-out
Cursor: pointer (buttons, links)
Cursor: default (text, labels)
```

### Disabled State
```
Opacity: 100% (don't fade out)
Cursor: not-allowed
Lower contrast text
Still visible for context
Background: neutral-100
Text: neutral-400
```

### Transitions
```
Fast (hover, click): 150ms ease-out
Medium (expand, collapse): 250ms ease-out
Slow (modals, page): 400ms ease-out
Never use ease-in (feels sluggish)
```

### Cursor Types
```
pointer   - buttons, links, clickable cards
default   - text, labels
text      - input fields
not-allowed - disabled elements
grab      - draggable elements
move      - resizable
wait      - loading
```

---

## Responsive Design

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
```

### Layout Behavior
```
Desktop: sidebar (256px) + main content
Tablet: sidebar + main (may collapse)
Mobile: fullscreen content, slide-in menu
```

### Padding Adjustments
```
Desktop: 24px
Tablet: 16px
Mobile: 12px
```

### Tables on Mobile
```
Desktop: full table
Tablet: scrollable or stacked
Mobile: card layout or horizontal scroll
```

---

## Special States

### Empty State
```
Center content
Icon: 48px, light gray (neutral-300)
Title: 18px, semibold, neutral-700
Message: 14px, neutral-600
CTA: primary button
Padding: 48px around
```

### Loading State
```
Spinner: 24-32px, primary-600
Text: "Loading..." or "Please wait..."
Overlay: 50% opacity if blocking
Show skeleton loaders for lists
```

### Error State
```
Icon: alert triangle, 32px, error-500
Title: "Error occurred"
Message: specific error text
Retry button: secondary
Error code: 12px, monospace, neutral-600
Background: error-50
Border-left: 3px error-500
```

### Toast/Notification
```
Position: fixed bottom-right, 16px margin
Background: neutral-50 + colored border-left
Border-left: 3px (color matches status)
Max-width: 400px
Shadow: md
Auto-dismiss: 4s fade-out
Manual close button: X icon
```

---

## Implementation Checklist

- [x] Color palette defined and implemented
- [x] Typography system established
- [x] Spacing/grid system (4px base)
- [x] Tailwind config with enterprise colors
- [x] Component styling rules documented
- [x] Button styles (primary, secondary, danger)
- [x] Input/form styling
- [x] Table styling (clean, bordered)
- [x] Card/panel styling
- [x] Modal styling
- [x] Navigation/sidebar redesign
- [x] Login component redesign
- [x] Header redesign
- [x] Status indicators/badges
- [x] Accessibility standards (focus rings, contrast)
- [x] Responsive behavior
- [x] Loading/empty/error states

---

## File Structure

```
frontend/
├── src/
│   ├── styles/
│   │   ├── designTokens.js       (Color, typography, spacing constants)
│   │   ├── DESIGN_GUIDELINES.md  (This guide)
│   │   └── index.css             (Global CSS, utility classes)
│   ├── components/
│   │   ├── Login.js              (Redesigned login form)
│   │   ├── Dashboard.js          (Main container)
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.js      (Top bar - redesigned)
│   │   │   ├── DashboardSidebar.js     (Left nav - redesigned)
│   │   │   ├── DashboardOverview.js    (Dashboard - update colors)
│   │   │   ├── ComplaintsView.js       (Complaint table - update colors)
│   │   │   ├── CustomersView.js        (Customer list)
│   │   │   └── ... (other views)
│   │   └── ...
│   ├── App.js
│   └── index.js
├── tailwind.config.js            (NEW - Tailwind configuration)
├── postcss.config.js             (NEW - PostCSS configuration)
└── package.json
```

---

## CSS Class Naming Convention

### Utility Classes Available
```
Colors:     text-primary-600, bg-neutral-50, border-neutral-200, etc.
Sizing:     w-64, h-16, p-4, m-6, gap-3, etc.
Layout:     flex, grid, absolute, sticky, etc.
Typography: text-sm, font-semibold, uppercase, tracking-wide, etc.
Shadows:    shadow-sm, shadow-md, shadow-lg
Rounded:    rounded-md, rounded-lg, rounded-full
Transitions: transition-colors, hover:, focus:, etc.
```

### Component Classes (Custom)
```
.card-base         - Base card styling
.table-header      - Table header styling
.table-row         - Table row styling
.input-base        - Input field base styling
.btn-primary       - Primary button
.btn-secondary     - Secondary button
.btn-danger        - Danger button
.badge-success     - Success badge
.fade-in           - Fade in animation
```

---

## Future Enhancements

1. **Dark Mode** - Can be implemented using CSS variables and `prefers-color-scheme`
2. **Component Library** - Create reusable React components with consistent styling
3. **Theme Switching** - Allow admin to customize primary color
4. **Animation Library** - Develop consistent micro-interactions
5. **Icon System** - Standardize icon usage (currently using lucide-react)

---

## References

- Color: https://tailwindcss.com/docs/customizing-colors
- Typography: https://tailwindcss.com/docs/font-size
- Spacing: https://tailwindcss.com/docs/padding
- Accessibility: https://www.w3.org/WAI/WCAG21/quickref/
- Enterprise Design: https://material.io/design/

---

## Design System Maintenance

**Last Updated:** January 10, 2026
**Version:** 1.0
**Status:** Active

All components should follow this guide. When adding new components or making changes, ensure they align with these standards.

