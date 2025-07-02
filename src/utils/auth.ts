// Auth utility functions for admin components
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp > now;
  } catch {
    return false;
  }
};

export const handleApiError = (response: Response): string => {
  if (response.status === 401) {
    return 'Authentication failed. Please login again.';
  }
  if (response.status === 403) {
    return 'Access denied. Insufficient permissions.';
  }
  if (response.status === 404) {
    return 'Resource not found.';
  }
  if (response.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return `Request failed with status ${response.status}`;
};

export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  if (!isTokenValid(token)) {
    throw new Error('No valid authentication token. Please login again.');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });
};
