import CreateUserForm from "../_components/CreateUserForm";
import Link from "next/link";

export default function CreateUserPage() {
  return (
    <div className="p-6">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/admin/users" className="text-blue-500 hover:text-blue-600 hover:underline">
          ← Back to Users
        </Link>
      </div>

      <CreateUserForm />
    </div>
  );
}
