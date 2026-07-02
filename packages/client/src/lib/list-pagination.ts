export const LIBRARY_PAGE_SIZE = 100;

export type PaginatedList<T> = {
  items: T[];
  limit: number;
  offset: number;
  hasMore: boolean;
};

export function getNextPageOffset<T>(page: PaginatedList<T>) {
  return page.hasMore ? page.offset + page.items.length : undefined;
}

export function flattenPaginatedItems<T>(pages: Array<PaginatedList<T>> | undefined) {
  return pages?.flatMap((page) => page.items) ?? [];
}
