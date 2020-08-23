const { promisify } = require('util');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const JWT = require('jsonwebtoken');
const AppError = require('../utils/appError');
const NewMail = require('../utils/email');

const createToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const sendToken = (id, data, res, mess = undefined) => {
  const token = createToken(id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('JWT', token, cookieOptions);

  if (data) data.password = undefined;

  res.status(201).json({
    status: 'success',
    token: token,
    data,
    message: mess,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  await new NewMail(
    user,
    `${req.protocol}://${req.get('host')}/me`
  ).sendWelcome();

  sendToken(user._id, user, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //1) if email and password exitsts
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please enter your email and password', 400));
  }
  //2 if email and password are correct
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const correct = await user.checkPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('Invalid email or password', 401));
  }

  sendToken(user._id, undefined, res);
});

exports.logout = (req, res, next) => {
  res.cookie('JWT', undefined, {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  //1) checking the token came in
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }

  if (!token) {
    return next(new AppError('Please Login or SignUp to access'), 401);
  }

  //2) Verification of the Token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3) Checking if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User does not exist anymore', 401));
  }

  //4) Checking if the password been changed after the token was issued
  if (currentUser.passwordChanged(decoded.iat)) {
    return next(
      new AppError(
        'Recently password has been changed, please login again',
        401
      )
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  //1) checking the token came in cookies
  if (req.cookies.JWT) {
    //2) Verification of the Token
    try {
      const decoded = await promisify(JWT.verify)(
        req.cookies.JWT,
        process.env.JWT_SECRET
      );
      //console.log(decoded);

      //3) Checking if the user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      //4) Checking if the password been changed after the token was issued
      if (currentUser.passwordChanged(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have access to perform this action.', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) To get the user based on his email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user exists with this email'), 404);
  }
  //2) To get the Token
  const token = user.createPasswordToken();
  await user.save({ validateBeforeSave: false });

  //3) To send the mail

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${token}`;

    await new NewMail(user, resetURL).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to the requested email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError("Couldn't send the email", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) getting the user based on the token
  const cryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: cryptedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) checking the token is still valid

  if (!user) {
    return next(
      new AppError('User does not exist or the reset link has expired', 404)
    );
  }

  //3) setting the passwords
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  //4) Logging in the user by sending the jwt
  sendToken(user._id, undefined, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Getting the user

  const user = await User.findById(req.user._id).select('+password');

  //2) Checking if the password is correct

  if (
    !req.body.passwordCurrent ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError(
        'Enter all the required fields. Current Password, New Password, New Password Confirm.',
        400
      )
    );
  }

  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Current password is incorrect. Try forgot password'),
      401
    );
  }

  //3) Changing the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4) Logging in the user by sending the jwt
  sendToken(user._id, undefined, res, 'Your password was changed successfully');
});
