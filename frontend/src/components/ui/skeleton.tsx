import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-gray-200 rounded-md animate-pulse", className)}
      {...props}
    />
  );
}

export default Skeleton;
