# Quick Design Reference - Copy & Paste Classes

## Color Quick Reference

### Tailwind Color Classes Available
```
Primary:    primary-50 to primary-900 (primary-600 for buttons)
Neutral:    neutral-50 to neutral-900
Success:    success-50 to success-900
Warning:    warning-50 to warning-900
Error:      error-50 to error-900
Info:       info-50 to info-900
```

## Common Component Snippets

### Primary Button
```jsx
<button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1">
  Button Text
</button>
```

### Secondary Button
```jsx
<button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-50 hover:border-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1">
  Button Text
</button>
```

### Input Field
```jsx
<input 
  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-400"
  placeholder="Enter text..."
/>
```

### Card
```jsx
<div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-4">
  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Card Title</h3>
  <p className="text-sm text-neutral-600">Card content goes here</p>
</div>
```

### Table Header
```jsx
<thead className="bg-neutral-50 text-neutral-700 text-xs font-semibold uppercase tracking-wider border-b border-neutral-200">
  <tr>
    <th className="px-6 py-3">Column Header</th>
  </tr>
</thead>
```

### Table Row
```jsx
<tbody className="divide-y divide-neutral-100">
  <tr className="hover:bg-neutral-50 transition-colors">
    <td className="px-6 py-4 text-sm text-neutral-700">Cell content</td>
  </tr>
</tbody>
```

### Status Badge - Success
```jsx
<span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border bg-success-50 text-success-700 border border-success-200">
  Resolved
</span>
```

### Status Badge - Warning
```jsx
<span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border bg-warning-50 text-warning-700 border border-warning-200">
  Pending
</span>
```

### Status Badge - Error
```jsx
<span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border bg-error-50 text-error-700 border border-error-200">
  Failed
</span>
```

### Stat Card
```jsx
<div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-neutral-500 text-sm font-medium">Label</p>
      <h4 className="text-3xl font-bold text-neutral-900 mt-2">123</h4>
    </div>
    <div className="p-3 rounded-md bg-primary-50 text-primary-600">
      <Icon className="w-6 h-6" />
    </div>
  </div>
</div>
```

### Modal
```jsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg border border-neutral-200 shadow-lg p-6 max-w-md w-full mx-4">
    <h2 className="text-xl font-semibold text-neutral-900 mb-4">Modal Title</h2>
    <p className="text-sm text-neutral-600 mb-6">Modal content</p>
    <div className="flex gap-3 justify-end">
      <button className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-50">
        Cancel
      </button>
      <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Empty State
```jsx
<div className="py-12 text-center">
  <div className="flex justify-center mb-4">
    <Icon className="w-12 h-12 text-neutral-300" />
  </div>
  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Items Found</h3>
  <p className="text-sm text-neutral-500 mb-4">There are no items to display</p>
  <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
    Create New
  </button>
</div>
```

### Notification/Toast
```jsx
<div className="fixed bottom-4 right-4 bg-white border-l-4 border-success-500 rounded-md shadow-md p-4">
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
    <div>
      <h4 className="font-semibold text-neutral-900">Success</h4>
      <p className="text-sm text-neutral-600 mt-1">Your action was completed successfully</p>
    </div>
  </div>
</div>
```

## Typography Classes

### Headings
```jsx
<h1 className="text-4xl font-bold text-neutral-900">Main Title</h1>
<h2 className="text-3xl font-bold text-neutral-900">Section Header</h2>
<h3 className="text-2xl font-semibold text-neutral-900">Subsection</h3>
<h4 className="text-xl font-semibold text-neutral-900">Small Header</h4>
```

### Body Text
```jsx
<p className="text-base font-normal text-neutral-700">Regular body text</p>
<p className="text-sm font-normal text-neutral-600">Small body text</p>
<p className="text-xs font-normal text-neutral-500">Tiny text / caption</p>
```

### Labels & Emphasis
```jsx
<label className="text-sm font-medium text-neutral-700">Form Label</label>
<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Small Caps Label</p>
```

## Spacing Quick Guide

```
Gap between items:     gap-2 (8px) or gap-4 (16px)
Padding in cards:      p-4 (16px)
Margin between sections: mb-6 (24px)
Form field spacing:    mb-4 (16px)
Button groups:         gap-2 (8px)
Sidebar padding:       p-4 (16px)
Header padding:        px-6 py-4 (24px x 16px)
```

## Border & Shadow Classes

### Borders
```jsx
border                    // 1px neutral-200
border-neutral-300        // Thicker border
border-l-4                // Left border (4px)
border-b                  // Bottom border
border-t                  // Top border
border-r                  // Right border
rounded-md                // 4px radius (buttons, inputs)
rounded-lg                // 6px radius (cards)
rounded-xl                // 8px radius (modals)
rounded-full              // Circle
```

### Shadows
```jsx
shadow-sm                 // Subtle shadow (cards)
shadow-md                 // Medium shadow (panels)
shadow-lg                 // Large shadow (modals)
hover:shadow-md           // Shadow on hover
```

## Focus & Hover States

### Focus Ring
```jsx
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
```

### Hover States
```jsx
hover:bg-neutral-50       // Subtle background change
hover:text-primary-700    // Color change
hover:shadow-md           // Shadow change
hover:border-neutral-400  // Border change
transition-colors         // Smooth transition
```

## Animation Classes

```jsx
fade-in                   // Fade in animation
slide-in                  // Slide in from left
fade-out                  // Fade out
transition-colors         // Color transitions
transition-all            // All property transitions
duration-150              // Fast (150ms)
duration-250              // Normal (250ms)
duration-400              // Slow (400ms)
```

## Responsive Classes

```jsx
hidden md:block            // Hide on mobile, show on desktop
flex-col md:flex-row      // Stack on mobile, row on desktop
w-full md:w-2/3           // Full width mobile, 2/3 desktop
p-4 md:p-6                // Less padding on mobile
text-sm md:text-base      // Smaller text on mobile
grid-cols-1 md:grid-cols-2 lg:grid-cols-4  // Responsive grid
```

## Disabled States

```jsx
disabled:opacity-50
disabled:cursor-not-allowed
disabled:bg-neutral-100
disabled:text-neutral-400
disabled:border-neutral-200
```

## Color Combinations (Pre-tested)

### Professional Backgrounds with Text
```
Primary Text:      text-neutral-900 on bg-white
Secondary Text:    text-neutral-600 on bg-neutral-50
Disabled Text:     text-neutral-400 on bg-neutral-100
Success Text:      text-success-700 on bg-success-50
Warning Text:      text-warning-700 on bg-warning-50
Error Text:        text-error-700 on bg-error-50
```

## Import Statements

```javascript
// Icons (lucide-react)
import { AlertCircle, CheckCircle2, Cpu, LogOut, Edit2 } from 'lucide-react';

// All other icons available at https://lucide.dev
```

---

## Common Mistakes to Avoid

❌ Using `slate-*` colors (use `neutral-*` instead)
❌ Using `blue-*` colors (use `primary-*` instead)
❌ Using `emerald-*` colors (use `success-*` instead)
❌ Border-radius > 8px on most elements
❌ Shadows deeper than `shadow-lg`
❌ Gradients in backgrounds
❌ Bright colors like `#FF0000`
❌ Removing focus rings (accessibility!)
❌ Using emojis (use lucide-react icons instead)

✅ Always use design tokens colors
✅ Follow the component snippets above
✅ Keep spacing on 4px grid
✅ Maintain focus rings
✅ Use professional colors only

---

## Testing Your Changes

After making changes, check:
1. Colors match the palette (visit tailwind.config.js)
2. Spacing is aligned to 4px grid
3. Focus rings are visible (Tab key)
4. Hover states are smooth (transition-colors)
5. Buttons are 40px height
6. Cards have subtle shadows
7. Tables have proper spacing
8. Text has good contrast

---

**Last Updated:** January 10, 2026
**Design System Version:** 1.0

