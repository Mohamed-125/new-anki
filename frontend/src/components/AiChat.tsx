import React from "react";
import useModalsStates from "@/hooks/useModalsStates";

const AiChat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div
      className={`fixed transition-all duration-300 ease-in-out top-0 right-0 h-full max-w-[40%] w-full sm:max-w-none   bg-gray-50 shadow-lg z-10 ${
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`flex absolute -left-10 transition-all top-1/2 z-20 justify-center items-center p-2 w-10 h-10 bg-primary text-white rounded-l-lg shadow-md -translate-y-1/2
         ${isSidebarOpen ? "translate-x-full" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform ${
            isSidebarOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="px-4 py-4">
        <div className="sticky top-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Translation
          </h3>
          <div className="text-sm text-gray-600">
            Select text to see translation
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
