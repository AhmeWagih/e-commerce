const User = require('../models/userModel');
const Product = require('../models/productModel');
const PromoCode = require('../models/promoCodeModel');
const Order = require('../models/orderModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const filter = { deletedAt: null };
  if (!req.query.includeInactive) {
    filter.active = { $ne: false };
  }
  const users = await User.find(filter);

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.createNewUser = catchAsync(async (req, res, next) => {
  if (Object.hasOwn(req.body, 'role')) {
    req.body.role = undefined;
  }
  const userInfo = await User.create(req.body);

  userInfo.cofirmPassword = undefined;

  //Create a cart for a new user

  //Create a wishlist for a new user


  res.status(201).json({
    status: 'success',
    data: {
      userInfo,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Not found user with this id', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const body = req.body;

  if (Object.hasOwn(body, 'password')) {
    return next(new AppError("You can't change password in this request"));
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Not found user with this id', 400));
  }

  if (user.role === 'admin') {
    return next(new AppError('Cannot delete an admin account', 400));
  }

  user.deletedAt = new Date();
  user.active = false;
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    message: 'User was deactivated',
  });
});

exports.deleteAllUsers = catchAsync(async (req, res, next) => {
  await User.deleteMany({});

  res.status(204).json({
    status: 'success',
    message: 'Users deleted',
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const userInfo = req.body;

  //can't Change Password
  if (userInfo.password || userInfo.cofirmPassword || userInfo.role) {
    return next(
      new AppError("You can't Change Password or Role In this Endpoint!", 400)
    );
  }

  // update User
  const user = await User.findByIdAndUpdate(req.user._id, userInfo, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'User information Updated',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    message: 'User was deleted!',
  });
});

exports.getWishlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist.productId'
  );

  res.status(200).json({
    status: 'success',
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new AppError('productId is required', 400));
  }

  const user = await User.findById(req.user._id);

  const exists = user.wishlist.some(
    (item) => item.productId.toString() === productId
  );

  if (!exists) {
    user.wishlist.push({ productId });
    await user.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      wishlist: user.wishlist,
    },
  });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (item) => item.productId.toString() !== productId
  );

  await user.save();

  res.status(204).json({
    status: 'success',
    message: 'Product removed from wishlist',
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    data: {
      orders
    },
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, promoCode, shippingFee } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Order items are required', 400));
  }

  let subtotal = 0;
  const normalizedItems = [];

  for (const it of items) {
    const pid = it.productId || it.product;
    const product = await Product.findById(pid);
    if (!product) {
      return next(new AppError(`Product not found: ${pid}`, 400));
    }
    const qty = it.quantity || 1;
    if (qty > product.quantity) {
      return next(new AppError(`Not enough stock for ${product.title}`, 400));
    }
    const unitPrice = product.price - (product.price * product.discount) / 100;
    subtotal += unitPrice * qty;
    normalizedItems.push({
      productId: product._id,
      sellerId: product.seller ? product.seller._id || product.seller : undefined,
      quantity: qty,
      unitPrice,
      sellerStatus: 'pending',
    });
  }

  let promoDiscount = 0;
  let appliedCode;

  if (promoCode) {
    const promo = await PromoCode.findOne({ code: String(promoCode).toUpperCase() });
    if (!promo || !promo.active) {
      return next(new AppError('Invalid promo code', 400));
    }
    if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) {
      return next(new AppError('Promo code has expired', 400));
    }
    if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
      return next(new AppError('Promo code usage limit reached', 400));
    }
    if (subtotal < promo.minOrderAmount) {
      return next(new AppError('Order does not meet minimum for this promo', 400));
    }
    promoDiscount = promo.computeDiscount(subtotal);
    appliedCode = promo.code;
    await PromoCode.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
  }

  const ship = Number(shippingFee);
  const shipping = Number.isFinite(ship) && ship >= 0 ? ship : 50;
  const totalAmount = Math.max(0, subtotal - promoDiscount + shipping);

  const user = await User.findById(req.user._id);

  user.orders.push({
    items: normalizedItems,
    totalAmount,
    subtotalBeforePromo: subtotal,
    promoCode: appliedCode,
    promoDiscount,
    shippingAddress,
    paymentMethod,
    status: 'pending',
  });

  await user.save();

  const sellerRevenueMap = new Map();
  normalizedItems.forEach((item) => {
    if (!item.sellerId) return;
    const key = item.sellerId.toString();
    const amount = Number(item.unitPrice) * Number(item.quantity);
    sellerRevenueMap.set(key, Number(sellerRevenueMap.get(key) || 0) + amount);
  });

  for (const [sellerId, amount] of sellerRevenueMap.entries()) {
    await User.findByIdAndUpdate(sellerId, {
      $inc: { 'sellerWallet.pendingBalance': amount },
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      orders: user.orders,
      lastOrder: user.orders[user.orders.length - 1],
    },
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    'reviews.productId'
  );

  res.status(200).json({
    status: 'success',
    data: {
      reviews: user.reviews,
    },
  });
});

exports.addReview = catchAsync(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    return next(new AppError('productId and rating are required', 400));
  }

  const user = await User.findById(req.user._id);

  user.reviews.push({
    productId,
    rating,
    comment,
  });

  await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      reviews: user.reviews,
    },
  });
});

exports.currentUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
});