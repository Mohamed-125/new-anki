import React, { useRef, useEffect } from "react";
import   Skeleton   from "@/components/ui/skeleton";
import { motion, useInView, useAnimation } from "framer-motion";
import { CardType } from "@/hooks/useGetCards";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

const CardsSkeleton = ({ cards }: { cards: CardType[] }) => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
    >
      {new Array(5).fill(0).map((_, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
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
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CardsSkeleton;
