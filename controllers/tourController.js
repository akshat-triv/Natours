const multer = require('multer');
const sharp = require('sharp');

const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const factory = require('./controllerFactory');
const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') cb(null, true);
  else
    cb(
      new AppError(
        'Selected file is not an image. Only Image can be uploaded',
        400
      ),
      false
    );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (req.files.imageCover) {
    const coverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1300)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${coverFileName}`);

    req.body.imageCover = coverFileName;
  }

  if (req.files.images) {
    let images = [];

    await Promise.all(
      req.files.images.map(async (image, i) => {
        const imageFileName = `tour-${req.params.id}-${Date.now()}-${
          i + 1
        }.jpeg`;

        await sharp(image.buffer)
          .resize(2000, 1300)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${imageFileName}`);

        images.push(imageFileName);
      })
    );

    req.body.images = images;
  }

  next();
});

exports.alias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,duration,difficulty,imageCover,price,ratingsAverage';

  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.postTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.toursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlon, unit } = req.params;

  const [lat, lon] = latlon.split(',');

  if (!lat || !lon) {
    next(
      new AppError('Please specify your location latitude and longitude', 400)
    );
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });

  res
    .status(200)
    .json({ status: 'success', length: tours.length, data: tours });
});

exports.tourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        num: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    //{ $match: { _id: { $ne: 'EASY' } } },
  ]);

  res.status(200).json({ status: 'success', data: { stats } });
});

exports.monthPlan = catchAsync(async (req, res) => {
  const year = req.params.year;

  const data = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  //console.log(data);
  res.status(200).json({ status: 'success', data: { data } });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlon, unit } = req.params;

  const [lat, lon] = latlon.split(',');

  if (!lat || !lon) {
    next(
      new AppError('Please specify your location latitude and longitude', 400)
    );
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  const data = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
    {
      $sort: { distance: 1 },
    },
  ]);

  res.status(200).json({ status: 'success', data });
});
