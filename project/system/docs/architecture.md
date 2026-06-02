# System Architecture

## Overview

FarmLink follows a client-server architecture with a Next.js web frontend,
a Node.js REST API backend, and a MongoDB database. The three layers are fully
decoupled — the frontend communicates with the backend exclusively through HTTP
requests to the REST API, and the backend handles all database operations.

```
┌─────────────────────────────────────────────────────┐
│                   WEB CLIENT                         │
│              Next.js 14 (App Router)                 │
│   Farmer Views  │  Buyer Views  │  Admin Dashboard   │
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
              ┌────────┴────────┐
              ▼                 ▼
        ┌──────────┐     ┌──────────┐
        │  Twilio  │     │ Safaricom│
        │   SMS    │     │  Daraja  │
        │   API    │     │ (M-Pesa) │
        └──────────┘     └──────────┘
```

## Layers

### Frontend — Next.js 14 (App Router)
- Web application accessible from any modern browser (desktop and mobile)
- Responsive design via Tailwind CSS for usability on phones and tablets
- Next.js App Router for file-based routing and server/client component split
- Axios for REST API calls to the backend
- Browser Geolocation API (`navigator.geolocation`) for GPS coordinates
- localStorage for JWT session token persistence
- Leaflet.js for interactive map display in the geolocation feature

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
- **Twilio** — SMS notifications sent to farmer and buyer phone numbers on order events
