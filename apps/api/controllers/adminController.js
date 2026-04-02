const mongoose = require('mongoose');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const PromoCode = require('../models/promoCodeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const accountStatuses = ['pending', 'active', 'restricted'];

exports.listUsers = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.accountStatus && accountStatuses.includes(req.query.accountStatus)) {
    if (req.query.accountStatus === 'active') {
      filter.$or = [{ accountStatus: 'active' }, { accountStatus: { $exists: false } }, { accountStatus: null }];
    } else {
      filter.accountStatus = req.query.accountStatus;
    }
  }
  if (req.query.role) filter.role = req.query.role;
  if (req.query.includeDeleted !== 'true') {
    filter.deletedAt = null;
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select('+active +emailConfirmed username email phone name role accountStatus deletedAt createdAt')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.updateUserAccount = catchAsync(async (req, res, next) => {
  const { accountStatus } = req.body;
  if (!accountStatus || !accountStatuses.includes(accountStatus)) {
    return next(new AppError(`accountStatus must be one of: ${accountStatuses.join(', ')}`, 400));
  }

  const user = await User.findById(req.params.userId);
  if (!user || user.deletedAt) {
    return next(new AppError('User not found', 404));
  }
  if (user.role === 'admin' && accountStatus !== 'active') {
    return next(new AppError('Cannot restrict or pend another admin this way', 400));
  }

  user.accountStatus = accountStatus;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) return next(new AppError('User not found', 404));
  if (user.role === 'admin') {
    return next(new AppError('Cannot soft-delete an admin account', 400));
  }

  user.deletedAt = new Date();
  user.active = false;
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'User deactivated',
    data: { user },
  });
});

exports.restoreUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) return next(new AppError('User not found', 404));

  user.deletedAt = null;
  user.active = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.listOrders = catchAsync(async (req, res) => {
  const match = { status: { $exists: true } };
  if (req.query.status) {
    match.status = req.query.status;
  }

  const orders = await Order.find(match)
    .populate('user', '_id name email')
    .sort('-createdAt')
    .lean();

  const result = orders.map((order) => ({
    userId: order.user?._id,
    userName: order.user?.name || 'Unknown',
    userEmail: order.user?.email || 'Unknown',
    order: {
      _id: order._id,
      status: order.status,
      totalAmount: order.shippingCost || 0,
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
      shippingNotes: order.shippingNotes || '',
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
    },
  }));

  res.status(200).json({
    status: 'success',
    results: result.length,
    data: { orders: result },
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, trackingNumber, carrier, shippingNotes } = req.body;

  if (!mongoose.isValidObjectId(orderId)) {
    return next(new AppError('Invalid order ID', 400));
  }

  const order = await Order.findById(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  if (status) {
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
    if (!allowed.includes(status)) {
      return next(new AppError(`Invalid status. Must be one of: ${allowed.join(', ')}`, 400));
    }
    order.status = status;
  }
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (carrier !== undefined) order.carrier = carrier;
  if (shippingNotes !== undefined) order.shippingNotes = shippingNotes;

  await order.save();

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

exports.listPromos = catchAsync(async (req, res) => {
  const promos = await PromoCode.find().sort('-createdAt');
  res.status(200).json({
    status: 'success',
    results: promos.length,
    data: { promos },
  });
});

exports.createPromo = catchAsync(async (req, res, next) => {
  const payload = { ...req.body };
  if (payload.code) payload.code = String(payload.code).toUpperCase();
  try {
    const promo = await PromoCode.create(payload);
    res.status(201).json({
      status: 'success',
      data: { promo },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('Promo code already exists', 400));
    }
    throw err;
  }
});

exports.updatePromo = catchAsync(async (req, res, next) => {
  const payload = { ...req.body };
  if (payload.code) payload.code = String(payload.code).toUpperCase();
  const promo = await PromoCode.findByIdAndUpdate(req.params.promoId, payload, {
    new: true,
    runValidators: true,
  });
  if (!promo) return next(new AppError('Promo not found', 404));
  res.status(200).json({
    status: 'success',
    data: { promo },
  });
});

exports.deletePromo = catchAsync(async (req, res, next) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.promoId);
  if (!promo) return next(new AppError('Promo not found', 404));
  res.status(204).json({ status: 'success', data: null });
});

exports.validatePromo = catchAsync(async (req, res, next) => {
  const { code, subtotal } = req.body;
  if (!code || subtotal === undefined) {
    return next(new AppError('code and subtotal are required', 400));
  }

  const promo = await PromoCode.findOne({ code: String(code).toUpperCase() });
  if (!promo || !promo.active) {
    return next(new AppError('Invalid or inactive promo code', 400));
  }
  if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) {
    return next(new AppError('Promo code has expired', 400));
  }
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return next(new AppError('Promo code usage limit reached', 400));
  }
  const sub = Number(subtotal);
  if (Number.isNaN(sub) || sub < 0) {
    return next(new AppError('subtotal must be a non-negative number', 400));
  }
  if (sub < promo.minOrderAmount) {
    return next(
      new AppError(`Minimum order amount for this code is ${promo.minOrderAmount}`, 400)
    );
  }

  const discount = promo.computeDiscount(sub);

  res.status(200).json({
    status: 'success',
    data: {
      code: promo.code,
      discount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    },
  });
});
