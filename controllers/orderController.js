import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { supplier, items } = req.body;

  const order = new Order({
    customer: req.user._id,
    supplier,
    items,
    status: 'en attente'
  });

  await order.save();
  res.status(201).json(order);
});
