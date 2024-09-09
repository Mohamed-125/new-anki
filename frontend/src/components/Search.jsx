import React, { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounced";
import Form from "./Form";

const Search = ({ items, setState, filter, label }) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    console.log("debounced ", debouncedQuery);
    if (debouncedQuery) {
      setState(
        items?.filter((item) =>
          item[filter]
            .toLowerCase()
            .trim()
            .includes(debouncedQuery.toLowerCase().trim())
        )
      );
    } else {
      setState(items);
    }
  }, [debouncedQuery, items]);

  return (
    <Form className={"w-full flex max-w-none mb-8"}>
      <div className="grow">
        <Form.Label>{label}</Form.Label>
        <Form.Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          name="query"
          placeholder="Search"
        />
      </div>
    </Form>
  );
};

Search.NotFound = ({ state, searchFor, filter }) => {
  return (
    <>
      {!state?.length ? (
        <p className="text-center text-white text-2xl">
          there is no {searchFor} found with this {filter}
        </p>
      ) : null}
    </>
  );
};
export default Search;
