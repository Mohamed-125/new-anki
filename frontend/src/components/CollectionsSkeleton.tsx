import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const skeletons = new Array(10).fill(0).map((_, i) => {
  return (
    <div
      key={i}
      className="flex items-center px-8 py-6 bg-white border-b cursor-pointer min-h-24 border-neutral-300"
    >
      <div className="flex items-center flex-1 gap-2">
        <Skeleton className="h-12 w-14" />
        <Skeleton className="w-full h-5 " />
      </div>

      <div className="ml-2 text-2xl ">
        <Skeleton className="w-9 h-14" />
      </div>
    </div>
  );
});

console.log(skeletons);
const CollectionSkeleton = () => skeletons;
export default CollectionSkeleton;
