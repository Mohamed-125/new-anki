import { PasswordInput } from "./PasswordInput";
import React, { useState, ReactNode, forwardRef } from "react";
import Button from "./Button";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

type FormProps = React.HTMLAttributes<HTMLFormElement> & {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  children: React.ReactNode;
  formMessage?: string;
  [key: string]: any;
};

const Form = ({
  onSubmit,
  className,
  children,
  formMessage,
  ...attrubites
}: FormProps) => {
  return (
    <form
      className={twMerge(
        "bg-white  py-12 px-7 sm:py-8 sm:px-2 rounded-2xl w-[100%] max-w-[430px]",
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(e);
      }}
      {...attrubites}
    >
      {children}
    </form>
  );
};

Form.Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="mb-8 text-4xl font-bold text-center sm:text-3xl text-slate-700">
      {children}
    </h2>
  );
};

Form.FieldsContainer = ({
  children,
  gap = 20,
  className,
}: {
  children: ReactNode;
  gap?: number;
  className?: string;
}) => {
  return (
    <div
      className={twMerge("", className)}
      style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}
    >
      {children}
    </div>
  );
};
Form.Field = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={twMerge("", className)}>{children}</div>;
};

Form.Label = ({ children }: { children: ReactNode }) => {
  return <p className="mb-2 font-medium">{children}</p>;
};

Form.Message = ({
  children,
  className,
  center,
}: {
  children: ReactNode;
  className?: string;
  center?: boolean;
}) => {
  return (
    <p
      className={twMerge(
        "mt-4 mb- font-medium text-slate-700",
        className,
        center && "text-center"
      )}
    >
      {children}
    </p>
  );
};

// : {
//   type?: string;
//   ref?: any;
//   className?: string;
// } & React.InputHTMLAttributes<HTMLInputElement>

type InputProps = {
  type?: string;
  className?: string;
  isLoading?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

Form.Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, className, isLoading, ...attributes }, ref) => {
    const [isPassword, setIsPassword] = useState(true);
    return type === "password" ? (
      <PasswordInput
        isPassword={isPassword}
        setIsPassword={setIsPassword}
        {...attributes}
      />
    ) : (
      <div className="relative">
        <input
          ref={ref}
          className={twMerge(
            "w-full px-3 focus-visible:outline-lightPrimary py-2 focus-visible:border border  border-neutral-300  rounded-lg",
            className,
            isLoading && "inputLoading"
          )}
          {...attributes}
        />
        {isLoading && <i className="loader loader-input"></i>}
      </div>
    );
  }
);

type TextareaProps = {
  type?: string;
  className?: string;
  isLoading: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

Form.Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ type, className, isLoading, ...attributes }, ref) => {
    return (
      <>
        {" "}
        <textarea
          ref={ref} // Forward the ref to the <textarea> element
          className={twMerge(
            "w-full px-3 py-4 sm:text-sm border border-gray-400 rounded-lg",
            className,
            isLoading && "inputLoading"
          )}
          {...attributes}
        />
        {isLoading && <i className="loader loader-input"></i>}
      </>
    );
  }
);

Form.Select = ({
  type,
  className,
  children,
  ...attributes
}: {
  children: ReactNode;
  type?: string;
  className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select
      className={twMerge(
        "w-full px-3 mb-4 py- border border-gray-400   rounded-lg",
        className
      )}
      {...attributes}
    >
      {children}
    </select>
  );
};

export default Form;
