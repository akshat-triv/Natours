import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './update';
import { bookTour } from './stripe';

const map = document.getElementById('map');
const form = document.querySelector('.form-login');
const logoutBtn = document.querySelector('.nav__el--logout');
const formUser = document.querySelector('.form-user-data');
const formSettings = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');

if (map) {
  const locations = JSON.parse(map.dataset.locations);

  displayMap(locations);
}

if (form)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (formUser) {
  formUser.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'Profile');
  });
}

if (formSettings) {
  formSettings.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateSettings({ passwordCurrent, password, passwordConfirm }, 'Password');
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing..';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
