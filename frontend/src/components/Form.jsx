import { PasswordInput } from "./PasswordInput";
import React, { useState } from "react";
import Button from "./Button";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
const Form = ({
  onSubmit,
  className,
  children,
  formMessage,
  ...attrubites
}) => {
  return (
    <form
      className={twMerge(
        "bg-white  py-12 px-7 rounded-2xl w-[100%] max-w-[430px] ",
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      {...attrubites}
    >
      {children}
    </form>
  );
};

Form.Title = ({ children }) => {
  return (
    <h2 className="mb-8 text-4xl font-bold text-center text-slate-700">
      {children}
    </h2>
  );
};

Form.FieldsContainer = ({ children, gap = 20 }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
      {children}
    </div>
  );
};
Form.Field = ({ children }) => {
  return <div>{children}</div>;
};

Form.Label = ({ children }) => {
  return <p className="mb-2 font-medium">{children}</p>;
};

Form.Message = ({ children, className, center }) => {
  return (
    <p
      className={twMerge(
        "mt-4 mb-4 text-base font-medium text-slate-700",
        className,
        center && "text-center"
      )}
    >
      {children}
    </p>
  );
};

Form.Input = ({ options, type, className, ...attributes }) => {
  const [isPassword, setIsPassword] = useState(true);
  return type === "password" ? (
    <PasswordInput
      isPassword={isPassword}
      attributes={attributes}
      setIsPassword={setIsPassword}
    />
  ) : (
    <input
      className={twMerge(
        "w-full px-3 py-2 text-base border border-gray-400 border-solid rounded-lg",
        className
      )}
      {...attributes}
    />
  );
};

Form.Textarea = ({ options, type, className, ...attributes }) => {
  return (
    <textarea
      className={twMerge(
        "w-full px-3 py-2 text-base border border-gray-400 border-solid rounded-lg",
        className
      )}
      {...attributes}
    />
  );
};

Form.Select = ({ options, type, className, children, ...attributes }) => {
  return (
    <select
      className={twMerge(
        "w-full px-3 mb-4 py-2 text-base border border-gray-400 border-solid rounded-lg",
        className
      )}
      {...attributes}
    >
      {children}
    </select>
  );
};

export default Form;
