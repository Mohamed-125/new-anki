import React from "react";
import { twMerge } from "tailwind-merge";

const Message = ({
  isUserSender,
  content,
}: {
  isUserSender: boolean;
  content: string;
}) => {
  return (
    <div
      className={twMerge(
        "w-[90%] text-white mb-[15px]  rounded-xl py-5  px-3",
        isUserSender
          ? " bg-gray-700 ml-auto "
          : "bg-gradient-to-r from-purple-700 to-pink-800"
      )}
    >
      <pre className="font-[inherit] text-wrap">{content}</pre>
    </div>
  );
};

export default Message;
