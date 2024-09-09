import React, { useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, children, setIsOpen }) => {
  return (
    <>
      <div
        className="modal-backdrop"
        onClick={(e) => {
          setIsOpen?.(false);
        }}
      ></div>

      <div className="bg-white py-14 px-7 z-[1500] absolute inset-2/4 h-fit -translate-x-2/4 -translate-y-2/4 rounded-2xl w-[100%] max-w-[730px] ">
        {children}
      </div>
    </>
  );
};

export default Modal;
