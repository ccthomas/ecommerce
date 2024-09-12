export type Product = {
  id: string;
  name: string;
  imageObjectKey: string | null,
  imageUrl: string | null;
  priceLowest: string | null;

  // Audit data
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

// Define the type for pagination details
interface PageInfo {
  page: number;
  pageSize: number;
  initialPage: number;
  totalPages: number;
}

// Define the type for sorting details
interface SortInfo {
  sortBy: string;
  sortOrder: 'asc' | 'desc' | 'ASC' | 'DESC';
}

// Define the type for the query information
interface QueryInfo {
  name?: string;
}

// Define the main payload type
export interface ProductListResponse {
  countTotal: number;
  count: number;
  page: PageInfo;
  sort: SortInfo;
  query: QueryInfo;
  data: Product[];
}
