import { useEffect, useState } from "react";
import Input from "../components/Input";
import useTokenChecker from "../utility/useTokenChecker";
import FriendsList from "../components/FriendsList";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import ErrorMessage from "../components/ErrorMessage";
import { login } from "../slices/userSlice";
import TransferModal from "../components/TransferModal";
import { setUser } from "../slices/accountSlice";

interface TransferFields {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  searchBy: string;
}
export interface FriendType {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function Transfer() {
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [selection, setSelection] = useState("");
  const [friends, setFriends] = useState<FriendType[] | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<FriendType | null>(null);
  const userid = useSelector((store: RootState) => store.user.user.id);
  const user = useSelector((store: RootState) => store.user.user);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },

    setError,
  } = useForm<TransferFields>();

  const { token, decodedToken, isValid } = useTokenChecker();

  useEffect(() => {
    async function getUser() {
      try {
        if (isValid && decodedToken) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email: decodedToken.email }),
          });
          if (!res.ok) {
            throw new Error("Not logged in");
          }
          const data = await res.json();
          dispatch(
            login({
              email: data.user.email,
              phone: data.user.phone,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
              id: data.user.id,
            }),
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
    getUser();
  }, [token, isValid, decodedToken, dispatch]);

  useEffect(() => {
    async function getUserFinancials() {
      try {
        const res = await fetch(
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
        const { account_number, balance, id, loan_amount, loan_reason } =
          await res.json();
        dispatch(
          setUser({ account_number, id, loan_amount, loan_reason, balance }),
        );
      } catch (error) {
        console.error(error);
      }
    }
    getUserFinancials();
  });

  useEffect(() => {
    const getFriends = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${user.id}/friends`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        setFriends(data.friends);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getFriends();
  }, [user.id, token, setFriends]);

  const submitHandler: SubmitHandler<TransferFields> = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/friend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: userid,
            friend: data,
          }),
        },
      );
      console.log(response.status);
      switch (response.status) {
        case 401:
          setError("email", {
            type: "manual",
            message: "A friend with that email already exists",
          });
          break;
        case 402:
          setError("phone", {
            type: "manual",
            message: "A friend with that phone number already exists",
          });
          break;
        case 403:
          setError("phone", {
            type: "manual",
            message: "Cannot add your own phone number",
          });
          break;
        case 405:
          setError("email", {
            type: "manual",
            message: "Cannot add your own email",
          });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full p-6 text-center">
      {openModal && (
        <TransferModal
          selection={selection}
          selectedFriend={selectedFriend}
          token={token}
          setOpenModal={setOpenModal}
        />
      )}
      <h1 className="mb-10 font-bold">Transfers</h1>
      <div className="mb-10 flex justify-center gap-5">
        <button
          className="rounded-md border bg-green-400 px-4 py-2 transition-transform duration-100 active:scale-95"
          onClick={() => setSelection("send")}
        >
          Send
        </button>
        <button
          className="rounded-md border bg-red-500 px-4 py-2 transition-transform duration-100 active:scale-95"
          onClick={() => setSelection("request")}
        >
          Request
        </button>
      </div>

      {selection ? (
        <div>
          <button
            className="mb-6 rounded-md border bg-yellow-300 px-2 py-1"
            onClick={() => setSelection("")}
          >
            Add Friend
          </button>
          <h2>
            {selection === "send" ? (
              <p className="text-lg">
                <strong>Send</strong> $ to a friend
              </p>
            ) : (
              <p className="text-lg">
                <strong>Request</strong> $ from a friend
              </p>
            )}
          </h2>
          <FriendsList
            isLoading={isLoading}
            setSelectedFriend={setSelectedFriend}
            friends={friends}
            setFriends={setFriends}
            setOpenModal={setOpenModal}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="mb-5 flex flex-col items-center justify-center gap-2">
            <h3>Add Friend</h3>
            <Input
              type="text"
              label="First Name"
              {...register("first_name", {
                required: "Please enter your friend's first name",
                minLength: { value: 2, message: "Please enter a valid name" },
              })}
            />
            {errors.first_name && (
              <ErrorMessage>{errors.first_name.message}</ErrorMessage>
            )}
            <Input
              type="text"
              label="Last Name"
              {...register("last_name", {
                required: "Please enter your friend's last name",
                minLength: {
                  value: 2,
                  message: "Please enter a valid last name",
                },
              })}
            />
            {errors.last_name && (
              <ErrorMessage>{errors.last_name.message}</ErrorMessage>
            )}
            <Input
              {...register("email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              label="E-mail Address"
              type="text"
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
            <Input
              type="text"
              label="Phone Number"
              {...register("phone", {
                pattern: {
                  value: /^(\d{3}-?\d{3}-?\d{4})$/,
                  message: "Please enter a valid phone number",
                },
              })}
            />
            {errors.phone && (
              <ErrorMessage>{errors.phone.message}</ErrorMessage>
            )}
            <button className="mt-3 rounded-md border px-2 py-1" type="submit">
              Submit
            </button>
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </form>
      )}
    </div>
  );
}
