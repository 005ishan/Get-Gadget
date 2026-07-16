import CreateProductForm from "../_components/CreateProductForm";
import Link from "next/link";

export default function Page() {
  return (
    <div className="p-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/admin/products"
          className="text-blue-500 hover:text-blue-600 hover:underline"
        >
          ← Back to Products
        </Link>
      </div>

      <CreateProductForm />
    </div>
  );
}
