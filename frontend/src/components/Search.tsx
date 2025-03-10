import React from "react";
import Form from "./Form";

type SearchProps = {
  query: string;
  searchingFor: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
};

const Search = React.memo(function Search({
  query,
  searchingFor,
  setQuery,
}: SearchProps) {
  return (
    <>
      <Form
        className={
          "flex px-0 py-0 mb-6 w-full max-w-none text-lg bg-transparent rounded-xl"
        }
      >
        <div className="grow">
          <Form.Label>Search Your {searchingFor}</Form.Label>
          <Form.Input
            className="py-2 text-black bg-gray-200 rounded-xl"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            name="query"
          />
        </div>
      </Form>
    </>
  );
});

export default Search;
