import React, { ReactNode } from "react";

const DragableComponent = ({
  order,
  state,
  setState,
  children,
  reorderHandler,
}: {
  order: number;
  state: any[];
  setState: React.Dispatch<React.SetStateAction<any[]>>;
  children: ReactNode;
  reorderHandler: (newArrangedArr: any[]) => void;
}) => {
  return (
    <div data-order={order}>
      <div
        draggable
        className="overflow-hidden relative bg-white rounded-t-lg border-b-2 border-gray-400 shadow-md will-change-transform"
        onDragStart={(e) => {
          // console.log(e.target);
          const parentElement = e.currentTarget?.parentElement;
          if (parentElement) {
            const order = parentElement.getAttribute("data-order");
            if (order) {
              e.dataTransfer.setData("text/plain", order); // Set data
            }
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          // console.log(e.currentTarget.parentElement.getAttribute("data-order"));
          const targetElementOrder = +(
            e.currentTarget?.parentElement?.getAttribute("data-order") ?? "0"
          );
          const draggedOrder = +e.dataTransfer.getData("text/plain") as number;
          const dragSection = state[draggedOrder - 1];

          // Remove dragged item from array
          let stateArr = state.filter(
            (section, index) => index !== draggedOrder - 1
          );

          const { top, height } = e.currentTarget.getBoundingClientRect();
          const isUpperHalf = e.clientY - top < height / 2;

          // Calculate insert position based on drop location
          let insertIndex = targetElementOrder - 1;
          if (!isUpperHalf && insertIndex < stateArr.length) {
            insertIndex++;
          }

          // Adjust for removing the dragged item
          if (draggedOrder - 1 < insertIndex) {
            insertIndex--;
          }

          // Create new array and insert dragged item while preserving all section properties
          const newArrangedArr = [...stateArr];
          newArrangedArr.splice(insertIndex, 0, {
            ...dragSection,
            order: insertIndex + 1,
          });

          // Update order numbers while preserving other section properties
          newArrangedArr.forEach((section, index) => {
            section.order = index + 1;
          });
          setState(newArrangedArr);

          reorderHandler(newArrangedArr);
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DragableComponent;
