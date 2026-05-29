# Figure 4.2 — FarmLink Use Case Diagram

**Report location:** Section 4.4.2  
**Caption:** Figure 4.2 — FarmLink Use Case Diagram  
**Diagram type:** UML Use Case Diagram  
**Recommended PlantUML type:** `@startuml` with `actor` and `usecase` notation

---

## Actors

| Actor | Type | Description |
|---|---|---|
| Farmer | Primary actor | Smallholder farmer who lists produce and fulfils orders |
| Buyer | Primary actor | Consumer who discovers and purchases produce |
| Administrator | Primary actor | Platform manager who moderates users and listings |
| Safaricom M-Pesa | External system | Processes M-Pesa STK Push payment requests |
| Twilio | External system | Delivers SMS notifications to users |

---

## Use Cases by Actor

### Farmer
- UC01: Register account (role = farmer)
- UC02: Login
- UC03: Create produce listing
- UC04: Edit produce listing
- UC05: Delete produce listing
- UC06: View incoming orders
- UC07: Confirm order
- UC08: Mark order as dispatched
- UC09: Mark order as delivered
- UC10: View earnings dashboard
- UC11: View buyer reviews
- UC12: Update profile and location

### Buyer
- UC13: Register account (role = buyer)
- UC14: Login
- UC15: Browse produce by category
- UC16: Search produce by geolocation
- UC17: View farmer profile and rating
- UC18: Add produce to cart
- UC19: Place order
- UC20: Pay via M-Pesa
- UC21: Track order status
- UC22: Cancel pending order
- UC23: Leave rating and review
- UC24: View order history

### Administrator
- UC25: Login (admin role)
- UC26: View all users
- UC27: Verify farmer account
- UC28: Deactivate user account
- UC29: Moderate produce listings
- UC30: Remove a listing
- UC31: View sales report
- UC32: View user registration report

### Safaricom M-Pesa (External)
- UC33: Receive STK Push request from FarmLink backend
- UC34: Send payment callback to FarmLink backend

### Twilio (External)
- UC35: Receive SMS send request from FarmLink backend
- UC36: Deliver SMS to farmer or buyer phone number

---

## Include / Extend relationships

- UC20 (Pay via M-Pesa) **includes** UC33 (Receive STK Push request)
- UC33 **includes** UC34 (Send payment callback)
- UC19 (Place order) **includes** UC20 (Pay via M-Pesa)
- UC09 (Mark order as delivered) **extends** UC23 (Leave rating and review) — review prompt triggered on delivery
- UC03/UC04 (Create/Edit listing) — subject to UC29 (Moderate produce listings) by Admin
