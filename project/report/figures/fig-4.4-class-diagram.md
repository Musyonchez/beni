# Figure 4.4 — FarmLink Class Diagram

**Report location:** Section 4.4.4  
**Caption:** Figure 4.4 — FarmLink Class Diagram  
**Diagram type:** UML Class Diagram  
**Recommended PlantUML type:** `@startuml` with `class` notation

---

## Classes and Attributes

### User (base class)
**Attributes:**
- _id : ObjectId
- name : String
- email : String
- password : String
- phone : String
- role : String  *(values: farmer / buyer / admin)*
- profilePhoto : String
- location : GeoJSON
- isVerified : Boolean
- createdAt : Date

**Methods:**
- register()
- login()
- updateProfile()
- changePassword()

---

### Farmer (extends User)
**Additional attributes:**
- avgRating : Number
- reviewCount : Number

**Methods:**
- listProduct()
- viewOrders()
- updateOrderStatus()

---

### Buyer (extends User)
**Methods:**
- browse()
- addToCart()
- placeOrder()

---

### Admin (extends User)
**Methods:**
- manageUsers()
- moderateListings()
- viewReports()

---

### Product
**Attributes:**
- _id : ObjectId
- farmer : ObjectId  *(ref → User)*
- title : String
- category : String
- description : String
- price : Number
- unit : String
- quantity : Number
- images : String[]
- location : GeoJSON Point
- locationName : String
- isAvailable : Boolean
- createdAt : Date

**Methods:**
- create()
- update()
- delete()
- findNearby()

---

### Order
**Attributes:**
- _id : ObjectId
- buyer : ObjectId  *(ref → User)*
- farmer : ObjectId  *(ref → User)*
- items : OrderItem[]  *(embedded)*
- totalAmount : Number
- status : String  *(pending / confirmed / dispatched / delivered / cancelled)*
- paymentStatus : String  *(unpaid / paid)*
- paymentRef : String
- statusHistory : Object[]
- createdAt : Date

**Methods:**
- place()
- updateStatus()
- cancel()

---

### OrderItem (embedded in Order — not a standalone collection)
**Attributes:**
- product : ObjectId  *(ref → Product)*
- title : String
- quantity : Number
- pricePerUnit : Number
- unit : String
- subtotal : Number

---

### Review
**Attributes:**
- _id : ObjectId
- order : ObjectId  *(ref → Order, unique)*
- buyer : ObjectId  *(ref → User)*
- farmer : ObjectId  *(ref → User)*
- rating : Number  *(1–5)*
- comment : String
- createdAt : Date

**Methods:**
- submit()
- getAvgRating()

---

### Notification
**Attributes:**
- _id : ObjectId
- recipient : ObjectId  *(ref → User)*
- type : String
- title : String
- message : String
- relatedOrder : ObjectId  *(ref → Order)*
- isRead : Boolean
- createdAt : Date

**Methods:**
- send()
- markRead()

---

## Relationships

| From | To | Type | Multiplicity | Note |
|---|---|---|---|---|
| User | Farmer | Generalisation (extends) | — | Farmer is a specialised User |
| User | Buyer | Generalisation (extends) | — | Buyer is a specialised User |
| User | Admin | Generalisation (extends) | — | Admin is a specialised User |
| Farmer | Product | Association | 1 to many | A farmer creates many products |
| Buyer | Order | Association | 1 to many | A buyer places many orders |
| Farmer | Order | Association | 1 to many | A farmer receives many orders |
| Order | OrderItem | Composition | 1 to many | OrderItems are embedded in Order |
| Order | Review | Association | 1 to 1 | One completed order → at most one review |
| User | Notification | Association | 1 to many | A user receives many notifications |
