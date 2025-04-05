import React from "react";

const TopicsSkeleton = () => {
  // Create an array of 5 items to represent loading skeletons
  const skeletons = Array(5).fill(null);

  return (
    <div className="animate-pulse">
      {skeletons.map((_, index) => (
        <div
          key={index}
          className="overflow-hidden p-5 mb-4 w-full bg-white rounded-xl border border-gray-200 shadow-md"
        >
          <div className="flex justify-between items-start">
            <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
            <div className="flex space-x-2">
              <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
              <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="mt-3 w-full h-4 bg-gray-200 rounded"></div>
          <div className="mt-2 w-2/3 h-4 bg-gray-200 rounded"></div>
          <div className="mt-3">
            <div className="w-20 h-4 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopicsSkeleton;
