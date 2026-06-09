# UI/UX Polish Backlog

All items completed. ✅

---

## Global

- [x] Consistent page background — root layout sets `bg-gray-100` on `<body>`, all pages inherit it
- [x] Spinner is copy-pasted across every page — extracted `<Spinner />` component
- [x] No `<title>` / `metadata` per page — added per-route `layout.tsx` files with titles; root layout uses `title.template`

---

## Browse (`/browse`)

- [x] No search bar — added text input to filter by product name
- [x] No product count — shows "24 listings" or "3 results for 'tomato'"
- [x] Category chips have no icons — emoji added per category
- [x] Product card image placeholder is a plain grey div — replaced with green tinted div + category emoji
- [x] No stock/availability indicator on cards — "Low stock" badge if quantity < 5
- [x] Page background inconsistent — fixed (inherits root)

---

## Product Detail (`/products/[id]`)

- [x] No category badge visible — pill badge added next to location line
- [x] Images array has multiple entries but only first is shown — thumbnail row added
- [x] Available quantity is small grey text — prominent with ⚠ orange warning when low
- [x] Page background inconsistent — fixed

---

## Cart (`/cart`)

- [x] Same-farmer validation only triggers on submit — orange warning banner shown immediately in cart
- [x] No item image or icon in cart rows — category emoji icon added
- [x] "Notes to farmer" field label is placeholder only — visible label added above field
- [x] Page background inconsistent — fixed

---

## Orders (`/orders`)

- [x] `alert()` used for pay response — replaced with inline success/error message per order card
- [x] `confirm()` used for cancel — replaced with inline "Cancel order? Yes / No" row
- [x] Raw date format — relative timestamps ("2h ago", "3d ago")
- [x] No order count in header — shows "3 orders"
- [x] Page background inconsistent — fixed

---

## Map (`/map`)

- [x] Selected product popup has no image — thumbnail added if available
- [x] No product count indicator — "12 listings nearby" badge added
- [x] Error state has no fallback — "Browse all products" link added to error banner

---

## Farmer Dashboard (`/farmer`)

- [x] Pure placeholder text — replaced with welcome card + 3 coming-soon section cards (Listings, Orders, Earnings)
- [x] No visual structure — card grid layout added

---

## Login & Register (`/login`, `/register`)

- [x] "FarmLink" h1 inside the card is redundant — replaced with descriptive headings ("Sign in", "Create account")
- [x] No password visibility toggle — Show/Hide toggle added to both pages
- [x] Register: no phone format confirmation — inline red error + border highlight for invalid format

---

## Home (`/`)

- [x] Logged-in users see a flash of the landing page — spinner shown while auth check runs or redirect is in flight
- [x] No `og:image` or meta description — OG metadata added in root layout
