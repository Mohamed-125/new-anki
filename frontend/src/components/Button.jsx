import React from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";

const Button = ({
  children,
  className,
  onClick,
  variant,
  size,
  center,
  ...attributes
}) => {
  const buttonVariants = cva(
    "cursor-pointer py-2 px-4 disabled:opacity-30 text-white transition-all border rounded-md block",
    {
      variants: {
        variant: {
          primary: "bg-blue-500  hover:bg-blue-400",
          "primary-outline":
            "border-blue-500 hover:bg-blue-400  text-blue-700 hover:text-white",
          danger: "bg-red-600  hover:bg-red-400",
          "danger-outline":
            "border-red-600 text-red-600 hover:bg-red-400  hover:text-white",
        },
        size: {
          large: "py-3 w-screen max-w-[200px]",
          parent: "w-full",
        },
      },
      defaultVariants: {
        variant: "primary",
        size: "small",
      },
    }
  );

  return (
    <button
      onClick={onClick}
      className={twMerge(
        buttonVariants({ variant, size }),
        className,
        center && "mx-auto"
      )}
      {...attributes}
    >
      {children}
    </button>
  );
};

export default Button;
