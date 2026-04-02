const express = require('express');
const adminController = require('../controllers/adminController');
const siteContentController = require('../controllers/siteContentController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/users', adminController.listUsers);
router.patch('/users/:userId/account', adminController.updateUserAccount);
router.delete('/users/:userId', adminController.softDeleteUser);
router.patch('/users/:userId/restore', adminController.restoreUser);

router.get('/orders', adminController.listOrders);
router.patch('/orders/:orderId', adminController.updateOrder);

router.get('/promos', adminController.listPromos);
router.post('/promos', adminController.createPromo);
router.patch('/promos/:promoId', adminController.updatePromo);
router.delete('/promos/:promoId', adminController.deletePromo);

router.patch('/site-content', siteContentController.updateSiteContent);

module.exports = router;
