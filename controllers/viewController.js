const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Getting all the Tours
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'Overview',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Getting the Tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
  });

  if (!tour) {
    return next(new AppError('No Tour with such name exists', 404));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({ user: req.user.id });

  const toursId = booking.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: toursId } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

exports.getSignupForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Signup',
  });
});

exports.getForgotForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Forgot my password',
  });
});

exports.getResetForm = catchAsync(async (req, res, next) => {
  res.status(200).render('reset', {
    title: 'Reset password',
    token: req.params.token,
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'My account',
  });
});
