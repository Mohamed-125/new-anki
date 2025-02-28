import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const skeletons = new Array(10).fill(0).map((_, i) => {
  return (
    <div
      key={i}
      className="flex items-center px-8 h-[65px] py-6  max-w-full bg-white border-b cursor-pointer border-neutral-300"
    >
      <Skeleton className="mr-4 w-full h-5" />

      <div className="mr-3 text-2xl">
        <Skeleton className="w-14 h-6" />
      </div>
    </div>
  );
});

console.log(skeletons);
const CollectionSkeleton = () => skeletons;
export default CollectionSkeleton;
