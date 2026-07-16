import { handleGetAllTransactions, handleBackfillOrders } from "@/lib/actions/admin/transaction-actions";
import {
  CreditCard,
  Package,
  User,
  DollarSign,
  Calendar,
  Hash,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = (params.page as string) || "1";
  const size = (params.size as string) || "10";
  const search = (params.search as string) || "";

  let response: any = { success: false, data: [], pagination: {} };

  try {
    response = await handleGetAllTransactions(page, size, search);
  } catch (err) {
    console.error("Failed to load transactions:", err);
  }

  const transactions = response.data || [];
  const totalAmount = transactions.reduce(
    (sum: number, t: any) => sum + (t.amount || 0),
    0,
  );

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get payment method color
  const getPaymentMethodColor = (method: string) => {
    const colors: any = {
      esewa: "bg-purple-100 text-purple-700 border-purple-200",
      khalti: "bg-blue-100 text-blue-700 border-blue-200",
      cod: "bg-green-100 text-green-700 border-green-200",
      card: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return (
      colors[method?.toLowerCase()] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Transactions
                </h1>
                <p className="text-xs text-gray-500">
                  Manage and view all payment transactions
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <form action={handleBackfillOrders}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Create Orders
                </button>
              </form>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {response.pagination?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Total Amount</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  Rs. {totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Current Page</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{page}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Filter className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Per Page</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{size}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Hash className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by product name, transaction ID, or user ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    S.N.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">
                          No transactions found
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction: any, index: number) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {(parseInt(page) - 1) * parseInt(size) + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {transaction.transactionId?.slice(-8) ||
                              transaction._id?.slice(-8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">
                            {transaction.productName || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {transaction.userId?.slice(-8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-green-600">
                          Rs. {transaction.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentMethodColor(
                            transaction.paymentMethod,
                          )}`}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          {transaction.paymentMethod?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {response.pagination && response.pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {(parseInt(page) - 1) * parseInt(size) + 1} to{" "}
                  {Math.min(
                    parseInt(page) * parseInt(size),
                    response.pagination.total,
                  )}{" "}
                  of {response.pagination.total} results
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/transactions?page=${
                      parseInt(page) - 1
                    }&size=${size}${search ? `&search=${search}` : ""}`}
                    className={`p-2 rounded-lg border border-gray-200 ${
                      parseInt(page) <= 1
                        ? "opacity-40 cursor-not-allowed pointer-events-none bg-gray-50"
                        : "hover:bg-white hover:border-gray-300 transition"
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg">
                    {page}
                  </span>
                  <Link
                    href={`/admin/transactions?page=${
                      parseInt(page) + 1
                    }&size=${size}${search ? `&search=${search}` : ""}`}
                    className={`p-2 rounded-lg border border-gray-200 ${
                      parseInt(page) >= response.pagination.totalPages
                        ? "opacity-40 cursor-not-allowed pointer-events-none bg-gray-50"
                        : "hover:bg-white hover:border-gray-300 transition"
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
