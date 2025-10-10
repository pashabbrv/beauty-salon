// Utility functions for authentication

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('adminToken');
};

export const getToken = (): string | null => {
  return localStorage.getItem('adminToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('adminToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('adminToken');
};

export const requireAuth = (): boolean => {
  if (!isAuthenticated()) {
    window.location.href = '/admin/login';
    return false;
  }
  return true;
};