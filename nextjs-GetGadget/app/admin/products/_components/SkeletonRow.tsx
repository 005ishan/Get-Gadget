export default function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-5 py-4"><div className="relative shimmer h-3 w-4 bg-gray-200 rounded-full overflow-hidden" /></td>
      <td className="px-5 py-4"><div className="relative shimmer w-12 h-12 bg-gray-200 rounded-xl overflow-hidden" /></td>
      <td className="px-5 py-4"><div className="relative shimmer h-3 w-32 bg-gray-200 rounded-full overflow-hidden" /></td>
      <td className="px-5 py-4"><div className="relative shimmer h-3 w-16 bg-gray-200 rounded-full overflow-hidden" /></td>
      <td className="px-5 py-4"><div className="relative shimmer h-6 w-16 bg-gray-200 rounded-full overflow-hidden" /></td>
      <td className="px-5 py-4"><div className="relative shimmer h-3 w-24 bg-gray-200 rounded-full overflow-hidden" /></td>
      <td className="px-5 py-4">
        <div className="flex gap-2">
          <div className="relative shimmer h-7 w-14 bg-gray-200 rounded-lg overflow-hidden" />
          <div className="relative shimmer h-7 w-14 bg-gray-200 rounded-lg overflow-hidden" />
          <div className="relative shimmer h-7 w-16 bg-gray-200 rounded-lg overflow-hidden" />
        </div>
      </td>
    </tr>
  );
}