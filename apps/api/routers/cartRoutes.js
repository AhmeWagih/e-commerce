const express = require('express');

const router = express.Router();

//Controllers
const cartController = require('../controllers/cartController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')

router.use(protect);
router.use(restrictTo('customer'));

router.route('/').get(cartController.getCart).post(cartController.addCartItem);

router
  .route('/:itemId')
  .patch(cartController.updateCartItem)
  .delete(cartController.deleteCartItem);

module.exports = router;
