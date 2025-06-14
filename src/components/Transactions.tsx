import { useEffect, useState } from "react";
import useTokenChecker from "../utility/useTokenChecker";
import { Details } from "../pages/Dashboard";
import { Link } from "react-router-dom";

interface transaction {
  user_id: number;
  amount: number;
  type: string;
  created_at: string;
  recipient_id: string;
  transaction_id: string;
  account_number: string;
  loan_reason?: string;
  setDetails: React.Dispatch<React.SetStateAction<Details | null>>;
  setShowDetails: (x: boolean) => void;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<transaction[] | null>(null);
  const { token } = useTokenChecker();

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/transactions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error(error);
      }
    };
    getTransactions();
  }, [token]);
  return (
    <div className="flex h-4/5 w-full flex-col rounded-sm border p-2 lg:w-1/2 lg:p-6">
      <h2 className="border-b text-center text-2xl font-bold">Transactions</h2>

      <div className="my-auto flex flex-col">
        {transactions ? (
          <ul>
            {transactions.map((transaction, index) => {
              return (
                <Transaction
                  key={index}
                  date={transaction.created_at}
                  amount={transaction.amount}
                  type={transaction.type}
                  transactionID={transaction.transaction_id}
                  recipientID={transaction.recipient_id}
                  loanReason={transaction.loan_reason}
                  accountNumber={transaction.account_number}
                />
              );
            })}
          </ul>
        ) : (
          <p>User does not have any transactions yet!</p>
        )}
      </div>
    </div>
  );
};
interface transactionProps {
  date: string;
  amount: number;
  type: string;
  transactionID: string;
  recipientID: string;
  loanReason?: string;
  accountNumber: string;
}

export default Transactions;

const Transaction = ({
  date,
  amount,
  type,
  transactionID,
}: transactionProps) => {
  const convertedDate = new Date(date);
  let convertedType;
  switch (type) {
    case "deposit":
      convertedType = "Deposit";
      break;
    case "withdrawal":
      convertedType = "Withdrawal";
      break;
    case "takeoutLoan":
      convertedType = "Loan granted";
      break;
    case "payLoan":
      convertedType = "Loan Payment";
      break;
    case "transfer":
      convertedType = "Transfer";
  }

  return (
    <li className="mb-3 grid grid-cols-[2fr_1fr_1fr_1fr] items-center rounded-md border p-2 lg:h-14 lg:p-2">
      <span className="h-8">{convertedDate.toLocaleString()}</span>
      <span
        className={
          type === "deposit" || type === "takeoutLoan"
            ? "h-8 text-green-500"
            : "h-8 text-red-500"
        }
      >
        {} ${amount}
      </span>
      <span className="h-8">{convertedType}</span>
      <span className="h-8 text-center">
        <Link
          to={`/transactions/${transactionID}`}
          className="inline-block rounded-md border bg-yellow-300 p-1 font-semibold"
        >
          DETAILS
        </Link>
      </span>
    </li>
  );
};
