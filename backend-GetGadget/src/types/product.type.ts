import { GadgetCategory } from "./common.type";

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: GadgetCategory;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
