# Stock Inventra Design System

## 1. Design Philosophy
Stock Inventra aims to feel premium, bright, clean, elegant, professional, business-focused, and practical. The application relies primarily on whites and bright neutrals, punctuated by the brand's signature burgundy for identity and primary actions.

## 2. Color Palette
- **Primary:** `#7A1830`
- **Dark Primary:** `#641326`
- **Warm Ivory:** `#F5EFE6`
- **Application Background:** `#FCFCFB`
- **Surface / Card:** `#FFFFFF`
- **Primary Text:** `#242124`
- **Secondary Text:** `#77706D`
- **Border:** `#EAE5E0`

## 3. Color Usage
- ~70% White / bright neutral
- ~15% Warm Ivory
- ~10% Burgundy
- ~5% Semantic/supporting colors

Burgundy is an accent and identity color. Do not make the entire interface burgundy. Avoid large saturated backgrounds.

## 4. Typography
- **Primary Font:** Inter
- **Display:** `text-display` (36px, 700)
- **Page Title:** `text-page-title` (30px, 600)
- **Section Heading:** `text-section-title` (20px, 600)
- **Card Heading:** `text-card-title` (16px, 600)
- **Body:** `text-body` (14px, 400)
- **Body Strong:** `text-body-strong` (14px, 500)
- **Small:** `text-small` (12px, 400)
- **Caption:** `text-caption` (11px, 500)

## 5. Spacing
Consistent spacing scale based on multiples of 4:
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

## 6. Radius
Subtle modern radius values:
- `sm`: 4px
- `md`: 6px
- `lg`: 8px
- `pill`: Fully rounded

## 7. Shadows
Extremely subtle shadows for elevation. The interface primarily relies on whitespace and borders.
- `none`, `sm`, `md`, `lg`

## 8. Buttons
- **Variants:** Primary, Secondary, Outline, Ghost, Danger, Disabled
- **Primary Button:** Burgundy background, white text. Hover: Dark burgundy.
- **Properties:** Predictable height, consistent padding, consistent radius, clear hover/focus/disabled states.

## 9. Forms
- Form controls include Label, Optional Description, Input, and states (Focus, Error, Disabled).
- Do not put labels inside placeholders.

## 10. Cards
- **Types:** Standard, Metric, Chart, Summary, Alert
- **Properties:** White background, subtle border, subtle shadow, consistent radius (`md` or `lg`), consistent padding (`16` or `24`).

## 11. Tables
- Readable and compact without becoming visually dense.
- Support for: Header, Body, Hover, Selected row, Empty state, Loading state, Pagination.

## 12. Badges
- Reusable status styles using subtle semantic background colors and readable text.
- **Semantic:** Success, Warning, Danger, Neutral, Info

## 13. Icons
- **Library:** Lucide React
- **Sizes:** 12, 14, 16, 18, 20, 24
- Consistent stroke weight (outline icons). Do not mix styles.

## 14. Charts
- **Library:** Recharts
- Primary series: Burgundy
- Supporting series: Muted complementary tone
- Grid: Very subtle
- Tooltip: White surface
- Prioritize readability over excessive decoration.

## 15. Responsive Rules
- Dashboard is the primary desktop experience.
- Mobile should remain usable but not just shrink the desktop UI.

## 16. Accessibility Rules
- Keyboard navigation and visible focus states.
- Sufficient contrast and semantic HTML elements.
- Accessible interactive states. Do not sacrifice usability for visual styling.

## 17. Component State Rules
- Clearly defined states: Default, Hover, Focus, Active, Disabled, Loading, Error, Success.

## 18. Design Token Usage
- Do NOT scatter raw values. Use Tailwind classes derived from the centralized configuration (`bg-primary`, `text-text-secondary`, `p-16`, `rounded-md`, etc.).
