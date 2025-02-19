import React from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";

export function PasswordInput({
  isPassword,
  setIsPassword,
  ...attributes
}: {
  isPassword: boolean;
  setIsPassword: React.Dispatch<React.SetStateAction<boolean>>;
} & React.HTMLAttributes<HTMLInputElement>) {
  return (
    <span className="relative">
      <input
        type={isPassword ? "password" : "text"}
        className="relative w-full px-3 py-2 text-base border border-gray-400 border-solid rounded-lg"
        {...attributes}
      />

      <button type="button">
        {isPassword ? (
          <FaEye
            onClick={() => {
              setIsPassword(false);
            }}
            className="absolute text-2xl right-3 top-[50%] bottom-2/4 -translate-y-2/4 cursor-pointer"
          />
        ) : (
          <FaEyeSlash
            onClick={() => {
              setIsPassword(true);
            }}
            className="absolute text-2xl right-3 top-[50%] bottom-2/4 -translate-y-2/4 cursor-pointer"
          />
        )}{" "}
      </button>
    </span>
  );
}
