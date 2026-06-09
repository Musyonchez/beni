import { Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest, protect, requireRole } from '../middleware/auth';

const router = Router();

// POST /api/orders — buyer places an order
router.post(
  '/',
  protect,
  requireRole('buyer'),
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.productId').notEmpty().withMessage('Product ID required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryAddress').notEmpty().withMessage('Delivery address required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { items, deliveryAddress, notes } = req.body;

    // Load products and verify they belong to the same farmer
    const productIds = items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isAvailable: true });

    if (products.length !== items.length) {
      res.status(400).json({ message: 'One or more products are unavailable' });
      return;
    }

    const farmerIds = [...new Set(products.map((p) => p.farmer.toString()))];
    if (farmerIds.length > 1) {
      res.status(400).json({ message: 'All items must be from the same farmer' });
      return;
    }

    const orderItems = items.map((i: any) => {
      const product = products.find((p) => p._id.toString() === i.productId);
      return {
        product: product!._id,
        title: product!.title,
        price: product!.price,
        unit: product!.unit,
        quantity: i.quantity,
      };
    });

    // Check each item has enough stock
    for (const i of items) {
      const product = products.find((p) => p._id.toString() === i.productId);
      if (product!.quantity < i.quantity) {
        res.status(400).json({ message: `Not enough stock for "${product!.title}" (${product!.quantity} ${product!.unit} left)` });
        return;
      }
    }

    const total = orderItems.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      buyer: req.user!.id,
      farmer: farmerIds[0],
      items: orderItems,
      total,
      deliveryAddress,
      notes,
    });

    // Deduct stock for each ordered item
    await Promise.all(
      items.map((i: any) =>
        Product.findByIdAndUpdate(i.productId, { $inc: { quantity: -i.quantity } })
      )
    );

    res.status(201).json(order);
  }
);

// GET /api/orders/my — buyer's own orders
router.get('/my', protect, requireRole('buyer'), async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await Order.find({ buyer: req.user!.id })
    .sort({ createdAt: -1 })
    .populate('farmer', 'name phone');
  res.json(orders);
});

// GET /api/orders/farmer — farmer sees incoming orders
router.get('/farmer', protect, requireRole('farmer'), async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await Order.find({ farmer: req.user!.id })
    .sort({ createdAt: -1 })
    .populate('buyer', 'name phone');
  res.json(orders);
});

// GET /api/orders/:id — single order (buyer or farmer)
router.get('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name phone')
    .populate('farmer', 'name phone');

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  const userId = req.user!.id;
  if (order.buyer.toString() !== userId && order.farmer.toString() !== userId) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  res.json(order);
});

// PUT /api/orders/:id/status — farmer updates order status
router.put(
  '/:id/status',
  protect,
  requireRole('farmer'),
  body('status').isIn(['confirmed', 'ready', 'delivered']).withMessage('Invalid status'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    if (order.farmer.toString() !== req.user!.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    if (order.status === 'cancelled') {
      res.status(400).json({ message: 'Cannot update a cancelled order' });
      return;
    }

    const NEXT: Record<string, string> = { pending: 'confirmed', confirmed: 'ready', ready: 'delivered' };
    if (req.body.status !== NEXT[order.status]) {
      res.status(400).json({ message: `Status must advance from ${order.status} to ${NEXT[order.status] ?? '(already final)'}` });
      return;
    }

    order.status = req.body.status;
    await order.save();
    res.json(order);
  }
);

// PUT /api/orders/:id/cancel — buyer cancels a pending order
router.put('/:id/cancel', protect, requireRole('buyer'), async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  if (order.buyer.toString() !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  if (order.status !== 'pending') {
    res.status(400).json({ message: 'Only pending orders can be cancelled' });
    return;
  }

  order.status = 'cancelled';
  await order.save();
  res.json(order);
});

export default router;
