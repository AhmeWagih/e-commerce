const express = require('express');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');
const sellerController = require('../controllers/sellerController');

const router = express.Router();

router.use(protect);

router.post('/register', sellerController.registerSeller);
router.get('/me', restrictTo('seller', 'admin'), sellerController.getMySellerProfile);
router.patch('/me', restrictTo('seller', 'admin'), sellerController.updateMySellerProfile);

router.get(
  '/inventory',
  restrictTo('seller', 'admin'),
  sellerController.getMyInventory
);
router.patch(
  '/inventory/:productId',
  restrictTo('seller', 'admin'),
  sellerController.updateInventory
);

router.get('/orders', restrictTo('seller', 'admin'), sellerController.getMyOrders);
router.patch(
  '/orders/:customerId/:orderId/items/:itemId/status',
  restrictTo('seller', 'admin'),
  sellerController.updateOrderItemStatus
);

router.get('/earnings', restrictTo('seller', 'admin'), sellerController.getMyEarnings);
router.post('/payouts', restrictTo('seller', 'admin'), sellerController.requestPayout);

module.exports = router;
