// redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// ── Register ──────────────────────────────────────────────
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/user/register", formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed.");
    }
  }
);

// ── Citizen Login ─────────────────────────────────────────
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/user/login", credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
  }
);

// ── Staff Login ───────────────────────────────────────────
export const loginStaff = createAsyncThunk(
  "auth/loginStaff",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/staff/login", credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
  }
);

// ── Helper — load user from localStorage on refresh ───────
const loadUserFromStorage = () => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  if (token && role && email) return { email, role };
  return null;
};

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    loadUserFromStorage(),
    token:   localStorage.getItem("token")  || null,
    role:    localStorage.getItem("role")   || null,
    userId:  localStorage.getItem("userId") || null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout: (state) => {
      state.user   = null;
      state.token  = null;
      state.role   = null;
      state.userId = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("userId");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    // ── Register ──
    builder
      .addCase(registerUser.pending,   (state)         => { state.loading = true;  state.error = null; })
      .addCase(registerUser.fulfilled, (state)         => { state.loading = false; })
      .addCase(registerUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── Citizen Login ──
    builder
      .addCase(loginUser.pending,   (state)         => { state.loading = true;  state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const { token, email, role, userId: id } = action.payload.data;
        state.token  = token;
        state.role   = role;
        state.userId = id ?? null;
        state.user   = { email, role };
        localStorage.setItem("token", token);
        localStorage.setItem("role",  role);
        localStorage.setItem("email", email);
        if (id != null) localStorage.setItem("userId", id);
      })
      .addCase(loginUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── Staff Login ──
    builder
      .addCase(loginStaff.pending,   (state)         => { state.loading = true;  state.error = null; })
      .addCase(loginStaff.fulfilled, (state, action) => {
        state.loading = false;
        const { token, email, role, userId, staffId } = action.payload.data;
        const id = staffId ?? userId ?? null;
        state.token  = token;
        state.role   = role;
        state.userId = id;
        state.user   = { email, role };
        localStorage.setItem("token", token);
        localStorage.setItem("role",  role);
        localStorage.setItem("email", email);
        if (id != null) localStorage.setItem("userId", String(id));
      })
      .addCase(loginStaff.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;