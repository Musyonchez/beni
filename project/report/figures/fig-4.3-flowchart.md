# Figure 4.3 — FarmLink Buyer Purchase Flowchart

**Report location:** Section 4.4.3  
**Caption:** Figure 4.3 — FarmLink Buyer Purchase Flowchart  
**Diagram type:** Flowchart / Activity diagram  
**Recommended PlantUML type:** `@startuml` with activity diagram notation (`start`, `if`, `endif`, `stop`)

---

## Description

This flowchart shows the complete end-to-end buyer purchase flow — from
opening the app through to submitting a review after delivery.

---

## Steps in order

1. **START**
2. Open FarmLink App
3. **Decision:** User Registered?
   - **No →** Register (enter name, email, password, phone, role = buyer) → Account Created → continue to step 4
   - **Yes →** continue to step 4
4. Login (email + password)
5. **Decision:** Credentials Valid?
   - **No →** Show error message → Return to Login (back to step 4)
   - **Yes →** continue
6. Home Feed Loaded (nearby produce listings and categories displayed)
7. Browse / Search Produce
   - Option A: Browse by Category → filter listings
   - Option B: Search by Location → enable GPS → show nearby farmers on map
8. Select Product → View Product Detail Page
9. Add to Cart
10. **Decision:** Continue Shopping?
    - **Yes →** Return to step 7
    - **No →** continue
11. View Cart (items, quantities, total in KES)
12. Proceed to Checkout
13. Confirm M-Pesa phone number
14. Tap "Pay via M-Pesa"
15. STK Push sent to buyer's phone by Safaricom
16. Buyer enters M-Pesa PIN on their phone
17. **Decision:** Payment Successful?
    - **No →** Show "Payment Failed" → Option to retry (back to step 14)
    - **Yes →** continue
18. Order Placed → Farmer notified (push notification + SMS via Twilio)
19. Order Tracking Screen shown (status: Pending)
20. Farmer Confirms Order → Status changes to: Confirmed → Buyer notified
21. Farmer Dispatches Order → Status changes to: Dispatched → Buyer notified
22. Order Delivered → Status changes to: Delivered → Buyer notified
23. Review Prompt shown to buyer
24. Buyer enters rating (1–5 stars) + optional comment
25. Review Submitted → Farmer's average rating updated in database
26. **END**
