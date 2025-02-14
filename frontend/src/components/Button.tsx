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
    "cursor-pointer py-2 px-4 disabled:opacity-30 text-white transition-all border rounded-3xl block",
    {
      variants: {
        variant: {
          primary: "bg-blue-500 hover:opacity-80",
          dark: "bg-dark-primary hover:opacity-80",
          "primary-outline":
            "border-blue-500 hover:bg-blue-400 text-blue-700 hover:text-white",
          danger: "bg-red-600 hover:bg-red-400",
          "danger-outline":
            "border-red-600 text-red-600 hover:bg-red-400 hover:text-white",
        },
        size: {
          large: "py-3 w-full max-w-[200px]", // w-screen applies for large
          parent: "w-full",
          fit: "w-fit", // fit applies w-fit correctly
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
