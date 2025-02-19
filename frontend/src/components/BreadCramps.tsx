import { Link, useLocation } from "react-router-dom";
import useGetCollectionsContext from "../hooks/useGetCollectionsContext";

const BreadCramps = () => {
  const location = useLocation().pathname;
  const pathArray = location.split("/");

  let breadCramps = [] as string[];

  const { collections } = useGetCollectionsContext();

  if (pathArray.includes("collections")) {
    pathArray.forEach((path, index) => {
      if (index <= 1) {
        breadCramps[index] = path;
        return;
      }
      //@ts-ignore
      breadCramps[index] = collections.find((collection) => {
        return collection._id === path;
      })?.name;
    });
  }

  return (
    <div className="flex gap-1 sm:text-sm">
      {pathArray.map((path, index) => {
        return (
          <button key={path} className="text-gray-500 hover:text-gray-700">
            {index !== 0 ? "/ " : null}
            <Link
              to={`${pathArray
                .slice(
                  0,
                  pathArray.findIndex((pathName) => pathName === path) + 1
                )
                .join("/")}`}
            >
              {index !== 0 ? breadCramps[index] || path : "Home"}
            </Link>
          </button>
        );
      })}
    </div>
  );
};

export default BreadCramps;
