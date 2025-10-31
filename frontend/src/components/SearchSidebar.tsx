import React, { memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import useGetCards, { CardType } from "@/hooks/useGetCards";
import Card from "./Card";
import Form from "./Form";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Virtuoso } from "react-virtuoso";
import useDebounce from "@/hooks/useDebounce";

interface SearchSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId?: string;
}

const MemoizedCard = memo(Card);

const SearchForm = memo(
  ({
    query,
    setQuery,
  }: {
    query: string;
    setQuery: (query: string) => void;
  }) => (
    <Form className="flex px-0 py-0 w-full max-w-none text-lg bg-transparent rounded-xl">
      <div className="grow">
        <Form.Input
          className="py-2 text-black bg-gray-100 rounded-xl"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search cards..."
          name="query"
        />
      </div>
    </Form>
  )
);

const SearchSidebar = memo(function SearchSidebar({
  isOpen,
  onClose,
  collectionId,
}: SearchSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedQuery = useDebounce(searchQuery);

  const {
    userCards: searchResults,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
  } = useGetCards({
    collectionId,
    query: debouncedQuery,
    searchSidebar: true,
    enabled: isOpen, // Only fetch when sidebar is open
  });

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={handleOverlayClick}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "" }}
            className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-white shadow-xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Search Cards</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b">
                <SearchForm query={searchQuery} setQuery={setSearchQuery} />
              </div>

              {/* Cards List */}
              <div className="overflow-hidden flex-1 p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32 text-gray-500">
                    Loading...
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <Virtuoso
                    style={{ height: "100%" }}
                    totalCount={searchResults.length}
                    itemContent={(index) => (
                      <MemoizedCard
                        key={searchResults[index]._id}
                        id={searchResults[index]._id}
                        card={searchResults[index]}
                      />
                    )}
                    endReached={() => {
                      if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
                        fetchNextPage();
                      }
                    }}
                    components={{
                      List: React.forwardRef(({ style, children }, ref) => (
                        <div
                          ref={ref as any}
                          style={{
                            ...style,
                            paddingRight: "4px",
                          }}
                          className="space-y-4"
                        >
                          {children}
                          {isFetchingNextPage && (
                            <div className="py-4 text-center text-gray-500">
                              Loading more cards...
                            </div>
                          )}
                        </div>
                      )),
                    }}
                  />
                ) : (
                  <div className="flex justify-center items-center h-32 text-gray-500">
                    No cards found
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

export default SearchSidebar;
