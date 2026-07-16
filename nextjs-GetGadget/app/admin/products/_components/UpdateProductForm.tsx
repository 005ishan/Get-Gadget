"use client";

import axios from "@/lib/api/axios";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Product } from "@/types/product.type";

interface UpdateProductFormProps {
  productId: string;
  onProductUpdated?: (product: Product) => void;
}

export default function UpdateProductForm({
  productId,
  onProductUpdated,
}: UpdateProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState<Product["category"]>("audio");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/admin/products/${productId}`);
        const product: Product = res.data.data;

        setName(product.name);
        setPrice(product.price);
        setCategory(product.category);
        setPreview(
          product.imageUrl
            ? `${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`
            : null,
        );
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load product");
      }
    };
    fetchProduct();
  }, [productId]);

  // Handle image selection & preview
  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const handleDismissImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) return toast.error("Name and price are required");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price.toString());
      formData.append("category", category);

      if (image) formData.append("image", image);

      const res = await axios.put(`/api/admin/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully");
      if (onProductUpdated) onProductUpdated(res.data.data);

      // Reset image input if needed
      setImage(null);
      setPreview(
        res.data.data.imageUrl
          ? `${process.env.NEXT_PUBLIC_API_URL}${res.data.data.imageUrl}`
          : null,
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto p-4 border rounded-lg shadow"
    >
      <h2 className="text-xl font-semibold">Update Product</h2>

      {/* Image Preview */}
      <div className="mb-4">
        {preview ? (
          <div className="relative w-full h-48">
            <img
              src={preview}
              alt="Product Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={handleDismissImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-600">No Image</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Price */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Price</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Product["category"])}
          className="w-full border rounded px-3 py-2"
        >
          <option value="audio">Audio</option>
          <option value="accessories">Accessories</option>
          <option value="charging">Charging</option>
        </select>
      </div>

      {/* Image Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Image</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
          accept=".jpg,.jpeg,.png,.webp"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update Product"}
      </button>
    </form>
  );
}
