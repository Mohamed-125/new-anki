import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const skeletons = new Array(10).fill(0).map((_, i) => {
  return (
    <div
      key={i}
      className="flex items-center max-w-full px-8 py-6 mb-4 bg-white border shadow-md cursor-pointer rounded-2xl border-neutral-300"
    >
      <Skeleton className="mr-2 w-7 h-7" />
      <div className="mr-3 text-2xl">
        <Skeleton className="w-7 h-7" />
      </div>
      <div className="overflow-hidden break-words whitespace-normal grow text-ellipsis">
        <Skeleton className="mb-2 w-full h-[23px]" />
        <Skeleton className="w-full h-[23px]" />
      </div>
      <Skeleton className="ml-4 w-9 h-9" />
    </div>
  );
});

const CardsSkeleton = () => skeletons;
export default CardsSkeleton;
