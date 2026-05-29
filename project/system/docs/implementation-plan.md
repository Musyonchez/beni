# Implementation Plan

Step-by-step build order for FarmLink. Each phase produces a working,
testable increment. Complete phases in order — later phases depend on earlier ones.

---

## Phase 1: Project Scaffold

**Goal:** Both repos boot and connect to each other.

### 1.1 Backend
1. `mkdir backend && cd backend && npm init -y`
2. Install dependencies:
   ```bash
   npm install express mongoose jsonwebtoken bcryptjs express-validator dotenv cors
   npm install --save-dev nodemon
   ```
3. Create folder structure:
   ```
   backend/
   ├── src/
   │   ├── config/       # db.js (Mongoose connection)
   │   ├── middleware/   # auth.js, validate.js, error.js
   │   ├── models/       # User.js, Product.js, Order.js, Review.js, Notification.js
   │   ├── routes/       # auth.js, products.js, orders.js, payments.js, reviews.js, notifications.js, admin.js
   │   └── index.js      # Express app entry point
   ├── .env
   └── package.json
   ```
4. `src/index.js` — mount all routes, CORS, JSON body parser, error handler
5. `src/config/db.js` — `mongoose.connect(process.env.MONGO_URI)`
6. Add `"dev": "nodemon src/index.js"` script
7. Fill `.env` from the template in [tech-stack.md](tech-stack.md)
8. `npm run dev` → server starts on port 5000

### 1.2 Frontend
1. `npx create-expo-app frontend --template blank`
2. Install dependencies:
   ```bash
   npx expo install expo-location expo-notifications @react-native-async-storage/async-storage react-native-maps
   npm install axios @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   npx expo install react-native-screens react-native-safe-area-context
   ```
3. Create folder structure:
   ```
   frontend/
   ├── src/
   │   ├── api/          # client.js (Axios instance with base URL)
   │   ├── context/      # AuthContext.js, CartContext.js
   │   ├── navigation/   # RootNavigator.js, FarmerNavigator.js, BuyerNavigator.js
   │   ├── screens/      # (one file per screen, grouped by role)
   │   └── components/   # shared UI components
   ├── App.js
   └── app.json
   ```
4. `src/api/client.js` — Axios instance pointing at `http://localhost:5000/api`
5. `npx expo start` → QR code visible, app loads on device

**Checkpoint:** Server returns `{"message":"API running"}` at `GET /api`. App renders a blank screen without crashing.

---

## Phase 2: Authentication

**Goal:** Users can register, log in, and stay logged in across app restarts.

### 2.1 Backend
1. **Model** `src/models/User.js` — schema from [database-schema.md](database-schema.md), add `bcryptjs` pre-save hook for password hashing
2. **Middleware** `src/middleware/auth.js` — verify JWT, attach `req.user`
3. **Routes** `src/routes/auth.js`:
   - `POST /auth/register` — validate input, create user, return token
   - `POST /auth/login` — compare password, return token + user
   - `GET /auth/me` — protected, return current user
   - `PUT /auth/me` — protected, update profile fields
   - `PUT /auth/password` — protected, change password

### 2.2 Frontend
1. **AuthContext** — holds `user`, `token`; exposes `login()`, `register()`, `logout()`; persists token to AsyncStorage on login, restores on app start
2. **Screens:** Register, Login
3. **RootNavigator** — if `token` exists → role-based app navigator; else → Auth stack
4. Test with Postman first, then wire up the screens

**Checkpoint:** Register a farmer and a buyer via the app. Close and reopen — both stay logged in. `GET /auth/me` returns correct profile.

---

## Phase 3: Product Listings (Farmer Side)

**Goal:** Farmers can create, edit, and delete produce listings.

### 3.1 Backend
1. **Model** `src/models/Product.js` — schema from [database-schema.md](database-schema.md), `2dsphere` index on `location`
2. **Routes** `src/routes/products.js`:
   - `GET /products` — public, filter by category/available, paginate
   - `GET /products/my` — farmer-only, own listings
   - `GET /products/:id` — public, single listing
   - `POST /products` — farmer-only, create listing
   - `PUT /products/:id` — farmer-only (owner check), update
   - `DELETE /products/:id` — farmer-only (owner check), remove
3. Role middleware: `requireRole("farmer")`

### 3.2 Frontend (Farmer Screens)
1. **My Listings** screen — flat list of own products, link to edit
2. **Add Listing** form — title, category, price, unit, quantity, description, location (use `expo-location` to auto-fill coordinates), location name
3. **Edit Listing** screen — same form, pre-filled
4. Wire to `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

**Checkpoint:** Farmer creates a listing with their GPS coordinates. Listing appears in their "My Listings" screen. Confirm document exists in MongoDB Compass.

---

## Phase 4: Product Discovery (Buyer Side)

**Goal:** Buyers can browse and search listings; geolocation shows nearby produce.

### 4.1 Backend
1. Add `GET /products/nearby` route — `$near` geospatial query as described in [features.md](features.md)
2. Populate `farmer` fields (name, avgRating, profilePhoto) on list responses via Mongoose `.populate()`

### 4.2 Frontend (Buyer Screens)
1. **Home Feed** — category filter chips + paginated product list
2. **Map View** — request location permission, call `/products/nearby`, render pins on `MapView`
3. **Product Detail** — images, price, quantity, farmer name + rating, "Add to Cart" button

**Checkpoint:** Open the app as a buyer, grant location. Map shows at least one nearby listing pinned at the farmer's coordinates.

---

## Phase 5: Cart and Orders

**Goal:** Buyers can build a cart and place orders that farmers can see.

### 5.1 Backend
1. **Model** `src/models/Order.js`
2. **Routes** `src/routes/orders.js`:
   - `POST /orders` — buyer places order; validate product availability, deduct stock
   - `GET /orders/my` — buyer's order history
   - `GET /orders/farmer` — farmer's received orders
   - `GET /orders/:id` — detail view for either party
   - `PUT /orders/:id/status` — farmer updates status (enforce transition rules)
   - `PUT /orders/:id/cancel` — buyer cancels pending order

### 5.2 Frontend
1. **CartContext** — items array, `addItem()`, `removeItem()`, `clearCart()`; persisted to AsyncStorage
2. **Cart Screen** — item list, subtotals, grand total, "Checkout" button
3. **Farmer: Incoming Orders** list + **Order Detail** with status update button

**Checkpoint:** Buyer places an order. Farmer sees it under "Incoming Orders". Farmer marks it Confirmed. Buyer's order screen updates.

---

## Phase 6: M-Pesa Payments

**Goal:** Buyer pays via M-Pesa STK Push from within the app.

### 6.1 Backend
1. **Routes** `src/routes/payments.js`:
   - `POST /payments/initiate` — generate Daraja OAuth token, send STK Push (sandbox)
   - `POST /payments/callback` — receive Safaricom webhook, update order `paymentStatus`
   - `GET /payments/status/:orderId` — poll endpoint for frontend
2. Use `ngrok http 5000` to expose the callback URL during development

### 6.2 Frontend
1. **Checkout Screen** — show total, phone field (pre-filled), "Pay via M-Pesa" button
2. Call `POST /payments/initiate` → show "Check your phone" message
3. Poll `GET /payments/status/:orderId` every 5 seconds
4. On `"paid"` → navigate to Payment Success screen, clear cart

**Checkpoint:** Complete an end-to-end sandbox payment. Order `paymentStatus` changes to `"paid"` in the database.

---

## Phase 7: Notifications

**Goal:** Buyers get notified when order status changes; farmers when paid.

### 7.1 Backend
1. **Model** `src/models/Notification.js`
2. Helper `src/utils/notify.js` — creates notification document + sends Expo push (and optionally Twilio SMS for Dispatched/Delivered)
3. Call `notify()` inside:
   - `PUT /orders/:id/status` — notify buyer
   - `POST /payments/callback` (on success) — notify farmer

### 7.2 Frontend
1. **Routes** `src/routes/notifications.js` — GET list, mark read, mark all read
2. **Notifications Screen** — unread badge on tab icon, list of messages
3. Register Expo push token on login: `Notifications.getExpoPushTokenAsync()`, send to `PUT /auth/me`

**Checkpoint:** Farmer marks order Dispatched. Buyer receives a push notification within seconds.

---

## Phase 8: Reviews

**Goal:** Buyers rate farmers after delivery; ratings appear on profiles and listings.

### 8.1 Backend
1. **Model** `src/models/Review.js` — unique index on `order`
2. **Routes** `src/routes/reviews.js` — as specified in [api-endpoints.md](api-endpoints.md)
3. After saving a review, run aggregation pipeline to update `user.avgRating` and `user.reviewCount`

### 8.2 Frontend
1. **Order Detail** — show "Leave a Review" button only when `status === "delivered"` and no review exists
2. **Review Screen** — star selector + comment field
3. **Farmer Profile** — display star rating and review count
4. Product cards include star rating pulled from populated farmer field

**Checkpoint:** Buyer submits a 5-star review. Farmer profile immediately shows updated average rating.

---

## Phase 9: Admin Panel

**Goal:** Admin can manage users, listings, and view reports.

### 9.1 Backend
1. **Routes** `src/routes/admin.js` — all endpoints from [api-endpoints.md](api-endpoints.md)
2. `requireRole("admin")` middleware on all admin routes
3. Seed one admin user directly in MongoDB Compass (set `role: "admin"`)

### 9.2 Frontend
1. Admin role gets its own navigator after login
2. **Screens:** Dashboard (user + sales stats), User Management (verify/deactivate), Listings Management, Reports

**Checkpoint:** Admin verifies a farmer account. Verified badge appears on farmer's listings.

---

## Phase 10: Polish and Documentation

- Add loading states and error messages to all screens
- Handle edge cases: empty states, network errors, expired tokens (auto-logout)
- Capture screenshots for all screens listed in [features.md](features.md)
- Write Chapter 7 (Implementation) using screenshots and code excerpts
- Final end-to-end test: register farmer → add listing → register buyer → discover listing → place order → pay → track → review

---

## Summary Table

| Phase | Focus | Key Deliverable |
|---|---|---|
| 1 | Scaffold | Both apps boot, API returns 200 |
| 2 | Auth | Register, login, persistent session |
| 3 | Listings | Farmer CRUD for produce |
| 4 | Discovery | Buyer browses and finds nearby produce |
| 5 | Orders | Cart, checkout flow, farmer order management |
| 6 | Payments | M-Pesa STK Push end-to-end |
| 7 | Notifications | Push + SMS on order events |
| 8 | Reviews | Star ratings on farmers and listings |
| 9 | Admin | User and listing management panel |
| 10 | Polish | Screenshots, error handling, Chapter 7 |
