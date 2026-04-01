const express = require('express');
<<<<<<< HEAD

const router = express.Router();

//Controller
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')

//Router
const productRouter = require('./productRoutes');

// Products of specific Category
=======
const categoryController = require('../controllers/categoryController');
const productRouter = require('./productRoutes');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

>>>>>>> cec5ac635426012cf332a7c7a2c2989c54a5d3a4
router.use('/:categoryId/products', productRouter);

router
  .route('/')
  .get(categoryController.getAllCategories)
<<<<<<< HEAD
  .post(protect, restrictTo('admin'), categoryController.createCategory)
  .delete(protect, restrictTo('admin'), categoryController.deleteAllCategories);

router
  .route('/:categoryId')
  .get(categoryController.getCategory)
  .patch(
    protect,
    restrictTo('admin'),
    categoryController.uploadProductImages,
    categoryController.resizeImages,
    categoryController.updateCategory
  )
  .delete(protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
=======
  .post(protect, restrictTo('admin'), categoryController.createCategory);

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(protect, restrictTo('admin'), categoryController.updateCategory)
  .delete(protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;
>>>>>>> cec5ac635426012cf332a7c7a2c2989c54a5d3a4
