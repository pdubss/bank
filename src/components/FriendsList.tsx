import { FriendType } from "../pages/Transfer";
import useTokenChecker from "../utility/useTokenChecker";
import Spinner from "./Spinner";

interface FriendsListProps {
  setOpenModal: (x: boolean) => void;
  setFriends: (x: FriendType[]) => void;
  friends: FriendType[] | null;
  setSelectedFriend: (x: FriendType) => void;
  isLoading: boolean;
}

export default function FriendsList({
  setOpenModal,
  isLoading,
  friends,
  setSelectedFriend,
}: FriendsListProps) {
  useTokenChecker();

  return (
    <div>
      {isLoading && <Spinner />}
      <h1 className="my-8 text-2xl font-bold">Friends List</h1>
      <ul className="flex justify-center">
        {friends?.map((friend, index) => (
          <Friend
            setSelectedFriend={setSelectedFriend}
            setOpenModal={setOpenModal}
            firstName={friend.first_name}
            lastName={friend.last_name}
            email={friend.email}
            phone={friend.phone}
            key={index}
          />
        ))}
      </ul>
    </div>
  );
}

interface friendProps {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  setOpenModal: (x: boolean) => void;
  setSelectedFriend: (x: FriendType) => void;
}

function Friend({
  firstName,
  lastName,
  phone,
  email,
  setOpenModal,
  setSelectedFriend,
}: friendProps) {
  const selectFriendHandler = async () => {
    setSelectedFriend({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: email,
    });

    setOpenModal(true);
  };

  return (
    <li
      onClick={selectFriendHandler}
      className="w-fit cursor-pointer border p-5"
    >
      <h3 className="text-lg font-semibold">{`${firstName} ${lastName}`}</h3>
      <p>{phone}</p>
      <p>{email}</p>
    </li>
  );
}
