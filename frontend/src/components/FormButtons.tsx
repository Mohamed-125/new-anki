import React from "react";
import Button from "./Button";

const FormButtons = ({
  setIsOpen,
  isEdit,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit: boolean;
}) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => setIsOpen(false)}
        size="parent"
        type="reset"
        variant={"danger"}
      >
        Cancel
      </Button>

      <Button size="parent">{isEdit ? "Save Changes" : "Add Card"}</Button>
    </div>
  );
};

export default FormButtons;
