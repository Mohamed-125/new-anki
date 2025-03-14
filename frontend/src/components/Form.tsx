import React, { useState, ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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
  formRef,
  ...attrubites
}: FormProps) => {
  return (
    <form
      className={twMerge("px-7 py-12 bg-white rounded-2xl", className)}
      ref={formRef}
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

Form.Title = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2
      className={twMerge(
        "mb-8 text-4xl font-bold text-center sm:text-3xl text-slate-700",
        className
      )}
    >
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

Form.Label = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <p className={twMerge("mb-2 font-medium", className)}>{children}</p>;
};

Form.Message = ({
  children,
  className,
  center,
  error,
}: {
  children: ReactNode;
  className?: string;
  center?: boolean;
  error?: boolean;
}) => {
  return (
    <p
      className={twMerge(
        "mt-4 mb- font-medium text-slate-700",
        className,
        center && "text-center",
        error && "text-red-600 mt-1"
      )}
    >
      {children}
    </p>
  );
};

type InputProps = {
  type?: string;
  className?: string;
  isLoading?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

Form.Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, className, isLoading, ...attributes }, ref) => {
    const [isPassword, setIsPassword] = useState(true);

    return type === "password" ? (
      <span className="relative">
        <Input
          ref={ref}
          className={twMerge("focus-visible:ring-lightPrimary", className)}
          type={isPassword ? "password" : "text"}
          {...attributes}
        />
        <Button
          type="button"
          variant="ghost"
          className="absolute right-2 top-1/2 p-0 h-auto -translate-y-1/2"
          onClick={() => setIsPassword(!isPassword)}
        >
          {isPassword ? (
            <FaEye className="text-2xl" />
          ) : (
            <FaEyeSlash className="text-2xl" />
          )}
        </Button>
      </span>
    ) : (
      <div className="relative">
        <Input
          ref={ref}
          className={twMerge(
            "focus-visible:ring-lightPrimary",
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
  isLoading?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

Form.Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ type, className, isLoading, ...attributes }, ref) => {
    return (
      <div className="relative">
        <Textarea
          ref={ref}
          className={twMerge(
            "focus-visible:ring-lightPrimary sm:text-sm",
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
        "px-3 py-2 mb-4 w-full rounded-lg border border-gray-400",
        className
      )}
      {...attributes}
    >
      {children}
    </select>
  );
};

export default Form;
