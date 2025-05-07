"use client";

import * as React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  className?: string;
  hideHeaderOnMobile?: boolean;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyField,
  className = "",
  hideHeaderOnMobile = false,
  emptyMessage = "No data available",
}: ResponsiveTableProps<T>) {
  // No data state
  if (!data.length) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Traditional table (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item) => (
              <tr key={String(item[keyField])}>
                {columns.map((column) => (
                  <td
                    key={`${String(item[keyField])}-${String(column.accessor)}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ""}`}
                  >
                    {column.cell
                      ? column.cell(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div
            key={String(item[keyField])}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700"
          >
            {columns.map((column) => (
              <div key={`${String(item[keyField])}-${String(column.accessor)}`}>
                {!hideHeaderOnMobile && (
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {column.header}
                  </div>
                )}
                <div className={column.className || ""}>
                  {column.cell
                    ? column.cell(item)
                    : (item[column.accessor] as React.ReactNode)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 