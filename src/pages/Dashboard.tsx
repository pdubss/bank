import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";

import {
  deposit,
  payLoan,
  requestLoan,
  withdraw,
  setUser,
} from "../slices/accountSlice";
import { login } from "../slices/userSlice";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTokenChecker from "../utility/useTokenChecker";
import { Link } from "react-router-dom";
import Transactions from "../components/Transactions";
import Spinner from "../components/Spinner";

export interface Details {
  userAccountNumber: string;
  amount: number;
  type: string;
  recipientID?: string;
  transactionID: string;
  date: Date;
  loanReason?: string;
}

export interface transaction {
  amount: number;
  type: string;
  created_at: string;
  transaction_id: string;
}

export default function Dashboard() {
  const { isValid, decodedToken, token } = useTokenChecker();

  const navigate = useNavigate();
  const user = useSelector((store: RootState) => store.user.user);
  const account = useSelector((store: RootState) => store.account);
  const dispatch = useDispatch();

  const [userLoading, setUserLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [loanReason, setLoanReason] = useState("");
  const [loanPayment, setLoanPayment] = useState(0);
  const [transactions, setTransactions] = useState<transaction[]>([]);

  const depositHandler = async () => {
    if (depositAmount > 0 && user.firstName) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/transactions/deposit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              depositAmount: Number(depositAmount),
              email: user.email,
            }),
          },
        );
        const data = await response.json();

        if (response.ok) {
          dispatch(deposit({ amount: Number(depositAmount) }));
          setTransactions((prevTransactions) => [
            ...prevTransactions,
            {
              amount: data.transaction.amount,
              type: data.transaction.type,
              created_at: data.transaction.created_at,
              transaction_id: data.transaction.transaction_id,
            },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    setDepositAmount(0);
  };

  const withdrawalHandler = async () => {
    if (withdrawalAmount < 0) {
      alert("Withdrawal cannot be negative");
      return;
    }
    if (withdrawalAmount > account.balance) {
      alert("Withdrawal cannot be greater than current balance");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transactions/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            amount: Number(withdrawalAmount),
          }),
        },
      );
      const data = await response.json();

      if (response.ok) {
        dispatch(withdraw({ amount: Number(withdrawalAmount) }));
        setTransactions((prevTransactions) => [
          ...prevTransactions,
          {
            amount: data.transaction.amount,
            type: data.transaction.type,
            created_at: data.transaction.created_at,
            transaction_id: data.transaction.transaction_id,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    }

    setWithdrawalAmount(0);
  };

  const loanHandler = async () => {
    if (Number(loanAmount) > 0 && loanReason !== "") {
      dispatch(requestLoan({ loan: loanAmount, loanPurpose: loanReason }));
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/transactions/requestLoan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              loan_amount: loanAmount,
              loan_reason: loanReason,
              email: user.email,
            }),
          },
        );
        const data = await res.json();
        if (res.ok) {
          setTransactions((prevTransactions) => [
            ...prevTransactions,
            {
              amount: data.transaction.amount,
              type: data.transaction.type,
              created_at: data.transaction.created_at,
              transaction_id: data.transaction.transaction_id,
            },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (account.loan > 0)
      alert("Pay back your current loan before requesting another one");

    if (loanAmount < 0) alert("Loan amount cannot be negative");
  };

  const payLoanHandler = async () => {
    if (
      loanPayment > 0 &&
      loanPayment <= account.balance &&
      loanPayment <= account.loan
    ) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/transactions/paybackLoan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ payment: loanPayment, email: user.email }),
          },
        );
        const data = await res.json();
        if (res.ok) {
          dispatch(payLoan({ amount: loanPayment }));
          setTransactions((prevTransactions) => [
            ...prevTransactions,
            {
              amount: data.transaction.amount,
              type: data.transaction.type,
              created_at: data.transaction.created_at,
              transaction_id: data.transaction.transaction_id,
            },
          ]);
        }
      } catch (error) {
        console.error("Error processing loan payment", error);
      }
    }

    if (loanPayment > account.balance)
      alert("Insufficient funds to make this payment");

    if (loanPayment > account.loan) alert("Cannot pay off more than you owe");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const getTransactions = async () => {
      setTransactionsLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/transactions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        setTransactions(data.transactions);
      } catch (error) {
        setTransactionsLoading(false);
        console.error("Fetching transactions failed", error);
      } finally {
        setTransactionsLoading(false);
      }
    };
    getTransactions();
  }, []);

  useEffect(() => {
    if (isValid && decodedToken) {
      dispatch(
        login({
          email: decodedToken.email,
          firstName: decodedToken.firstName,
          lastName: decodedToken.lastName,
          id: decodedToken.id,
          phone: decodedToken.phone,
        }),
      );
    }
  }, [isValid, decodedToken, dispatch]);

  useEffect(() => {
    async function getUserInfo() {
      setUserLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/getOne`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: user.email }),
          },
        );
        const { account_number, balance, loan_amount, loan_reason, id } =
          await response.json();
        dispatch(
          setUser({ account_number, balance, loan_amount, loan_reason, id }),
        );
      } catch (error) {
        console.error("Fetching user financials failed", error);
      } finally {
        setUserLoading(false);
      }
    }

    getUserInfo();
  }, [dispatch, user.email, navigate, token]);

  return (
    <div className="mx-auto flex h-full w-full flex-col items-center gap-10 p-4 md:w-4/5 md:items-center md:justify-center lg:flex-row">
      {userLoading ? (
        <Spinner />
      ) : (
        <div className="flex h-3/4 w-[22rem] flex-col gap-6 border p-6 text-center">
          <h2 className="border-b text-2xl font-bold">Account Details</h2>
          <h3 className="font-semibold">Account Number</h3>
          <p>{account.accountNumber}</p>
          <h4 className="font-semibold">Total Funds</h4>
          <span>${account.balance}</span>
          {account.loan ? (
            <>
              <h4 className="font-semibold">Loan Balance</h4>
              <span>${account.loan}</span>
              <h4 className="font-semibold">Reason for Loan</h4>
              <span>{account.loanPurpose}</span>
            </>
          ) : null}
        </div>
      )}
      <div className="flex h-3/4 w-[22rem] flex-col gap-16 border p-6 md:w-[30rem]">
        <div>
          <h2 className="border-b text-center text-2xl font-bold">
            Action Center
          </h2>
        </div>
        <div className="mx-auto flex w-full items-center justify-around">
          <label>
            <input
              className="w-20 md:w-48"
              type="number"
              value={depositAmount}
              placeholder="Enter deposit amount"
              onChange={(e) => Number(setDepositAmount(+e.target.value))}
            />
          </label>
          <button
            className="rounded-md bg-yellow-300 px-2 py-1 font-semibold"
            onClick={depositHandler}
          >
            Deposit
          </button>
        </div>
        <div className="mx-auto flex w-full items-center justify-around">
          <label>
            <input
              className="w-20 md:w-48"
              value={withdrawalAmount}
              type="number"
              placeholder="
            Enter withdrawal amount"
              onChange={(e) => Number(setWithdrawalAmount(+e.target.value))}
            />
          </label>
          <button
            className="rounded-md bg-yellow-300 px-2 py-1 font-semibold"
            onClick={withdrawalHandler}
          >
            Withdraw
          </button>
        </div>
        {account.loan === 0 ? (
          <div className="mx-auto flex w-full items-center justify-around">
            <label>
              <input
                className="md:w-30 w-16"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(+e.target.value)}
              />
            </label>
            <label>
              <input
                className="w-24 md:w-40"
                type="text"
                placeholder="Reason for loan"
                value={loanReason}
                onChange={(e) => setLoanReason(e.target.value)}
              />
            </label>
            <button
              className="rounded-md bg-yellow-300 px-2 py-1 font-semibold"
              onClick={loanHandler}
            >
              Request Loan
            </button>
          </div>
        ) : null}

        {account.loan ? (
          <div className="mx-auto flex w-full items-center justify-around">
            <label>
              <input
                type="number"
                value={loanPayment}
                onChange={(e) => setLoanPayment(+e.target.value)}
              />
            </label>
            <button
              className="rounded-md bg-yellow-300 px-2 py-1 font-semibold"
              onClick={payLoanHandler}
            >
              Pay Loan
            </button>
          </div>
        ) : null}
        <div className="flex justify-center">
          <Link to="/transfer">
            <button className="rounded-md bg-yellow-300 px-4 py-2 font-semibold">
              Transfer Money
            </button>
          </Link>
        </div>
      </div>
      {transactionsLoading ? (
        <Spinner />
      ) : (
        <Transactions transactions={transactions} />
      )}
    </div>
  );
}
