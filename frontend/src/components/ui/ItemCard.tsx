import { Folder, Icon } from "lucide-react";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import ActionsDropdown from "../ActionsDropdown";
import SelectCheckBox from "../SelectCheckBox";
import useModalsStates from "@/hooks/useModalsStates";
import { linkSync } from "fs";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";

const ItemCard = ({
  moveHandler,
  editHandler,
  id,
  deleteHandler,
  name,
  Icon,
  subText,
  isNotes,
  shareHandler,
  isSameUser = true,
  select = true,
  to,
  sectionId,
}: {
  moveHandler?: any;
  editHandler?: any;
  deleteHandler?: any;
  id: string;
  name: string;
  subText?: ReactNode;
  Icon: any;
  isNotes?: boolean;
  shareHandler?: () => void;
  isSameUser?: boolean;
  select?: boolean;
  to?: string;
  sectionId?: string;
}) => {
  const { selectedItems, setSelectedItems } = useModalsStates();
  const linkContent = (
    <div className="flex flex-1 gap-3 items-center">
      <div className="p-2.5 bg-[#ebe7f8] *:w-5 *:h-5 text-[#5a3aa5] rounded-lg">
        {Icon}
      </div>
      <div className="overflow-hidden whitespace-normal break-words grow text-ellipsis">
        <p className="flex-1 font-semibold text-gray-800">{name}</p>
      </div>
    </div>
  );

  return (
    <div
      id={id}
      className="rounded-xl my-3 border py-6 px-5 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer bg-white hover:translate-y-[-2px] border-[#e5e5e5]"
    >
      <div className="flex justify-between items-center">
        {isNotes ? (
          linkContent
        ) : (
          <Link
            to={to || `${location.pathname}/${id}`}
            state={{ sectionId }}
            className="flex flex-1 gap-3 items-center"
          >
            {linkContent}
          </Link>
        )}
        <div className="flex gap-2 items-center">
          <div className="text-lg font-semibold">{subText}</div>
          <div onClick={(e) => e.stopPropagation()}>
            {id &&
              isSameUser &&
              (!selectedItems.length ? (
                <ActionsDropdown
                  moveHandler={moveHandler}
                  editHandler={editHandler}
                  deleteHandler={deleteHandler}
                  shareHandler={shareHandler}
                  itemId={id}
                  isSameUser={isSameUser}
                  setSelectedItems={select ? setSelectedItems : undefined}
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
      </div>
    </div>
  );
};

export default React.memo(ItemCard);
