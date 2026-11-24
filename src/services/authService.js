import { canUseWeb } from "../constants/roles";
import fetchAPI, { refreshAccessToken } from "./api";

const authService = {
  login: async (username, password) => {
    const response = await fetchAPI(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      },
      {
        skipAuth: true,
        skipRefresh: true,
      },
    );

    if (!response?.success || !response?.data) {
      throw new Error(response?.message || "Login failed.");
    }

    const { accessToken, refreshToken, expiresAt, user } = response.data;

    if (!canUseWeb(user?.role)) {
      authService.clearAuth();
      throw new Error("Web is only available to System Admin and Farm Admin.");
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("expiresAt", expiresAt);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await fetchAPI("/auth/me");

    if (!response?.success) {
      throw new Error(response?.message || "Unable to get current user.");
    }

    if (!canUseWeb(response.data?.role)) {
      authService.clearAuth();
      throw new Error("This role cannot use the Web application.");
    }
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  },

  refreshSession: async () => {
    return refreshAccessToken();
  },

  logout: async () => {
    try {
      await fetchAPI("/auth/logout", {
        method: "POST",
      });
    } finally {
      authService.clearAuth();
    }
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("user");
  },

  getStoredUser: () => {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    try {
      const parsed = JSON.parse(user);
      if (!canUseWeb(parsed?.role)) {
        authService.clearAuth();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  getAccessToken: () => {
    return localStorage.getItem("accessToken");
  },

  isAuthenticated: () => {
    return Boolean(
      localStorage.getItem("accessToken") &&
      localStorage.getItem("refreshToken"),
    );
  },
};

export default authService;
