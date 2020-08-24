const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name length should be less than 40 characters'],
      minlength: [10, 'Name length should be more than 10 characters'],
      //validate: validator.isAlpha,
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than price',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be greater than 0'],
      max: [5, 'Rating should be less than equal to 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'value can either be easy,medium,difficult',
      },
    },
    summary: {
      type: String,
      required: [true, 'A Tour must have a Summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    secretTour: {
      type: Boolean,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a imageCover'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    images: [String],
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//Document MiddleWare: runs before .save() and .create()

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Query MiddleWare: runs before all methods start with find

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.date = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.date} millisecondes`);
//   next();
// });

//Aggregation MiddleWare: runs before all the aggregation pipelines

tourSchema.pre('aggregate', function (next) {
  if ('$geoNear' in this.pipeline()[0]) return next();
  //console.log('$geoNear' in this.pipeline()[0]);
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log('$geoNear' in this.pipeline()[0]);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
