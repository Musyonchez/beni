# Figure 4.10 â€” Buyer Sequence Diagram

**Report location:** Section 4.4.7.2  
**Caption:** Figure 4.10 â€” Buyer Sequence Diagram  
**Diagram type:** UML Sequence Diagram  
**Recommended PlantUML type:** `@startuml` with sequence diagram notation

---

## Participants (in order, left to right)

1. **Buyer** (actor)
2. **Web Client** (FarmLink web application)
3. **Backend API** (Node.js + Express)
4. **MongoDB** (database)
5. **Safaricom** (M-Pesa Daraja API â€” external system)

---

## Sequence of Messages

### Step 1 â€” Login

| # | From | To | Message |
|---|---|---|---|
| 1 | Buyer | Web Client | Open App, tap Login |
| 2 | Web Client | Backend API | POST /api/auth/login {email, password} |
| 3 | Backend API | MongoDB | find user by email, compare password |
| 4 | MongoDB | Backend API | return user document |
| 5 | Backend API | Web Client | 200 OK + JWT token |

---

### Step 2 â€” Discover Nearby Produce

| # | From | To | Message | Note |
|---|---|---|---|---|
| 6 | Buyer | Web Client | Enable GPS / tap "Nearby" | |
| 7 | Web Client | Backend API | GET /api/products/nearby?lat=X&lng=Y&radius=10000 (Bearer JWT) | |
| 8 | Backend API | MongoDB | find products with $near GeoJSON query | Uses 2dsphere index |
| 9 | MongoDB | Backend API | return products array (sorted by distance) | |
| 10 | Backend API | Web Client | 200 OK + nearby products | |
| 11 | Web Client | Buyer | Nearby produce listings displayed on map/list | |

---

### Step 3 â€” Add to Cart

| # | From | To | Message | Note |
|---|---|---|---|---|
| 12 | Buyer | Web Client | Tap product â†’ tap "Add to Cart" | |
| 13 | Web Client | Web Client | Cart stored locally in localStorage | No API call |

---

### Step 4 â€” Place Order

| # | From | To | Message |
|---|---|---|---|
| 14 | Buyer | Web Client | Tap "Place Order" |
| 15 | Web Client | Backend API | POST /api/orders {buyer, farmer, items[], totalAmount} (Bearer JWT) |
| 16 | Backend API | MongoDB | insertOne order document (status: pending, paymentStatus: unpaid) |
| 17 | MongoDB | Backend API | return new order document with _id |
| 18 | Backend API | Web Client | 201 Created + order object |

---

### Step 5 â€” Pay via M-Pesa

| # | From | To | Message | Note |
|---|---|---|---|---|
| 19 | Buyer | Web Client | Tap "Pay via M-Pesa", confirm phone number | |
| 20 | Web Client | Backend API | POST /api/payments/initiate {orderId, phone, amount} (Bearer JWT) | |
| 21 | Backend API | Safaricom | STK Push request (amount, phone, accountRef, description) | Daraja API |
| 22 | Safaricom | Buyer | STK Push prompt appears on buyer's phone | |
| 23 | Buyer | Safaricom | Buyer enters M-Pesa PIN | |
| 24 | Safaricom | Backend API | Payment callback (ResultCode, MpesaReceiptNumber, Amount) | Webhook POST |
| 25 | Backend API | MongoDB | update order: paymentStatus=paid, paymentRef=txID | |
| 26 | Backend API | MongoDB | insert notification for farmer (new paid order) | |
| 27 | Backend API | Web Client | Payment success response | |
| 28 | Web Client | Buyer | "Payment successful" confirmation shown | |

---

### Step 6 â€” Track Order

| # | From | To | Message |
|---|---|---|---|
| 29 | Buyer | Web Client | Tap "Track Order" |
| 30 | Web Client | Backend API | GET /api/orders/:id (Bearer JWT) |
| 31 | Backend API | MongoDB | findOne order by _id (validate buyer = requester) |
| 32 | MongoDB | Backend API | return order with current status + statusHistory |
| 33 | Backend API | Web Client | 200 OK + order object |
| 34 | Web Client | Buyer | Current order status displayed |

---

### Step 7 â€” Leave Review (after delivery)

| # | From | To | Message |
|---|---|---|---|
| 35 | Buyer | Web Client | Tap "Leave Review", enter rating (1â€“5) + comment |
| 36 | Web Client | Backend API | POST /api/reviews {orderId, rating, comment} (Bearer JWT) |
| 37 | Backend API | MongoDB | insertOne review document |
| 38 | Backend API | MongoDB | update farmer's avgRating field (recalculate) |
| 39 | Backend API | Web Client | 201 Created + review object |
| 40 | Web Client | Buyer | "Thank you for your review" shown |



