const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-tours', authController.protect, viewController.getMyTours);

router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingCheckout,
  viewController.getOverview
);

router.get('/tour/:slug', viewController.getTour);

router.get('/login', viewController.getLoginForm);
router.get('/forgotmypassword', viewController.getForgotForm);
router.get('/signup', viewController.getSignupForm);

router.get('/resetPassword/:token', viewController.getResetForm);

module.exports = router;
