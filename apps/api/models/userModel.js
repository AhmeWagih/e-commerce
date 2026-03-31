const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
  username: {
    type: String,
    required: [true, 'Username is required!'],
    unique: [true, 'Username must be unique!'],
  },
  email: {
    type: String,
    required: [true, 'Email is required!'],
    unique: [true, 'Email must be unique!'],
    validate: {
      validator: function (v) {
        return validator.isEmail(v);
      },
      message: 'email is not correct!',
    },
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required!'],
    unique: [true, 'Phone number must be unique!'],
    validate: {
      validator: function (v) {
        return validator.isMobilePhone(v);
      },
      message: 'phone number is not valid!',
    },
  },
  name: {
    type: String,
    required: [true, 'Name is required!'],
  },
  address: String,
  paymentDetails: {
    cardLast4: String,
    cardBrand: String,
    billingAddress: String,
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer',
  },
  accountStatus: {
    type: String,
    enum: ['pending', 'active', 'restricted'],
    default: 'active',
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    select: false,
    validate: {
      validator: function (v) {
        return validator.isStrongPassword(v);
      },
      message:
        'Password must have minLength 8 and contain at least 1 Uppercase letter and at least 1 Number and at least 1 Symbol',
    },
  },
  confirmPassword: {
    type: String,
    required: [true, 'ConfirmPassword is required!'],
    select: false,
    validate: {
      validator: function (v) {
        return this.password === v;
      },
      message: 'Password is not match with Confirm password',
    },
  },
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  orders: [
    {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
          },
          quantity: {
            type: Number,
            default: 1,
          },
          unitPrice: Number,
        },
      ],
      totalAmount: {
        type: Number,
        default: 0,
      },
      subtotalBeforePromo: Number,
      promoCode: String,
      promoDiscount: {
        type: Number,
        default: 0,
      },
      shippingAddress: {
        address: String,
        city: String,
        zipCode: String,
      },
      paymentMethod: {
        type: String,
        enum: ['credit', 'cod'],
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
        default: 'pending',
      },
      trackingNumber: String,
      carrier: String,
      shippingNotes: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  reviews: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  refreshToken: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  password,
  correctPassword
) {
  return await bcrypt.compare(password, correctPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;