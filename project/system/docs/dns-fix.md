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

The fix is controlled by a `DNS_FIX` environment variable so each developer can enable it only on machines that need it. Others connect normally without any DNS override.

### In your `.env` file

Add this line **only on machines that hit the DNS error**:

```
DNS_FIX=true
```

Leave it out (or set it to `false`) on machines that connect fine without it.

### What `DNS_FIX=true` does in `db.ts`

```typescript
if (process.env.DNS_FIX === 'true') {
  // Override DNS to Google's public servers (supports SRV lookups)
  setServers(['8.8.8.8', '8.8.4.4']);
  // Force IPv4 to avoid IPv6 fallback failures
  await mongoose.connect(uri, { family: 4 });
} else {
  await mongoose.connect(uri);
}
```

- **`setServers(['8.8.8.8', '8.8.4.4'])`** — tells Node.js to use Google's public DNS instead of the system default. Google DNS fully supports SRV record lookups, which is what `mongodb+srv://` needs.
- **`family: 4`** — forces IPv4-only hostname resolution, avoiding silent IPv6 fallback failures.

---

## The Final `db.ts`

```typescript
import mongoose from 'mongoose';
import { setServers } from 'dns';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables');

  if (process.env.DNS_FIX === 'true') {
    setServers(['8.8.8.8', '8.8.4.4']);
    await mongoose.connect(uri, { family: 4 });
  } else {
    await mongoose.connect(uri);
  }

  console.log('MongoDB connected');
};
```

---

## Still failing on a new machine?

If you still see `ETIMEDOUT` after adding `DNS_FIX=true`, check:

1. **`.env` is filled in** — `MONGO_URI` must not be empty.
2. **Atlas IP Access List** — go to MongoDB Atlas → Network Access and confirm `0.0.0.0/0` is active, or add your machine's IP.
3. **Firewall blocking port 53** — if your network blocks outbound DNS to `8.8.8.8`, the override won't help. Try connecting on a different network (e.g. phone hotspot) to confirm.
4. **Firewall blocking port 27017** — MongoDB Atlas connects over port 27017. Some corporate networks block it. Again, test on a hotspot.
