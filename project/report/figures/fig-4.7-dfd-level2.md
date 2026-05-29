# Figure 4.7 — FarmLink Level 2 DFD: Order Management

**Report location:** Section 4.4.5.3  
**Caption:** Figure 4.7 — FarmLink Level 2 DFD: Order Management  
**Diagram type:** Data Flow Diagram — Level 2 (decomposition of P3)  
**Recommended PlantUML type:** `@startuml` with rectangle/arrow notation

---

## Description

Level 2 decomposes P3 (Order Management) from the Level 1 DFD into its
6 constituent sub-processes. This is the most complex process in the system.

---

## External Entities referenced in this diagram

- Buyer
- Farmer
- P4 (Payment Processing — from Level 1)
- P6 (Notification Service — from Level 1)

---

## Data Stores referenced in this diagram

- D2 — Products
- D3 — Orders
- D4 — Reviews

---

## Sub-Processes of P3

### P3.1 — Place Order
**Input:** Cart data from Buyer; Product data from D2  
**Output:** Order record written to D3; Payment request sent to P4  
**Description:** Validates cart contents against current product availability
in D2, calculates total amount, creates the order document in D3 with
status = "pending", and triggers the payment flow via P4.

---

### P3.2 — Confirm Payment
**Input:** Payment result (success/failure) from P4  
**Output:** Order paymentStatus updated in D3; Notification to Farmer via P6  
**Description:** On receiving a successful callback from P4, updates the
order's paymentStatus to "paid" and stores the M-Pesa transaction ID.
Triggers P6 to notify the farmer of the new order.

---

### P3.3 — Update Order Status
**Input:** Status update from Farmer (confirmed / dispatched / delivered)  
**Output:** Order status updated in D3; Notification to Buyer via P6  
**Description:** Validates that the new status is a legal forward transition
(pending → confirmed → dispatched → delivered), updates the order document
in D3, appends the change to statusHistory, and triggers P6 to notify the buyer.

---

### P3.4 — Cancel Order
**Input:** Cancellation request from Buyer (only allowed when status = pending)  
**Output:** Order status set to "cancelled" in D3; Notification to Farmer via P6  
**Description:** Validates the order is still in "pending" state, updates
status to "cancelled" in D3, and triggers P6 to alert the farmer.

---

### P3.5 — Retrieve Order
**Input:** Order ID from Buyer or Farmer  
**Output:** Order data read from D3, returned to the requester  
**Description:** Fetches the order document from D3 by ID, validates that
the requesting user is either the buyer or farmer on that order (role check),
and returns the full order with current status and statusHistory.

---

### P3.6 — Trigger Review
**Input:** Delivered status update from P3.3  
**Output:** Review prompt triggered to Buyer; Review record written to D4  
**Description:** When P3.3 sets order status to "delivered", P3.6 sends a
review prompt notification to the buyer via P6. When the buyer submits a
review, it is saved to D4 and the farmer's avgRating field in D1 is updated.
