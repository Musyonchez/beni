# Tech Stack

## Frontend

| Tool | Version | Purpose |
|---|---|---|
| React Native | 0.73+ | Cross-platform mobile framework |
| Expo | SDK 50+ | Managed workflow, OTA updates, device APIs |
| React Navigation | v6 | Screen routing and navigation stacks |
| Axios | latest | HTTP client for API calls |
| Expo Location | latest | GPS geolocation access |
| AsyncStorage | latest | Local key-value storage (session token) |
| React Native Maps | latest | Map display for geolocation feature |

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
| Twilio | SMS order notifications | Free tier |
| Expo Push Notifications | In-app push alerts | Free |

## Dev Tools

| Tool | Purpose |
|---|---|
| VS Code | Primary code editor |
| Git | Version control |
| Postman | API endpoint testing |
| Expo Go | Live preview on physical Android device |

## Setup Instructions

### Prerequisites
- Node.js 20 LTS installed
- MongoDB Atlas account (free)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app installed on your phone

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
npx expo start              # scan QR code with Expo Go
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
