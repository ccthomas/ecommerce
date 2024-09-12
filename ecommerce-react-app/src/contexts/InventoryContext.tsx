import React, {
  createContext, useContext, useState, ReactNode,
} from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { SERVICE_API } from '../constants';
import { Inventory } from '../types/Inventory';

/**
 * This context is a quick hack job to get inventory feature out.
 */

type InventoryContextType = {
  inventory: Inventory[];
  loading: boolean;
  error: string | null;
  fetchInventoryByProductId: (productId: string) => Promise<void>;
  saveInventory: (item: Inventory | {
    productId: string,
    price: number,
    quantity: number,
  }) => Promise<boolean>;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryByProductId = async (productId: string) => {
    setLoading(true);
    try {
      const response: AxiosResponse<{ data: Inventory[] }> = await axios
        .get(`${SERVICE_API}/product/inventory/${productId}`);
      setLoading(false);
      setError(null);
      setInventory(response.data.data);
    } catch (e) {
      setLoading(false);
      if (e instanceof AxiosError && (e as AxiosError).status === 404) {
        setError('Product has no inventory');
        return;
      }

      setError('Error occurred getting inventory');
    }
  };

  const saveInventory = async (item: Inventory | {
    productId: string,
    price: number,
    quantity: number,
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const response: AxiosResponse<Inventory> = await axios.post(`${SERVICE_API}/product/inventory`, item);
      setLoading(false);
      setError(null);
      if (response.status === 200) {
        setInventory(inventory.concat(response.data));
        return true;
      }
    } catch (e) {
      setLoading(false);
      setError('Error occurred saving inventory item');
    }
    return false;
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      loading,
      error,
      fetchInventoryByProductId,
      saveInventory,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventoryContext must be used within a ProductProvider');
  }
  return context;
};
