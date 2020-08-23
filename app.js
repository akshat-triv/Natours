const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanatize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorController = require('./controllers/errorController');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'https://*.mapbox.com', 'https://*.stripe.com'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: [
          "'self'",
          'https://js.stripe.com/v3',
          'https://cdnjs.cloudflare.com',
          'https://api.mapbox.com',
          'blob:',
        ],
        objectSrc: ["'none'"],
        frameSrc: ["'self'", 'https://*.stripe.com/'],
        styleSrc: ["'self'", 'https:', 'unsafe-inline'],
        upgradeInsecureRequests: [],
      },
    })
  );
}

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanatize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'difficulty',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'duration',
    ],
  })
);

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from the same IP. Try again later',
});

app.use('/api', limiter);

//mounting the routers
app.use('/', viewRouter);
app.use('/api/v1/booking', bookingRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/review', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't process ${req.originalUrl}`, 404));
});

app.use(globalErrorController);

module.exports = app;
