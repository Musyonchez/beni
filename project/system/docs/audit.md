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

### ✅ B1 — Cart icon uses wrong lookup key
**Fixed in commit `5acf989`** — added `category` to `CartItem`, now used for icon lookup.

### ✅ B2 — No stock deduction on order placement
**Fixed in commit `efc55fb`** — stock check + `$inc` deduction added to order creation.

### ✅ B3 — Product creation fails when location is empty
**Fixed in commit `5edebf0`** — location and locationName are now optional in both model and route.

### ✅ B4 — M-Pesa callback can't find order
**Fixed in commit `pending`** — added `reference` field to Order model (last 6 hex chars of `_id`, set via pre-save hook). Callback now queries `{ reference: suffix }` instead of the broken `$regex` on ObjectId.

### ✅ B5 — Map nearby radius is 20,000× too large
**Fixed in commit `e2771fb`** — changed `radius: 20000` to `radius: 20` (km).

### ✅ B6 — Express 4 async errors bypass errorHandler
**Fixed in commit `e2771fb`** — added `express-async-errors` to `index.ts`.

### ✅ B7 — Out-of-stock products can still be added to cart
**Fixed in commit `29378b7`** — button replaced with "Out of Stock" pill when `quantity === 0`.

---

## 🟠 Missing Features (gaps users will notice)

### ✅ F1 — No profile / account page
**Fixed in commit `pending`** — added `/account` page with profile edit (name, phone) and password change forms. `AuthContext` gains `patchUser()` to sync name back to the Navbar after save. Account link added to Navbar for all logged-in users.

### ✅ F2 — AuthContext User type missing fields
**Fixed in commit `pending`** — `User` interface extended with `phone?`, `isVerified?`, `avgRating?`, `profilePhoto?`. These are returned by login/register and now flow through to components.

### F3 — Browse search only covers loaded page
**File:** `frontend/src/app/browse/page.tsx` lines 48–51  
Search filters `products` array which is only the current page (12 items). If 50 products exist, searching only covers the first 12 loaded.  
**Fix:** Either (a) pass `search` as a query param to the backend and add text search there, or (b) show a note "Searching loaded products only — load more to search all."

### F4 — No mobile-friendly Navbar
**File:** `frontend/src/components/Navbar.tsx`  
The nav links are all in a single flex row. On small screens (phone) they'll wrap or overflow.  
**Fix:** Add a hamburger menu that toggles a dropdown on mobile (`sm:hidden` / `hidden sm:flex` pattern).

### ✅ F5 — No role guard on protected routes
**Fixed in commit `pending`** — `AuthGuard` now accepts `role?: 'buyer' | 'farmer'`; farmer layout uses `role="farmer"`, cart and orders layouts use `role="buyer"`. Wrong-role users are redirected to their home page.

### ✅ F6 — Admin redirect goes to /admin which doesn't exist
**Fixed in commit `pending`** — admin role now redirects to `/browse` until an admin dashboard is built.

---

## 🟡 UX Issues (minor but visible)

### ✅ U1 — KES amounts not formatted with commas
**Fixed in commit `pending`** — all KES amounts across orders, cart, farmer, browse, map, product detail, and MapView now use `.toLocaleString()`.

### ✅ U2 — Cart + button doesn't respect stock on cart page
**Fixed in commit `pending`** — added optional `maxQuantity` to `CartItem`, populated from `product.quantity` on add-to-cart, used to disable the `+` button on cart page when at the limit.

### ✅ U3 — Product detail back button goes blank if accessed directly
**Fixed in commit `pending`** — added a persistent "Browse all products" link alongside the ← Back button.

### ✅ U4 — Farmer dashboard earnings shows zeros when orders failed to load
**Fixed in commit `pending`** — Earnings tab now shows the same red error banner as the Orders tab when `ordersError` is set.

### ✅ U5 — Phone validation rejects valid Kenyan formats
**Fixed in commit `pending`** — regex updated from `/^07\d{8}$/` to `/^0[17]\d{8}$/` to accept both `07XXXXXXXX` and `01XXXXXXXX` formats.

### ✅ U6 — Farmer cannot browse or access map
**Fixed with F1 commit** — Browse link added to farmer nav in Navbar.

### ✅ U7 — Cart category icon placeholder broken
Fixed with B1 (commit `5acf989`).

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

### ✅ C3 — Order status update allows skipping steps
**Fixed in commit `pending`** — added a `NEXT` map check: status must advance exactly one step (pending→confirmed→ready→delivered). Any other transition returns 400.

### ✅ C4 — errorHandler doesn't distinguish Mongoose validation errors
**Fixed in commit `pending`** — errorHandler now returns 400 for `ValidationError` (with joined field messages), `CastError` (invalid ObjectId), and duplicate key errors (11000). Other errors still return 500 or `err.status` if set.

### C5 — reviews and admin routes are all 501 stubs
**Files:** `routes/reviews.ts`, `routes/admin.ts`  
These mount and register routes but all return 501. Not a bug but noted as future work (Phase 8 and 9).

---

## Summary Count

| Severity | Count | Fixed |
|---|---|---|
| 🔴 Critical bugs | 7 | 7 ✅ |
| 🟠 Missing features | 6 | 4 ✅ |
| 🟡 UX issues | 8 | 7 ✅ |
| 🔵 Code quality | 5 | 2 ✅ |
| **Total** | **26** | **20 done** |

---

## Fix Priority Recommendation

1. ~~**B6**~~ ✅ `express-async-errors`
2. ~~**B5**~~ ✅ Map radius
3. ~~**B2**~~ ✅ Stock deduction
4. ~~**B1 + U7**~~ ✅ Cart icon category field
5. ~~**B7**~~ ✅ Out-of-stock add to cart
6. ~~**B3**~~ ✅ Location optional on backend
7. ~~**F5**~~ ✅ Role guard on protected routes
8. ~~**F6**~~ ✅ Admin redirect to non-existent /admin page
9. ~~**F2**~~ ✅ Extend User type (phone/isVerified lost after login)
10. ~~**U1**~~ ✅ KES formatting consistency
11. ~~**U5**~~ ✅ Phone regex (blocks valid 01X numbers)
12. ~~**F1**~~ ✅ Profile/account page (also fixed U6 — farmer Browse link)
13. ~~**B4**~~ ✅ M-Pesa callback fix
14. ~~**C3**~~ ✅ Order status sequence enforcement
15. Everything else
