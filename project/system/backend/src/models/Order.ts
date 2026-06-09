import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  price: number;
  unit: string;
  quantity: number;
}

export interface IOrder extends Document {
  buyer: Types.ObjectId;
  farmer: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  notes?: string;
  paymentStatus: 'unpaid' | 'paid';
  reference?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        unit: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryAddress: { type: String, required: true },
    notes: { type: String },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    reference: { type: String, index: true },
  },
  { timestamps: true }
);

OrderSchema.pre('save', function (next) {
  if (this.isNew && !this.reference) {
    this.reference = this._id.toString().slice(-6).toLowerCase();
  }
  next();
});

OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ farmer: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
