# Figure 4.1 — FarmLink Systems Architecture

**Report location:** Section 4.4.1  
**Caption:** Figure 4.1 — FarmLink Systems Architecture  
**Diagram type:** Component / Deployment diagram  
**Recommended PlantUML type:** `@startuml` with component or deployment notation

---

## Description

FarmLink uses a three-tier client-server architecture. The three tiers are
fully decoupled and communicate only through a RESTful HTTP API. Three external
services are also integrated.

---

## Tier 1 — Presentation Layer (Mobile Client)

- Component: **FarmLink Mobile App**
- Technology: React Native + Expo (cross-platform, Android + iOS)
- Responsibilities: Renders UI screens, handles user input, manages local session
  state (AsyncStorage), makes HTTP calls to the backend via Axios
- Contains NO business logic

---

## Tier 2 — Business Logic Layer (Backend Server)

- Component: **Node.js + Express.js API Server**
- Port: 5000
- Exposes RESTful API endpoints in 6 modules:
  - `/api/auth` — Authentication
  - `/api/products` — Product listings
  - `/api/orders` — Order management
  - `/api/payments` — M-Pesa payment
  - `/api/reviews` — Ratings and reviews
  - `/api/notifications` — Push and SMS notifications
- Handles: JWT authentication, role-based access control, business rules,
  request validation, error handling, CORS

---

## Tier 3 — Data Layer (Database)

- Component: **MongoDB Atlas** (cloud-hosted)
- ODM: Mongoose
- Collections: users, products, orders, reviews, notifications
- Geospatial indexes on users and products for $near proximity queries

---

## External Services (called from backend only)

| Service | Purpose | Direction |
|---|---|---|
| Safaricom Daraja API | M-Pesa STK Push payment initiation and callback | Backend → Safaricom → Backend (callback) |
| Twilio SMS API | Send SMS notifications to farmers and buyers | Backend → Twilio → User phone |
| Expo Push Notification Service | Send in-app push notifications to mobile clients | Backend → Expo → Mobile App |

---

## Connections to draw

1. Mobile App → (HTTP/REST) → Node.js API Server
2. Node.js API Server → (Mongoose/TCP) → MongoDB Atlas
3. Node.js API Server → (HTTPS) → Safaricom Daraja API
4. Safaricom Daraja API → (HTTPS callback) → Node.js API Server
5. Node.js API Server → (HTTPS) → Twilio SMS API
6. Twilio SMS API → (SMS) → User Phone
7. Node.js API Server → (HTTPS) → Expo Push Service
8. Expo Push Service → (Push notification) → Mobile App
