import mongoose from 'mongoose';
import { setServers } from 'dns';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables');

  if (process.env.DNS_FIX === 'true') {
    // DNS_FIX=true in .env on machines where MongoDB Atlas SRV lookup fails
    setServers(['8.8.8.8', '8.8.4.4']);
    await mongoose.connect(uri, { family: 4 });
  } else {
    await mongoose.connect(uri);
  }

  console.log('MongoDB connected');
};
