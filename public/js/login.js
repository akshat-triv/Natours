import axios from 'axios';
import { sendAlert } from './alerts';

export const login = async (email, password) => {
  //console.log(email, password);
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    //console.log(res.data);
    if (res.data.status === 'success') {
      sendAlert('success', 'Logged in successfuly');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    sendAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      sendAlert('success', 'Logged out successfuly');
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    sendAlert('error', 'Error in logging out! Try again later');
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  if (passwordConfirm != password) {
    return sendAlert('error', 'Password confirm does not match.');
  }
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    //console.log(res.data);
    if (res.data.status === 'success') {
      sendAlert('success', 'Signed in successfuly');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    sendAlert('error', err.response.data.message);
  }
};

export const forgot = async (email) => {
  try {
    const res = await axios({
      method: 'post',
      url: '/api/v1/users/forgotPassword',
      data: {
        email,
      },
    });
    if (res.data.status === 'success') {
      sendAlert('success', res.data.message);
    }
  } catch (err) {
    sendAlert('error', err.response.data.message);
  }
};

export const reset = async (data, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data,
    });

    if (res.data.status === 'success') {
      sendAlert('success', `Password updated successfully!`);
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    sendAlert('error', err.response.data.message);
    //console.log(err.response.data.message);
  }
};
