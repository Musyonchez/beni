# Figure 4.5 — FarmLink Context Diagram (DFD Level 0)

**Report location:** Section 4.4.5.1  
**Caption:** Figure 4.5 — FarmLink Context Diagram (Level 0)  
**Diagram type:** Data Flow Diagram — Level 0 (Context Diagram)  
**Recommended PlantUML type:** `@startuml` with rectangle/arrow notation, or use a DFD-style layout

---

## Description

The context diagram shows FarmLink as a single central process surrounded by
all external entities. It does not show internal sub-processes — only what
data flows in and out of the system boundary.

---

## Central Process

- **FarmLink System** (single bubble / process in the centre)

---

## External Entities and Data Flows

### Farmer
**Data INTO FarmLink:**
- Registration details (name, email, phone, password, role)
- Produce listing data (title, category, price, quantity, photos, location)
- Order status updates (confirmed / dispatched / delivered)
- Profile updates

**Data OUT of FarmLink to Farmer:**
- Account confirmation
- Listing confirmation
- Order notifications (new order placed by buyer)
- Earnings data

---

### Buyer
**Data INTO FarmLink:**
- Registration details
- Search queries (category, location coordinates)
- Cart and order data (product IDs, quantities)
- M-Pesa phone number for payment
- Review data (rating, comment)

**Data OUT of FarmLink to Buyer:**
- Account confirmation
- Search results (nearby produce listings)
- Order confirmation
- Order tracking status updates
- Payment result (success / failure)

---

### Administrator
**Data INTO FarmLink:**
- Login credentials
- Moderation actions (verify farmer, deactivate user, remove listing)
- Report requests

**Data OUT of FarmLink to Administrator:**
- User lists
- Produce listing lists
- Sales reports
- User registration reports

---

### Safaricom (M-Pesa)
**Data INTO FarmLink:**
- Payment callback (transaction ID, result code, amount, phone)

**Data OUT of FarmLink to Safaricom:**
- STK Push request (amount, buyer phone number, account reference, description)

---

### Twilio
**Data INTO FarmLink:**
- SMS delivery status callback

**Data OUT of FarmLink to Twilio:**
- SMS message content and recipient phone number
