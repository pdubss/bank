import { logout } from "../slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { decodedJWT } from "../pages/Login";
import { useState, useEffect } from "react";

function useTokenChecker() {
  const [isValid, setIsValid] = useState(false);
  const [decodedToken, setDecodedToken] = useState<decodedJWT | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem("token");

    if (jwt) {
      setToken(jwt);
      const base64token = jwt.split(".")[1];
      const decoded = JSON.parse(atob(base64token)) as decodedJWT;
      console.log(decoded);

      if (decoded.exp * 1000 > Date.now()) {
        setIsValid(true);
        setDecodedToken(decoded);
      } else {
        alert("Session expired, please log in again");
        localStorage.removeItem("token");
        setIsValid(false);
        setDecodedToken(null);
        navigate("/login");
        dispatch(logout());
      }
    } else {
      setDecodedToken(null);
      setIsValid(false);
      dispatch(logout());
      navigate("/login");
      alert("Login to access this page");
    }
  }, [dispatch, navigate]);

  return { isValid, decodedToken, token };
}

export default useTokenChecker;
