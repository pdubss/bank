import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { logout } from "../slices/userSlice";

export default function Header() {
  const user = useSelector((store: RootState) => store.user);
  const account = useSelector((store: RootState) => store.account);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="flex w-screen items-center justify-between bg-blue-600 p-4 text-white">
      <Link to="/dashboard">🏦 APP</Link>
      <div className="flex items-center gap-8">
        <NavLink className="hidden sm:flex" to="/about">
          ABOUT
        </NavLink>
        <NavLink className="hidden sm:flex" to="/tech">
          TECH
        </NavLink>
        {user.isLoggedIn ? (
          <div className="flex items-center justify-end gap-4">
            <h3>Welcome, {user.user.firstName}</h3>
            <button
              className="rounded border bg-green-600 px-1 py-1 uppercase text-white"
              onClick={() => navigate(`/profile/${account.id}`)}
            >
              profile
            </button>
            <button
              className="rounded border bg-red-700 px-1 py-1 uppercase text-white"
              onClick={logoutHandler}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
