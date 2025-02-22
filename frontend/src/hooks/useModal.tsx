import React, { useContext } from "react";
import { ModalContext } from "../context/ModalContext";

const useModal = () => {
  const modal = useContext(ModalContext);
  if (!modal) {
    throw new Error("modalContext must be used within a modal provider");
  }
  return modal;
};

export default useModal;
