import { apiRequest } from './client.js';

export function getAdminCourses({ signal } = {}) {
  return apiRequest('/admin/courses', { signal });
}

export function getAdminStats({ signal } = {}) {
  return apiRequest('/admin/stats', { signal });
}

export function createCourse(course) {
  return apiRequest('/admin/courses', {
    method: 'POST',
    body: course,
  });
}
