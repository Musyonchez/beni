# Tech Stack

## Frontend

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | Full-stack React web framework |
| React | 18 | UI component library |
| Tailwind CSS | 3.x | Utility-first CSS for responsive design |
| Axios | latest | HTTP client for API calls |
| Leaflet.js / React-Leaflet | latest | Interactive map for geolocation feature |
| js-cookie / localStorage | built-in | JWT session token storage in browser |

## Backend

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | JavaScript runtime |
| Express.js | 4.x | HTTP server and routing framework |
| Mongoose | 8.x | MongoDB ODM |
| JSON Web Token (jsonwebtoken) | latest | Auth token generation and verification |
| Bcryptjs | latest | Password hashing |
| Express Validator | latest | Request input validation |
| Dotenv | latest | Environment variable loading |
| Cors | latest | Cross-origin request handling |
| Nodemon | latest | Dev server auto-restart |

## Database

| Tool | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted MongoDB (free tier M0) |
| MongoDB Compass | GUI for inspecting collections locally |

## External APIs

| Service | Purpose | Mode |
|---|---|---|
| Safaricom Daraja API | M-Pesa STK Push payments | Sandbox |
| Twilio | SMS order notifications to farmers and buyers | Free tier |

## Dev Tools

| Tool | Purpose |
|---|---|
| VS Code | Primary code editor |
| Git | Version control |
| Postman | API endpoint testing |
| Browser DevTools | Frontend debugging and responsive design testing |

## Setup Instructions

### Prerequisites
- Node.js 20 LTS installed
- MongoDB Atlas account (free)

### Backend Setup
```bash
cd project/system/backend
npm install
cp .env.example .env        # fill in your MongoDB URI and JWT secret
npm run dev                 # starts on http://localhost:5000
```

### Frontend Setup
```bash
cd project/system/frontend
npm install
npm run dev                 # starts on http://localhost:3000
```

### Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/farmlink
JWT_SECRET=your_jwt_secret_here
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+1234567890
MPESA_CONSUMER_KEY=your_daraja_key
MPESA_CONSUMER_SECRET=your_daraja_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_sandbox_passkey
MPESA_CALLBACK_URL=https://your-ngrok-url.io/api/payments/callback
```

### Environment Variables (frontend/.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
