/**
 * api.js — MODE MOCK (tidak terhubung ke server)
 *
 * Semua fungsi mengembalikan data hardcoded agar frontend bisa
 * berjalan penuh tanpa backend. Ganti implementasi ini dengan
 * fetch ke server nyata saat backend sudah siap.
 */

// ─── Data mock ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 1,
  username: "Ghifari",
  email: "ghifari@healthyup.com",
};

// Simulasi sesi: simpan di memori (hilang saat refresh — wajar untuk mock)
let _session = null;

// ─── Helper delay opsional (bisa di-set 0 untuk instan) ──────────────────────
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email, password) => {
    await delay();
    // Validasi sederhana: terima email apapun yang valid + password ≥ 8 karakter
    if (!email || !password || password.length < 8) {
      throw new Error("Email atau password tidak valid.");
    }
    _session = { ...MOCK_USER, email };
    return {
      status: "success",
      data: { user: _session },
    };
  },

  register: async (username, email, password) => {
    await delay();
    if (!username || !email || !password) {
      throw new Error("Semua field wajib diisi.");
    }
    _session = { id: Date.now(), username, email };
    return {
      status: "success",
      data: { user: _session },
    };
  },

  logout: async () => {
    await delay(100);
    _session = null;
    return { status: "success", message: "Logged out" };
  },

  forgotPassword: async (email) => {
    await delay();
    if (!email) throw new Error("Email wajib diisi.");
    // Simulasi: selalu berhasil
    return {
      status: "success",
      message: "OTP telah dikirim ke email kamu (simulasi).",
    };
  },

  resetPassword: async (email, otp, newPassword, confirmedPassword) => {
    await delay();
    if (newPassword !== confirmedPassword) {
      throw new Error("Password tidak cocok.");
    }
    // Simulasi: OTP apapun diterima
    return {
      status: "success",
      message: "Password berhasil diubah.",
    };
  },
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  /**
   * Cek sesi aktif — dipakai AuthContext saat app pertama kali dimuat.
   * Mock: selalu kembalikan null (belum login) supaya PrivateRoute
   * mengarahkan ke /login. Ubah ke `_session ?? MOCK_USER` jika ingin
   * langsung masuk tanpa login.
   */
  getMe: async () => {
    await delay(100);
    const user = _session ?? null;
    if (!user) throw new Error("Tidak ada sesi aktif.");
    return { status: "success", data: { user } };
  },
};
