import { useForm, SubmitHandler } from "react-hook-form";
import { createUser } from "../slices/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import Input from "../components/Input";

type Inputs = {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  ssn: string;
  phone: string;
};

const CreateUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      //only if email doesn't exist, does the post request go through
      const response = await fetch(
        `https://bank-backend-feny.onrender.com/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const newUser = await response.json();
      const { token } = newUser;

      localStorage.setItem("token", token);

      if (response.status === 409) {
        setError("email", {
          type: "manual",
          message: "Email already registered, please log in",
        });
      }
      if (response.status === 410) {
        setError("phone", {
          type: "manual",
          message: "Phone number already registered, please log in ",
        });
      }

      if (response.ok) {
        navigate("/dashboard");
        dispatch(
          createUser({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          }),
        );
      }
    } catch (error) {
      console.error("Error creating user", error);
    }
  };

  return (
    <form
      className="flex w-screen flex-col items-center justify-center gap-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl">Create Your Account</h1>
      <Input
        {...register("firstName", {
          required: "Field is required",
          minLength: {
            value: 2,
            message: "First name must be at least two characters long",
          },
        })}
        type="text"
        label="First Name"
      />
      {errors.firstName && (
        <p className="text-red-600">{errors.firstName.message}</p>
      )}
      <Input
        {...register("lastName", {
          required: "Field is required",
          minLength: {
            value: 2,
            message: "Last name must be at least two letters long",
          },
        })}
        label="Last Name"
        type="text"
      />
      {errors.lastName && (
        <p className="text-red-600">{errors.lastName.message}</p>
      )}
      <Input
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email address",
          },
        })}
        label="E-Mail"
        type="text"
      />
      {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      <Input
        label="Phone Number"
        type="text"
        {...register("phone", {
          required: "A phone number is required",
          pattern: {
            value: /^(\d{3}-?\d{3}-?\d{4})$/,
            message: "Invalid phone number",
          },
        })}
      />
      {errors.phone && <p className="text-red-600">{errors.phone.message}</p>}
      <Input
        {...register("password", {
          required: "A password is required",
          minLength: {
            value: 8,
            message: "Enter at least 8 characters",
          },
        })}
        label="Password"
        type="text"
      />
      {errors.password && (
        <p className="text-red-600">{errors.password.message} </p>
      )}
      <Input
        {...register("ssn", {
          required: "SSN is required",
          minLength: {
            value: 11,
            message: "SSN must be in XXX-XX-XXXX format",
          },
          maxLength: {
            value: 11,
            message: "SSN must be in XXX-XX-XXXX format",
          },
          pattern: {
            value: /^\d{3}-\d{2}-\d{4}$/,
            message: " Invalid SSN format, expect 123-45-6789 format",
          },
        })}
        label="SSN"
        type="text"
      />
      {errors.ssn && <p className="text-red-600">{errors.ssn.message}</p>}
      <div className="flex gap-3 uppercase">
        <button className="border px-3 py-2 uppercase" type="submit">
          Submit
        </button>
        <Link className="border px-3 py-2" to="/login">
          Login
        </Link>
      </div>
    </form>
  );
};

export default CreateUser;
