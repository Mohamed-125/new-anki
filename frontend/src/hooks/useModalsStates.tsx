import { statesContext } from "@/context/StatesContext";
import { useContext } from "react";

const useModalsStates = () => {
  const data = useContext(statesContext);
  if (!data) {
    throw new Error("must use within the toast provider");
  }
  return data;
};

export default useModalsStates;

 