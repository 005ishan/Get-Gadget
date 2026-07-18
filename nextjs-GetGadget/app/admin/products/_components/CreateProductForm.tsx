"use client";

import axios from "@/lib/api/axios";
import { useState, useRef } from "react";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: "audio" | "accessories" | "charging";
}

interface CreateProductFormProps {
  onProductCreated?: (product: Product) => void;
}

export default function CreateProductForm({ onProductCreated }: CreateProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState<"audio" | "accessories" | "charging">("audio");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleDismissImage = () => {
    setImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("Name and price are required", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price.toString());
      formData.append("category", category);

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post("/api/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const createdProduct: Product = res.data.data;

      toast.success("Product created successfully!", { position: "top-right", autoClose: 3000 });

      setName("");
      setPrice("");
      setCategory("audio");
      handleDismissImage();

      if (onProductCreated) onProductCreated(createdProduct);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold">Create Product</h2>

      <div className="space-y-1">
        <label className="text-sm font-medium">Name</label>
        <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Price</label>
        <input type="number" className="w-full border rounded px-3 py-2" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Category</label>
        <select className="w-full border rounded px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as "audio" | "accessories" | "charging")}>
          <option value="audio">Audio</option>
          <option value="accessories">Accessories</option>
          <option value="charging">Charging</option>
        </select>
      </div>

      <div className="mb-4">
        {previewImage ? (
          <div className="relative w-full h-48">
            <img src={previewImage} alt="Product Preview" className="w-full h-48 object-cover rounded-md" />
            <button type="button" onClick={handleDismissImage} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600">✕</button>
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center"><span className="text-gray-600">No Image</span></div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Image</label>
        <input type="file" ref={fileInputRef} onChange={(e) => handleImageChange(e.target.files?.[0] || null)} accept=".jpg,.jpeg,.png,.webp" />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-60">
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
