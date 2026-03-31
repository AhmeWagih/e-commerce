const express = require('express');
const categoryController = require('../controllers/categoryController');
const productRouter = require('./productRoutes');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router.use('/:categoryId/products', productRouter);

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo('admin'), categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(protect, restrictTo('admin'), categoryController.updateCategory)
  .delete(protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
