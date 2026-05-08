import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // add more slices here as you build more features
    // requests: requestsReducer,
    // workOrders: workOrdersReducer,
  },
});

export default store;