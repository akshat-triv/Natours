const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.use(authController.protect);

router.get('/session-checkout/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guides'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.postBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
