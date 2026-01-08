// Auth utility functions
// Note: This app uses simple session-based auth without JWT tokens

export const getToken = () => {
  return localStorage.getItem("token");
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const getUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

// Check if user is authenticated (based on user data in localStorage, not token)
export const isAuthenticated = () => {
  const user = getUser();
  return !!user && !!user._id;
};

export const clearAuth = () => {
  removeToken();
  removeUser();
};

export const getAuthHeaders = () => {
  const token = getToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

