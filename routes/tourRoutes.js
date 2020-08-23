const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.alias, tourController.getAllTours);

router.route('/tourStats').get(tourController.tourStats);

router
  .route('/monthly-plan/:year')
  .get(authController.protect, tourController.monthPlan);

router.get(
  '/tours-within/:distance/center/:latlon/unit/:unit',
  tourController.toursWithin
);

//tours-within/400/center/34.026990,-118.192043/unit/mi

router.get('/distance/:latlon/unit/:unit', tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.postTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
