"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import InfiniteScroll from "@/components/InfiniteScroll";
import VideoSkeleton from "@/components/VideoSkeleton";
import useGetUsers from "@/hooks/useGetUsers";

interface DataTableProps {
  debouncedQuery: string;
}

export function DataTable({ debouncedQuery }: DataTableProps) {
  const [isAdmin, setIsAdmin] = useState("");
  const [isPremium, setIsPremium] = useState("");

  const onFilterChange = (filters: ColumnFiltersState) => {
    const isAdminFilter =
      (filters.find((filter) => filter.id === "isAdmin")?.value as string) ||
      "";
    const isPremiumFilter =
      (filters.find((filter) => filter.id === "isPremium")?.value as string) ||
      "";

    setIsAdmin(isAdminFilter);
    setIsPremium(isPremiumFilter);
  };

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const {
    users,
    isInitialLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetUsers({
    query: debouncedQuery,
    isAdmin,
    isPremium,
  });

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(columnFilters);
    }
  }, [columnFilters, onFilterChange]);

  const table = useReactTable({
    data: users || [],
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <InfiniteScroll
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        loadingElement={<VideoSkeleton />}
      >
        {" "}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>{" "}
          <TableBody>
            {isInitialLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <VideoSkeleton />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </InfiniteScroll>
    </div>
  );
}
