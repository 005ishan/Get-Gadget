import Link from "next/link";
import { handleGetAllUsers } from "@/lib/actions/admin/user-actions";
import UserTable from "./_components/UserTable";
import { 
  Users, 
  LayoutGrid, 
  UserPlus, 
  Shield, 
  User as UserIcon,
  Search,
  AlertCircle,
  ChevronRight,
  BarChart3
} from "lucide-react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = (params.page as string) || "1";
  const size = (params.size as string) || "5";
  const search = (params.search as string) || "";

  let response: any = { success: false, data: [], pagination: {} };

  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 5000)
    );
    response = await Promise.race([handleGetAllUsers(page, size, search), timeout]);
  } catch (err) {
    console.error("Failed to load users:", err);
  }

  const totalUsers = response.pagination?.total || response.data?.length || 0;
  const totalPages = response.pagination?.totalPages || response.pagination?.pages || 1;

  // Calculate role counts from response data
  const adminCount = response.data?.filter((u: any) => u.role === "admin").length || 0;
  const userCount = response.data?.filter((u: any) => u.role === "user").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .card-hover {
          transition: all 0.2s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.95));
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Header Section with Glassmorphism */}
      <div className="mb-8 animate-fadeIn">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                  Manage platform users, roles and permissions
                </p>
              </div>
            </div>
            <Link
              href="/admin/users/create"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl card-hover"
            >
              <UserPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              Create New User
            </Link>
          </div>

          {/* Stats Cards Grid - Now with 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="stat-card bg-white rounded-xl p-5 shadow-md border border-gray-100 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</p>
                  <p className="text-xs text-gray-400 mt-1">All registered users</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card bg-white rounded-xl p-5 shadow-md border border-gray-100 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                    Current Page
                  </p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{page}</p>
                  <p className="text-xs text-gray-400 mt-1">of {totalPages} pages</p>
                </div>
                <div className="p-3 bg-cyan-50 rounded-xl">
                  <LayoutGrid className="w-6 h-6 text-cyan-500" />
                </div>
              </div>
            </div>
            
            <div className="stat-card bg-white rounded-xl p-5 shadow-md border border-gray-100 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    Role Distribution
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="text-lg font-bold text-gray-800">{adminCount}</span>
                      <span className="text-xs text-gray-400">Admins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-gray-800">{userCount}</span>
                      <span className="text-xs text-gray-400">Users</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">On current page</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Bar */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <span>Showing page {page} with {size} items per page</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Total: {totalUsers}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>Admins: {adminCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Users: {userCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Indicator */}
      {search && (
        <div className="mb-6 animate-slideIn">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="flex items-center gap-3">                <div className="p-2 bg-blue-50 rounded-lg">
                  <Search className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-600">
                  Showing results for{' '}
                  <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                    "{search}"
                  </span>
                </span>
              </div>
              <Link
                href="/admin/users?page=1&size=5"
                className="text-xs text-blue-500 hover:text-blue-600 font-medium hover:underline"
              >
                Clear search
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!response.success && (
        <div className="mb-6 animate-slideIn">
          <div className="bg-red-50 rounded-xl shadow-md border border-red-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <span className="text-sm text-red-700 font-medium">
                  Connection Error
                </span>
                <p className="text-xs text-red-600 mt-0.5">
                  Could not connect to the server. Make sure your backend is running and try refreshing.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-white px-3 py-1.5 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table Section */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">All Users</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {response.data?.length || 0} users shown on this page
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  Page {page} of {totalPages}
                </span>
                {search && (
                  <span className="text-xs text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">
                    Filtered
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* User Table Component */}
          <UserTable
            users={response.data || []}
            pagination={{
              ...response.pagination,
              page: parseInt(page),
              pageSize: parseInt(size)
            }}
            search={search}
          />
        </div>
      </div>

      {/* Footer Info */}
      {response.data?.length > 0 && (
        <div className="text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <span>Showing {response.data.length} of {totalUsers} users</span>
            <ChevronRight className="w-3 h-3" />
            <span>Page {page} of {totalPages}</span>
          </p>
        </div>
      )}
    </div>
  );
}