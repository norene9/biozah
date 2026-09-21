# Admin Catalogue UX TODO

## Goal

Refine the authenticated admin catalogue workspace to follow the attached reference: a focused management screen with a compact left collection rail and a dense product list on the right.

This is a layout and interaction refinement only. Keep Firebase Authentication, Firestore, Cloudinary, API routes, business rules, and existing product/category fields unchanged.

## Visual Direction

Preserve the existing Biozah design system:

- Existing dark green brand color
- Existing off-white page background
- Existing pale green surfaces
- Existing Playfair Display headings
- Existing DM Sans body text
- Existing border, button, badge, and spacing language
- No dark-theme conversion
- No new analytics, reports, notifications, or unrelated navigation

The attached reference is a structural reference, not a color replacement.

## Target Experience

### Admin Shell

- Keep the separate admin sidebar.
- Sidebar contains only the existing admin destinations:
  - Dashboard
  - Products & Collections
  - Orders
  - Sign out
- Keep the public storefront header separate from admin navigation.
- Admin content should sit directly beside the sidebar with restrained outer spacing.

### Catalogue Header

- Eyebrow: `CATALOGUE`
- Title: `Products & Collections.`
- Subtitle: `Manage your live product feed, collections, stock and images.`
- Primary `+ New product` action aligned to the top-right.
- Keep the original light Biozah palette.

### Split Workspace

Desktop layout:

- Left rail: Collections
- Right panel: Products
- Use a compact gap and shared content container.
- Avoid large empty areas between the sidebar, collection rail, and product list.

Mobile layout:

- Stack the collection rail above the product list.
- Preserve 44px touch targets.
- Keep horizontal scrolling limited to data tables only.

## Collections Rail

- Show `All products` with total product count.
- Show every collection as a compact card.
- Each card contains:
  - Thumbnail or safe initial-letter placeholder
  - Collection name
  - Product count
  - Active/Hidden status directly below the count
  - Edit action
- Highlight the active collection.
- Selecting a collection updates the product list using `?collection=slug`.
- `+ Create collection` opens the reusable creation modal.
- Edit opens the reusable collection modal.
- Preserve collection action behavior:
  - Edit
  - View products
  - Activate/Deactivate
  - Delete
- Delete must remain blocked when products reference the collection.

## Product Panel

- Keep the compact inline toolbar:
  - Search products
  - Collection filter when applicable
  - Status filter
  - Sort
  - Refresh
  - Product count
- Product table columns:
  - Thumbnail
  - Name and slug
  - Price
  - Stock badge
  - Active toggle
  - Featured toggle
  - Edit/delete actions
- Product rows should be dense, aligned, and easy to scan.
- Clicking Edit opens the reusable product modal.
- Product deletion must remove the Firestore product and its Cloudinary image.
- Product creation should add the response product to the visible list immediately or refresh through the router without losing the current layout state.

## Collection Cards

- Use one consistent CSS grid.
- Every card must reserve the same regions:
  1. Fixed image/header area
  2. Collection information area
  3. Footer/action area
- Image area:
  - Fixed aspect ratio
  - `object-fit: cover`
  - No collapsing containers
  - Safe placeholder for missing/invalid URLs
- Information area:
  - Name
  - Product count
  - Slug
  - Optional one-line description
- Footer:
  - Active/Hidden badge
  - Three-dot action button
- Action dropdown must be positioned relative to its button and must not be clipped or overlap card content.

## Reusable Components

Prefer shared components over page-specific duplicated markup:

- `components/admin/admin-page.tsx`
  - Admin page container
  - Admin page header
  - Admin list wrapper
  - Admin status badge
- Product toolbar and filters sheet
- Product modal/drawer and image upload field
- Collection form/modal
- Collection editor
- Collection card/list-row primitives
- Confirmation modal

When a component is used by both Products and Collections, keep the shared behavior in one file and pass data/actions as props.

## Image Handling

- Keep Cloudinary signed upload flow server-protected.
- Keep Cloudinary secrets server-only.
- Store image URL and public ID in Firestore.
- Use `next/image` only with configured remote hosts.
- Validate image URLs before rendering them through `next/image`.
- Use a visual placeholder when an image is missing or invalid.
- Handle upload lifecycle with success, error, abort, timeout, and `finally` cleanup.
- Never leave an upload button permanently stuck at a progress percentage.

## Files To Review Next

- `app/admin/products/page.tsx`
- `app/admin/products/products-table.tsx`
- `app/admin/products/collections-rail.tsx`
- `app/admin/products/products-toolbar.tsx`
- `app/admin/products/product-drawer.tsx`
- `app/admin/products/image-upload-field.tsx`
- `app/admin/categories/collections-manager.tsx`
- `app/admin/categories/category-form.tsx`
- `app/admin/categories/category-editor.tsx`
- `components/admin/admin-page.tsx`
- `components/site-header.tsx`
- `app/admin-layout.css`
- `app/catalog-reference.css`
- `app/globals.css`

## Verification Checklist

- [x] Admin sidebar is visually separate from the public storefront header.
- [x] Products and Collections are visible in one split workspace.
- [x] Collection cards align uniformly at desktop, tablet, and mobile widths.
- [x] Collection status appears below product count.
- [x] Collection image failures show a placeholder, never broken-image UI.
- [x] Collection action menus do not overlap images or overflow rows.
- [x] Product toolbar stays compact on desktop.
- [x] Product filters remain usable on mobile.
- [x] Create collection opens the reusable modal.
- [x] Edit collection opens the reusable modal.
- [x] Create product opens the reusable modal.
- [x] Product active/featured toggles persist through protected PATCH routes.
- [x] Product delete removes Firestore data and the Cloudinary image.
- [x] Collection delete remains blocked when products reference it.
- [x] Logout clears the session and redirects to `/admin/login`.
- [x] `npm run build` succeeds.
- [x] No unrelated navigation such as analytics or reports is added.
