// redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/user/register", formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed."
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/user/login", credentials);
      return response.data;   // { success, message, data }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    null,
    token:   localStorage.getItem("token")    || null,
    role:    localStorage.getItem("role")     || null,
    userId:  localStorage.getItem("userId")
               ? Number(localStorage.getItem("userId"))
               : null,                                     // ← added
    loading: false,
    error:   null,
  },
  reducers: {
    logout: (state) => {
      state.user   = null;
      state.token  = null;
      state.role   = null;
      state.userId = null;                                 // ← added
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");                   // ← added
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading    = false;
        const { token, email, role, userId } = action.payload.data;  // ← added userId
        state.token      = token;
        state.role       = role;
        state.userId     = userId;                                     // ← added
        state.user       = { email, role, userId };                    // ← added userId
        localStorage.setItem("token",  token);
        localStorage.setItem("role",   role);
        if (userId) localStorage.setItem("userId", userId);           // ← added
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;