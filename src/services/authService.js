// src/services/authService.js

import axios from 'axios';

const API_URL = 'https://localhost:5001/api/auth/';

const register = (email, password) => {
  return axios.post(API_URL + 'register', {
    email,
    password
  });
};

const login = (email, password) => {
  return axios.post(API_URL + 'login', {
    email,
    password
  })
  .then(response => {
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  });
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export default {
  register,
  login,
  logout,
  getCurrentUser
};
