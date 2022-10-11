/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'email'
export const updateSettings = async (data, type) => {
  try {

    const url= 
        type === 'password' 
        ? 'http://127.0.0.1:3030/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3030/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data:data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} was updated successfully!`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
    }
  } catch (err) {
    console.log(err)
    showAlert('error', err.response.request.responseText);
  }
};
