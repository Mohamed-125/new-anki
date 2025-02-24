import { Folder, Icon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import ActionsDropdown from "../ActionsDropdown";
import SelectCheckBox from "../SelectCheckBox";
import useModalsStates from "@/hooks/useModalsStates";

const ItemCard = ({
  moveHandler,
  renameHandler,
  id,
  deleteHandler,
  name,
  Icon,
  subText,
}: {
  moveHandler?: any;
  renameHandler?: any;
  deleteHandler?: any;
  id: string;
  name: string;
  subText?: string;
  Icon: any;
}) => {
  const { selectedItems, setSelectedItems } = useModalsStates();

  return (
    <div className="rounded-lg border  p-6 py-7 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer bg-white dark:bg-[#242326] hover:translate-y-[-2px] border-[#e5e5e5] dark:border-[#2D2D2D]">
      <div className="flex items-center">
        <Link
          to={`${location.pathname}/${id}`}
          className="flex items-center flex-1 gap-4"
        >
          <div
            data-lov-name="div"
            data-component-line="70"
            className="p-3 bg-blue-100 *:w-6 *:h-6 text-primary rounded-lg dark:bg-indigo-900/30"
          >
            {Icon}
          </div>
          <div>
            <p className="flex-1 font-semibold">{name}</p>
            {subText && (
              <span className="text-sm font-medium text-grayColor">
                {subText}
              </span>
            )}
          </div>
        </Link>

        {id &&
          (!selectedItems.length ? (
            <ActionsDropdown
              moveHandler={moveHandler}
              renameHandler={renameHandler}
              deleteHandler={deleteHandler}
              itemId={id}
              setSelectedItems={setSelectedItems}
            />
          ) : (
            <SelectCheckBox
              id={id}
              setSelectedItems={setSelectedItems}
              selectedItems={selectedItems}
            />
          ))}
      </div>
    </div>
  );
};

export default ItemCard;
