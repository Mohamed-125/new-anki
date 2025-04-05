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
        className="overflow-hidden relative bg-white rounded-t-lg border-b-2 border-gray-400 shadow-md"
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
          e.preventDefault(); // Allow drop

          const element = e.currentTarget;
          const elementRect = element.getBoundingClientRect();
          const { top, bottom, height } = elementRect;
          const mouseTopPosition = e.clientY;

          const dropIndicator = document.getElementById("dropIndicator");

          if (dropIndicator) {
            dropIndicator?.remove();
          }

          const div = document.createElement("div");
          div.id = "dropIndicator";
          div.style.height = "6px";
          div.style.backgroundColor = "rgb(59 130 246)";

          // console.log(((mouseTopPosition - top) / height) * 100);
          if (mouseTopPosition - top > 0) {
            if (((mouseTopPosition - top) / height) * 100 < 50) {
              element?.parentElement?.insertBefore(div, element);
            } else {
              element?.parentElement?.insertBefore(div, element.nextSibling);
            }
          }
        }}
        onDrop={(e) => {
          const dropIndicator = document.getElementById("dropIndicator");

          // console.log(e.currentTarget.parentElement.getAttribute("data-order"));
          const next = dropIndicator?.nextSibling;

          const isBeforeElement = Boolean(next);
          // const targetElement = next
          //   ? next.parentElement
          //   : pre?.parentElement?.nextSibling;
          // const targetElementOrder = +targetElement?.getAttribute("data-order");

          const targetElementOrder = +(
            e.currentTarget?.parentElement?.getAttribute("data-order") ?? "0"
          );

          const draggedOrder = +e.dataTransfer.getData("text/plain") as number;
          const dragSection = state[draggedOrder - 1];
          const targetSection = state[targetElementOrder - 1];

          let stateArr = state.filter(
            (section, index) => index !== draggedOrder - 1
          );

          // let arrangedSections = [...sections]

          // console.log(draggedOrder, targetElementOrder);

          const newArrangedArr = [...stateArr];

          console.log(targetElementOrder - 1);

          let insertIndex;

          if (targetElementOrder - 1 === draggedOrder - 1) {
            insertIndex = draggedOrder - 1;
          } else if (targetElementOrder - 1 === 0) {
            insertIndex = 0;
          } else if (draggedOrder - 1 > targetElementOrder - 1) {
            insertIndex = isBeforeElement
              ? targetElementOrder - 1
              : targetElementOrder - 2;
          } else {
            insertIndex = isBeforeElement
              ? targetElementOrder - 2
              : targetElementOrder - 1;
          }

          if (insertIndex >= 0 && insertIndex <= newArrangedArr.length) {
            newArrangedArr.splice(insertIndex, 0, dragSection);
          } else {
            newArrangedArr.splice(insertIndex - 1, 0, dragSection);
          }

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
