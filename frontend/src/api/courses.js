import { apiRequest } from './client.js';

export function getCourses({ signal } = {}) {
  return apiRequest('/user/courses', { signal });
}

export function getPurchasedCourses({ signal } = {}) {
  return apiRequest('/user/purchasedCourses', { signal });
}

export function purchaseCourse(courseId) {
  return apiRequest(`/user/courses/${encodeURIComponent(courseId)}`, {
    method: 'POST',
  });
}
