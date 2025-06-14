import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  const onClickHandler = () => {
    navigate(-1);
  };

  return (
    <button
      className="fixed left-4 top-20 z-50 rounded-full bg-blue-500 px-3 py-2 text-white shadow-md md:left-1/4 md:top-1/4 lg:left-1/3 lg:top-1/4"
      onClick={onClickHandler}
    >
      Back
    </button>
  );
};

export default BackButton;
