# MongoDB Atlas DNS Fix

## The Problem

When starting the backend for the first time, the server crashed with this error:

```
Failed to connect to MongoDB: querySrv ECONNREFUSED _mongodb._tcp.cluster0.4ebvrgi.mongodb.net
```

or on some machines:

```
Failed to connect to MongoDB: querySrv ETIMEDOUT _mongodb._tcp.cluster0.4ebvrgi.mongodb.net
```

### Why it happens

MongoDB Atlas connection strings use the `mongodb+srv://` protocol. The `+srv` part means the driver does a **DNS SRV lookup** to discover the actual cluster hostnames before connecting — it's how Atlas hides the internal cluster topology behind a single hostname.

Node.js performs DNS lookups using a library called **c-ares**. On many Windows machines (and some Linux environments), c-ares fails to resolve SRV records because:

- The system's default DNS server doesn't support SRV record lookups properly
- Corporate or ISP DNS servers block or drop SRV queries
- IPv6 is preferred but the Atlas SRV records only resolve over IPv4

The result: Node.js can't find the cluster hosts, so Mongoose never gets an address to connect to.

---

## The Fix

Two changes were made to `project/system/backend/src/config/db.ts`:

### 1. Override the DNS resolver

```typescript
import { setServers } from 'dns';
setServers(['8.8.8.8', '8.8.4.4']);
```

This tells Node.js to use **Google's public DNS servers** instead of the system default. Google DNS fully supports SRV record lookups, which is exactly what the `mongodb+srv://` protocol needs.

This must be called **before** any connection attempt — placing it at the top of `db.ts` ensures it runs first.

### 2. Force IPv4

```typescript
await mongoose.connect(uri, { family: 4 });
```

The `family: 4` option tells Mongoose to resolve hostnames using IPv4 only. Without this, Node.js may try IPv6 first, fail, and not fall back cleanly — adding another potential point of failure on networks where IPv6 isn't fully configured.

---

## The Final `db.ts`

```typescript
import { setServers } from 'dns';
import mongoose from 'mongoose';

setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables');
  await mongoose.connect(uri, { family: 4 });
  console.log('MongoDB connected');
};
```

---

## Still failing on a new machine?

If you still see `ETIMEDOUT` after this fix, check:

1. **`.env` is filled in** — `MONGO_URI` must not be empty.
2. **Atlas IP Access List** — go to MongoDB Atlas → Network Access and confirm `0.0.0.0/0` is active, or add your machine's IP.
3. **Firewall blocking port 53** — if your network blocks outbound DNS to `8.8.8.8`, the override won't help. Try connecting on a different network (e.g. phone hotspot) to confirm.
4. **Firewall blocking port 27017** — MongoDB Atlas connects over port 27017. Some corporate networks block it. Again, test on a hotspot.
