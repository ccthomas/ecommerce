export interface IProduct {
  id?: string | undefined;
  name: string;
  imageObjectKey?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
}
