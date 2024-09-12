// TypeScript Interface for the Inventory Model
export interface IInventory {
  id: string;
  productId: string;
  price: number;
  quantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
}
