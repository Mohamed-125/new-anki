import React, { ReactNode, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | null>(
    null
  );

  return (
    <div data-order={order} className="relative mb-2">
      {/* Drop indicator line */}
      {isDragOver && dropPosition === "top" && (
        <div className="absolute top-0 right-0 left-0 z-10 h-1 rounded-full animate-pulse transform -translate-y-1/2 bg-primary" />
      )}

      <div
        draggable
        className={cn(
          "overflow-hidden relative bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 will-change-transform group",
          isDragging && "opacity-50 shadow-none border-dashed border-gray-300",
          isDragOver && "ring-2 ring-primary ring-opacity-50"
        )}
        onDragStart={(e) => {
          setIsDragging(true);
          const parentElement = e.currentTarget?.parentElement;
          if (parentElement) {
            const order = parentElement.getAttribute("data-order");
            if (order) {
              e.dataTransfer.setData("text/plain", order);
              // Add a ghost image effect
              const ghostElement = e.currentTarget.cloneNode(
                true
              ) as HTMLElement;
              ghostElement.style.opacity = "0.5";
              ghostElement.style.position = "absolute";
              ghostElement.style.top = "-1000px";
              document.body.appendChild(ghostElement);
              e.dataTransfer.setDragImage(ghostElement, 20, 20);
              setTimeout(() => {
                document.body.removeChild(ghostElement);
              }, 0);
            }
          }
        }}
        onDragEnd={() => {
          setIsDragging(false);
          setIsDragOver(false);
          setDropPosition(null);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isDragOver) setIsDragOver(true);

          // Determine if we're in the top or bottom half
          const { top, height } = e.currentTarget.getBoundingClientRect();
          const isUpperHalf = e.clientY - top < height / 2;
          setDropPosition(isUpperHalf ? "top" : "bottom");
        }}
        onDragLeave={() => {
          setIsDragOver(false);
          setDropPosition(null);
        }}
        onDrop={(e) => {
          setIsDragOver(false);
          setDropPosition(null);

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

          // If dropping in bottom half, increment the insert index
          if (!isUpperHalf) {
            insertIndex++;
          }

          // Ensure insertIndex doesn't exceed array bounds
          insertIndex = Math.min(insertIndex, stateArr.length);

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
        <div className="flex items-center">
          <div className="flex justify-center items-center p-2 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 cursor-grab active:cursor-grabbing">
            <GripVertical size={18} />
          </div>
          <div className="flex-grow">{children}</div>
        </div>
      </div>

      {/* Bottom drop indicator line */}
      {isDragOver && dropPosition === "bottom" && (
        <div className="absolute right-0 bottom-0 left-0 z-10 h-1 rounded-full animate-pulse transform translate-y-1/2 bg-primary" />
      )}
    </div>
  );
};

export default React.memo(DragableComponent);
