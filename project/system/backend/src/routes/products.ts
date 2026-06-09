import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import Product from '../models/Product';
import { protect, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/products — public, filter by category/available/search, paginate
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category, available, page = '1', limit = '10', search } = req.query;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (available !== undefined) filter.isAvailable = available === 'true';
  else filter.isAvailable = true;
  if (search) {
    const re = { $regex: search as string, $options: 'i' };
    filter.$or = [{ title: re }, { description: re }];
  }

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('farmer', 'name profilePhoto isVerified avgRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.json({ products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// GET /api/products/nearby — geolocation search
router.get(
  '/nearby',
  [
    query('lat').isFloat().withMessage('lat is required'),
    query('lng').isFloat().withMessage('lng is required'),
    query('radius').optional().isFloat({ min: 0.1 }).withMessage('radius must be a positive number'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat((req.query.radius as string) || '10');

    const products = await Product.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1000,
        },
      },
    }).populate('farmer', 'name profilePhoto isVerified avgRating locationName');

    res.json(products);
  }
);

// GET /api/products/my — farmer's own listings
router.get('/my', protect, requireRole('farmer'), async (req: AuthRequest, res: Response): Promise<void> => {
  const products = await Product.find({ farmer: req.user!.id }).sort({ createdAt: -1 });
  res.json(products);
});

// GET /api/products/:id — single product
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id).populate(
    'farmer',
    'name profilePhoto isVerified avgRating reviewCount phone locationName'
  );
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json(product);
});

// POST /api/products — farmer creates listing
router.post(
  '/',
  protect,
  requireRole('farmer'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category')
      .isIn(['vegetables', 'fruits', 'grains', 'livestock', 'inputs'])
      .withMessage('Invalid category'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('unit')
      .isIn(['kg', 'crate', 'bunch', 'piece', 'litre'])
      .withMessage('Invalid unit'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('location.coordinates')
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage('location.coordinates must be [lng, lat]'),
    body('locationName').optional().trim(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ message: errors.array()[0].msg });
      return;
    }

    const productData: any = {
      ...req.body,
      farmer: req.user!.id,
    };
    if (req.body.location?.coordinates) {
      productData.location = { type: 'Point', coordinates: req.body.location.coordinates };
    }

    const product = await Product.create(productData);

    res.status(201).json(product);
  }
);

// PUT /api/products/:id — farmer updates own listing
router.put(
  '/:id',
  protect,
  requireRole('farmer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.farmer.toString() !== req.user!.id) {
      res.status(403).json({ message: 'Not authorised to edit this listing' });
      return;
    }

    const allowed = ['title', 'category', 'description', 'price', 'unit', 'quantity', 'images', 'location', 'locationName', 'isAvailable'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (req.body.location?.coordinates) {
      updates.location = { type: 'Point', coordinates: req.body.location.coordinates };
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  }
);

// DELETE /api/products/:id — farmer removes own listing
router.delete(
  '/:id',
  protect,
  requireRole('farmer'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.farmer.toString() !== req.user!.id) {
      res.status(403).json({ message: 'Not authorised to delete this listing' });
      return;
    }

    await product.deleteOne();
    res.json({ message: 'Listing removed' });
  }
);

export default router;
