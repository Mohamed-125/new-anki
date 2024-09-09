import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import Chat from "./Chat";

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const ChatComponent = () => {
  const VITE_API_KEY = "AIzaSyBOE7ADX5XOK0iQLFbQbMCahy_d8uA_Jfw";
  const model = useMemo(() => {
    const genAI = new GoogleGenerativeAI(VITE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return model;
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="fixed p-3 rounded-full cursor-pointer group bg-gradient-to-r from-purple-700 to-pink-800 right-12 sm:right-7 bottom-5">
      <IoChatbubbleEllipses
        className="text-5xl text-white sm:text-3xl"
        onClick={() => {
          setIsChatOpen((pre) => !pre);
        }}
      />
      <div className="bg-gray-100 border border-gray-300 shadow-md rounded-xl absolute  bottom-0 -translate-x-[104%] hidden group-hover:block  py-5 px-8 text-xl w-max ">
        Chat with gemini (Google Ai)
      </div>
      {isChatOpen && <Chat model={model} />}
    </div>
  );
};

export default ChatComponent;
