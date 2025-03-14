import { Link, useLocation } from "react-router-dom";
import useGetCollections from "@/hooks/useGetCollections";

const BreadCramps = () => {
  const location = useLocation().pathname;
  let pathArray = location.split("/");
  if (pathArray[1] === "") {
    pathArray = [""];
  }
  let breadCramps = [] as string[];

  const { collections } = useGetCollections({ all: true });

  if (pathArray.includes("collections")) {
    pathArray.forEach((path, index) => {
      if (index <= 1) {
        breadCramps[index] = path;
        return;
      }
      //@ts-ignore
      breadCramps[index] = collections?.find((collection) => {
        return collection._id === path;
      })?.name;
    });
  }

  return (
    <div className="flex relative gap-1 mt-3 mb-8 sm:text-sm">
      {pathArray.map((path, index) => {
        return (
          <Link
            key={path}
            to={`${pathArray
              .slice(
                0,
                pathArray.findIndex((pathName) => pathName === path) + 1
              )
              .join("/")}`}
            className="text-gray-500 !cursor-pointer hover:text-gray-700"
          >
            {index !== 0 ? breadCramps[index] || path : "Home"}
            {index !== pathArray.length - 1
              ? " / "
              : pathArray.length === 1
              ? " / "
              : null}
          </Link>
        );
      })}
    </div>
  );
};

export default BreadCramps;
