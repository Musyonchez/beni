# Farmer Dashboard — Build Plan

The farmer page is currently a placeholder. This doc covers everything that needs to be built.

Backend routes are already done — this is purely frontend work.

---

## Layout

Tabbed interface inside the existing farmer page (`/farmer`).  
Keep the welcome header card at the top, then 3 tabs below:

- **🌿 My Listings**
- **📦 Orders**
- **💰 Earnings**

---

## Tab 1 — My Listings

**API:** `GET /api/products/my` → `getMyProducts()`

### What to build

- Product list — each row shows:
  - Category emoji icon
  - Title, location, price/unit, quantity left
  - **Live / Hidden** toggle button → calls `updateProduct(id, { isAvailable: !current })`
  - **Edit** button → opens the form pre-filled
  - **Delete** button → inline confirm "Sure? Yes / No" then calls `deleteProduct(id)`

- **Add Listing** button (top right) → opens the form empty

### Add / Edit Form (inline, above the list)

Fields:
| Field | Type | Notes |
|---|---|---|
| Title | text | required |
| Category | select | vegetables, fruits, grains, livestock, inputs |
| Unit | select | kg, crate, bunch, piece, litre |
| Price (KES) | number | required |
| Quantity | number | required |
| Description | textarea | required |
| Location Name | text | e.g. "Kiambu, Nairobi" |
| Latitude | number | e.g. -1.2921 |
| Longitude | number | e.g. 36.8219 |

On submit:
- Create: `POST /api/products` → `createProduct(payload)`
- Edit: `PUT /api/products/:id` → `updateProduct(id, payload)`
- Location must be sent as `{ type: 'Point', coordinates: [lng, lat] }` (note: lng first)

### Empty state
Show emoji + "No listings yet. Click Add Listing to create your first product."

---

## Tab 2 — Orders (Incoming)

**API:** `GET /api/orders/farmer` → `getFarmerOrders()`

### What to build

- Order card for each incoming order showing:
  - Order ID (last 6 chars), status badge (colour-coded)
  - Buyer name + phone
  - Delivery address + notes (if any)
  - Relative timestamp ("2h ago")
  - Item list (title × qty × unit = KES subtotal)
  - Total + payment status (Paid / Unpaid)
  - **Action button** — advances status:
    - pending → `Confirm Order`
    - confirmed → `Mark as Ready`
    - ready → `Mark Delivered`
    - delivered / cancelled → no button

  Action calls: `PUT /api/orders/:id/status` → `updateOrderStatus(id, nextStatus)`

### Status progression
```
pending → confirmed → ready → delivered
```
Cancelled orders show the badge only, no button.

### Empty state
"No orders yet. Orders from buyers will appear here."

---

## Tab 3 — Earnings

**API:** reuse orders already loaded (no new endpoint needed)

### What to build

4 stat cards:
| Card | Value |
|---|---|
| Total Revenue | Sum of `total` where `status === 'delivered' && paymentStatus === 'paid'` |
| Completed | Count of `status === 'delivered'` orders |
| Active | Count of `status === 'confirmed'` or `'ready'` |
| Pending | Count of `status === 'pending'` |

Below the cards: list of delivered orders (title, buyer name, date, total, paid/unpaid badge).

### Empty state
"No completed orders yet. Revenue will appear here once orders are delivered."

---

## API functions needed (already added to orders.ts)

```typescript
getFarmerOrders()           // GET /api/orders/farmer
updateOrderStatus(id, status) // PUT /api/orders/:id/status
```

`getMyProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()` already existed in `products.ts`.

---

## Notes

- All tabs lazy-load: listings on mount, orders/earnings on tab switch
- Delete confirm and status update use inline UI (no alert/confirm dialogs)
- The available toggle is instant (optimistic update)
- Coordinates: longitude comes FIRST in the array `[lng, lat]` — this is GeoJSON standard
