# Icon & Asset Strategy

## 1. Icon Library
The primary and default icon system for Stock Inventra is **Lucide React**. 
No external icon packs or duplicate SVGs should be downloaded for standard UI functionality.

## 2. Icon Style
- Maintain a consistent outline style.
- Do not mix different icon weights or styles (solid, duotone, etc.).
- Default stroke weight provided by Lucide should be used (usually 2px).

## 3. Icon Sizes
Icons should exclusively use the following standard sizes:
- **12px - 14px:** Small metadata / compact UI
- **16px:** Default inline UI icon
- **18px:** Navigation / action icons
- **20px:** Buttons / important actions
- **24px:** Large empty states or prominent UI
Do not randomly use arbitrary icon sizes.

## 4. Icon Color Rules
- **Default icon color:** Secondary text / muted color (`text-text-secondary`)
- **Active navigation icon:** Primary Burgundy (`text-primary`)
- **Destructive action:** Semantic Error (`text-semantic-error`)
- **Success action:** Semantic Success (`text-semantic-success`)

## 5. Sidebar Icon Mapping
- **Dashboard:** `LayoutDashboard`
- **Products:** `Package`
- **Inventory:** `Boxes`
- **Sales:** `Receipt`
- **Categories:** `Tags`
- **Analytics:** `BarChart3`
- **Reports:** `FileBarChart`
- **Settings:** `Settings`

## 6. Header Icon Mapping
- **Search:** `Search`
- **Calendar:** `CalendarDays`
- **Notifications:** `Bell`
- **Profile:** `UserCircle`
- **Dropdown:** `ChevronDown`

## 7. Action Icon Mapping
- **Add:** `Plus`
- **Edit:** `Pencil`
- **Delete:** `Trash2`
- **View:** `Eye`
- **More:** `MoreHorizontal`
- **Close:** `X`
- **Confirm:** `Check`
- **Back:** `ArrowLeft`
- **Next:** `ArrowRight`
- **Filter:** `ListFilter`
- **Upload:** `Upload`
- **Download:** `Download`
- **Refresh:** `RefreshCw`

## 8. Feature Icon Mapping
**Dashboard:**
- Revenue → `CircleDollarSign`
- Profit → `TrendingUp`
- Products → `Package`
- Stock → `Boxes`
- Increase → `ArrowUpRight`
- Decrease → `ArrowDownRight`

**Product:**
- Product image → `Image`
- Pricing → `CircleDollarSign`
- Stock → `Boxes`
- Description → `AlignLeft`

**Sales:**
- Product → `Package`
- Quantity → `Hash`
- Discount → `BadgePercent`
- Price → `CircleDollarSign`
- Profit → `TrendingUp`
- Complete Sale → `CheckCircle2`

**Inventory:**
- Stock → `Boxes`
- Stock Movement → `ArrowLeftRight`
- Low Stock → `TriangleAlert`
- Out of Stock → `CircleX`
- In Stock → `CircleCheck`

**Analytics:**
- Revenue → `CircleDollarSign`
- Profit → `TrendingUp`
- Units Sold → `Package`
- Average Order Value → `Receipt`
- Recommendation → `Lightbulb`
- Increase Stock → `ArrowUp`
- Reduce Stock → `ArrowDown`
- Maintain → `Minus`

**Settings:**
- Business Information → `Building2`
- Inventory Settings → `Boxes`
- Currency & Tax → `CircleDollarSign`
- Account Settings → `UserCog`
- Change Logo → `ImagePlus`

*(Note: These exactly follow the requirements. Substitutions will be noted if necessary during implementation, but all specified icons exist in Lucide.)*

## 9. Public Asset Structure
```
apps/web/public/
├── logos/
├── images/
│   ├── products/
│   ├── avatars/
│   └── illustrations/
└── icons/
    └── custom/
```

## 10. Logo Strategy
- The final product branding must use the text: **Stock Inventra** (Do not use "StockPro" from references).
- The future logo will be premium, minimal, burgundy-based, geometric, and relate to inventory/packages.
- It will be stored in `apps/web/public/logos/` as an SVG.
- For now, text placeholders or basic SVG placeholders will suffice.

## 11. Product Image Strategy
- Demo product images will eventually be stored in `apps/web/public/images/products/`.
- Do not mix UI icons with product images.

## 12. Avatar Strategy
- Stored in `apps/web/public/images/avatars/`.
- Use professional placeholder or properly licensed demo assets. No copyrighted random profile photos.

## 13. Illustration Strategy
- Stored in `apps/web/public/images/illustrations/`.
- Reserved for future empty states and onboarding. Use scalable SVG formats.

## 14. SVG Rules
- **DO NOT** create custom SVG files for common interface icons (Search, Bell, Settings, etc.). Use Lucide React instead.
- Custom SVGs are strictly for brand logos, brand marks, unique product illustrations, or assets genuinely missing from Lucide.

## 15. Naming Conventions
- Always use predictable lowercase kebab-case for filenames.
- Examples: `stock-inventra-logo.svg`, `product-coffee-beans.webp`, `avatar-admin.webp`
- Avoid: `IMG_1234.png`, `final-final.png`

## 16. Licensing Rules
- As a commercial source-code product, **all assets must be commercially usable.**
- Use Lucide React, self-created assets, or verifiable public-domain/licensed assets.
- Absolutely no ambiguous or copyrighted external assets.

## 17. Image Format Guidelines
- **SVG:** Logos, vector illustrations, and custom scalable graphics.
- **WebP:** Preferred for raster images (products, avatars) due to performance.
- **PNG:** Only when transparency or specific compatibility strictly requires it.
