# Chapter 5: Diagrams Needed - Complete List

This document consolidates all diagram placeholders from Chapter 5 sections, providing a comprehensive checklist for diagram creation. Each diagram is listed with its figure number, title, type, section location, and detailed description of required content.

---

## Summary Statistics

- **Total Diagrams Required**: 34
- **UML Diagrams**: 18
- **UI Wireframes/Mockups**: 11
- **Database Diagrams**: 1
- **Tables**: 4

---

## Architecture and System Design

### Figure 5.1 - System Architecture Diagram
**Section**: 5.2 System Architecture  
**Type**: Architecture Diagram  
**Priority**: Critical  

**Description**:
A comprehensive three-tier architecture diagram showing:
- **Top tier**: Presentation Layer (Flutter Mobile App on left, React Admin Dashboard on right)
- **Middle tier**: Application Layer (Firebase Cloud Functions, M-Pesa Daraja API)
- **Bottom tier**: Data Layer (Cloud Firestore database, Firebase Authentication)
- Arrows showing data flow and communication between layers
- External integrations: M-Pesa payment gateway, Firebase Cloud Messaging for push notifications
- Security boundary markers showing HTTPS/TLS encryption
- Component labels and technology stack annotations

**Tool Recommendation**: Draw.io, Lucidchart, or Visual Paradigm

---

## Use Case Diagrams

### Figure 5.2 - Student Actor Use Case Diagram
**Section**: 5.3 Use Case Diagrams  
**Type**: UML Use Case Diagram  
**Priority**: High  

**Description**:
A UML use case diagram showing the Student actor (stick figure on left) with connecting lines to multiple use case ovals:
- Register Account
- Login to System
- Browse Menu Items
- Search Menu
- Filter by Category
- View Item Details
- Add Items to Cart
- Modify Cart (Remove Items, Change Quantity)
- View Cart Summary
- Proceed to Checkout
- Enter Delivery Preferences
- Confirm Order
- Make M-Pesa Payment
- View Order Confirmation
- Track Order Status (Real-time)
- View Order History
- Reorder Previous Order
- View Loyalty Points Balance
- Redeem Loyalty Points
- View Points Transaction History
- Update Profile Information
- Change Password
- Logout
- Include/extend relationships showing: "Make M-Pesa Payment" extends "Confirm Order", "Search Menu" and "Filter by Category" extend "Browse Menu Items"

**Tool Recommendation**: Draw.io, PlantUML, or Lucidchart

---

### Figure 5.3 - Cafeteria Staff Actor Use Case Diagram
**Section**: 5.3 Use Case Diagrams  
**Type**: UML Use Case Diagram  
**Priority**: High  

**Description**:
A UML use case diagram showing the Cafeteria Staff actor with connections to:
- Login to Dashboard
- View Active Order Queue
- Sort Orders (by time, priority)
- View Order Details
- Update Order Status
- Mark Items as Unavailable
- Mark Items as Available
- View Daily Sales Summary
- Print Order Tickets
- Contact Customer
- Logout

**Tool Recommendation**: Draw.io or Lucidchart

---

### Figure 5.4 - System Administrator Use Case Diagram
**Section**: 5.3 Use Case Diagrams  
**Type**: UML Use Case Diagram  
**Priority**: High  

**Description**:
A UML use case diagram showing the Administrator actor with connections to:
- All Staff use cases (through inheritance/generalization)
- Create New Menu Items
- Edit Menu Items (name, description, price, category, image)
- Delete Menu Items
- Upload Menu Item Images
- Set Dynamic Pricing
- Configure Loyalty Points Rules
- View Analytics Dashboard
- Generate Reports (daily sales, popular items, revenue trends)
- View All Users
- Deactivate User Accounts
- Adjust User Loyalty Points (manual corrections)
- Configure System Settings
- Manage Staff Accounts

**Tool Recommendation**: Draw.io or Lucidchart

---

### Figure 5.5 - External Systems Integration Use Case Diagram
**Section**: 5.3 Use Case Diagrams  
**Type**: UML Use Case Diagram  
**Priority**: Medium  

**Description**:
A UML use case diagram showing interactions between the system and external actors:
- M-Pesa Payment Gateway: Process Payment, Send Payment Callback, Verify Transaction
- Firebase Authentication: Authenticate User, Verify Email, Reset Password
- Firebase Cloud Messaging: Send Push Notification, Deliver Notification
- Include relationships showing dependencies

**Tool Recommendation**: Draw.io or PlantUML

---

## Activity Diagrams

### Figure 5.6 - User Registration Activity Diagram
**Section**: 5.4 Activity Diagrams  
**Type**: UML Activity Diagram  
**Priority**: High  

**Description**:
A UML activity diagram showing the user registration workflow with:
- Start node (filled circle)
- User enters registration details (name, email, phone, password) - activity rectangle
- System validates input format - activity rectangle
- Decision diamond: "Input valid?"
  - No branch → Display validation errors → Return to input form
  - Yes branch → Continue
- System checks email uniqueness - activity rectangle
- Decision diamond: "Email already exists?"
  - Yes branch → Display "Email already registered" error → Return to input
  - No branch → Continue
- System creates user account in Firestore - activity rectangle
- System sends verification email via Firebase Auth - activity rectangle
- Fork (parallel paths):
  - Initialize loyalty points = 0
  - Create default user profile
  - Log registration event
- Join (merge parallel paths)
- Display "Registration successful, check email" message - activity rectangle
- End node (filled circle with border)

**Tool Recommendation**: Draw.io, Lucidchart, or Visual Paradigm

---

### Figure 5.7 - User Login Activity Diagram
**Section**: 5.4 Activity Diagrams  
**Type**: UML Activity Diagram  
**Priority**: High  

**Description**:
A UML activity diagram showing the login workflow with:
- Start node
- User enters email and password - activity rectangle
- System calls Firebase Authentication - activity rectangle
- Decision diamond: "Credentials valid?"
  - No branch → Increment failed login counter → Decision: "Failed attempts > 3?" → Yes → Lock account for 15 minutes → Display error; No → Display "Invalid credentials" → Return to login
  - Yes branch → Continue
- System retrieves user profile from Firestore - activity rectangle
- System generates session token - activity rectangle
- Decision diamond: "Email verified?"
  - No branch → Display "Please verify email" warning → Allow limited access
  - Yes branch → Continue
- Fork (parallel paths):
  - Load user preferences
  - Fetch loyalty points balance
  - Retrieve cart items (if any)
  - Check for pending orders
- Join
- Navigate to Home screen - activity rectangle
- End node

**Tool Recommendation**: Draw.io or Lucidchart

---

### Figure 5.8 - Complete Order Placement Activity Diagram
**Section**: 5.4 Activity Diagrams  
**Type**: UML Activity Diagram  
**Priority**: Critical  

**Description**:
A comprehensive UML activity diagram showing the end-to-end ordering process with:
- Start node
- User browses menu - activity rectangle
- Decision diamond: "Item selected?"
  - No branch → Continue browsing → Loop back
  - Yes branch → Continue
- User adds item to cart (specify quantity) - activity rectangle
- System calculates cart subtotal - activity rectangle
- Decision diamond: "Add more items?"
  - Yes branch → Return to browsing
  - No branch → Proceed to checkout
- User reviews cart contents - activity rectangle
- Decision diamond: "Apply loyalty points?"
  - Yes branch → Calculate discount → Update total
  - No branch → Use original total
- User enters delivery preferences (pickup time, special instructions) - activity rectangle
- System displays order summary with final total - activity rectangle
- User confirms order - activity rectangle
- System creates order record in Firestore (status = "Pending Payment") - activity rectangle
- Proceed to payment workflow (connection to Figure 5.9)

**Tool Recommendation**: Draw.io or Lucidchart

---

### Figure 5.9 - M-Pesa Payment Processing Activity Diagram
**Section**: 5.4 Activity Diagrams  
**Type**: UML Activity Diagram with Swim Lanes  
**Priority**: Critical  

**Description**:
A detailed activity diagram showing payment processing with swim lanes for Customer, Mobile App, Cloud Functions, and M-Pesa:

**Customer Lane**:
- Start → Confirm order → Receive STK Push prompt on phone → Enter M-Pesa PIN → Receive confirmation

**Mobile App Lane**:
- Display order summary → Request payment → Show "Waiting for payment..." spinner → Receive payment result → Display confirmation/error → Navigate to order tracking

**Cloud Functions Lane**:
- Receive payment request → Generate OAuth token from M-Pesa → Submit STK Push request → Wait for callback → Validate callback signature → Update order payment status → Send push notification → Trigger loyalty points calculation

**M-Pesa Lane**:
- Receive STK Push request → Send USSD prompt to customer phone → Receive PIN entry → Process transaction → Send callback to webhook → Return transaction reference

Decision diamonds showing: "Payment successful?", "OAuth token valid?", "Callback authentic?", "Sufficient balance?"

**Tool Recommendation**: Lucidchart or Visual Paradigm (for swim lane support)

---

### Figure 5.10 - Order Status Update Activity Diagram
**Section**: 5.4 Activity Diagrams  
**Type**: UML Activity Diagram  
**Priority**: High  

**Description**:
Activity diagram showing order lifecycle with staff interactions:
- Start: Order created (status = "Pending Payment")
- Wait for payment confirmation
- Decision: "Payment confirmed within 5 minutes?"
  - No → Cancel order → Notify customer → End
  - Yes → Update status to "Payment Confirmed"
- Order appears in staff queue - activity rectangle
- Staff views order details - activity rectangle
- Staff begins preparation → Update status to "Preparing" → Send push notification to customer
- Parallel activities: Prepare food items (concurrent preparation of multiple items)
- Staff marks items complete
- Decision: "All items prepared?"
  - No → Continue preparing
  - Yes → Update status to "Ready for Pickup"
- Send push notification to customer - activity rectangle
- Wait for customer pickup
- Staff confirms pickup → Update status to "Completed"
- Trigger loyalty points calculation - activity rectangle
- Fork: Update analytics / Archive order / Send feedback request
- End

**Tool Recommendation**: Draw.io or Lucidchart

---

### Figure 5.11 - Loyalty Points Calculation Activity Diagram
**Section**: 5.4 Activity Diagrams  
**Type**: UML Activity Diagram  
**Priority**: Medium  

**Description**:
Activity diagram for loyalty points processing:
- Start: Order completed
- Retrieve order total amount - activity rectangle
- Calculate base points (total ÷ 100, rounded down) - activity rectangle
- Decision: "Special promotion active?"
  - Yes → Apply multiplier (2x, 3x) → Recalculate points
  - No → Use base points
- Decision: "Order total ≥ minimum threshold (200 KES)?"
  - No → Points = 0 → Skip earning
  - Yes → Continue
- Retrieve user's current points balance - activity rectangle
- Add earned points to balance - activity rectangle
- Create loyalty transaction record (type = "earned", source = order ID) - activity rectangle
- Send notification: "You earned X points!" - activity rectangle
- End

**Tool Recommendation**: Draw.io or PlantUML

---

### Figure 5.12 - Loyalty Points Redemption Activity Diagram
**Section**: 5.4 Activity Diagrams  
**Type**: UML Activity Diagram  
**Priority**: Medium  

**Description**:
Activity diagram for redeeming points:
- Start: User views cart during checkout
- Retrieve user's available points balance - activity rectangle
- Display redemption option: "Redeem 100 points for 50 KES discount" - activity rectangle
- Decision: "User chooses to redeem?"
  - No → Proceed without discount → End
  - Yes → Continue
- Decision: "Sufficient points balance?"
  - No → Display "Insufficient points" error → End
  - Yes → Continue
- Calculate discount amount (points ÷ 2 KES) - activity rectangle
- Apply discount to order total - activity rectangle
- Reserve points (mark as pending redemption) - activity rectangle
- When order completes:
  - Deduct points from balance
  - Create loyalty transaction record (type = "redeemed", applied to order ID)
- When order cancels:
  - Release reserved points
- End

**Tool Recommendation**: Draw.io or Lucidchart

---

## Sequence Diagrams

### Figure 5.13 - User Login Sequence Diagram
**Section**: 5.5 Sequence Diagrams  
**Type**: UML Sequence Diagram  
**Priority**: High  

**Description**:
A UML sequence diagram showing login interaction with vertical lifelines for:
- Student (Actor - leftmost)
- Mobile App (Flutter UI)
- Authentication Controller (BLoC)
- Firebase Authentication Service
- Cloud Firestore Database

Horizontal arrows showing message flow with labels:
1. Student → Mobile App: enters email & password
2. Mobile App → Auth Controller: login(email, password)
3. Auth Controller → Firebase Auth: signInWithEmailAndPassword()
4. Firebase Auth → Firebase Auth: validate credentials (self-call)
5. Firebase Auth → Auth Controller: return UserCredential + JWT token
6. Auth Controller → Firestore: getUserProfile(userId)
7. Firestore → Auth Controller: return User document
8. Auth Controller → Mobile App: LoginSuccess(user, token)
9. Mobile App → Mobile App: persist session token (self-call)
10. Mobile App → Student: navigate to Home screen

Activation bars showing when objects are processing  
Return messages shown as dashed lines

**Tool Recommendation**: Draw.io, PlantUML, or Visual Paradigm

---

### Figure 5.14 - Order Placement Sequence Diagram
**Section**: 5.5 Sequence Diagrams  
**Type**: UML Sequence Diagram  
**Priority**: Critical  

**Description**:
A comprehensive sequence diagram with lifelines for:
- Student (Actor)
- Mobile App
- Checkout Controller
- Cart Manager
- Firestore Database
- Cloud Functions
- M-Pesa Daraja API

Message sequence (23 steps):
1. Student → Mobile App: taps "Checkout"
2. Mobile App → Cart Manager: getCartItems()
3. Cart Manager → Mobile App: return items array
4. Mobile App → Student: display review screen
5. Student → Mobile App: confirms order
6. Mobile App → Checkout Controller: createOrder(items, total, preferences)
7. Checkout Controller → Firestore: create Order document (status="Pending")
8. Firestore → Checkout Controller: return Order ID
9. Checkout Controller → Cloud Functions: initiatePayment(orderId, amount, phoneNumber)
10. Cloud Functions → M-Pesa API: requestOAuthToken()
11. M-Pesa API → Cloud Functions: return access token
12. Cloud Functions → M-Pesa API: stkPush(amount, phone, callbackUrl)
13. M-Pesa API → Cloud Functions: return request accepted
14. Cloud Functions → Checkout Controller: return "Payment initiated"
15. Checkout Controller → Mobile App: show "Waiting for payment..."
16. Mobile App → Student: display spinner + instructions
17. [Parallel] M-Pesa API → Student's Phone: STK Push prompt
18. Student's Phone → M-Pesa API: M-Pesa PIN entry
19. M-Pesa API → M-Pesa API: process payment (self-call)
20. M-Pesa API → Cloud Functions: POST callback (payment result)
21. Cloud Functions → Firestore: update Order (status="Paid", paymentRef)
22. Firestore → Mobile App: snapshot listener triggers update
23. Mobile App → Student: navigate to Order Tracking screen

Alt frame showing payment failure path with error handling

**Tool Recommendation**: Lucidchart or Visual Paradigm

---

### Figure 5.15 - Real-Time Order Tracking Sequence Diagram
**Section**: 5.5 Sequence Diagrams  
**Type**: UML Sequence Diagram  
**Priority**: High  

**Description**:
Sequence diagram showing real-time synchronization:

Lifelines: Student, Mobile App, Firestore Database, Cloud Messaging, Cafeteria Staff, Admin Dashboard

Message sequence:
1. Student → Mobile App: opens Order Tracking screen
2. Mobile App → Firestore: attachSnapshotListener(orderRef)
3. Firestore → Mobile App: initial order data (status="Preparing")
4. Mobile App → Student: display "Order is being prepared"
5. [Time passes...]
6. Cafeteria Staff → Admin Dashboard: marks order "Ready"
7. Admin Dashboard → Firestore: updateOrder(orderId, status="Ready")
8. Firestore → Firestore: trigger onUpdate Cloud Function (self-call)
9. Firestore → Cloud Messaging: sendNotification(userId, "Order ready!")
10. Cloud Messaging → Student's Device: push notification
11. Firestore → Mobile App: snapshot event (updated order data)
12. Mobile App → Mobile App: rebuild UI with new status (self-call)
13. Mobile App → Student: display "Ready for Pickup!" with animation

Opt frame showing "if app is backgrounded" flow with notification handling

**Tool Recommendation**: Draw.io or Lucidchart

---

### Figure 5.16 - Menu Loading with Cache Sequence Diagram
**Section**: 5.5 Sequence Diagrams  
**Type**: UML Sequence Diagram  
**Priority**: Medium  

**Description**:
Sequence diagram demonstrating offline-first architecture:

Lifelines: Student, Mobile App, Menu Controller, Local Cache (SQLite), Firestore Database

Message sequence:
1. Student → Mobile App: launches app
2. Mobile App → Menu Controller: loadMenu()
3. Menu Controller → Local Cache: getMenuItems()
4. Local Cache → Menu Controller: return cached items (with timestamp)
5. Menu Controller → Mobile App: display cached menu immediately
6. Mobile App → Student: menu appears (instant, from cache)
7. [Parallel] Menu Controller → Firestore: queryMenuItems(since=lastCacheTime)
8. Firestore → Menu Controller: return updated items (if any)
9. Alt frame: "if updates exist"
   - Menu Controller → Local Cache: updateCache(newItems)
   - Local Cache → Menu Controller: cache updated
   - Menu Controller → Mobile App: notify UI refresh
   - Mobile App → Student: menu updates with fade animation
10. Alt frame: "if network unavailable"
    - Firestore → Menu Controller: connection error
    - Menu Controller → Mobile App: operate from cache only
    - Mobile App → Student: show "Offline mode" indicator

**Tool Recommendation**: Draw.io or PlantUML

---

### Figure 5.17 - Loyalty Points Calculation Sequence Diagram
**Section**: 5.5 Sequence Diagrams  
**Type**: UML Sequence Diagram  
**Priority**: Medium  

**Description**:
Sequence diagram for automated points calculation:

Lifelines: Firestore Database, Cloud Functions (onOrderComplete trigger), Loyalty Engine, User Document

Message sequence:
1. Admin Dashboard → Firestore: updateOrder(orderId, status="Completed")
2. Firestore → Cloud Functions: trigger onOrderComplete(orderSnapshot)
3. Cloud Functions → Cloud Functions: extract userId, orderTotal (self-call)
4. Cloud Functions → Loyalty Engine: calculatePoints(orderTotal)
5. Loyalty Engine → Loyalty Engine: points = floor(total / 100) (self-call)
6. Loyalty Engine → Loyalty Engine: checkPromotions() (self-call)
7. Loyalty Engine → Loyalty Engine: applyMultiplier() if applicable (self-call)
8. Loyalty Engine → Cloud Functions: return earnedPoints
9. Cloud Functions → Firestore: getUser(userId)
10. Firestore → Cloud Functions: return User document
11. Cloud Functions → Cloud Functions: newBalance = currentBalance + earnedPoints (self-call)
12. Cloud Functions → Firestore: updateUser(userId, {loyaltyPoints: newBalance})
13. Cloud Functions → Firestore: createTransaction({type:"earned", points, source:orderId})
14. Firestore → Mobile App: snapshot listener fires
15. Mobile App → Student: show notification "You earned X points!"

**Tool Recommendation**: Draw.io or PlantUML

---

## Class Diagrams

### Figure 5.18 - Core Domain Classes Diagram
**Section**: 5.6 Class Diagrams  
**Type**: UML Class Diagram  
**Priority**: Critical  

**Description**:
A UML class diagram showing the primary business domain classes with complete structure:

**Classes to include**:
- User (with attributes: userId, name, email, phoneNumber, passwordHash, loyaltyPoints, profileImageUrl, emailVerified, createdAt, lastLoginAt; methods: register(), login(), updateProfile(), resetPassword(), getLoyaltyBalance(), getOrderHistory())
- MenuItem (attributes: itemId, name, description, category, price, imageUrl, preparationTime, isAvailable, nutritionalInfo, allergens, createdAt, updatedAt; methods: create(), update(), delete(), toggleAvailability(), applyDiscount())
- Order (attributes: orderId, userId, items, subtotal, loyaltyDiscount, total, status, paymentStatus, deliveryPreferences, specialInstructions, estimatedPickupTime, createdAt, completedAt; methods: create(), updateStatus(), calculateTotal(), applyLoyaltyDiscount(), cancel(), complete())
- OrderItem (attributes: itemId, name, quantity, unitPrice, subtotal, specialInstructions; methods: calculateSubtotal(), updateQuantity())

**Relationships**:
- User "1" ──── "0..*" Order (one user has zero or many orders)
- Order "1" ◆──── "1..*" OrderItem (composition - order contains items)
- MenuItem "1" ──── "0..*" OrderItem (one menu item referenced in many order items)
- User "1" ──── "0..1" Cart (one user has zero or one active cart)

**Tool Recommendation**: Visual Paradigm, Draw.io, or Lucidchart

---

### Figure 5.19 - Payment Domain Classes Diagram
**Section**: 5.6 Class Diagrams  
**Type**: UML Class Diagram  
**Priority**: High  

**Description**:
UML class diagram for payment-related classes:

**Classes**:
- Payment (attributes: paymentId, orderId, userId, amount, paymentMethod, mpesaTransactionId, mpesaReceiptNumber, phoneNumber, status, initiatedAt, completedAt, failureReason; methods: initiate(), verify(), confirm(), fail(), refund())
- LoyaltyTransaction (attributes: transactionId, userId, points, type, sourceOrderId, description, balanceAfter, createdAt, expiresAt; methods: create(), getBalance(), earnPoints(), redeemPoints(), getHistory())
- Cart (attributes: cartId, userId, items, subtotal, updatedAt; methods: addItem(), removeItem(), updateQuantity(), clear(), calculateSubtotal(), convertToOrder())

**Relationships**:
- Payment "1" ──── "1" Order (one-to-one association)
- LoyaltyTransaction "0..*" ──── "1" User (many transactions per user)
- LoyaltyTransaction "0..1" ──── "0..1" Order (optional link to source order)
- Cart "1" ◆──── "0..*" CartItem (composition)

**Tool Recommendation**: Visual Paradigm or Draw.io

---

### Figure 5.20 - Application Logic Classes Diagram
**Section**: 5.6 Class Diagrams  
**Type**: UML Class Diagram  
**Priority**: Medium  

**Description**:
UML class diagram showing BLoC controllers and services:

**Classes**:
- AuthenticationController (BLoC) (attributes: authService, currentUser, authStateStream; methods: login(), register(), logout(), resetPassword(), getCurrentUser(), listenAuthState())
- OrderController (BLoC) (attributes: orderService, activeOrders, orderHistory; methods: createOrder(), getActiveOrders(), getOrderHistory(), trackOrder(), cancelOrder())
- PaymentService (attributes: httpClient, apiBaseUrl; methods: initiateSTKPush(), verifyPayment(), queryPaymentStatus(), handleCallback())
- FirestoreService (attributes: firestore; methods: getDocument(), queryCollection(), createDocument(), updateDocument(), deleteDocument(), batchWrite())

**Relationships**:
- AuthenticationController ──uses──> FirestoreService (dependency)
- OrderController ──uses──> FirestoreService
- OrderController ──uses──> PaymentService
- All controllers inherit from base BLoC class (generalization)

**Tool Recommendation**: Draw.io or Visual Paradigm

---

## Database Diagrams

### Figure 5.21 - Firestore Database ER Diagram
**Section**: 5.7 Database Schema  
**Type**: Entity-Relationship Diagram (NoSQL adapted)  
**Priority**: Critical  

**Description**:
An entity-relationship diagram showing Firestore collections and their relationships:
- Top level: Users collection, MenuItems collection, Orders collection, Payments collection, LoyaltyTransactions collection
- Users collection containing user documents with fields listed
- MenuItems collection containing menu item documents with fields listed
- Orders collection containing order documents, with subcollection OrderItems
- Payments collection with references to Orders
- LoyaltyTransactions collection with references to Users
- Lines showing relationships with cardinality (1:N, 1:1)
- Foreign key references shown as dashed arrows labeled with field names (userId, orderId, itemId, paymentId)
- Document structure snippets for each collection showing key fields

**Tool Recommendation**: dbdiagram.io, DrawSQL, or Lucidchart

---

## UI Wireframes (Low-Fidelity)

### Figure 5.22 - Splash and Authentication Screens Wireframes
**Section**: 5.8 UI Design  
**Type**: Low-Fidelity Wireframe  
**Priority**: High  

**Description**:
Three wireframe screens showing basic layout:

**Splash Screen**: App logo centered, loading indicator below, app name text

**Login Screen**: Logo at top, "Welcome Back" heading, email input field, password input field with visibility toggle, "Forgot Password?" link (right-aligned), "Login" button (full width), "Don't have an account? Register" link (bottom)

**Registration Screen**: "Create Account" heading, Full Name input, Email input, Phone Number input (+254 prefix), Password input with strength indicator, Confirm Password input, "I agree to Terms" checkbox, "Register" button, "Already have account? Login" link

**Tool Recommendation**: Figma, Balsamiq, or Draw.io

---

### Figure 5.23 - Home and Menu Browsing Wireframes
**Section**: 5.8 UI Design  
**Type**: Low-Fidelity Wireframe  
**Priority**: Critical  

**Description**:
Four wireframe screens:

**Home Screen**: Search bar at top, horizontal scrolling category chips, "Popular Items" section with 3 items in horizontal scroll, "All Menu Items" grid (2 columns), each item showing image + name + price + "Add to Cart" button, bottom navigation bar (Home, Orders, Loyalty, Profile)

**Menu Item Detail**: Full-width item image, back button (top-left), favorite button (top-right), item name, price, star rating, description, preparation time with icon, allergen tags, quantity selector (- / number / +), "Add to Cart" button (sticky bottom)

**Shopping Cart**: "My Cart" heading, items list with thumbnails/names/prices/quantity/remove, "Apply Loyalty Points" expandable section, summary (Subtotal, Discount, Total), "Proceed to Checkout" button, "Continue Shopping" link

**Search/Filter**: Search input with real-time results, filter chips (Price, Category, Dietary), results count, results grid, "Clear Filters" option

**Tool Recommendation**: Figma or Balsamiq

---

### Figure 5.24 - Checkout and Payment Wireframes
**Section**: 5.8 UI Design  
**Type**: Low-Fidelity Wireframe  
**Priority**: Critical  

**Description**:
Three wireframe screens:

**Checkout Screen**: Order summary (collapsed with expand), pickup time selector (Now/30min/1hr/Custom), special instructions text area, order details review (items count, subtotal, discount, total), payment method selection (M-Pesa default), "Confirm Order" button

**Payment Processing**: Progress spinner, "Processing Payment..." heading, "Check phone for M-Pesa prompt" instruction, M-Pesa icon with animation, order summary sidebar, "Cancel" button

**Order Confirmation**: Success checkmark (large, centered), "Order Confirmed!" heading, order number, estimated pickup time, "Track Order" button, "View Receipt" button, "Back to Home" link

**Tool Recommendation**: Figma or Balsamiq

---

### Figure 5.25 - Order Tracking and History Wireframes
**Section**: 5.8 UI Design  
**Type**: Low-Fidelity Wireframe  
**Priority**: High  

**Description**:
Four wireframe screens:

**Order Tracking**: Order number heading, progress stepper (Payment Confirmed ✓, Preparing •, Ready, Completed), countdown "Ready in ~12 minutes", expandable order details (items, total, location), "Contact Cafeteria" button, "Cancel Order" button

**Active Orders**: "Active Orders" heading, list of current orders (order #, status badge, items preview, time remaining), tap to expand, empty state if no orders

**Order History**: "Order History" heading, filter dropdown (Last 30 days/3 months/All), chronological list (date, items summary, total, status), "Reorder" button per order, "View Details" link, pagination

**Order Detail History**: Full order information (date/time, items with quantities/prices, payment method, transaction ID, final total), "Reorder These Items" button, "Download Receipt" option

**Tool Recommendation**: Figma or Balsamiq

---

### Figure 5.26 - Loyalty Program and Profile Wireframes
**Section**: 5.8 UI Design  
**Type**: Low-Fidelity Wireframe  
**Priority**: Medium  

**Description**:
Four wireframe screens:

**Loyalty Points**: Large circular progress indicator showing points balance, "You have 250 points" heading, earning explanation, redemption value info, "Redeem Points" button, points history timeline (date, description, points, balance), expiration notice

**Profile**: Profile photo (circular, editable), name/email/phone display, "Edit Profile" button, settings sections (Notifications toggle, Newsletter toggle, Language, T&C link, Privacy link), "Change Password", "Logout" (red/destructive)

**Edit Profile**: Name/Email(disabled)/Phone/Photo upload fields, "Save Changes" button, "Cancel" link

**Admin Dashboard - Order Queue** (web): Sidebar navigation, main area with "Active Orders" table (columns: Order#, Customer, Items, Total, Time Elapsed, Status, Actions), status dropdown per order, auto-refresh indicator, filter options, sound notification for new orders

**Tool Recommendation**: Figma for mobile, Balsamiq for admin web

---

### Figure 5.27 - Admin Dashboard Wireframes
**Section**: 5.8 UI Design  
**Type**: Low-Fidelity Wireframe (Web)  
**Priority**: Medium  

**Description**:
Three wireframe screens for web dashboard:

**Admin Menu Management**: "Menu Items" heading, "Add New Item" button (top-right), items table (columns: Image, Name, Category, Price, Status, Actions), toggle availability button, Edit/Delete actions

**Admin Analytics Dashboard**: KPI cards row (Today's Orders count, Today's Revenue, Active Users, Average Order Value), line chart (Revenue over 7 days), bar chart (Orders by hour), pie chart (Revenue by category), "Top 10 Popular Items" ranked list

**Tool Recommendation**: Figma or Balsamiq

---

## High-Fidelity Mockups

### Figure 5.28 - Home Screen High-Fidelity Mockup
**Section**: 5.8 UI Design  
**Type**: High-Fidelity Mockup  
**Priority**: Critical  

**Description**:
Full-color mockup of home screen showing:
- White background
- Orange (#FF6B35) accent color on "Add to Cart" buttons and active category
- High-quality food photography for menu items
- Inter font applied to all text with proper hierarchy
- Drop shadows on cards (2px blur, 10% black opacity)
- Active category chip with orange background, white text
- Bottom navigation with icons and labels, active tab in orange
- 12px corner radius on cards and buttons
- Professional spacing and alignment

**Tool Recommendation**: Figma or Adobe XD

---

### Figure 5.29 - Menu Item Detail High-Fidelity Mockup
**Section**: 5.8 UI Design  
**Type**: High-Fidelity Mockup  
**Priority**: High  

**Description**:
Detailed mockup showing:
- Full-bleed food photo at top with gradient overlay for text readability
- Back button as white circle with drop shadow (floating over image)
- Item name in Inter Bold 28pt white text
- Price in orange, bold
- Orange "Add to Cart" button with subtle gradient and drop shadow
- Quantity selector with rounded borders and teal increment/decrement buttons
- Tag chips for allergens/dietary info in light gray background
- Smooth 12px corner radius on all interactive elements
- Inter Regular 16pt for body text

**Tool Recommendation**: Figma or Adobe XD

---

### Figure 5.30 - Order Tracking High-Fidelity Mockup
**Section**: 5.8 UI Design  
**Type**: High-Fidelity Mockup  
**Priority**: High  

**Description**:
Mockup demonstrating:
- Progress stepper with orange fill for completed steps, gray for pending
- Pulsing animation indicator on current step (visual cue with rings)
- Countdown timer in large Inter Bold 32pt orange text
- Success green checkmarks (✓) on completed stages
- Teal (#2A9D8F) "Contact Cafeteria" button
- Clean card design with subtle shadows
- Proper spacing between elements

**Tool Recommendation**: Figma or Adobe XD

---

### Figure 5.31 - Loyalty Points High-Fidelity Mockup
**Section**: 5.8 UI Design  
**Type**: High-Fidelity Mockup  
**Priority**: Medium  

**Description**:
Mockup showing:
- Circular progress indicator with orange fill and gray background track
- Points balance in center (Inter Bold 48pt)
- Teal accent color for loyalty features (differentiating from main orange)
- Timeline using vertical teal line with circular markers
- Earned points entries in success green, redeemed in gray
- Clean typography hierarchy
- Proper visual balance

**Tool Recommendation**: Figma or Adobe XD

---

### Figure 5.32 - Admin Dashboard High-Fidelity Mockup
**Section**: 5.8 UI Design  
**Type**: High-Fidelity Mockup (Web)  
**Priority**: Medium  

**Description**:
Web dashboard mockup with:
- Clean, professional interface with white background
- Sidebar navigation with icons (Home, Orders, Menu, Analytics, Users, Settings)
- Data tables with alternating row colors for readability
- Status badges (green for "Ready", orange for "Preparing", gray for "Completed")
- Charts using consistent color palette (orange, teal, navy)
- Responsive layout adapting to screen size
- Hover states on interactive elements

**Tool Recommendation**: Figma or Adobe XD

---

## Navigation and Flow Diagrams

### Figure 5.33 - App Navigation Flow Diagram
**Section**: 5.8 UI Design  
**Type**: Navigation Flow Diagram  
**Priority**: Medium  

**Description**:
A flowchart showing screen-to-screen navigation:
- Splash → Login/Register → Home
- Home → Menu Detail → Cart → Checkout → Payment → Confirmation → Tracking
- Home → Search → Results → Menu Detail
- Bottom Nav accessible from anywhere: Home, Orders, Loyalty, Profile
- Orders → Order Detail → Tracking
- Profile → Edit Profile / Settings / Logout
- Arrows showing navigation paths
- Back navigation shown with dashed lines
- Deep links and shortcuts indicated

**Tool Recommendation**: Draw.io, Lucidchart, or Figma

---

## Tables and Matrices

### Figure 5.34 - Requirements Traceability Matrix Table
**Section**: 5.9 Requirements Specification  
**Type**: Traceability Table  
**Priority**: High  

**Description**:
A comprehensive table showing:

**Columns**:
- Requirement ID
- Description (summary)
- Priority (Must/Should/Could/Won't)
- Category (Authentication, Ordering, Payment, etc.)
- Objective Reference (from Chapter 3)
- Test Case ID (from Chapter 7)

**Sample Rows** (continue for all 35 FR + 18 NFR = 53 requirements):
- FR1 | User Registration | Must Have | Authentication | OBJ-1 | TC-001
- FR12 | Add to Cart | Must Have | Ordering | OBJ-2 | TC-015
- FR19 | M-Pesa Integration | Must Have | Payment | OBJ-3 | TC-025
- FR27 | Points Earning | Must Have | Loyalty | OBJ-4 | TC-035
- NFR1 | App Launch Time | Must Have | Performance | OBJ-7 | TC-045
- NFR10 | Data Encryption | Must Have | Security | OBJ-6 | TC-055

**Tool Recommendation**: Microsoft Excel, Google Sheets, or Markdown table

---

## Creation Workflow Recommendations

### Phase 1: Critical Diagrams (Week 1)
1. Figure 5.1 - System Architecture Diagram
2. Figure 5.21 - Firestore Database ER Diagram
3. Figure 5.8 - Complete Order Placement Activity Diagram
4. Figure 5.9 - M-Pesa Payment Processing Activity Diagram
5. Figure 5.14 - Order Placement Sequence Diagram

### Phase 2: Design Diagrams (Week 2)
6. Figure 5.23 - Home and Menu Browsing Wireframes
7. Figure 5.24 - Checkout and Payment Wireframes
8. Figure 5.25 - Order Tracking Wireframes
9. Figure 5.28 - Home Screen High-Fidelity Mockup
10. Figure 5.29 - Menu Item Detail Mockup

### Phase 3: Remaining UML (Week 3)
11-15. All Use Case Diagrams (Figures 5.2-5.5)
16-20. All Activity Diagrams (Figures 5.6-5.7, 5.10-5.12)
21-25. All Sequence Diagrams (Figures 5.13, 5.15-5.17)
26-28. All Class Diagrams (Figures 5.18-5.20)

### Phase 4: Supplementary (Week 4)
29-34. Remaining wireframes, mockups, and tables

---

## Tool Setup Checklist

- [ ] **UML Diagrams**: Install Draw.io desktop or use online version
- [ ] **Database Design**: Set up dbdiagram.io account
- [ ] **UI Design**: Install Figma or Adobe XD
- [ ] **Alternative**: Set up PlantUML for code-based UML generation
- [ ] **Export Settings**: Configure 300 DPI for high-quality exports
- [ ] **File Naming**: Use consistent naming (figure-5-01-system-architecture.png)
- [ ] **Storage**: Create `/document/main-body/chapter-05-system-analysis-design/diagrams/` folder

---

**Total Estimated Time**: 40-60 hours for all diagrams  
**Recommended Approach**: Create 2-3 diagrams per day over 2-3 weeks

**Note**: Adjust complexity and detail based on time constraints. Prioritize critical diagrams (marked as "Critical" priority) if limited on time.
