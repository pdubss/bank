import { Link } from "react-router-dom";
import { transaction } from "../pages/Dashboard";

interface TransactionsProps {
  transactions: transaction[];
}

const Transactions = ({ transactions }: TransactionsProps) => {
  return (
    <div className="flex h-2/3 w-full flex-col rounded-sm border p-2 lg:w-1/2 lg:p-6">
      <h2 className="mb-3 border-b text-center text-2xl font-bold">
        Transactions
      </h2>

      <div className="flex max-h-[500px] flex-col justify-start overflow-y-scroll">
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((transaction, index) => {
              return (
                <Transaction
                  key={index}
                  date={transaction.created_at}
                  amount={transaction.amount}
                  type={transaction.type}
                  transactionID={transaction.transaction_id}
                />
              );
            })}
          </ul>
        ) : (
          <p className="text-center">
            User does not have any transactions yet!
          </p>
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
    case "transfer-sent":
      convertedType = "Transfer Sent";
      break;
    case "transfer-received":
      convertedType = "Transfer Received";
  }

  return (
    <li className="mb-3 grid grid-cols-[2fr_1fr_1fr_1fr] items-center rounded-md border p-2 lg:h-14 lg:p-2">
      <span className="h-8">{convertedDate.toLocaleString()}</span>
      <span
        className={
          type === "deposit" ||
          type === "takeoutLoan" ||
          type === "transfer-recieved"
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
