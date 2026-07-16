"use client";

import { useParams } from "next/navigation";
import UpdateProductForm from "../../_components/UpdateProductForm";
import Link from "next/link";

export default function UpdateProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start p-4">
      {/* Back button */}
      <div className="self-start mb-4">
        <Link
          href="/admin/products"
          className="text-blue-500 hover:text-blue-600 hover:underline"
        >
          ← Back to Products
        </Link>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      {/* Form */}
      <div className="w-full max-w-md">
        <UpdateProductForm
          productId={productId}
          onProductUpdated={(updatedProduct) => {
            console.log("Product updated:", updatedProduct);
          }}
        />
      </div>
    </div>
  );
}
