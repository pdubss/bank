import { Link } from "react-router-dom";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../slices/userSlice";
// import useTokenChecker from "../utility/useTokenChecker";

type FormFields = { email: string; password: string };
export interface decodedJWT {
  id: number;
  email: string;
  iat: number;
  exp: number;
  firstName: string;
  lastName: string;
  phone: string;
}
interface loginResponse {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  token: string;
  id: number;
  phone: string;
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormFields>();
  const [showPass, setShowPass] = useState(false);

  const toggleShowPassword = () => {
    setShowPass(showPass ? false : true);
  };

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (response.status === 400) {
        setError("email", {
          type: "manual",
          message: "Incorrect email or password",
        });
        throw new Error("Error logging in");
      }

      const user: loginResponse = await response.json();
      const { token } = user;
      console.log(user);

      localStorage.setItem("token", token);
      dispatch(
        login({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          id: user.id,
          phone: user.phone,
        }),
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Error loggin in:", error);
    }
  };

  // const { isValid, decodedToken } = useTokenChecker();
  // if (isValid && decodedToken) {
  //   dispatch(
  //     login({
  //       email: decodedToken.email,
  //       firstName: decodedToken.firstName,
  //       lastName: decodedToken.lastName,
  //     }),
  //   );
  //   navigate("/dashboard");
  // }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64token = token.split(".")[1];
        const decodedToken = JSON.parse(atob(base64token)) as decodedJWT;
        console.log(decodedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          dispatch(
            login({
              email: decodedToken.email,
              firstName: decodedToken.firstName,
              lastName: decodedToken.lastName,
              id: decodedToken.id,
              phone: decodedToken.phone,
            }),
          );
          navigate("/dashboard");
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [navigate, dispatch]);

  return (
    <form
      className="flex w-screen flex-col items-center justify-center gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl">Login</h1>
      <Input
        {...register("email", {
          required: true,
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address",
          },
        })}
        type="text"
        label="E-Mail"
      />
      {errors.email && (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      )}
      <div className="relative">
        <Input
          {...register("password", { required: true, minLength: 8 })}
          label="Password"
          type={showPass ? "text" : "password"}
        />
        <button
          className="absolute left-[105%] top-6 rounded-lg border px-2 py-1 text-center uppercase"
          onClick={toggleShowPassword}
          type="button"
        >
          {showPass ? "HIDE" : "REVEAL"}
        </button>
      </div>
      <div className="flex gap-3 uppercase sm:gap-10">
        <button className="border px-3 py-2 uppercase" type="submit">
          Submit
        </button>
        <Link className="border px-3 py-2" to="/">
          Create an Account
        </Link>
      </div>
      <div>
        <Link to="/reset" className="border px-3 py-2">
          Forgot Password?
        </Link>
      </div>
    </form>
  );
}
