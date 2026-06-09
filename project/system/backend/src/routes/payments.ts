import { Response, Router } from 'express';
import Order from '../models/Order';
import { AuthRequest, protect, requireRole } from '../middleware/auth';
import { initiateStkPush } from '../services/mpesa';

const router = Router();

// POST /api/payments/initiate — buyer triggers STK push for an order
router.post('/initiate', protect, requireRole('buyer'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400).json({ message: 'orderId is required' });
    return;
  }

  const order = await Order.findById(orderId).populate('buyer', 'phone');
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  if (order.buyer.toString() !== req.user!.id && (order.buyer as any)._id?.toString() !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  if (order.paymentStatus === 'paid') {
    res.status(400).json({ message: 'Order already paid' });
    return;
  }

  const buyerPhone = (order.buyer as any).phone as string;

  try {
    const result = await initiateStkPush({
      phone: buyerPhone,
      amount: order.total,
      orderId: order._id.toString(),
      description: `FarmLink order payment`,
    });

    res.json({
      message: 'STK push sent. Enter your M-Pesa PIN on your phone.',
      checkoutRequestId: result.CheckoutRequestID,
    });
  } catch (err: any) {
    const mpesaError = err?.response?.data?.errorMessage ?? err?.message ?? 'M-Pesa request failed';
    res.status(502).json({ message: mpesaError });
  }
});

// POST /api/payments/callback — Safaricom posts payment result here (no auth)
router.post('/callback', async (req, res): Promise<void> => {
  const body = req.body?.Body?.stkCallback;

  if (!body) {
    res.status(400).json({ message: 'Invalid callback payload' });
    return;
  }

  const { ResultCode, CallbackMetadata } = body;

  if (ResultCode === 0 && CallbackMetadata) {
    // Extract M-Pesa receipt number and phone from metadata items
    const items: any[] = CallbackMetadata.Item ?? [];
    const receipt = items.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;
    const accountRef = items.find((i) => i.Name === 'AccountReference')?.Value as string | undefined;

    if (accountRef) {
      // AccountReference is "FarmLink-XXXXXX" where XXXXXX is last 6 chars of orderId
      const suffix = accountRef.replace('FarmLink-', '').toLowerCase();
      const order = await Order.findOne({ reference: suffix }).catch(() => null);

      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
        console.log(`Order ${order._id} marked as paid. Receipt: ${receipt}`);
      }
    }
  }

  // Always respond 200 to Safaricom
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// GET /api/payments/status/:orderId — check payment status
router.get('/status/:orderId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.orderId).select('paymentStatus status buyer');
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  if (order.buyer.toString() !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  res.json({ paymentStatus: order.paymentStatus, orderStatus: order.status });
});

export default router;
