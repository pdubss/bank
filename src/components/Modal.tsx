import { logout } from "../slices/userSlice";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import useTokenChecker from "../utility/useTokenChecker";
import { setUser } from "../slices/accountSlice";

interface ModalProps {
  isOpen: boolean;
  setModalOpen: (x: boolean) => void;
}

export default function Modal({ isOpen, setModalOpen }: ModalProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useTokenChecker();
  const { id } = useParams();

  const deleteHandler = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/users/profile/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to delete item", error.error);
      }
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/login");
      alert("Account successfully deleted");
      dispatch(
        setUser({
          balance: 0,
          loan_amount: 0,
          loan_reason: "",
          id: 0,
          account_number: 0,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      {isOpen ? (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-white bg-opacity-50"
        >
          <div
            className="z-100 fixed flex flex-col justify-around border bg-white p-4 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex items-end justify-around">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md bg-green-500 px-4 py-2"
              >
                Take me back!
              </button>
              <button
                className="rounded-md bg-red-500 px-4 py-2"
                onClick={deleteHandler}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
