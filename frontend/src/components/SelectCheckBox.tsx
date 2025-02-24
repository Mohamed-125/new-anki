import React from "react";

const SelectCheckBox = ({
  selectedItems,
  id,
  setSelectedItems,
}: {
  selectedItems: string[];
  id: string;
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const isSelected = selectedItems?.includes(id);

  return (
    <input
      checked={isSelected}
      type="checkbox"
      className="w-8 !h-8 mr-2 border-2 cursor-pointer border-gray-300 rounded-full relative appearance-none sm:hidden checked:bg-primary checkInput"
      onClick={(e) => {
        setSelectedItems?.((pre) => {
          if ((e.target as HTMLInputElement).checked) {
            return [...pre, id];
          } else {
            return [...pre.filter((item) => item !== id)];
          }
        });
      }}
    />
  );
};

export default SelectCheckBox;
