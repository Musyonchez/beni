import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  farmer: Types.ObjectId;
  title: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'livestock' | 'inputs';
  description: string;
  price: number;
  unit: 'kg' | 'crate' | 'bunch' | 'piece' | 'litre';
  quantity: number;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationName: string;
  isAvailable: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'grains', 'livestock', 'inputs'],
      required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['kg', 'crate', 'bunch', 'piece', 'litre'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    locationName: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ location: '2dsphere' });
ProductSchema.index({ category: 1, isAvailable: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
