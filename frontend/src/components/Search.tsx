import React, { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounced";
import Form from "./Form";

type SearchProps<T extends { [key: string]: any }> = {
  items: T[];
  setState: any;
  filter: keyof T;
  label: string;
};

function Search<T extends { [key: string]: any }>({
  items,
  setState,
  filter,
  label,
}: SearchProps<T>) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery) {
      setState(
        items?.filter((item) => {
          return item[filter]
            .toLowerCase()
            .trim()
            .includes(debouncedQuery.toLowerCase().trim());
        })
      );
    } else {
      setState(items);
    }
  }, [debouncedQuery, items]);

  return (
    <Form
      className={
        "w-full flex max-w-none py-0 px-0 text-lg  rounded-xl my-8 bg-transparent"
      }
    >
      <div className="grow">
        <Form.Label>{label}</Form.Label>
        <Form.Input
          className="py-2 text-black bg-gray-200 rounded-xl"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          name="query"
          placeholder="Search"
        />
      </div>
    </Form>
  );
}

Search.NotFound = <T,>({
  state,
  searchFor,
  filter,
}: {
  state: T[];
  searchFor: string;
  filter: string;
}) => {
  return (
    <>
      {!state?.length ? (
        <p className="text-2xl text-center text-textGray">
          there is no {searchFor} found with this {filter}
        </p>
      ) : null}
    </>
  );
};
export default Search;
