const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ active: { $ne: false } });

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
  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    message: 'User was deleted!',
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

  res.status(200).json({
    status: 'success',
    data: {
      orders: user.orders,
    },
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, totalAmount, status } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Order items are required', 400));
  }

  const user = await User.findById(req.user._id);

  user.orders.push({
    items,
    totalAmount: totalAmount || 0,
    status: status || 'pending',
  });

  await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      orders: user.orders,
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