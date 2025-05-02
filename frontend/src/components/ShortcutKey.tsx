import React from "react";

const ShortcutKey = ({ text }: { text: string }) => {
  return (
    <span className="flex absolute top-[-50%] right-[-50%] justify-center items-center p-1 px-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-full">
      {text}
    </span>
  );
};

export default ShortcutKey;
