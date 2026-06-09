import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors as Record<string, { message: string }>)
      .map((e) => e.message)
      .join(', ');
    res.status(400).json({ message });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ message: 'Invalid ID format' });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    res.status(400).json({ message: `${field} already exists` });
    return;
  }

  res.status(err.status ?? 500).json({ message: err.message || 'Internal Server Error' });
};
