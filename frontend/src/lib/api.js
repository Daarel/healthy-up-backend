const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";

const TOKEN_KEY = "healthyup:token";
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data?.message ||
      data?.errors?.[0]?.message ||
      "Terjadi kesalahan pada server.";
    throw new Error(message);
  }
  return data;
}
export const authApi = {
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },
  register: async (username, email, password) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    if (data.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },
  logout: async () => {
    try {
      return await request("/auth/logout", {
        method: "POST",
      });
    } finally {
      removeToken();
    }
  },
  forgotPassword: async (email) => {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  resetPassword: async (email, otp, newPassword, confirmedPassword) => {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
        newPassword,
        confirmedPassword,
      }),
    });
  },
  resendOtp: async (email) => {
    return request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
export const userApi = {
  getMe: async () => {
    return request("/users/user");
  },
};