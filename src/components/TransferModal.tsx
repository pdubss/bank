import { useEffect, useState } from "react";
import { FriendType } from "../pages/Transfer";
import Input from "./Input";
import { useForm, SubmitHandler } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toast, ToastContainer } from "react-toastify";
import { sendMoney } from "../slices/accountSlice";

interface TransferModalProps {
  setOpenModal: (x: boolean) => void;
  token: string | null;
  selectedFriend: FriendType | null;
  selection: string;
}
interface Friend {
  first_name: string;
  last_name: string;
  email: string;
}

interface TransferValues {
  amount: number;
}

const TransferModal = ({
  setOpenModal,
  token,
  selectedFriend,
  selection,
}: TransferModalProps) => {
  const [friend, setFriend] = useState<Friend | null>(null);
  const balance = useSelector((store: RootState) => store.account.balance);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferValues>();
  const dispatch = useDispatch();

  useEffect(() => {
    const getFriend = async () => {
      try {
        const res = await fetch("http://localhost:5000/users/verifyFriend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: selectedFriend?.email }),
        });
        const data = await res.json();
        setFriend(data.friend);
      } catch (error) {
        console.error(error);
      }
    };
    getFriend();
  }, [token, selectedFriend]);

  const onSubmit: SubmitHandler<TransferValues> = async (data) => {
    try {
      if (friend && selection === "send") {
        const response = await fetch(
          "http://localhost:5000/transactions/transfer/send",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: data.amount,
              targetEmail: friend.email,
            }),
          },
        );
        if (response.ok) {
          toast.success(`Transfer of $${data.amount} was successful`);
          dispatch(sendMoney({ amount: data.amount }));
        }
      } else if (friend && selection === "request") {
        await fetch("http://localhost:5000/transactions/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetEmail: friend.email,
            amount: data.amount,
          }),
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-white bg-opacity-50"
      onClick={() => setOpenModal(false)}
    >
      <ToastContainer position="top-center" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="z-100 fixed flex flex-col justify-around border bg-white p-4 shadow-md"
      >
        <p className="mb-6">
          The user you have selected is registered as{" "}
          <strong>
            {friend?.first_name} {friend?.last_name}
          </strong>
        </p>
        <p>Current Balance: ${balance}</p>
        <form className="mt-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center gap-6">
            <Input
              type="number"
              label="Amount"
              {...register("amount", {
                required: "Enter a valid amount",
                pattern: {
                  value: /^\d*\.?\d+$/,
                  message: "Amount must be a positive number",
                },
              })}
            />
            {errors.amount && (
              <ErrorMessage>{errors.amount.message}</ErrorMessage>
            )}
            <button className="rounded-md border px-2 py-1" type="submit">
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
