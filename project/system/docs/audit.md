# System Audit — Gaps & Improvements

Scan progress: **COMPLETE** (all files read)  
Files scanned: backend models, all routes, all middleware (auth, error), mpesa service, index.ts, all frontend pages (home, login, register, browse, product detail, cart, orders, farmer, map), all contexts (Auth, Cart), all components (Navbar, Spinner, AuthGuard, MapView), all API clients, both package.json files

---

## Scan Progress Tracker

| Area | Status |
|---|---|
| Backend — models (User, Product, Order) | ✅ Done |
| Backend — routes (auth, products, orders, payments, reviews, admin) | ✅ Done |
| Backend — middleware (auth, error), index.ts | ✅ Done |
| Frontend — contexts (Auth, Cart) | ✅ Done |
| Frontend — components (Navbar, Spinner, AuthGuard) | ✅ Done |
| Frontend — pages (browse, product detail, cart, orders, farmer, map, login, register, home) | ✅ Done |
| Frontend — API clients (client, orders, products, payments) | ✅ Done |

---

## 🔴 Critical Bugs (breaks functionality)

### B1 — Cart icon uses wrong lookup key
**File:** `frontend/src/app/(protected)/cart/page.tsx` line 79  
`CATEGORY_ICON[item.unit]` — uses `unit` (kg, litre, etc.) as the key instead of `category`.  
`CartItem` doesn't store a `category` field, so this always falls through to `🌿`.  
**Fix:** Add `category` field to `CartItem` interface and `CartContext`, populate it when adding item in `products/[id]/page.tsx`.

### B2 — No stock deduction on order placement
**File:** `backend/src/routes/orders.ts` lines 44–68  
When an order is created, product quantities are never decremented. A buyer can order 100 units of a product that only has 10 left.  
**Fix:** After creating the order, run `Product.updateMany` with `$inc: { quantity: -qty }` for each item. Also add a stock-check before creating the order (compare requested qty vs available).

### B3 — Product creation fails silently when location is empty
**File:** `backend/src/routes/products.ts` line 101–104 + `frontend/src/app/(protected)/farmer/page.tsx`  
Backend validates `location.coordinates` as a required array. Farmer form only sends `location` if both lat and lng are filled. If left empty, the backend returns 400 but the frontend `formError` won't catch the specific field — it'll show generic "Save failed."  
**Fix option A:** Make location optional in the backend (remove the validator, wrap in optional check).  
**Fix option B:** Mark lat/lng as required in the form with a visible error.  
Recommended: Fix option A — many farmers may not have precise coordinates.

### B4 — M-Pesa callback can't find order
**File:** `backend/src/routes/payments.ts` lines 70–78  
```js
Order.findOne({ _id: { $regex: suffix + '$', $options: 'i' } })
```
MongoDB ObjectId fields cannot be queried with `$regex` — this query will never match. Orders will never be marked as paid via callback.  
**Fix:** Store the order's `_id` suffix (last 6 chars) as a separate `reference` field on the Order model, index it, and query by that field in the callback.

### B5 — Map nearby radius is 20,000× too large
**File:** `frontend/src/app/map/page.tsx` line 23  
`getNearbyProducts({ lat, lng, radius: 20000 })` — frontend sends `20000`.  
Backend multiplies by 1000: `$maxDistance: radius * 1000` → `20,000,000 metres = 20,000 km`. This returns every product in the database, not just nearby ones.  
**Fix:** Pass `radius: 20` (km) instead of `20000`.

### B6 — Express 4 + no try/catch = unhandled promise rejections
**File:** `backend/package.json` + all route files  
Express version is `4.19.2`. Express 4 does NOT automatically catch errors from async route handlers — they become unhandled promise rejections and bypass `errorHandler`. None of the route handlers have try/catch blocks.  
**Fix:** Add `express-async-errors` package (`npm install express-async-errors`) and `require('express-async-errors')` at the top of `index.ts`. Zero code changes to routes needed.

### B7 — Out-of-stock products can still be added to cart
**File:** `frontend/src/app/products/[id]/page.tsx` lines 136–139  
The `Add to Cart` button is never disabled when `product.quantity === 0`. The `+` button is capped but the Add button itself has no guard.  
**Fix:** Disable and grey out "Add to Cart" when `product.quantity === 0`, show "Out of Stock" label instead.

---

## 🟠 Missing Features (gaps users will notice)

### F1 — No profile / account page
Backend has `PUT /api/auth/me` (update name, phone, location) and `PUT /api/auth/password` but no frontend page uses them. Users cannot update their profile or change their password after registering.  
**Fix:** Add `/account` page accessible from Navbar for logged-in users (both roles). Form fields: name, phone, location name. Separate section for password change.

### F2 — AuthContext User type missing fields
**File:** `frontend/src/context/AuthContext.tsx` line 6–9  
`User` interface only has `{ id, name, email, role }`. The login/register API returns `phone`, `isVerified`, `avgRating`, `profilePhoto` but they are discarded. This means the farmer dashboard can't show verified badge, and a future account page can't pre-fill phone.  
**Fix:** Extend `User` interface to include `phone`, `isVerified`, `avgRating`, `profilePhoto` (all optional).

### F3 — Browse search only covers loaded page
**File:** `frontend/src/app/browse/page.tsx` lines 48–51  
Search filters `products` array which is only the current page (12 items). If 50 products exist, searching only covers the first 12 loaded.  
**Fix:** Either (a) pass `search` as a query param to the backend and add text search there, or (b) show a note "Searching loaded products only — load more to search all."

### F4 — No mobile-friendly Navbar
**File:** `frontend/src/components/Navbar.tsx`  
The nav links are all in a single flex row. On small screens (phone) they'll wrap or overflow.  
**Fix:** Add a hamburger menu that toggles a dropdown on mobile (`sm:hidden` / `hidden sm:flex` pattern).

### F5 — No role guard on protected routes
**File:** `frontend/src/components/AuthGuard.tsx`  
`AuthGuard` only checks if a user is logged in — it doesn't check role. A buyer can navigate to `/farmer` and call farmer APIs (which return 403 from backend, so data is empty, but it's confusing). A farmer can navigate to `/cart` and `/orders` (cart is localStorage so it works, but placing an order would fail with 403).  
**Fix:** Accept an optional `role` prop on `AuthGuard` and redirect to appropriate page if role doesn't match. Use in `(protected)/farmer` layout and `(protected)/layout`.

### F6 — Admin redirect goes to /admin which doesn't exist
**File:** `frontend/src/app/page.tsx` line 16  
`if (user?.role === 'admin') router.replace('/admin')` — there is no `/admin` route. Any admin user will be redirected to a 404.  
**Fix:** Either redirect admin to `/browse` for now, or note this needs to be built before any admin accounts are created.

---

## 🟡 UX Issues (minor but visible)

### U1 — KES amounts not formatted with commas
**Files:** `orders/page.tsx` line 136, `cart/page.tsx` line 101, `farmer/page.tsx` various  
`KES {order.total}` shows `KES 1500` not `KES 1,500`. Some places already use `.toLocaleString()`, others don't. Inconsistent.  
**Fix:** Wrap all KES amounts in a helper: `const kes = (n: number) => n.toLocaleString('en-KE')`.

### U2 — Cart + button doesn't respect stock on cart page
**File:** `frontend/src/app/(protected)/cart/page.tsx` line 89  
Product detail page caps quantity at `product.quantity`, but on the cart page the `+` button calls `updateQuantity(id, quantity + 1)` with no upper bound.  
**Fix:** Store `maxQuantity` in `CartItem`, use it as the cap in cart page.

### U3 — Product detail back button goes blank if accessed directly
**File:** `frontend/src/app/products/[id]/page.tsx` line 67  
`router.back()` with no history sends user to a blank tab.  
**Fix:** `router.back()` is fine, but add `router.push('/browse')` as a visible fallback link ("← Browse").

### U4 — Farmer dashboard earnings shows zeros when orders failed to load
**File:** `frontend/src/app/(protected)/farmer/page.tsx` — Earnings tab  
If order loading fails, stat cards show 0/0/0/0 with no indication of error.  
**Fix:** Show `ordersError` banner on Earnings tab the same way it shows on Orders tab.

### U5 — Phone validation rejects valid Kenyan formats
**File:** `frontend/src/app/register/page.tsx` line 9  
Regex `/^07\d{8}$/` only accepts `07XXXXXXXX`. Valid Safaricom/Airtel numbers starting with `01XXXXXXXX` are rejected. Backend accepts any non-empty phone string — frontend is more restrictive than it needs to be.  
**Fix:** Update regex to `/^0[17]\d{8}$/` to allow both `07` and `01` prefixes.

### U6 — Farmer cannot browse or access map
**File:** `frontend/src/components/Navbar.tsx` lines 23–34  
Farmers only see "Dashboard" and "Logout". They have no way to browse products or see the map (e.g. to check competitor prices or their own listing's map pin).  
**Fix:** Add Browse and Nearby links to farmer nav, or at minimum Browse.

### U7 — Cart category icon placeholder broken (related to B1)
Already covered in B1 — all cart items show 🌿 instead of their category emoji.

### U8 — MapView marker icons loaded from CDN
**File:** `frontend/src/components/MapView.tsx` lines 8–13  
Leaflet marker icons are loaded from `unpkg.com`. Map pins disappear if unpkg is slow or down.  
**Fix:** Copy the 3 icon files into `/public` and reference them locally.

---

## 🔵 Backend / Code Quality

### C1 — CORS wide open
**File:** `backend/src/index.ts` line 16  
`app.use(cors())` with no origin restriction. Fine for development, but should restrict to the frontend URL for production.  
**Fix (prod):** `app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))`.

### C2 — No try/catch around DB operations in routes
All route handlers call Mongoose directly with no try/catch. Unhandled promise rejections go to `errorHandler` via Express's error propagation — which works, but only if Express catches the async error. Express 5 handles this automatically; Express 4 does not without `express-async-errors` or manual wraps.  
Check which Express version is installed. If v4, wrap handlers or add `require('express-async-errors')`.

### C3 — Order status update allows skipping steps
**File:** `backend/src/routes/orders.ts` line 114  
`body('status').isIn(['confirmed', 'ready', 'delivered'])` — a farmer can jump from `pending` directly to `delivered`, skipping `confirmed` and `ready`.  
**Fix:** Validate that status follows the sequence: only allow the next step based on `order.status`.

### C4 — errorHandler doesn't distinguish Mongoose validation errors
**File:** `backend/src/middleware/error.ts`  
All errors return 500 with `err.message`. Mongoose validation errors (wrong type, missing required field) should return 400, not 500. Currently a bad request to the DB returns the same status as a server crash.  
**Fix:** Check `err.name === 'ValidationError'` and return 400 with a cleaner message.

### C5 — reviews and admin routes are all 501 stubs
**Files:** `routes/reviews.ts`, `routes/admin.ts`  
These mount and register routes but all return 501. Not a bug but noted as future work (Phase 8 and 9).

---

## Summary Count

| Severity | Count |
|---|---|
| 🔴 Critical bugs | 7 |
| 🟠 Missing features | 6 |
| 🟡 UX issues | 8 |
| 🔵 Code quality | 5 |
| **Total** | **26** |

---

## Fix Priority Recommendation

1. **B6** — `express-async-errors` (any Mongo error currently crashes silently)
2. **B5** — Map radius (currently searches the whole world)
3. **B2** — Stock deduction (orders can oversell)
4. **B1 + U7** — Cart icon category field (visible broken UI)
5. **B7** — Out-of-stock add to cart
6. **B3** — Location optional on backend (farmers can't create listings without coordinates)
7. **F5** — Role guard on protected routes
8. **F6** — Admin redirect to non-existent /admin page
9. **F1** — Profile/account page
10. **F2** — Extend User type (phone/isVerified lost after login)
11. **U1** — KES formatting consistency
12. **U5** — Phone regex (blocks valid 01X numbers)
13. **B4** — M-Pesa callback fix (needed before payment goes live)
14. **C3** — Order status sequence enforcement
15. Everything else
