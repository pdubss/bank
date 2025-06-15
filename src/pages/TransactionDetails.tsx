import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useTokenChecker from "../utility/useTokenChecker";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";

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
  const [isLoading, setIsLoading] = useState(true);
  const { transactionID } = useParams();
  const [transaction, setTransaction] = useState<Transaction>();

  useTokenChecker();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/transactions/${transactionID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        setTransaction(data.transaction);
      } catch (error) {
        setIsLoading(false);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getInfo();
  }, [transactionID]);

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
      case "transfer-sent":
        convertedType = "Transfer Sent";
        break;
      case "transfer-received":
        convertedType = "Transfer Received";
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 text-center">
      <h2 className="text-xl">Transaction #{transactionID}</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-2">
          <span>
            <strong>Date: </strong>
            {convertedDate?.toLocaleString()}
          </span>
          <span>
            <strong>User Account #:</strong> {transaction?.user.account_number}{" "}
          </span>
          <span>
            <strong>Transaction Type:</strong> {convertedType}{" "}
          </span>{" "}
          <span>
            <strong>Transaction Amount:</strong> $
            {transaction?.transactionInfo.amount}{" "}
          </span>
          {transaction?.recipient && (
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
