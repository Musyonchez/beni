import { setServers } from 'dns';
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables');

  if (process.env.DNS_FIX === 'true') {
    // DNS_FIX=true — use this on machines where MongoDB Atlas SRV lookup fails
    // (ISP DNS can't resolve *.mongodb.net; override with Google DNS + force IPv4)
    // Set DNS_FIX=true in .env on the affected machine, leave it out or set to false elsewhere
    setServers(['8.8.8.8', '8.8.4.4']);
    await mongoose.connect(uri, { family: 4 });
  } else {
    // Default — plain connection, works on most machines without DNS issues
    await mongoose.connect(uri);
  }

  console.log('MongoDB connected');
};
