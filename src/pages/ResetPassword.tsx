import { SubmitHandler, useForm } from "react-hook-form";
import Input from "../components/Input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const {
    register: registerNewPassword,
    handleSubmit: handleSubmitNewPassword,
    formState: { errors: passwordErrors },
    setError,
  } = useForm<{ code: string; password: string; confirmPassword: string }>();

  const onSubmitEmail: SubmitHandler<{ email: string }> = async (data) => {
    setEmailSubmitted(true);
    setEmail(data.email);
    await fetch(`${import.meta.env.VITE_API_URL}/users/forgotMy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const onSubmitPassword: SubmitHandler<{
    password: string;
    confirmPassword: string;
    code: string;
  }> = async (data) => {
    if (data.confirmPassword === data.password) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/updatePassword`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, email }),
          },
        );
        if (response.status === 401) {
          setError("code", {
            type: "manual",
            message: "Incorrect code",
          });
        }
        if (response.status === 402) {
          setError("code", {
            type: "manual",
            message: "Expired code",
          });
        }
        if (response.ok) {
          toast.success("Password changed");
          navigate("/login");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
    }
  };

  return (
    <div className="mx-auto flex flex-col items-center justify-center">
      <ToastContainer position="top-center" />
      <h1 className="mb-10 text-2xl">Reset Password</h1>
      {emailSubmitted ? (
        <form
          className="flex flex-col items-center gap-4"
          onSubmit={handleSubmitNewPassword(onSubmitPassword)}
        >
          <p>{`Email: ${email}`}</p>
          <Input
            label="6-digit code"
            type="text"
            placeholder="Please check your email for a 6 digit code"
            {...registerNewPassword("code", {
              minLength: {
                value: 6,
                message: "Code must be 6 digits",
              },
              maxLength: {
                value: 6,
                message: "Code must be 6 digits",
              },
            })}
          />
          {passwordErrors.code && (
            <p className="text-red-500">{passwordErrors.code.message}</p>
          )}

          <Input
            label="New Password"
            type="text"
            {...registerNewPassword("password", {
              minLength: {
                value: 5,
                message: "New password must be 5 character or more",
              },
            })}
          />
          {passwordErrors.password && (
            <p className="text-red-500">{passwordErrors.password.message}</p>
          )}
          <Input
            label="Confirm New Password"
            type="text"
            {...registerNewPassword("confirmPassword", {
              required: true,
              minLength: {
                value: 5,
                message: "New password must be 5 characters or more",
              },
            })}
          />
          {passwordErrors.confirmPassword && (
            <p className="text-red-500">
              {passwordErrors.confirmPassword.message}
            </p>
          )}
          <button type="submit" className="border bg-yellow-300 px-3 py-2">
            Submit
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmitEmail)}
          className="flex flex-col items-center gap-4"
        >
          <Input
            type="text"
            label="E-Mail"
            {...register("email", {
              required: {
                value: true,
                message: "Field cannot be empty",
              },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
          <button className="border bg-yellow-300 px-3 py-2" type="submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
