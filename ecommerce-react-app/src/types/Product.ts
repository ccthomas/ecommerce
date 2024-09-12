export type Product = {
  id: string;
  name: string;
  inventory?: Inventory[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

export type Inventory = {
  id: string;
  price: number;
  quanity: number;
  owner: string;
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
