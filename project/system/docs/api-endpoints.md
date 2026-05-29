# API Endpoints

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>` header.
All responses return JSON. Error format: `{ "message": "error description" }`

---

## Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user (farmer or buyer) |
| POST | `/auth/login` | No | Login and receive JWT token |
| GET | `/auth/me` | Yes | Get current logged-in user profile |
| PUT | `/auth/me` | Yes | Update profile (name, phone, location, photo) |
| PUT | `/auth/password` | Yes | Change password |

**POST /auth/register — body:**
```json
{
  "name": "Jane Wanjiku",
  "email": "jane@example.com",
  "password": "securepass123",
  "phone": "+254712345678",
  "role": "farmer"
}
```

**POST /auth/login — response:**
```json
{
  "token": "eyJhbGc...",
  "user": { "_id": "...", "name": "Jane Wanjiku", "role": "farmer" }
}
```

---

## Products — `/api/products`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/products` | No | Any | Get all available listings (with filters) |
| GET | `/products/nearby` | No | Any | Get products near a coordinate (geolocation) |
| GET | `/products/:id` | No | Any | Get single product detail |
| POST | `/products` | Yes | Farmer | Create a new listing |
| PUT | `/products/:id` | Yes | Farmer (owner) | Update a listing |
| DELETE | `/products/:id` | Yes | Farmer (owner) | Remove a listing |
| GET | `/products/my` | Yes | Farmer | Get all listings by logged-in farmer |

**GET /products — query params:**
```
?category=vegetables
?available=true
?page=1&limit=10
```

**GET /products/nearby — query params:**
```
?lat=-1.2921&lng=36.8219&radius=10   (radius in km)
```

**POST /products — body:**
```json
{
  "title": "Fresh Tomatoes",
  "category": "vegetables",
  "description": "Freshly harvested, Roma variety",
  "price": 80,
  "unit": "kg",
  "quantity": 50,
  "images": ["https://..."],
  "location": { "coordinates": [36.65, -1.05] },
  "locationName": "Limuru, Kiambu"
}
```

---

## Orders — `/api/orders`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/orders` | Yes | Buyer | Place a new order |
| GET | `/orders/my` | Yes | Buyer | Get all orders placed by buyer |
| GET | `/orders/farmer` | Yes | Farmer | Get all orders received by farmer |
| GET | `/orders/:id` | Yes | Buyer/Farmer | Get single order detail |
| PUT | `/orders/:id/status` | Yes | Farmer | Update order status |
| PUT | `/orders/:id/cancel` | Yes | Buyer | Cancel a pending order |

**POST /orders — body:**
```json
{
  "farmer": "farmer_user_id",
  "items": [
    { "product": "product_id", "quantity": 5 }
  ],
  "deliveryNote": "Please call before delivery"
}
```

**PUT /orders/:id/status — body:**
```json
{ "status": "confirmed" }
// status options: "confirmed" | "dispatched" | "delivered" | "cancelled"
```

---

## Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/initiate` | Yes | Trigger M-Pesa STK Push to buyer's phone |
| POST | `/payments/callback` | No | Safaricom webhook — receives payment result |
| GET | `/payments/status/:orderId` | Yes | Check payment status for an order |

**POST /payments/initiate — body:**
```json
{
  "orderId": "order_id",
  "phone": "254712345678"   // without +, without leading 0
}
```

---

## Reviews — `/api/reviews`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/reviews` | Yes | Buyer | Submit a review for a completed order |
| GET | `/reviews/farmer/:farmerId` | No | Any | Get all reviews for a farmer |
| GET | `/reviews/farmer/:farmerId/rating` | No | Any | Get farmer's average rating |

**POST /reviews — body:**
```json
{
  "orderId": "order_id",
  "rating": 4,
  "comment": "Fresh produce, delivered on time."
}
```

---

## Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | Get all notifications for logged-in user |
| PUT | `/notifications/:id/read` | Yes | Mark a notification as read |
| PUT | `/notifications/read-all` | Yes | Mark all notifications as read |

---

## Admin — `/api/admin`

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/admin/users` | Yes | Admin | Get all users |
| PUT | `/admin/users/:id/verify` | Yes | Admin | Grant verified badge to a farmer |
| DELETE | `/admin/users/:id` | Yes | Admin | Deactivate a user account |
| GET | `/admin/products` | Yes | Admin | Get all listings including unavailable |
| DELETE | `/admin/products/:id` | Yes | Admin | Remove a listing |
| GET | `/admin/reports/sales` | Yes | Admin | Sales summary report |
| GET | `/admin/reports/users` | Yes | Admin | User registration stats |

---

## HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | OK — successful GET, PUT |
| 201 | Created — successful POST |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — valid token but wrong role |
| 404 | Not Found — resource does not exist |
| 500 | Internal Server Error |
