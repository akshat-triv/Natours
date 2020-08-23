const catchAsync = require('../utils/catchAsync');
const Review = require('./../models/reviewModel');
const AppError = require('../utils/appError');
const factory = require('./controllerFactory');

exports.setIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.tour) req.body.tour = req.params.tourId;

  next();
};

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.postReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
