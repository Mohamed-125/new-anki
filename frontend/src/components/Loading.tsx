import React from "react";
import { twMerge } from "tailwind-merge";

const Loading = ({
  className,
  loaderClassName,
}: {
  className?: string;
  loaderClassName?: string;
}) => {
  const classname = className?.split(" ").filter((classname) => {
    if (classname.includes("h-") || classname.includes("w-")) {
      return classname;
    }
  });
  return (
    <div
      className={twMerge(
        "grid absolute inset-0 z-50 justify-center content-center items-center bg-white",
        className
      )}
    >
      <div id="loader" className={twMerge("bg-white", loaderClassName)}></div>
    </div>
  );
};

export default Loading;
