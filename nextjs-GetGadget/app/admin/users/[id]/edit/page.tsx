import { handleGetOneUser } from "@/lib/actions/admin/user-actions";
import UpdateUserForm from "../../_components/UpdateUserForm";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response = await handleGetOneUser(id);

  if (!response.success) {
    throw new Error(response.message || "Failed to load user");
  }

  return (
    <div className="p-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/admin/users"
          className="text-blue-500 hover:text-blue-600 hover:underline"
        >
          ← Back to Users
        </Link>
      </div>

      <UpdateUserForm user={response.data} />
    </div>
  );
}
