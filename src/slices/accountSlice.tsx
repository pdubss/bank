import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface transaction {
  user_id: number;
  recipient_id: number | null;
  amount: number;
  type: string;
  created_at: string;
}

interface account {
  balance: number;
  loan: number;
  loanPurpose: string;
  accountNumber: number;
  id: number;
  transactions: transaction[];
}

const initialState: account = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  accountNumber: 0,
  id: 0,
  transactions: [],
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        id: number;
        account_number: number;
        balance: number;
        loan_amount: number;
        loan_reason: string;
      }>,
    ) => {
      state.balance = Number(action.payload.balance);
      state.loan = Number(action.payload.loan_amount);
      state.loanPurpose = action.payload.loan_reason;
      state.accountNumber = action.payload.account_number;
      state.id = action.payload.id;
    },
    deposit: (state, action: PayloadAction<{ amount: number }>) => {
      if (action.payload.amount > 0) {
        state.balance = state.balance + Number(action.payload.amount);
      }
    },
    withdraw: (state, action: PayloadAction<{ amount: number }>) => {
      if (state.balance > action.payload.amount)
        state.balance = state.balance - Number(action.payload.amount);
    },
    requestLoan: (
      state,
      action: PayloadAction<{ loan: number; loanPurpose: string }>,
    ) => {
      if (state.loan > 0) return;
      state.loan = action.payload.loan;
      state.loanPurpose = action.payload.loanPurpose;
    },
    payLoan: (state, action: PayloadAction<{ amount: number }>) => {
      if (action.payload.amount > 0 && action.payload.amount <= state.balance) {
        state.loan -= action.payload.amount;
        state.balance -= action.payload.amount;
      }
    },
    sendMoney: (state, action: PayloadAction<{ amount: number }>) => {
      if (state.balance > action.payload.amount) {
        state.balance -= action.payload.amount;
      }
    },
  },
});

export default accountSlice.reducer;
export const { deposit, withdraw, requestLoan, payLoan, setUser, sendMoney } =
  accountSlice.actions;
