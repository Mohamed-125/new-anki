import React from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";

type AnchorTypeProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  link: string; // Anchor buttons will have a link
};

type ButtonTypeProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

type CommonProps = {
  variant?: "primary" | "primary-outline" | "danger" | "danger-outline";
  size?: "large" | "parent" | "fit";
  center?: boolean;
  className?: string;
  children: React.ReactNode;
};

// Using a union type refinement for ButtonProps
type ButtonProps = CommonProps & (ButtonTypeProps | AnchorTypeProps);

const Button = (props: ButtonProps) => {
  const { children, className, variant, size, center, ...attributes } = props;

  const buttonVariants = cva(
    "cursor-pointer py-2.5 px-6 sm:zoom-[90%] sm:text-sm disabled:opacity-30 text-white transition-all duration-200 ease-in-out border rounded-lg shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 font-medium",
    {
      variants: {
        variant: {
          primary: "bg-blue-500 hover:bg-blue-600",
          dark: "bg-dark-primary hover:bg-opacity-90",
          "primary-outline":
            "border-blue-500 bg-transparent hover:bg-blue-50 text-blue-700",
          danger: "bg-red-600 hover:bg-red-700",
          "danger-outline":
            "border-red-600 bg-transparent hover:bg-red-50 text-red-600",
        },
        size: {
          large: "py-3 px-8 w-full max-w-[200px] text-base",
          parent: "w-full justify-center",
          fit: "w-fit justify-center"
        },
      },
      defaultVariants: {
        variant: "primary",
        size: "fit", // size defaults to large, but this can be overridden
      },
    }
  );

  // Check if 'link' prop exists to determine if it's an anchor element
  if ((props as AnchorTypeProps).link) {
    const link = (props as AnchorTypeProps).link;
    return (
      <a
        href={link}
        className={twMerge(
          buttonVariants({ variant, size }),
          className,
          center && "mx-auto"
        )}
        {...(attributes as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  } else {
    // Regular button
    return (
      <button
        className={twMerge(
          buttonVariants({ variant, size }),
          className,
          center && "mx-auto"
        )}
        {...(attributes as ButtonTypeProps)}
      >
        {children}
      </button>
    );
  }
};

export default Button;
