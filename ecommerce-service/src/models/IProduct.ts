export interface IProduct {
  id?: string | undefined;
  name: string;
  imageObjectKey?: string | null;
  priceLowest: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
}
