const AppError = require('./../utils/appError');

const handleCastErr = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTErr = () => new AppError('Invalid email or password', 401);

const handleJWTExpiredErr = () =>
  new AppError('Login session has expired, Login again', 401);

const handleDuplicateKeyErr = (err) => {
  let value = JSON.stringify(err.keyValue);
  value = value.slice(1, value.length - 1);
  value = value.split(':');
  value[0] = value[0].slice(1, value[0].length - 1);
  value[1] = value[1].slice(1, value[1].length - 1);

  const message = `${value[0]} : ${value[1]} already exists. Use any other value`;
  return new AppError(message, 400);
};

const handleValidationErr = (err) => {
  const errors = Object.values(err.errors).map((el) => el.properties.message);
  const message = `Invalid Field Values. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const errorHandleDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err: err,
      stack: err.stack,
    });
  }
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const errorHandleProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //console.error('ERROR', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  //console.error('ERROR', err);
  return res.status(500).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later sometime',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    errorHandleDev(err, req, res);
    //console.log(err.name);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErr(error);
    if (err.code === 11000) error = handleDuplicateKeyErr(error);
    if (err.name === 'ValidationError') error = handleValidationErr(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTErr();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredErr();

    errorHandleProd(error, req, res);
  }
};
