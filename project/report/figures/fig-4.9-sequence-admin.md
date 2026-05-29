# Figure 4.9 — Admin Sequence Diagram

**Report location:** Section 4.4.7.1  
**Caption:** Figure 4.9 — Admin Sequence Diagram  
**Diagram type:** UML Sequence Diagram  
**Recommended PlantUML type:** `@startuml` with sequence diagram notation (`->`, `-->`, `activate`, `deactivate`)

---

## Participants (in order, left to right)

1. **Admin** (actor)
2. **Mobile Client** (FarmLink mobile app)
3. **Backend API** (Node.js + Express, port 5000)
4. **MongoDB** (database)

---

## Sequence of Messages

### Step 1 — Login

| # | From | To | Message | Note |
|---|---|---|---|---|
| 1 | Admin | Mobile Client | Open App | |
| 2 | Mobile Client | Backend API | POST /api/auth/login {email, password} | |
| 3 | Backend API | MongoDB | find user by email | |
| 4 | MongoDB | Backend API | return user document | |
| 5 | Backend API | Mobile Client | 200 OK + JWT token | bcrypt compare password |
| 6 | Mobile Client | Admin | Admin dashboard shown | |

---

### Step 2 — View All Users

| # | From | To | Message | Note |
|---|---|---|---|---|
| 7 | Admin | Mobile Client | Tap "Manage Users" | |
| 8 | Mobile Client | Backend API | GET /api/admin/users (Bearer JWT) | |
| 9 | Backend API | MongoDB | find({ role: 'farmer' or 'buyer' }) | |
| 10 | MongoDB | Backend API | return users array | |
| 11 | Backend API | Mobile Client | 200 OK + users array | |
| 12 | Mobile Client | Admin | User list displayed | |

---

### Step 3 — Verify Farmer Account

| # | From | To | Message | Note |
|---|---|---|---|---|
| 13 | Admin | Mobile Client | Tap "Verify" on a farmer | |
| 14 | Mobile Client | Backend API | PUT /api/admin/users/:id/verify (Bearer JWT) | |
| 15 | Backend API | MongoDB | updateOne({ _id }, { isVerified: true }) | |
| 16 | MongoDB | Backend API | return updated document | |
| 17 | Backend API | Mobile Client | 200 OK + success message | |
| 18 | Mobile Client | Admin | "Farmer verified" confirmation shown | |

---

### Step 4 — View Sales Report

| # | From | To | Message | Note |
|---|---|---|---|---|
| 19 | Admin | Mobile Client | Tap "Sales Report" | |
| 20 | Mobile Client | Backend API | GET /api/admin/reports/sales (Bearer JWT) | |
| 21 | Backend API | MongoDB | aggregate orders (sum totalAmount, group by date) | |
| 22 | MongoDB | Backend API | return aggregated sales data | |
| 23 | Backend API | Mobile Client | 200 OK + report object | |
| 24 | Mobile Client | Admin | Sales report displayed | |
