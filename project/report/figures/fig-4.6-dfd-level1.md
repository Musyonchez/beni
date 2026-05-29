# Figure 4.6 — FarmLink Level 1 Data Flow Diagram

**Report location:** Section 4.4.5.2  
**Caption:** Figure 4.6 — FarmLink Level 1 Data Flow Diagram  
**Diagram type:** Data Flow Diagram — Level 1  
**Recommended PlantUML type:** `@startuml` with rectangle/arrow notation

---

## Description

The Level 1 DFD decomposes the FarmLink system into 6 sub-processes, showing
the data stores and the flows between processes and external entities.

---

## External Entities (same as Level 0)

- Farmer
- Buyer
- Administrator
- Safaricom (M-Pesa)
- Twilio

---

## Sub-Processes

| ID | Process Name | Description |
|---|---|---|
| P1 | User Management | Registration, login, profile updates, admin user management |
| P2 | Product Management | Create/read/update/delete produce listings; geolocation search |
| P3 | Order Management | Order placement, status transitions, order history |
| P4 | Payment Processing | M-Pesa STK Push initiation and Daraja API callback |
| P5 | Review Management | Review submission, farmer rating calculation, retrieval |
| P6 | Notification Service | Push notification and SMS dispatch on order events |

---

## Data Stores

| ID | Store Name | Contents |
|---|---|---|
| D1 | Users | All registered farmer, buyer, and admin accounts |
| D2 | Products | All produce listings with geolocation data |
| D3 | Orders | All orders with status history and payment records |
| D4 | Reviews | All submitted ratings and comments |
| D5 | Notifications | All in-app notification records |

---

## Data Flows

| From | To | Data |
|---|---|---|
| Farmer | P1 | Registration details, profile updates |
| P1 | D1 | User record (write) |
| P1 | Farmer | Account confirmation |
| Buyer | P1 | Registration details, login credentials |
| P1 | Buyer | Account confirmation, JWT session token |
| Administrator | P1 | Moderation actions (verify, deactivate) |
| P1 | Administrator | User lists |
| Farmer | P2 | Listing data (title, price, qty, location, photos) |
| P2 | D2 | Product record (write/update/delete) |
| Buyer | P2 | Search query (category, GPS coordinates) |
| P2 | D2 | Geospatial query ($near) |
| D2 | P2 | Nearby product records |
| P2 | Buyer | Search results |
| Buyer | P3 | Cart data, order placement request |
| P3 | D3 | Order record (write) |
| P3 | P4 | Payment initiation request |
| P3 | D3 | Order status update |
| P3 | P6 | Trigger notification (to farmer on new order) |
| P3 | Buyer | Order confirmation, tracking status |
| Farmer | P3 | Status update (confirmed / dispatched / delivered) |
| P4 | Safaricom | STK Push request |
| Safaricom | P4 | Payment callback (result) |
| P4 | P3 | Payment result (success/failure) |
| Buyer | P5 | Review submission (rating, comment) |
| P5 | D4 | Review record (write) |
| P5 | D1 | Update farmer avgRating field |
| P6 | D5 | Notification record (write) |
| P6 | Twilio | SMS message + recipient phone |
| P6 | Farmer | Push notification (new order) |
| P6 | Buyer | Push notification (order status change) |
| Administrator | P2 | Moderation action (remove listing) |
| Administrator | P3 | View reports request |
| P3 | Administrator | Sales report data |
