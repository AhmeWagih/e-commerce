const User = require('../models/userModel');
const Product = require('../models/productModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const normalizeOrderStatus = (items) => {
  if (!items || items.length === 0) return 'pending';
  if (items.every((it) => it.sellerStatus === 'cancelled')) return 'cancelled';
  if (items.every((it) => it.sellerStatus === 'delivered')) return 'completed';
  if (items.some((it) => it.sellerStatus === 'shipped')) return 'shipped';
  if (items.some((it) => it.sellerStatus === 'processing')) return 'paid';
  return 'pending';
};

exports.registerSeller = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError('User not found', 404));

  user.role = 'seller';
  user.sellerProfile = {
    ...user.sellerProfile,
    ...req.body,
    approvedAt: new Date(),
  };
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      seller: user,
    },
  });
});

exports.getMySellerProfile = catchAsync(async (req, res, next) => {
  const seller = await User.findById(req.user._id);
  res.status(200).json({
    status: 'success',
    data: { seller },
  });
});

exports.updateMySellerProfile = catchAsync(async (req, res, next) => {
  const blocked = ['role', 'sellerWallet', 'password', 'confirmPassword'];
  for (const key of blocked) {
    if (Object.hasOwn(req.body, key)) delete req.body[key];
  }

  const seller = await User.findById(req.user._id);
  if (!seller) return next(new AppError('Seller not found', 404));

  seller.sellerProfile = {
    ...seller.sellerProfile,
    ...req.body,
  };
  await seller.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: { seller },
  });
});

exports.getMyInventory = catchAsync(async (req, res, next) => {
  const products = await Product.find({ seller: req.user._id });
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products },
  });
});

exports.updateInventory = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  if (!Number.isFinite(Number(quantity)) || Number(quantity) < 0) {
    return next(new AppError('Quantity must be a positive number', 400));
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.productId, seller: req.user._id },
    { quantity: Number(quantity) },
    { new: true, runValidators: true }
  );

  if (!product) return next(new AppError('Product not found for this seller', 404));

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const customers = await User.find({
    'orders.items.sellerId': req.user._id,
  }).select('name email orders');

  const sellerOrders = [];
  customers.forEach((customer) => {
    customer.orders.forEach((order) => {
      const myItems = order.items.filter(
        (item) => item.sellerId && item.sellerId.toString() === req.user._id.toString()
      );
      if (myItems.length > 0) {
        sellerOrders.push({
          customerId: customer._id,
          customerName: customer.name,
          customerEmail: customer.email,
          orderId: order._id,
          createdAt: order.createdAt,
          status: normalizeOrderStatus(order.items),
          myItems,
        });
      }
    });
  });

  res.status(200).json({
    status: 'success',
    results: sellerOrders.length,
    data: { orders: sellerOrders },
  });
});

exports.updateOrderItemStatus = catchAsync(async (req, res, next) => {
  const { customerId, orderId, itemId } = req.params;
  const { sellerStatus } = req.body;
  const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(sellerStatus)) {
    return next(new AppError('Invalid sellerStatus', 400));
  }

  const customer = await User.findById(customerId);
  if (!customer) return next(new AppError('Customer not found', 404));

  const order = customer.orders.id(orderId);
  if (!order) return next(new AppError('Order not found', 404));

  const item = order.items.id(itemId);
  if (!item) return next(new AppError('Order item not found', 404));

  if (!item.sellerId || item.sellerId.toString() !== req.user._id.toString()) {
    return next(new AppError('This order item does not belong to you', 403));
  }

  const seller = await User.findById(req.user._id);
  const itemAmount = Number(item.unitPrice) * Number(item.quantity);

  if (item.sellerStatus !== 'delivered' && sellerStatus === 'delivered') {
    seller.sellerWallet.pendingBalance = Math.max(
      0,
      Number(seller.sellerWallet.pendingBalance || 0) - itemAmount
    );
    seller.sellerWallet.availableBalance =
      Number(seller.sellerWallet.availableBalance || 0) + itemAmount;
  }

  item.sellerStatus = sellerStatus;
  order.status = normalizeOrderStatus(order.items);

  await customer.save({ validateBeforeSave: false });
  await seller.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      order,
      item,
      wallet: seller.sellerWallet,
    },
  });
});

exports.getMyEarnings = catchAsync(async (req, res, next) => {
  const seller = await User.findById(req.user._id).select('+sellerWallet');
  res.status(200).json({
    status: 'success',
    data: {
      wallet: seller.sellerWallet,
    },
  });
});

exports.requestPayout = catchAsync(async (req, res, next) => {
  const { amount, method, reference, note } = req.body;
  const seller = await User.findById(req.user._id);
  const payoutAmount = Number(amount);

  if (!Number.isFinite(payoutAmount) || payoutAmount <= 0) {
    return next(new AppError('Payout amount must be greater than zero', 400));
  }
  if (payoutAmount > Number(seller.sellerWallet.availableBalance || 0)) {
    return next(new AppError('Insufficient available balance', 400));
  }

  seller.sellerWallet.availableBalance =
    Number(seller.sellerWallet.availableBalance || 0) - payoutAmount;
  seller.sellerWallet.totalPaid = Number(seller.sellerWallet.totalPaid || 0) + payoutAmount;
  seller.sellerWallet.payoutHistory.push({
    amount: payoutAmount,
    method: method || 'manual',
    reference,
    note,
  });

  await seller.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      wallet: seller.sellerWallet,
    },
  });
});
