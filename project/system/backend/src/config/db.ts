import { setServers } from 'dns';
import mongoose from 'mongoose';

setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables');
  await mongoose.connect(uri, { family: 4 });
  console.log('MongoDB connected');
};
