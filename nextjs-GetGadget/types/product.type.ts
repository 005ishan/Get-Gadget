export interface Product {
  _id: string;
  name: string;
  price: number;
  category: "audio" | "accessories" | "charging";
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
