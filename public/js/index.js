import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup, forgot, reset } from './login';
import { updateSettings } from './update';
import { bookTour } from './stripe';

const map = document.getElementById('map');
const form = document.querySelector('.form-login')
  ? document.querySelector('.form-login')
  : document.querySelector('.form-signup')
  ? document.querySelector('.form-signup')
  : document.querySelector('.form-forgot');

const formReset = document.querySelector('.form-reset');
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
    let name = document.getElementById('name');
    let password = document.getElementById('password');
    let passwordConfirm = document.getElementById('passwordConfirm');

    if (name) {
      name = name.value;
      password = password.value;
      passwordConfirm = passwordConfirm.value;
      return signup(name, email, password, passwordConfirm);
    }
    if (password) {
      password = password.value;
      return login(email, password);
    }

    forgot(email);
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

if (formReset) {
  const token = formReset.dataset.token;
  formReset.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    reset({ password, passwordConfirm }, token);
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
