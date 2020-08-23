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
