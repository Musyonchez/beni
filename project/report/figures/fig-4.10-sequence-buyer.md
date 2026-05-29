# Figure 4.10 — Buyer Sequence Diagram

**Report location:** Section 4.4.7.2  
**Caption:** Figure 4.10 — Buyer Sequence Diagram  
**Diagram type:** UML Sequence Diagram  
**Recommended PlantUML type:** `@startuml` with sequence diagram notation

---

## Participants (in order, left to right)

1. **Buyer** (actor)
2. **Mobile Client** (FarmLink mobile app)
3. **Backend API** (Node.js + Express)
4. **MongoDB** (database)
5. **Safaricom** (M-Pesa Daraja API — external system)

---

## Sequence of Messages

### Step 1 — Login

| # | From | To | Message |
|---|---|---|---|
| 1 | Buyer | Mobile Client | Open App, tap Login |
| 2 | Mobile Client | Backend API | POST /api/auth/login {email, password} |
| 3 | Backend API | MongoDB | find user by email, compare password |
| 4 | MongoDB | Backend API | return user document |
| 5 | Backend API | Mobile Client | 200 OK + JWT token |

---

### Step 2 — Discover Nearby Produce

| # | From | To | Message | Note |
|---|---|---|---|---|
| 6 | Buyer | Mobile Client | Enable GPS / tap "Nearby" | |
| 7 | Mobile Client | Backend API | GET /api/products/nearby?lat=X&lng=Y&radius=10000 (Bearer JWT) | |
| 8 | Backend API | MongoDB | find products with $near GeoJSON query | Uses 2dsphere index |
| 9 | MongoDB | Backend API | return products array (sorted by distance) | |
| 10 | Backend API | Mobile Client | 200 OK + nearby products | |
| 11 | Mobile Client | Buyer | Nearby produce listings displayed on map/list | |

---

### Step 3 — Add to Cart

| # | From | To | Message | Note |
|---|---|---|---|---|
| 12 | Buyer | Mobile Client | Tap product → tap "Add to Cart" | |
| 13 | Mobile Client | Mobile Client | Cart stored locally in AsyncStorage | No API call |

---

### Step 4 — Place Order

| # | From | To | Message |
|---|---|---|---|
| 14 | Buyer | Mobile Client | Tap "Place Order" |
| 15 | Mobile Client | Backend API | POST /api/orders {buyer, farmer, items[], totalAmount} (Bearer JWT) |
| 16 | Backend API | MongoDB | insertOne order document (status: pending, paymentStatus: unpaid) |
| 17 | MongoDB | Backend API | return new order document with _id |
| 18 | Backend API | Mobile Client | 201 Created + order object |

---

### Step 5 — Pay via M-Pesa

| # | From | To | Message | Note |
|---|---|---|---|---|
| 19 | Buyer | Mobile Client | Tap "Pay via M-Pesa", confirm phone number | |
| 20 | Mobile Client | Backend API | POST /api/payments/initiate {orderId, phone, amount} (Bearer JWT) | |
| 21 | Backend API | Safaricom | STK Push request (amount, phone, accountRef, description) | Daraja API |
| 22 | Safaricom | Buyer | STK Push prompt appears on buyer's phone | |
| 23 | Buyer | Safaricom | Buyer enters M-Pesa PIN | |
| 24 | Safaricom | Backend API | Payment callback (ResultCode, MpesaReceiptNumber, Amount) | Webhook POST |
| 25 | Backend API | MongoDB | update order: paymentStatus=paid, paymentRef=txID | |
| 26 | Backend API | MongoDB | insert notification for farmer (new paid order) | |
| 27 | Backend API | Mobile Client | Payment success response | |
| 28 | Mobile Client | Buyer | "Payment successful" confirmation shown | |

---

### Step 6 — Track Order

| # | From | To | Message |
|---|---|---|---|
| 29 | Buyer | Mobile Client | Tap "Track Order" |
| 30 | Mobile Client | Backend API | GET /api/orders/:id (Bearer JWT) |
| 31 | Backend API | MongoDB | findOne order by _id (validate buyer = requester) |
| 32 | MongoDB | Backend API | return order with current status + statusHistory |
| 33 | Backend API | Mobile Client | 200 OK + order object |
| 34 | Mobile Client | Buyer | Current order status displayed |

---

### Step 7 — Leave Review (after delivery)

| # | From | To | Message |
|---|---|---|---|
| 35 | Buyer | Mobile Client | Tap "Leave Review", enter rating (1–5) + comment |
| 36 | Mobile Client | Backend API | POST /api/reviews {orderId, rating, comment} (Bearer JWT) |
| 37 | Backend API | MongoDB | insertOne review document |
| 38 | Backend API | MongoDB | update farmer's avgRating field (recalculate) |
| 39 | Backend API | Mobile Client | 201 Created + review object |
| 40 | Mobile Client | Buyer | "Thank you for your review" shown |
