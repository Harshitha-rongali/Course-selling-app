import { apiRequest } from './client.js';

export function signupUser({ username, password }) {
  return apiRequest('/user/signup', {
    method: 'POST',
    body: { username, password },
  });
}

export function loginUser({ username, password }) {
  return apiRequest('/user/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function loginAdmin({ username, password }) {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function getSession({ signal } = {}) {
  return apiRequest('/auth/me', { signal });
}

export function logoutSession() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  });
}
