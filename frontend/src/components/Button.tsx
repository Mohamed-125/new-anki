import React from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import { link } from "fs";
import { size } from "lodash";
import { boolean, string } from "zod";

type AnchorTypeProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  link?: string; // Anchor buttons will have a link
};

type ButtonTypeProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

type CommonProps = {
  variant?:
    | "primary"
    | "primary-outline"
    | "danger"
    | "danger-outline"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "large" | "parent" | "fit" | "default" | "sm" | "lg" | "icon";
  center?: boolean;
  className?: string;
  children: React.ReactNode;
};

// Using a union type refinement for ButtonProps
type ButtonProps = CommonProps & (ButtonTypeProps | AnchorTypeProps);

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const { children, className, variant, size, center, ...attributes } = props;

  const buttonVariants = cva(
    "inline-flex text-white py-2 px-4 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      variants: {
        variant: {
          primary: "bg-primary hover:bg-lightPrimary",
          dark: "bg-dark-primary hover:bg-opacity-90",
          "primary-outline":
            "border-primary border bg-transparent text-primary hover:bg-lightPrimary hover:text-white",
          danger: "bg-red-600 hover:bg-red-700",
          "danger-outline":
            "border-red-600 bg-transparent hover:bg-red-500 text-red-600",
          outline:
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          secondary:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          ghost: "hover:bg-accent hover:text-accent-foreground",
          link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
          large: "py-3 px-8 w-full max-w-[200px] text-base",
          parent: "w-full py-3 justify-center",
          fit: "w-fit justify-center",
          default: "h-10 px-4 py-2",
          sm: "h-9 rounded-md px-3",
          lg: "h-11 rounded-md px-8",
          icon: "h-10 w-10",
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
        ref={ref as React.Ref<HTMLAnchorElement>}
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
        ref={ref as React.Ref<HTMLButtonElement>}
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
});

export default Button;
