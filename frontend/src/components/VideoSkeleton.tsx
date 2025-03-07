import { Skeleton } from "@/components/ui/skeleton";

const skeletons = new Array(10).fill(0).map((_, i) => {
  return (
    <div
      key={i}
      className="flex items-center max-w-full mb-4 bg-white border shadow-md cursor-pointer rounded-2xl border-neutral-300"
    >
      <div className="text-2xl ">
        <Skeleton className="w-full h-52" />
      </div>
      <div className="flex gap-4 px-8 overflow-hidden break-words whitespace-normal py-9 grow text-ellipsis">
        <Skeleton className="mb-2 flex-1 w-full h-[30px]" />
        <Skeleton className="w-10 h-[30px]" />
      </div>
    </div>
  );
});

const VideoSkeleton = () => skeletons;
export default VideoSkeleton;
