# Figure 4.8 — FarmLink Entity Relationship Diagram

**Report location:** Section 4.4.6  
**Caption:** Figure 4.8 — FarmLink Entity Relationship Diagram  
**Diagram type:** Entity Relationship Diagram (document-oriented, MongoDB)  
**Recommended PlantUML type:** `@startuml` with `entity` notation

---

## Note on MongoDB ERD

FarmLink uses MongoDB (NoSQL). Relationships are expressed through referenced
ObjectIds (not foreign keys). One entity — OrderItem — is embedded inside
Orders (not a separate collection). Indicate this distinction in the diagram
(e.g. dashed border or "embedded" label for OrderItem).

---

## Entities and Attributes

### USERS
| Attribute | Type | Constraint |
|---|---|---|
| _id | ObjectId | Primary Key |
| name | String | Required |
| email | String | Required, Unique |
| password | String | Required (bcrypt hashed) |
| phone | String | Required |
| role | String | Required — enum: farmer / buyer / admin |
| profilePhoto | String | Optional |
| location | GeoJSON Point | Optional |
| isVerified | Boolean | Default: false |
| createdAt | Date | Auto |

---

### PRODUCTS
| Attribute | Type | Constraint |
|---|---|---|
| _id | ObjectId | Primary Key |
| farmer | ObjectId | FK → USERS |
| title | String | Required |
| category | String | Required |
| description | String | Optional |
| price | Number | Required |
| unit | String | Required |
| quantity | Number | Required |
| images | String[] | Optional |
| location | GeoJSON Point | Required |
| locationName | String | Required |
| isAvailable | Boolean | Default: true |
| createdAt | Date | Auto |

---

### ORDERS
| Attribute | Type | Constraint |
|---|---|---|
| _id | ObjectId | Primary Key |
| buyer | ObjectId | FK → USERS |
| farmer | ObjectId | FK → USERS |
| items | OrderItem[] | Embedded array — Required |
| totalAmount | Number | Required |
| status | String | Default: pending |
| paymentStatus | String | Default: unpaid |
| paymentRef | String | Optional (M-Pesa transaction ID) |
| statusHistory | Object[] | Auto-appended on status change |
| createdAt | Date | Auto |

---

### ORDER_ITEMS (embedded inside ORDERS — not a separate collection)
| Attribute | Type | Constraint |
|---|---|---|
| product | ObjectId | FK → PRODUCTS |
| title | String | Snapshot at order time |
| quantity | Number | Required |
| pricePerUnit | Number | Snapshot at order time |
| unit | String | Snapshot at order time |
| subtotal | Number | Calculated |

---

### REVIEWS
| Attribute | Type | Constraint |
|---|---|---|
| _id | ObjectId | Primary Key |
| order | ObjectId | FK → ORDERS, Unique |
| buyer | ObjectId | FK → USERS |
| farmer | ObjectId | FK → USERS |
| rating | Number | Required — 1 to 5 |
| comment | String | Optional |
| createdAt | Date | Auto |

---

### NOTIFICATIONS
| Attribute | Type | Constraint |
|---|---|---|
| _id | ObjectId | Primary Key |
| recipient | ObjectId | FK → USERS |
| type | String | Required |
| title | String | Required |
| message | String | Required |
| relatedOrder | ObjectId | FK → ORDERS (optional) |
| isRead | Boolean | Default: false |
| createdAt | Date | Auto |

---

## Relationships

| Relationship | Type | Description |
|---|---|---|
| USERS → PRODUCTS | One-to-Many | One farmer creates many product listings |
| USERS (buyer) → ORDERS | One-to-Many | One buyer places many orders |
| USERS (farmer) → ORDERS | One-to-Many | One farmer receives many orders |
| ORDERS → ORDER_ITEMS | One-to-Many (embedded) | One order contains many embedded items |
| PRODUCTS → ORDER_ITEMS | One-to-Many | One product appears in many order items |
| ORDERS → REVIEWS | One-to-One | One completed order has at most one review |
| USERS → NOTIFICATIONS | One-to-Many | One user receives many notifications |
| ORDERS → NOTIFICATIONS | One-to-Many | One order triggers multiple notifications |
