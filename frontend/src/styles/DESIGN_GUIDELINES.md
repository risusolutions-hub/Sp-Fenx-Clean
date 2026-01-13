/**
 * Modern Glassmorphism Design System Guidelines
 * Premium, Contemporary Interface Design
 */

/* ============================================================================
   DESIGN PHILOSOPHY
   ============================================================================ */

/*
1. GLASSMORPHISM FIRST
   - Frosted glass effects with backdrop blur
   - Subtle transparency and layered depth
   - Soft light colors and gradients

2. ELEGANT MINIMALISM
   - Clean white-based foundation
   - Pastel color accents (blue, mint, lavender, sand)
   - Thin, elegant borders and refined spacing

3. CONTEMPORARY & PREMIUM
   - Modern typography with Inter font family
   - Smooth micro-interactions and animations
   - Professional iconography and visual hierarchy

4. ACCESSIBLE & RESPONSIVE
   - High contrast ratios for readability
   - Touch-friendly interactive elements
   - Consistent across all screen sizes

5. TRUST & SOPHISTICATION
   - Layered depth with subtle shadows
   - Smooth transitions and polished animations
   - Enterprise-grade attention to detail
*/

/* ============================================================================
   COLOR PALETTE - PASTEL GLASSMORPHISM
   ============================================================================ */

/*
PRIMARY COLORS (Soft Blues):
- Primary 500: #0C8CE9 - Main blue accent
- Primary 50-400: Light to medium blue variations
- Used for: Primary buttons, links, focus states

SECONDARY COLORS (Mint Green):
- Secondary 500: #14B8A6 - Mint accent
- Secondary 50-400: Light to medium mint variations
- Used for: Secondary actions, success states

ACCENT COLORS (Lavender):
- Accent 500: #A855F7 - Lavender accent
- Accent 50-400: Light to medium lavender variations
- Used for: Highlights, special elements

WARM COLORS (Sand):
- Warm 500: #ED8936 - Sand/beige accent
- Warm 50-400: Light to medium sand variations
- Used for: Warnings, warm highlights

NEUTRAL COLORS (Clean Whites):
- White: #FFFFFF - Pure white
- Neutral 50-900: Ultra light to very dark grays
- Used for: Text, backgrounds, borders

GLASS EFFECTS:
- Glass BG: rgba(255, 255, 255, 0.25) - Semi-transparent white
- Glass Border: rgba(255, 255, 255, 0.18) - Subtle glass border
- Backdrop Filter: blur(16px) saturate(180%) - Glassmorphism effect

STATUS COLORS (Soft & Professional):
- Success: #22C55E - Soft green
- Warning: #F59E0B - Soft amber
- Error: #EF4444 - Soft red
- Info: #0EA5E9 - Soft cyan
*/

/* ============================================================================
   TYPOGRAPHY - MODERN & REFINED
   ============================================================================ */

/*
FONT FAMILY: Inter (Google Fonts)
- Weights: 100-900 (Thin to Black)
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

HIERARCHICAL SCALE:
- Hero Titles: 40px, black (900), -0.025em letter-spacing
- Page Headers: 32px, bold (700), normal letter-spacing
- Section Titles: 24px, semibold (600), normal
- Card Headers: 20px, semibold (600), normal
- Body Large: 17px, normal (400), 1.4 line-height
- Body Regular: 15px, normal (400), 1.4 line-height
- Labels/Small: 13px, medium (500), 1.4 line-height
- Captions/Micro: 11px, normal (400), 1.2 line-height

USAGE RULES:
- Maximum 3 font sizes per component
- Use font-weight for hierarchy, not size alone
- Consistent letter-spacing: tighter (-0.025em) for headlines
- Line-height: 1.4 for body, 1.2 for tight spacing
*/

/* ============================================================================
   SPACING & LAYOUT - REFINED GRID
   ============================================================================ */

/*
BASE GRID: 4px system with expanded options
- 0.5: 2px (micro spacing)
- 1: 4px (minimal)
- 2: 8px (small)
- 3: 12px (medium)
- 4: 16px (large)
- 6: 24px (extra large)
- 8: 32px (section spacing)

CONTAINER MAX-WIDTHS:
- Small cards: 320px
- Medium cards: 480px
- Large cards: 640px
- Full content: 1024px
- Wide layouts: 1280px

BORDER RADIUS (Rounded Corners):
- XS: 2px - Minimal elements
- SM: 6px - Buttons, inputs
- MD: 8px - Cards, containers
- LG: 12px - Large cards
- XL: 16px - Modals, special elements
- 2XL: 20px - Hero sections
- 3XL: 24px - Premium elements
- Full: 9999px - Avatars, pills

RULES:
- Consistent 4px grid throughout
- Generous padding: minimum 16px for touch targets
- Breathing room: 24px between sections
- Visual balance: equal spacing around elements
*/

/* ============================================================================
   GLASSMORPHISM & EFFECTS
   ============================================================================ */

/*
GLASS CARD (Primary Component):
- Background: rgba(255, 255, 255, 0.25)
- Border: 1px solid rgba(255, 255, 255, 0.18)
- Border-radius: 12px
- Box-shadow: 0 8px 32px rgba(31, 38, 135, 0.12)
- Backdrop-filter: blur(16px) saturate(180%)

FLOATING CARD (Elevated):
- Background: rgba(255, 255, 255, 0.9)
- Border-radius: 16px
- Box-shadow: 0 10px 15px rgba(0, 0, 0, 0.06)
- Transform: translateY(-2px) on hover

SHADOWS (Layered Depth):
- XS: Subtle inner shadows
- SM: Soft outer shadows
- MD: Medium elevation
- LG: High elevation
- XL: Maximum elevation
- Glass: Special glassmorphism shadows

BACKDROP FILTERS:
- Light: blur(8px) - Subtle effects
- Medium: blur(12px) - Cards, sidebars
- Heavy: blur(16px) - Modals, overlays
- Strong: blur(20px) saturate(180%) - Premium elements

RULES:
- Use glass effects sparingly for premium feel
- Always combine with subtle shadows
- Ensure text contrast over glass backgrounds
- Test backdrop filters across browsers
*/

/* ============================================================================
   COMPONENTS - MODERN PATTERNS
   ============================================================================ */

/*
BUTTONS:
- Primary: Gradient background, glassmorphism hover
- Secondary: Glass background, subtle borders
- Ghost: Transparent, glass on hover
- Height: 44px minimum for touch
- Border-radius: 8px
- Font: 13px medium weight

INPUTS:
- Glass background: rgba(255, 255, 255, 0.25)
- Border: 1px solid rgba(255, 255, 255, 0.18)
- Height: 44px
- Border-radius: 8px
- Focus: Blue glow effect

CARDS:
- Glass background with backdrop blur
- Subtle borders and inner shadows
- Rounded corners: 12px
- Hover effects: translateY(-2px)
- Padding: 24px minimum

TABLES:
- Glass container background
- Subtle row separators
- Hover effects: light background tint
- Header: Semi-transparent white background

BADGES:
- Small rounded rectangles
- Gradient backgrounds for status
- Subtle shadows and borders
- Uppercase text, small font size

MODALS:
- Glass background with heavy blur
- Rounded corners: 16px
- Drop shadow with glass effect
- Overlay: Subtle blur background

SIDEBARS & HEADERS:
- Semi-transparent white backgrounds
- Backdrop blur effects
- Subtle borders and shadows
- Consistent with overall glass theme

RULES:
- All interactive elements: 44px minimum touch target
- Consistent border-radius: 8px for small, 12px for large
- Glass effects: Use rgba whites, not solid colors
- Shadows: Layered for depth, never harsh
*/

/* ============================================================================
   ANIMATIONS & MICRO-INTERACTIONS
   ============================================================================ */

/*
TRANSITIONS:
- Fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- Normal: 250ms cubic-bezier(0.4, 0, 0.2, 1)
- Slow: 400ms cubic-bezier(0.4, 0, 0.2, 1)

ANIMATIONS:
- Fade In: translateY(8px) to translateY(0)
- Slide In: translateX(-12px) to translateX(0)
- Scale In: scale(0.95) to scale(1)
- Glow: Pulsing glass shadow effect
- Shimmer: Loading state animation

MICRO-INTERACTIONS:
- Button hover: translateY(-1px) + enhanced shadow
- Card hover: translateY(-2px) + glow effect
- Input focus: Blue glow ring + background change
- Tab switch: Smooth color transition
- Loading states: Shimmer animation

RULES:
- Use cubic-bezier for natural motion
- Respect user's motion preferences
- Keep animations subtle and purposeful
- Performance: Use transform and opacity
*/

/* ============================================================================
   RESPONSIVE DESIGN
   ============================================================================ */

/*
BREAKPOINTS:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

MOBILE FIRST:
- Single column layouts
- Touch-friendly sizing (44px minimum)
- Simplified navigation
- Stacked components

TABLET:
- Two column layouts where appropriate
- Expanded navigation
- Medium-sized components

DESKTOP:
- Multi-column layouts
- Full navigation
- Large component sizes
- Advanced interactions

RULES:
- Fluid typography and spacing
- Progressive enhancement
- Touch targets always 44px minimum
- Content scales appropriately
*/

/* ============================================================================
   ACCESSIBILITY & INCLUSIVITY
   ============================================================================ */

/*
CONTRAST RATIOS:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI elements: 3:1 minimum

FOCUS INDICATORS:
- Blue glow ring: 3px solid rgba(12, 140, 233, 0.1)
- Visible on all interactive elements
- High contrast against backgrounds

MOTION PREFERENCES:
- Respect prefers-reduced-motion
- Provide alternatives for animations
- Essential animations only when reduced

COLOR BLINDNESS:
- Don't rely on color alone for meaning
- Use icons, patterns, and text labels
- Test with color blindness simulators

SCREEN READERS:
- Semantic HTML structure
- ARIA labels where needed
- Logical heading hierarchy
- Descriptive alt text for images

RULES:
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast verification
*/

/* ============================================================================
   IMPLEMENTATION NOTES
   ============================================================================ */

/*
CSS CUSTOM PROPERTIES:
- All colors defined as CSS variables
- Consistent naming convention
- Easy theme switching capability

COMPONENT LIBRARY:
- Reusable component classes
- Consistent API across components
- Theme-aware styling

PERFORMANCE:
- Use backdrop-filter sparingly
- Optimize animations with transform/opacity
- Lazy load heavy glass effects

BROWSER SUPPORT:
- Modern browsers with backdrop-filter
- Graceful fallbacks for older browsers
- Progressive enhancement approach

MAINTENANCE:
- Design tokens in central location
- Consistent component patterns
- Regular design system updates
*/

/*
BASE GRID: 4px
Use multiples: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

MARGINS:
- Element to element: 16px (4)
- Section to section: 24px (6)
- Page padding: 24px (6)
- Group inside card: 12px (3)

PADDING:
- Card padding: 16px (4)
- Button padding X: 16px, Y: 8-12px
- Input padding: 12px X, 8px Y
- Sidebar sections: 12px vertical, 16px horizontal
- Header padding: 16px

GAPS:
- Grid gap: 16px (4)
- Flex item gap: 8px (2) for compact, 16px (4) for loose
- Button groups: 8px (2)

SIDEBAR WIDTH: 256px (constant)
MAX CONTENT WIDTH: 1440px (desktop)
*/

/* ============================================================================
   BORDERS & SHADOWS
   ============================================================================ */

/*
BORDERS:
- Default border: 1px solid #E5E7EB (neutral-200)
- Hover border: 1px solid #D1D5DB (neutral-300)
- Focus border: 1px solid #3D5A8C (primary-600)
- Disabled border: 1px solid #E5E7EB (neutral-200)
- Header/Sidebar border: 1px solid #1F2937 (neutral-800)

BORDER RADIUS:
- Minimal: 3px (xs) - rare, for very small elements
- Default: 4px (md) - buttons, inputs, small cards
- Larger: 6px (lg) - cards, panels
- Large: 8px (xl) - modals, dropdowns
- Full: 9999px (circles, profile pics)

SHADOWS (minimal, professional):
- xs: 0 1px 2px rgba(0,0,0,0.05)
- sm: 0 1px 3px rgba(0,0,0,0.08) - cards, buttons on hover
- md: 0 4px 6px rgba(0,0,0,0.08) - panels
- lg: 0 10px 15px rgba(0,0,0,0.1) - modals, dropdowns
- Never use drop shadows deeper than 10px radius
*/

/* ============================================================================
   BUTTONS
   ============================================================================ */

/*
PRIMARY BUTTON (Main Action):
- Background: #3D5A8C (primary-600)
- Text: white
- Padding: 8px 16px (height 40px)
- Border: none or 1px primary-600
- Border-radius: 4px
- Font: 13px, semibold
- Hover: background #23325A (primary-800)
- Active: background #1B2541 (primary-900)
- Focus: ring 2px #4A6FA5 (primary-500) offset 1px
- Transition: 150ms ease-out
- Cursor: pointer
- Disabled: opacity 50%, cursor not-allowed

SECONDARY BUTTON (Alternative Action):
- Background: white
- Text: #4B5563 (neutral-600)
- Border: 1px #D1D5DB (neutral-300)
- Padding: 8px 16px (height 40px)
- Border-radius: 4px
- Font: 13px, semibold
- Hover: background #F9FAFB (neutral-50), border #9CA3AF (neutral-400)
- Focus: ring 2px #4A6FA5 offset 1px
- Transition: 150ms ease-out

TERTIARY/TEXT BUTTON:
- Background: transparent
- Text: #4A6FA5 (primary-500)
- Border: none
- Padding: 8px 16px
- Font: 13px, semibold
- Hover: background #F0F4F8 (primary-50)
- Focus: ring 2px primary-500 offset 1px

DANGER BUTTON:
- Background: #DC2626 (error-500)
- Text: white
- Hover: #B91C1C (darker red)

STATUS BUTTONS:
- Success: background #059669, hover #047857
- Warning: background #D97706, hover #B45309
- Info: background #0891B2, hover #0679A0

NO GRADIENTS, NO ROUNDED CORNERS > 4px, NO SHADOWS
*/

/* ============================================================================
   INPUTS & FORMS
   ============================================================================ */

/*
TEXT INPUT:
- Background: white
- Border: 1px #D1D5DB (neutral-300)
- Padding: 8px 12px (height 40px total)
- Border-radius: 4px
- Font: 14px
- Placeholder color: #9CA3AF (neutral-400)
- Text color: #1F2937 (neutral-800)
- Focus: ring 2px #4A6FA5 (primary-500), border primary-600
- Disabled: background #F3F4F6 (neutral-100), border #E5E7EB, cursor not-allowed
- Transition: 150ms ease-out

LABEL:
- Font: 13px, semibold (600), #374151 (neutral-700)
- Margin-bottom: 4px
- Display: block

TEXTAREA:
- Same as text input, but no height restriction
- Min-height: 120px recommended

SELECT/DROPDOWN:
- Same as text input styling
- Padding-right: 32px (for arrow icon)
- Arrow color: #6B7280 (neutral-500)

CHECKBOX/RADIO:
- Size: 18px
- Border: 1px #D1D5DB
- Checked: background #3D5A8C (primary-600), border primary-600
- Hover: border #9CA3AF (neutral-400)
- Focus: ring 2px primary-500
- Label-spacing: 8px

FORM LAYOUT:
- Label above input
- 16px gap between form groups
- Use clear error messages below input (color: #DC2626)
- Success state: border #059669, checkmark icon
- Helper text: 12px, color #6B7280 (neutral-500)
*/

/* ============================================================================
   TABLES
   ============================================================================ */

/*
TABLE HEADER:
- Background: #F9FAFB (neutral-50)
- Border-bottom: 1px #E5E7EB (neutral-200)
- Text: 12px, semibold (600), #374151 (neutral-700)
- Padding: 12px 16px
- Uppercase letter-spacing: 0.05em
- Text-align: left (default)

TABLE ROW:
- Background: white
- Border-bottom: 1px rgba(0,0,0,0.04) (very light)
- Text: 14px, normal (400), #4B5563 (neutral-600)
- Padding: 12px 16px
- Height: 44px

ZEBRA STRIPING (optional):
- Even rows: white
- Odd rows: #F9FAFB (neutral-50)

ROW HOVER:
- Background: #F3F4F6 (neutral-100)
- Transition: 150ms ease-out
- Cursor: pointer (if clickable)

COMPACT TABLE:
- Padding: 8px 12px
- Height: 36px
- Font: 13px

FIXED COLUMNS:
- Use for ID, action columns
- Right-align numbers, left-align text/actions

EMPTY STATE:
- Center text: "No data" or "No records found"
- Color: #9CA3AF (neutral-400)
- Padding: 32px top/bottom
- Font-style: italic

SORTING INDICATORS:
- Arrow icon (▲▼) next to header text
- Active: color #3D5A8C (primary-600)
- Inactive: color #D1D5DB (neutral-300)
*/

/* ============================================================================
   CARDS & PANELS
   ============================================================================ */

/*
CARD:
- Background: white
- Border: 1px #E5E7EB (neutral-200)
- Border-radius: 6px
- Padding: 16px
- Shadow: 0 1px 3px rgba(0,0,0,0.08)
- Margin-bottom: 16px

CARD HEADER:
- Font: 16px, semibold (600), #1F2937 (neutral-800)
- Padding-bottom: 12px
- Border-bottom: 1px #E5E7EB (optional)

CARD CONTENT:
- Padding: 12px (internal spacing)
- Font: 14px, normal (400)

CARD FOOTER:
- Padding-top: 12px
- Border-top: 1px #E5E7EB (optional)
- Contains buttons or additional info

PANEL (Sidebar, Modal Side):
- Same as card, but may have darker background (#F9FAFB)
- Used for grouped related information

STATISTICS CARD:
- Larger number: 24px, bold (700), #1F2937
- Label: 13px, normal (400), #6B7280 (neutral-500)
- Padding: 16px
- Can use light colored background (#F0F4F8 for primary)
- Border-left: 3px solid primary color (optional)
*/

/* ============================================================================
   MODALS & DIALOGS
   ============================================================================ */

/*
OVERLAY:
- Background: rgba(0,0,0,0.5)
- Backdrop-filter: optional blur(4px)

MODAL:
- Background: white
- Border: 1px #E5E7EB (neutral-200)
- Border-radius: 8px
- Shadow: 0 20px 25px rgba(0,0,0,0.1)
- Width: 90% (mobile), 600px (desktop)
- Max-width: 90vw
- Padding: 24px

MODAL HEADER:
- Font: 20px, semibold (600), #1F2937
- Border-bottom: 1px #E5E7EB (optional)
- Padding-bottom: 16px
- Close button: top-right, size 24px, color #9CA3AF

MODAL FOOTER:
- Border-top: 1px #E5E7EB
- Padding-top: 16px
- Button spacing: 8px between buttons
- Align: right
- Primary button on right, secondary on left

ALERT/CONFIRMATION:
- Header: bold, 18px
- Message: 14px, #4B5563
- Buttons: Primary (action), Secondary (cancel)
*/

/* ============================================================================
   NAVIGATION & SIDEBAR
   ============================================================================ */

/*
SIDEBAR:
- Width: 256px (fixed)
- Background: #111827 (neutral-900)
- Border-right: 1px #1F2937 (neutral-800)
- Position: fixed, left, top
- Height: 100vh
- Overflow-y: auto

SIDEBAR HEADER:
- Height: 64px
- Padding: 16px
- Border-bottom: 1px #1F2937
- Display: flex, gap 12px
- Font: 18px, bold (700), white

SIDEBAR NAV ITEM:
- Padding: 12px 16px
- Margin: 4px 12px
- Font: 14px, semibold (600)
- Border-radius: 4px
- Transition: 150ms ease-out

NAV ITEM STATES:
- Inactive: color #A1A5B0 (neutral-400), background transparent
- Hover: background #1F2937 (neutral-800), color #D1D5DB (neutral-300)
- Active: background #3D5A8C (primary-600), color white, border-left 3px primary
- Icon: size 18px, margin-right 12px

SIDEBAR FOOTER:
- Border-top: 1px #1F2937
- Padding: 16px
- Contains user profile, logout
- Background: #0F172A (slightly darker)

HEADER (Top Bar):
- Background: white
- Border-bottom: 1px #E5E7EB (neutral-200)
- Height: 64px
- Padding: 0 24px
- Display: flex, justify-between, align-center
- Box-shadow: none

BREADCRUMBS:
- Font: 13px, normal
- Separator: "/" or ">", color #D1D5DB
- Active: #4B5563, clickable #3D5A8C with underline on hover
*/

/* ============================================================================
   STATUS INDICATORS
   ============================================================================ */

/*
BADGE:
- Padding: 4px 8px
- Border-radius: 3px
- Font: 11px, semibold (600)
- Text-transform: uppercase

BADGE COLORS:
- Success: background #D1FAE5, text #065F46
- Warning: background #FEF3C7, text #92400E
- Error: background #FEE2E2, text #7F1D1D
- Info: background #DBEAFE, text #0C2340
- Neutral: background #F3F4F6, text #374151

STATUS DOT:
- Size: 8px
- Border-radius: 50%
- Inline with text
- Colors match badge

PROGRESS BAR:
- Height: 4px
- Background: #E5E7EB (neutral-200)
- Fill: #3D5A8C (primary-600)
- Border-radius: 2px
- Smooth transition: 300ms ease-out

LOADING SPINNER:
- Size: 20px, 24px, or 32px
- Color: #3D5A8C (primary-600)
- Stroke width: 2px
- Never use bright colors or animated GIFs
*/

/* ============================================================================
   FORMS & VALIDATION
   ============================================================================ */

/*
REQUIRED FIELD:
- Add asterisk (*) in label, color #DC2626 (error)
- Or bold the label
- Mark as required in legend

ERROR MESSAGE:
- Color: #DC2626 (error-500)
- Font: 12px
- Position: below input, 4px gap
- Icon: X or ! symbol, 14px

SUCCESS MESSAGE:
- Color: #059669 (success-500)
- Font: 12px
- Icon: checkmark, 14px

HELP TEXT:
- Color: #6B7280 (neutral-500)
- Font: 12px
- Position: below input or label
- Text-style: normal (not italic)

DISABLED FIELD:
- Background: #F3F4F6 (neutral-100)
- Text: #9CA3AF (neutral-400)
- Border: #E5E7EB (neutral-200)
- Cursor: not-allowed
- Opacity: 1 (don't use opacity)

FORM LAYOUT:
- Full width inputs by default
- Label + Input + Help/Error stacked vertically
- 16px between form groups
- Consider 2-column layout for wide screens (with careful field pairing)
*/

/* ============================================================================
   ACCESSIBILITY & INTERACTIONS
   ============================================================================ */

/*
FOCUS STATES (all interactive elements):
- Ring: 2px solid #4A6FA5 (primary-500)
- Ring-offset: 1px white
- Never remove focus outline
- Ensure 3:1 minimum contrast ratio

HOVER STATES:
- Subtle background color change (max 5% darker)
- Smooth transition (150ms)
- Cursor: pointer (buttons, links)
- Cursor: default (text)

ACTIVE/PRESSED:
- Slightly darker background
- Maintains focus ring
- Often used with pseudo-class :active

DISABLED:
- Opacity: 100% (don't fade)
- Cursor: not-allowed
- Lower contrast text
- Still visible (important for context)

TRANSITIONS:
- Fast interactions: 150ms (hover, click feedback)
- Medium: 250ms (expand, collapse)
- Slow: 400ms (modals, page transitions)
- Easing: ease-out (feels responsive)

CURSOR TYPES:
- pointer: buttons, links, clickable cards
- default: text, labels
- text: input fields
- not-allowed: disabled elements
- grab/grabbing: draggable
- move: resizable
- wait: loading

DARK MODE (future):
- Not required for enterprise interface
- If implemented: invert colors, maintain contrast
*/

/* ============================================================================
   RESPONSIVE DESIGN
   ============================================================================ */

/*
BREAKPOINTS:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

SIDEBAR BEHAVIOR:
- Desktop: fixed 256px
- Tablet: fixed 256px or collapsible
- Mobile: hidden by default, slide-in menu

LAYOUT SHIFTS:
- Desktop: sidebar + main content
- Tablet: sidebar + main (may collapse)
- Mobile: fullscreen content

PADDING:
- Desktop: 24px
- Tablet: 16px
- Mobile: 12px

FONT SIZES:
- Generally consistent
- May reduce by 1px on mobile for small text
- Maintain hierarchy

TABLES:
- Desktop: full table
- Tablet: scrollable or stacked
- Mobile: card layout or horizontal scroll
*/

/* ============================================================================
   SPECIAL STATES & SCENARIOS
   ============================================================================ */

/*
EMPTY STATE:
- Centered content
- Icon: 48px, light gray (#D1D5DB)
- Title: 18px, semibold, #374151
- Message: 14px, #6B7280
- CTA button: primary button
- Padding: 48px around

LOADING STATE:
- Spinner: 24-32px, #3D5A8C
- Text: "Loading..." or "Please wait..."
- Overlay: 50% opacity if blocking
- Show skeleton loaders for large lists

ERROR STATE:
- Icon: alert triangle, 32px, #DC2626
- Title: "Error occurred"
- Message: specific error text
- Retry button: secondary
- Error code: 12px, monospace, #6B7280

SUCCESS MESSAGE:
- Position: top-right or top-center
- Background: #D1FAE5 (success-100)
- Border-left: 3px #059669
- Auto-dismiss after 3-4 seconds
- Manual close button: X icon

TOAST/NOTIFICATION:
- Position: fixed bottom-right, 16px margin
- Background: #F3F4F6 with colored border-left
- Max-width: 400px
- Shadow: md
- Auto-dismiss: 4s with fade-out

SKELETON LOADER:
- Pulse animation: opacity 0.6-1.0
- Background: #E5E7EB
- Border-radius: match final element
- Stagger loads for multiple rows
*/

export default {};
