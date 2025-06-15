import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useForm, SubmitHandler } from "react-hook-form";
import Input from "../components/Input";
import useTokenChecker from "../utility/useTokenChecker";
import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import BackButton from "../components/BackButton";
import { useDispatch } from "react-redux";
import { login } from "../slices/userSlice";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorMessage from "../components/ErrorMessage";

interface FormValues {
  firstName: string;
  lastName: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

function Profile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();
  const user = useSelector((store: RootState) => store.user.user);
  const { isValid, decodedToken, token } = useTokenChecker();

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

  const deleteHandler = async () => {
    setModalOpen(true);
  };

  const currentPassword = watch("currentPassword");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${id}/updateInfo`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
      if (res.status === 200) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Profile could not be updated, try again");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto flex flex-col items-center justify-center gap-10">
      <BackButton />
      <Modal isOpen={modalOpen} setModalOpen={setModalOpen} />
      <ToastContainer position="top-center" />
      <form
        className="flex flex-col items-center gap-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="mb-10 text-2xl">Profile</h1>
        <Input
          label="First Name"
          type="text"
          defaultValue={user.firstName}
          {...register("firstName", {
            pattern: {
              value: /^[A-Za-z]+([-' ][A-Za-z]+)*$/,
              message: "Invalid name",
            },
          })}
        />
        {errors.firstName && (
          <ErrorMessage>{errors.firstName.message}</ErrorMessage>
        )}
        <Input
          type="text"
          label="Last Name"
          defaultValue={user.lastName}
          {...register("lastName", {
            pattern: {
              value: /^[A-Za-z]+([-' ][A-Za-z]+)*$/,
              message: "Invalid name",
            },
          })}
        />
        {errors.lastName && (
          <ErrorMessage>{errors.lastName.message}</ErrorMessage>
        )}
        <Input
          label="Phone Number"
          type="text"
          defaultValue={user.phone}
          {...register("phone", {
            pattern: {
              value: /^(\d{3}-?\d{3}-?\d{4})$/,
              message: "Invalid phone number",
            },
          })}
        />
        {errors.phone && <ErrorMessage>{errors.phone.message}</ErrorMessage>}
        <Input
          type="password"
          label="Current Password"
          {...register("currentPassword")}
        />
        {currentPassword && (
          <div>
            <Input
              type="password"
              label="New Password"
              {...register("newPassword", {
                required: "A new password is required",
                minLength: {
                  value: 8,
                  message: "New password must be at least 8 characters",
                },
              })}
            />
            {errors.newPassword && (
              <ErrorMessage>{errors.newPassword.message}</ErrorMessage>
            )}
            <Input
              type="password"
              label="Confirm New Password"
              {...register("confirmNewPassword", {
                required: "Confirm your new password",
                validate: (value) =>
                  value === watch("newPassword") ||
                  "New passwords do not match",
              })}
            />
            {errors.confirmNewPassword && (
              <ErrorMessage>{errors.confirmNewPassword.message}</ErrorMessage>
            )}
          </div>
        )}

        <button className="mt-10 w-[100px] rounded-md bg-yellow-500 px-2 py-1">
          UPDATE
        </button>
      </form>
      <button
        onClick={deleteHandler}
        className="w-[100px] rounded-md bg-red-500 px-2 py-1"
      >
        DELETE ACCOUNT
      </button>
    </div>
  );
}

export default Profile;
