import { configureStore } from "@reduxjs/toolkit";
import reincReducer from "./reincReducer";

export const reincStore = configureStore({
  reducer: {
    reducer: reincReducer, // Add the slice reducer to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
    //   thunk: {
    //     extraArgument: myCustomApiService,
    //   },
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof reincStore.getState>;
export type AppDispatch = typeof reincStore.dispatch;

export default reincStore;
