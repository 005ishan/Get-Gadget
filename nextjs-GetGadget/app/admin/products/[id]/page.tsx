"use client";

import axios from "@/lib/api/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: "audio" | "accessories" | "charging";
  imageUrl?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/admin/products/${productId}`);
        setProduct(res.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!product) return <p className="text-center mt-10">Product not found</p>;

  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`
    : null;

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <Link href="/admin/products" className="text-blue-500 hover:text-blue-600 hover:underline">
        ← Back to Products
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">{product.name}</h1>

      {/* Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center mb-4 text-gray-600">
          No Image
        </div>
      )}

      {/* Details */}
      <p className="mb-1">
        <strong>Price:</strong> Rs. {product.price}
      </p>
      <p className="mb-1">
        <strong>Category:</strong> {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
      </p>

    </div>
  );
}
