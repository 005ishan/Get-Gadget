"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleDeleteUser } from "@/lib/actions/admin/user-actions";
import DeleteModal from "@/app/_components/DeleteModal";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Shield, 
  User as UserIcon,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";

const UserTable = ({
  users,
  pagination,
  search,
}: {
  users: any[];
  pagination: any;
  search?: string;
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/admin/users?page=1&size=5` +
        (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "")
    );
  };

  const onDelete = async () => {
    try {
      setDeletingId(deleteId);
      await handleDeleteUser(deleteId!);
      toast.success("User deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleteId(null);
      setDeletingId(null);
    }
  };

  const goToPage = (pageNum: number) => {
    router.push(
      `/admin/users?page=${pageNum}&size=5` +
        (searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "")
    );
  };

  const getPageNumbers = () => {
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;
    const delta = 2;
    
    const pages: (number | string)[] = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />

      {/* Search Bar - Modern Design */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by email or name..."
            className="w-full pl-12 pr-24 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Search
          </button>
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
            Filtering by: "{searchTerm}"
          </p>
        )}
      </form>

      {/* Table - Modern Design */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No users found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or add a new user</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gray-50 transition-all duration-150 ${
                      deletingId === user._id ? "opacity-40 bg-gray-50" : ""
                    }`}
                  >
                    {/* Row number */}
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      #{String((pagination.page - 1) * 5 + index + 1).padStart(2, '0')}
                    </td>

                    {/* User with Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {user.name || user.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            ID: {user._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-100"
                            : "bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border border-cyan-100"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <UserIcon className="w-3 h-3 mr-1" />
                        )}
                        {user.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 group relative"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </Link>
                        <Link
                          href={`/admin/users/${user._id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group relative"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group relative"
                          title="Delete user"
                          disabled={deletingId === user._id}
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Modern Design */}
        {pagination.totalPages > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-700">{users.length}</span> of{' '}
                <span className="font-semibold text-gray-700">{pagination.total}</span> users
                {searchTerm && (
                  <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                    Filtered
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200 bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, index) => (
                    pageNum === "..." ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum as number)}
                        className={`min-w-[40px] h-10 text-sm rounded-lg transition-all duration-200 ${
                          pagination.page === pageNum
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg"
                          : "hover:bg-white border border-gray-200 bg-white hover:shadow-md"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200 bg-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;