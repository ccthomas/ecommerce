import React, {
  createContext, useContext, useState, ReactNode,
} from 'react';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Product, ProductListResponse } from '../types/Product';
import { SERVICE_API } from '../constants';

type ProductApiQueryParams = {
  page?: number | undefined;
  pageSize?: number | undefined;
  name?: string | undefined;
  sort?: 'asc' | 'desc' | undefined;
  sortBy?: 'name' | 'created_at' | 'updated_at';
};

type ProductContextType = {
  products: Product[];
  product: Product | undefined;
  loading: boolean;
  error: string | null;
  deleteProductById: (productId: string) => Promise<void>;
  fetchProducts: (query: ProductApiQueryParams) => Promise<void>;
  fetchProductById: (productId: string) => Promise<void>;
  loadMoreProducts: (query: ProductApiQueryParams) => Promise<void>;
  saveProduct: (product: Product | { name: string }) => Promise<boolean>;
  uploadProductImage: (file: File) => Promise<string | null>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // internal to context and not exposed.
  const getProducts = async (query: ProductApiQueryParams): Promise<Product[]> => {
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

  const loadMoreProducts = async (query: ProductApiQueryParams) => {
    const data: Product[] = await getProducts(query);
    setProducts(products.concat(data));
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

  const uploadProductImage = async (file: File): Promise<string | null> => {
    // Get the presigned URL from your endpoint
    const presignedUrlResponse: AxiosResponse | AxiosError = await axios.get(`${SERVICE_API}/product/signed-url`)
      .catch((e) => {
        setError(e);
        return e;
      });

    if (presignedUrlResponse instanceof AxiosError) {
      return null;
    }

    const { signedUrl, objectKey } = presignedUrlResponse.data;

    // Upload the file to the presigned URL
    const signedUrlResponse = await axios.put(signedUrl, file).catch((e) => {
      setError(e);
      return e;
    });

    if (signedUrlResponse instanceof AxiosError) {
      return null;
    }

    return objectKey;
  };

  return (
    <ProductContext.Provider value={{
      product,
      products,
      loading,
      error,
      deleteProductById,
      fetchProducts,
      fetchProductById,
      loadMoreProducts,
      saveProduct,
      uploadProductImage,
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
