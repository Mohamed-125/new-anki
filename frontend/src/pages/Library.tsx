import React, { useState } from "react";
import useGetCollections, { CollectionType } from "../hooks/useGetCollections";
import Search from "../components/Search";
import { Link } from "react-router-dom";
import Button from "../components/Button";

const Library = () => {
  const [filteredCollections, setFilteredCollections] = useState<
    CollectionType[]
  >([]);

  const { data: collections, isLoading } = useGetCollections({
    publicCollections: true,
  });

  return (
    <div className="container mt-11">
      <h1 className="text-4xl font-bold">Library</h1>
      <small className="text-lg text-textGray">
        In the library you can find all of the publicly availbale collections
      </small>

      {collections?.length ? (
        <div>
          <Search
            setState={setFilteredCollections}
            label={"Search your collections"}
            items={collections}
            filter={"name"}
          />

          <div className="grid gap-2 grid-container">
            {filteredCollections.map((collection) => (
              <div
                key={collection._id}
                id={collection._id}
                className="flex items-center gap-2 px-4 py-5 bg-white border shadow-lg rounded-xl border-neutral-300"
              >
                <Link className="grow" to={`/collections/${collection._id}`}>
                  {collection.name}
                </Link>
              </div>
            ))}{" "}
          </div>

          <Search.NotFound
            state={filteredCollections}
            searchFor={"collection"}
            filter={"name"}
          />
        </div>
      ) : (
        <p className="mt-11">There is no public collections</p>
      )}
    </div>
  );
};

export default Library;
