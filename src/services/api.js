const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5080/api";

let refreshPromise = null;

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("expiresAt");
  localStorage.removeItem("user");
};

const saveAuthData = (data) => {
  if (!data) return;

  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  }

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  if (data.expiresAt) {
    localStorage.setItem("expiresAt", data.expiresAt);
  }

  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
};

const redirectToLogin = () => {
  clearAuthStorage();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

// Dùng fetch trực tiếp ở đây để tránh:
// fetchAPI -> refresh -> fetchAPI -> refresh -> ...
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  // Nếu nhiều API cùng lúc đều bị 401,
  // chỉ gửi 1 refresh request.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      let result = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success || !result?.data?.accessToken) {
        throw new Error(
          result?.message || "Session expired. Please sign in again.",
        );
      }

      saveAuthData(result.data);

      return result.data.accessToken;
    } catch (error) {
      clearAuthStorage();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const fetchAPI = async (endpoint, options = {}, configOptions = {}) => {
  const { skipAuth = false, skipRefresh = false } = configOptions;

  const url = `${API_BASE_URL}${endpoint}`;

  const makeRequest = async (token = null) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (!skipAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  try {
    const currentToken = localStorage.getItem("accessToken");

    let response = await makeRequest(currentToken);

    /*
     * Access token hết hạn:
     * 1. refresh token
     * 2. lấy access token mới
     * 3. retry request ban đầu đúng 1 lần
     */
    if (
      response.status === 401 &&
      !skipRefresh &&
      endpoint !== "/auth/login" &&
      endpoint !== "/auth/refresh"
    ) {
      try {
        const newAccessToken = await refreshAccessToken();

        response = await makeRequest(newAccessToken);
      } catch (refreshError) {
        redirectToLogin();
        throw refreshError;
      }
    }

    let result = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      const message =
        result?.message ||
        result?.title ||
        `Request failed with status ${response.status}`;

      // Retry rồi mà vẫn 401
      if (response.status === 401) {
        redirectToLogin();
      }

      throw new Error(message);
    }

    return result;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Giữ compatibility với Monitoring.jsx hiện tại
export const waterQualityAPI = {
  getLatestData: () => fetchAPI("/water-quality/latest"),

  getHistoricalData: (startDate, endDate) =>
    fetchAPI(`/water-quality/history?start=${startDate}&end=${endDate}`),

  getParameterData: (parameter) =>
    fetchAPI(`/water-quality/parameter/${parameter}`),
};

export default fetchAPI;
