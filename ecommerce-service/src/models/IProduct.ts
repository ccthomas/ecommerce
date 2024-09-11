export interface IProduct {
  id?: string | undefined;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
}
