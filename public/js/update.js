import axios from 'axios';
import { sendAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `${
        type === 'Password'
          ? '/api/v1/users/updatePassword'
          : '/api/v1/users/updateMe'
      }`,
      data,
    });

    if (res.data.status === 'success') {
      sendAlert('success', `${type} updated successfully!`);
      window.setTimeout(() => {
        location.reload(true);
      }, 3000);
    }
  } catch (err) {
    sendAlert('error', err.response.data.message);
    //console.log(err.response.data.message);
  }
};
