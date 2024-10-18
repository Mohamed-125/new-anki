import { useContext } from "react";
import { userContext } from "../context/UserContext";

const useGetCurrentUser = () => {
  const user = useContext(userContext);
  if (!user) {
    throw new Error("User context must be used within a UserProvider");
  }
  return user;
};

export default useGetCurrentUser;
