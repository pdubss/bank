import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  id?: number;
  phone: string;
}

interface userState {
  user: User;
  isLoggedIn: boolean;
}

const initialState: userState = {
  user: {
    firstName: "",
    lastName: "",
    email: "",
    id: 0,
    phone: "",
  },
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    createUser: (state, action: PayloadAction<User>) => {
      state.user.firstName = action.payload.firstName;
      state.user.lastName = action.payload.lastName;
      state.user.email = action.payload.email;
      state.user.phone = action.payload.phone;

      state.isLoggedIn = true;
    },

    login: (state, action: PayloadAction<User>) => {
      state.user.firstName = action.payload.firstName;
      state.user.lastName = action.payload.lastName;
      state.user.email = action.payload.email;
      state.user.id = action.payload.id;
      state.user.phone = action.payload.phone;

      state.isLoggedIn = true;
    },
    logout: () => initialState,
  },
});

export const { createUser, login, logout } = userSlice.actions;
export default userSlice.reducer;
