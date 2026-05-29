# Features Implementation Guide

Detailed breakdown of how each of the 4 developer features works end-to-end,
from the API call to the UI screen.

---

## Feature 1: Geolocation — Discover Nearby Farmers

**What it does:** Buyer opens the app, grants location permission, and sees
produce listed by farmers within a set radius (default 10km), sorted by distance.

### How it works

**Frontend:**
1. On app load, request location permission using `expo-location`
2. Get device coordinates: `Location.getCurrentPositionAsync()`
3. Send coordinates to the backend: `GET /api/products/nearby?lat=X&lng=Y&radius=10`
4. Render results on a React Native Maps `MapView` with farmer pins
5. Also render a flat list below the map for non-map browsing

**Backend:**
1. Receive `lat`, `lng`, `radius` as query params
2. Query MongoDB using `$near` geospatial operator:
```js
Product.find({
  isAvailable: true,
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: radius * 1000  // convert km to metres
    }
  }
})
```
3. Return sorted array (nearest first) with distance calculated

**Database requirement:** `2dsphere` index on `products.location`

---

## Feature 2: Shopping Cart + M-Pesa Payment

**What it does:** Buyer adds items to a cart from one or multiple farmers,
reviews the cart, and pays via M-Pesa STK Push (a prompt sent to their phone).

### How it works

**Frontend (Cart):**
1. Cart state managed in React Context (persisted to AsyncStorage)
2. Buyer taps "Add to Cart" on any product detail screen
3. Cart icon in header shows item count badge
4. Cart screen shows itemised list with subtotals and grand total
5. "Checkout" button opens confirmation screen with M-Pesa prompt

**Frontend (Payment):**
1. Buyer enters M-Pesa phone number (pre-filled from profile)
2. Taps "Pay KES X via M-Pesa"
3. App calls `POST /api/payments/initiate`
4. STK Push arrives on buyer's phone — buyer enters M-Pesa PIN
5. App polls `GET /api/payments/status/:orderId` every 5 seconds
6. On `paymentStatus: "paid"` → show success screen and clear cart

**Backend (Initiate):**
1. Generate Safaricom OAuth token from consumer key + secret
2. Build STK Push request with shortcode, passkey, amount, phone, order reference
3. POST to `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
4. Save pending payment record against the order

**Backend (Callback):**
1. Safaricom POSTs result to `/api/payments/callback`
2. If `ResultCode === 0` (success): update order `paymentStatus` to `"paid"`,
   save M-Pesa transaction ID, trigger notification to farmer
3. If failed: update `paymentStatus` to `"failed"`, notify buyer

---

## Feature 3: Real-Time Order Tracking

**What it does:** After payment, buyer can see the current status of their
order as the farmer updates it — Placed → Confirmed → Dispatched → Delivered.

### How it works

**Frontend:**
1. Order detail screen shows a visual status stepper (4 steps)
2. Each step highlights as status progresses
3. Screen auto-refreshes every 30 seconds (polling `GET /api/orders/:id`)
4. Push notification sent at each status change via Expo Push

**Backend:**
1. Farmer taps "Update Status" in their orders screen
2. App calls `PUT /api/orders/:id/status` with new status
3. Backend validates status transition (cannot skip from Placed → Delivered)
4. Saves new status with timestamp to `statusHistory` array
5. Creates a notification document for the buyer
6. Sends Expo push notification to buyer's device token
7. Optionally sends Twilio SMS for critical updates (Dispatched, Delivered)

**Status transition rules:**
```
pending → confirmed   (farmer action)
confirmed → dispatched (farmer action)
dispatched → delivered (farmer action)
pending → cancelled   (buyer action, before confirmation only)
```

---

## Feature 4: Seller Rating and Review System

**What it does:** After an order is marked Delivered, the buyer can leave a
1–5 star rating and written comment for the farmer. Each farmer's average
rating is displayed on their profile and product listings.

### How it works

**Frontend:**
1. Order detail screen shows "Leave a Review" button only when `status === "delivered"`
   and no review exists yet for that order
2. Review screen: star selector (1–5) + text input for comment
3. Submit calls `POST /api/reviews`
4. Farmer profile and product cards show average star rating

**Backend (Submit):**
1. Validate: order must be delivered, buyer must be the order's buyer,
   no existing review for this order (enforced by unique index on `order` field)
2. Save review document
3. Recalculate farmer's average rating:
```js
const result = await Review.aggregate([
  { $match: { farmer: farmerId } },
  { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
])
```
4. Store `avgRating` and `reviewCount` on the farmer's user document for fast reads

**Backend (Read):**
- `GET /api/reviews/farmer/:farmerId` returns paginated review list
- `GET /api/reviews/farmer/:farmerId/rating` returns `{ avgRating, reviewCount }`
- Product listings include `farmer.avgRating` in the response via a Mongoose populate

---

## Screen List (for screenshots in Chapter 7)

### Farmer Screens
- [ ] Splash / Onboarding
- [ ] Register (role = farmer)
- [ ] Login
- [ ] Home Dashboard (earnings summary, recent orders)
- [ ] My Listings (list view)
- [ ] Add New Listing (form with image upload)
- [ ] Edit Listing
- [ ] Incoming Orders (list)
- [ ] Order Detail + Update Status
- [ ] My Reviews
- [ ] Profile / Settings

### Buyer Screens
- [ ] Splash / Onboarding
- [ ] Register (role = buyer)
- [ ] Login
- [ ] Home Feed (nearby produce, categories)
- [ ] Map View (farmers near me)
- [ ] Product Detail
- [ ] Farmer Profile (with rating)
- [ ] Shopping Cart
- [ ] Checkout + M-Pesa payment
- [ ] Payment Success
- [ ] My Orders (list)
- [ ] Order Tracking (status stepper)
- [ ] Leave a Review
- [ ] Profile / Settings

### Admin Screens
- [ ] Login
- [ ] Dashboard (user stats, sales summary)
- [ ] User Management
- [ ] Listings Management
- [ ] Reports
