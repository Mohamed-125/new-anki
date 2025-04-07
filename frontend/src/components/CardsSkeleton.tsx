import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const skeletons = new Array(3).fill(0).map((_, i) => {
  return (
    <div
      key={i}
      className="flex items-center px-8 py-6 mb-4 max-w-full bg-white rounded-2xl border shadow-md cursor-pointer border-neutral-300"
    >
      <Skeleton className="mr-2 w-7 h-7" />
      <div className="mr-3 text-2xl">
        <Skeleton className="w-7 h-7" />
      </div>
      <div className="overflow-hidden whitespace-normal break-words grow text-ellipsis">
        <Skeleton className="mb-2 w-full h-[23px]" />
        <Skeleton className="w-full h-[23px]" />
      </div>
      <Skeleton className="ml-4 w-9 h-9" />
    </div>
  );
});

const CardsSkeleton = () => skeletons;
export default CardsSkeleton;
