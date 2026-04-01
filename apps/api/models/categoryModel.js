const mongoose = require('mongoose');
<<<<<<< HEAD
const slugify = require('slugify');
const Product = require('./productModel');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required!'],
    unique: [true, 'Category name is unique!'],
  },
  parent: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  slug: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

//Indexes
categorySchema.index({ parent: 1 });

categorySchema.pre('save', async function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

categorySchema.pre(/^findOneAnd/, async function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

categorySchema.pre('findOneAndDelete', async function (next) {
  const categoryId = this.getFilter()._id;
  await Product.updateMany(
    { category: categoryId },
    { $unset: { category: '' } },
    {
      runValidators: true,
    }
  );

  next();
});

const Category = new mongoose.model('Category', categorySchema);

module.exports = Category;
=======

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    description: String,
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
>>>>>>> cec5ac635426012cf332a7c7a2c2989c54a5d3a4
