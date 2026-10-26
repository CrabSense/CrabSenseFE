
import fetchAPI from "./api";

async function unwrap(endpoint, options = {}) {
  const response = await fetchAPI(endpoint, options);

  if (!response?.success) {
    throw new Error(
      response?.message || "Employee request failed."
    );
  }

  return response.data;
}

export const farmUsersApi = {
  list() {
    return unwrap("/users");
  },

  getById(id) {
    return unwrap(`/users/${encodeURIComponent(id)}`);
  },

  create(data) {
    return unwrap("/farm-users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  setStatus(id, isActive) {
    return unwrap(`/users/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  resetPassword(id, newPassword) {
    return unwrap(
      `/users/${encodeURIComponent(id)}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      }
    );
  },

  // Optional: only when these BE endpoints exist.
  update(id, data) {
    return unwrap(`/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changeRole(id, role) {
    return unwrap(`/users/${encodeURIComponent(id)}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};

export default farmUsersApi;
