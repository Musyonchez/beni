# System Architecture

## Overview

FarmLink follows a client-server architecture with a React Native mobile frontend,
a Node.js REST API backend, and a MongoDB database. The three layers are fully
decoupled — the frontend communicates with the backend exclusively through HTTP
requests to the REST API, and the backend handles all database operations.

```
┌─────────────────────────────────────────────────────┐
│                  MOBILE CLIENT                       │
│            React Native (Expo)                       │
│   Farmer App  │  Buyer App  │  Admin Dashboard       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────┐
│                  BACKEND SERVER                      │
│               Node.js + Express.js                   │
│                                                      │
│  Auth      Products    Orders    Payments    Notify  │
│  Routes    Routes      Routes    Routes      Routes  │
│                                                      │
│              Middleware Layer                        │
│      (JWT Auth │ Input Validation │ Error Handler)   │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────┐
│                   DATABASE                           │
│                   MongoDB                            │
│                                                      │
│  users  │  products  │  orders  │  reviews  │  notif │
└─────────────────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  Twilio  │ │ Safaricom│ │  Expo    │
    │   SMS    │ │  Daraja  │ │  Push    │
    │   API    │ │ (M-Pesa) │ │  Notify  │
    └──────────┘ └──────────┘ └──────────┘
```

## Layers

### Frontend — React Native (Expo)
- Cross-platform mobile app targeting Android and iOS
- Expo managed workflow for simplified builds and OTA updates
- React Navigation for screen routing
- Axios for API calls
- Expo Location for geolocation
- AsyncStorage for local session persistence

### Backend — Node.js + Express.js
- RESTful API serving JSON responses
- JWT (JSON Web Tokens) for stateless authentication
- Bcrypt for password hashing
- Mongoose as the ODM layer for MongoDB
- Express Validator for request input validation
- Dotenv for environment variable management

### Database — MongoDB
- NoSQL document store hosted on MongoDB Atlas (free tier)
- Collections mirror the core domain entities
- Indexed fields: user email, product location (2dsphere), order status

### External Services
- **Safaricom Daraja API** — M-Pesa STK Push for in-app payments (sandbox)
- **Twilio** — SMS notifications for order updates
- **Expo Push Notifications** — in-app push alerts for order status changes
