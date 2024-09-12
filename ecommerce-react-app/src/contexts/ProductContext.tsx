import React, {
  createContext, useContext, useState, ReactNode,
} from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Product, ProductListResponse } from '../types/Product';
import { SERVICE_API } from '../constants';

interface ProductContextType {
  products: Product[];
  product: Product | undefined;
  loading: boolean;
  error: string | null;
  fetchProducts: (query: {
    page?: number | undefined;
    pageSize?: number | undefined;
    name?: string | undefined;
    sort?: 'asc' | 'desc' | undefined;
    sortBy?: 'name' | 'created_at' | 'updated_at';
  }) => Promise<void>;
  loadMoreProducts: (query: {
    page?: number | undefined;
    pageSize?: number | undefined;
    name?: string | undefined;
    sort?: 'asc' | 'desc' | undefined;
    sortBy?: 'name' | 'created_at' | 'updated_at';
  }) => Promise<void>;
  fetchProductById: (productId: string) => Promise<void>;
  deleteProductById: (productId: string) => Promise<void>;
  saveProduct: (product: Product | { name: string }) => Promise<boolean>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductById = async (productId: string) => {
    setLoading(true);
    try {
      const response: AxiosResponse<Product> = await axios
        .get(`${SERVICE_API}/product/${productId}`);
      setLoading(false);
      setError(null);
      setProduct(response.data);
    } catch (e) {
      setLoading(false);
      setError('Error occurred getting product'); // TODO GET Errro from response.
    }
  };

  const saveProduct = async (productToSave: Product | { name: string }): Promise<boolean> => {
    setLoading(true);
    try {
      const response: AxiosResponse<Product> = await axios.post(`${SERVICE_API}/product`, productToSave);
      setLoading(false);
      setError(null);
      return response.status === 200;
    } catch (e) {
      setLoading(false);
      setError('Error occurred getting product'); // TODO GET Errro from response.
      return false;
    }
  };

  const deleteProductById = async (productId: string) => {
    setLoading(true);
    try {
      await axios.delete(`${SERVICE_API}/product/${productId}`);
      setLoading(false);
      setError(null);
    } catch (e) {
      setLoading(false);
      setError('Error occurred getting product'); // TODO GET Errro from response.
    }
  };

  const getProducts = async (query: {
    page?: number | undefined;
    pageSize?: number | undefined;
    name?: string | undefined;
    sort?: 'asc' | 'desc' | undefined;
    sortBy?: 'name' | 'created_at' | 'updated_at';
  }): Promise<Product[]> => {
    setLoading(true);
    try {
      const response: AxiosResponse<ProductListResponse> = await axios.get(`${SERVICE_API}/product`, {
        params: {
          page: query.page,
          page_size: query.pageSize,
          name: query.name,
          sort: query.sort,
          sort_by: query.sortBy,
        },
      } as AxiosRequestConfig);
      setLoading(false);
      setError(null);
      return response.data.data;
    } catch (e) {
      setLoading(false);
      setError('Error occurred getting products'); // TODO GET Errro from response.
      return [];
    }
  };

  const loadMoreProducts = async (query: {
    page?: number | undefined;
    pageSize?: number | undefined;
    name?: string | undefined;
    sort?: 'asc' | 'desc' | undefined;
    sortBy?: 'name' | 'created_at' | 'updated_at';
  }) => {
    const data: Product[] = await getProducts(query);
    setProducts(products.concat(data));
  };

  const fetchProducts = async (query: {
    page?: number | undefined;
    pageSize?: number | undefined;
    name?: string | undefined;
    sort?: 'asc' | 'desc' | undefined;
    sortBy?: 'name' | 'created_at' | 'updated_at';
  }) => {
    const data: Product[] = await getProducts(query);
    setProducts(data);
  };

  return (
    <ProductContext.Provider value={{
      product,
      products,
      loading,
      error,
      saveProduct,
      fetchProducts,
      deleteProductById,
      fetchProductById,
      loadMoreProducts,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
