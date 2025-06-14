import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useTokenChecker from "../utility/useTokenChecker";
import { Link } from "react-router-dom";

interface Transaction {
  transactionInfo: { created_at: string; amount: number; type: string };
  recipient?: {
    account_number: string;
    first_name: string;
    last_name: string;
  };
  user: { account_number: string };
}

const TransactionDetails = () => {
  const { transactionID } = useParams();
  const { token } = useTokenChecker();
  const [transaction, setTransaction] = useState<Transaction | null>();

  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/transactions/${transactionID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        console.log(data.transaction);
        setTransaction(data.transaction);
      } catch (error) {
        console.error(error);
      }
    };
    getInfo();
  }, [transactionID, token]);

  let convertedDate;
  if (transaction) {
    convertedDate = new Date(transaction?.transactionInfo.created_at);
  }

  let convertedType;
  if (transaction) {
    switch (transaction.transactionInfo.type) {
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
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 text-center">
      <h2 className="text-xl">Transaction #{transactionID}</h2>
      {transaction && (
        <div className="flex flex-col gap-2">
          <span>
            <strong>Date: </strong>
            {convertedDate?.toLocaleString()}
          </span>
          <span>
            <strong>User Account #:</strong> {transaction.user.account_number}{" "}
          </span>
          <span>
            <strong>Transaction Type:</strong> {convertedType}{" "}
          </span>{" "}
          <span>
            <strong>Transaction Amount:</strong>{" "}
            {transaction.transactionInfo.amount}{" "}
          </span>
          {transaction.recipient && (
            <>
              <span>
                <strong> Recipient Account #:</strong>{" "}
                {transaction.recipient.account_number}{" "}
              </span>
              <span>
                <strong> Recipient:</strong> {transaction.recipient.first_name}{" "}
                {transaction.recipient.last_name}
              </span>
            </>
          )}
        </div>
      )}
      <Link className="rounded-md border bg-red-500 px-2 py-1" to="/dashboard">
        BACK
      </Link>
    </div>
  );
};

export default TransactionDetails;
