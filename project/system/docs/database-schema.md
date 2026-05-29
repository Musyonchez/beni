# Database Schema

All collections are stored in MongoDB. Each document uses MongoDB's default
`_id` (ObjectId) as the primary key.

---

## users
Stores all registered accounts. Role determines access level.

```js
{
  _id: ObjectId,
  name: String,           // full name
  email: String,          // unique, indexed
  password: String,       // bcrypt hashed
  phone: String,          // e.g. +254712345678
  role: String,           // "farmer" | "buyer" | "admin"
  profilePhoto: String,   // URL to uploaded image
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number] // [longitude, latitude]
  },
  isVerified: Boolean,    // verified seller badge
  createdAt: Date,
  updatedAt: Date
}
// Index: email (unique), location (2dsphere)
```

---

## products
Each listing created by a farmer. Supports geolocation-based discovery.

```js
{
  _id: ObjectId,
  farmer: ObjectId,       // ref: users
  title: String,          // e.g. "Fresh Tomatoes"
  category: String,       // "vegetables" | "fruits" | "grains" | "livestock" | "inputs"
  description: String,
  price: Number,          // price per unit in KES
  unit: String,           // "kg" | "crate" | "bunch" | "piece" | "litre"
  quantity: Number,       // available stock
  images: [String],       // array of image URLs
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number] // [longitude, latitude]
  },
  locationName: String,   // human-readable e.g. "Limuru, Kiambu"
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
// Index: location (2dsphere), category, isAvailable
```

---

## orders
Tracks a buyer's purchase from placement to delivery.

```js
{
  _id: ObjectId,
  buyer: ObjectId,        // ref: users
  farmer: ObjectId,       // ref: users
  items: [
    {
      product: ObjectId,  // ref: products
      title: String,      // snapshot of product title at time of order
      quantity: Number,
      pricePerUnit: Number,
      unit: String,
      subtotal: Number
    }
  ],
  totalAmount: Number,    // sum of all item subtotals in KES
  status: String,         // "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled"
  paymentStatus: String,  // "unpaid" | "paid" | "refunded"
  paymentRef: String,     // M-Pesa transaction ID
  deliveryNote: String,   // optional buyer note
  statusHistory: [
    {
      status: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
// Index: buyer, farmer, status
```

---

## reviews
One review per completed order. Buyer reviews the farmer.

```js
{
  _id: ObjectId,
  order: ObjectId,        // ref: orders (unique — one review per order)
  buyer: ObjectId,        // ref: users
  farmer: ObjectId,       // ref: users
  rating: Number,         // 1 to 5
  comment: String,
  createdAt: Date
}
// Index: farmer (for calculating average rating), order (unique)
```

---

## notifications
In-app and SMS notifications tied to order events.

```js
{
  _id: ObjectId,
  recipient: ObjectId,    // ref: users
  type: String,           // "order_placed" | "order_confirmed" | "order_dispatched"
                          // | "order_delivered" | "new_review" | "payment_received"
  title: String,
  message: String,
  relatedOrder: ObjectId, // ref: orders (optional)
  isRead: Boolean,
  createdAt: Date
}
// Index: recipient, isRead
```

---

## Relationships Summary

```
users (farmer) ──< products
users (buyer)  ──< orders >── users (farmer)
orders         ──< items  >── products
orders         ──1 reviews
users          ──< notifications
```

---

## Indexes to Create

```js
// Geolocation — enables $near queries for the discovery feature
db.users.createIndex({ location: "2dsphere" })
db.products.createIndex({ location: "2dsphere" })

// Performance
db.products.createIndex({ category: 1, isAvailable: 1 })
db.orders.createIndex({ buyer: 1, status: 1 })
db.orders.createIndex({ farmer: 1, status: 1 })
db.reviews.createIndex({ farmer: 1 })
db.reviews.createIndex({ order: 1 }, { unique: true })
db.notifications.createIndex({ recipient: 1, isRead: 1 })
```
