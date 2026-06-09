# UI/UX Polish Backlog

Things to improve before Phase 6. Work through these page by page.

---

## Global

- [ ] Consistent page background — mix of `bg-white`, `bg-gray-100`, nothing. Settle on `bg-gray-50` everywhere
- [ ] Spinner is copy-pasted across every page — extract a `<Spinner />` component
- [ ] No `<title>` / `metadata` per page — add meaningful page titles for browser tab

---

## Browse (`/browse`)

- [ ] No search bar — add a text input to filter by product name
- [ ] No product count — show "24 products" or "3 results for 'tomato'"
- [ ] Category chips have no icons — add emoji per category (🥦 vegetables, 🍎 fruits, 🌾 grains, 🐄 livestock, 🌱 inputs)
- [ ] Product card image placeholder is a plain grey div — replace with a tinted green div + category emoji
- [ ] No stock/availability indicator on cards — show "Low stock" badge if quantity < 5
- [ ] Page background inconsistent — missing `bg-gray-50`

---

## Product Detail (`/products/[id]`)

- [ ] No category badge visible — add a pill badge next to the location line
- [ ] Images array has multiple entries but only first is shown — add a simple image row/thumbnails
- [ ] Available quantity is small grey text — make it more prominent, especially when low
- [ ] Page background inconsistent — missing `bg-gray-50`

---

## Cart (`/cart`)

- [ ] Same-farmer validation only triggers on submit — warn earlier (e.g. when adding a second farmer's item show a banner in cart)
- [ ] No item image or icon in cart rows — feels bare
- [ ] "Notes to farmer" field label is placeholder only — add a visible label above it
- [ ] Page background inconsistent — missing `bg-gray-50`

---

## Orders (`/orders`)

- [ ] `alert()` used for pay response — replace with inline success/error message per order card
- [ ] `confirm()` used for cancel — replace with inline "Are you sure? Yes / No" row
- [ ] Raw date format (`toLocaleDateString`) is fine but no time — add time or relative format ("2 days ago")
- [ ] No order count in header — show "3 orders"
- [ ] "Pay via M-Pesa" button shows even before M-Pesa is configured — consider a placeholder state
- [ ] Page background inconsistent — missing `bg-gray-50`

---

## Map (`/map`)

- [ ] Selected product popup has no image — add a small thumbnail if available
- [ ] No product count indicator — "12 farmers nearby" text somewhere
- [ ] Error state (location denied) has no retry button or fallback — add a "Browse all products" link

---

## Farmer Dashboard (`/farmer`)

- [ ] Pure placeholder text — replace with a proper empty state: icon, heading, description, and "coming soon" cards for each section (My Listings, Incoming Orders, Earnings)
- [ ] No visual structure — at minimum show the dashboard card grid layout even if sections are empty

---

## Login & Register (`/login`, `/register`)

- [ ] "FarmLink" h1 inside the card is redundant — Navbar already shows it. Replace with a more descriptive heading or remove
- [ ] No password visibility toggle on password fields
- [ ] Register: no confirmation that the phone format is correct (07XXXXXXXX) — add inline format hint

---

## Home (`/`)

- [ ] Logged-in users see a flash of the landing page before redirect — loading state should suppress the hero render, not just show a spinner
- [ ] No `og:image` or meta description — add for sharing/SEO (thesis appendix screenshots)
