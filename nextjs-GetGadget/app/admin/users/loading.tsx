export default function Loading() {
  return (
    <div className="w-full px-4 md:px-8 py-8 space-y-8">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer 1.6s infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-3">
          <div className="relative shimmer h-9 w-64 bg-gray-200 rounded-xl overflow-hidden" />
          <div className="relative shimmer h-4 w-48 bg-gray-100 rounded-full overflow-hidden" />
        </div>
        <div className="relative shimmer h-11 w-36 bg-gray-200 rounded-xl overflow-hidden" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          "border-l-blue-500",
          "border-l-blue-400",
          "border-l-green-400",
          "border-l-orange-400",
        ].map((accent, i) => (
          <div
            key={i}
            className={`relative bg-background border border-l-4 ${accent} rounded-2xl p-5 shadow-sm overflow-hidden shimmer`}
          >
            <div className="h-3 bg-gray-200 rounded-full w-2/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded-full w-1/2" />
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border bg-background shadow-sm p-4 md:p-6 space-y-5">

        {/* Search bar skeleton */}
        <div className="flex gap-2">
          <div className="relative shimmer flex-1 h-11 bg-gray-100 rounded-xl overflow-hidden" />
          <div className="relative shimmer h-11 w-24 bg-gray-200 rounded-xl overflow-hidden" />
        </div>

        {/* Table top bar */}
        <div className="flex items-center justify-between">
          <div className="relative shimmer h-5 w-24 bg-gray-200 rounded-full overflow-hidden" />
          <div className="relative shimmer h-6 w-20 bg-gray-100 rounded-full overflow-hidden" />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-gray-100">
          {["w-6", "w-16", "w-24", "w-12", "w-20"].map((w, i) => (
            <div key={i} className={`relative shimmer h-3 ${w} bg-gray-200 rounded-full overflow-hidden`} />
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 px-5 py-4 items-center"
              style={{ opacity: 1 - i * 0.12 }}
            >
              {/* Row number */}
              <div className="relative shimmer h-3 w-4 bg-gray-200 rounded-full overflow-hidden" />

              {/* ID badge */}
              <div className="relative shimmer h-6 w-20 bg-gray-200 rounded-md overflow-hidden" />

              {/* Email */}
              <div
                className="relative shimmer h-3 bg-gray-200 rounded-full overflow-hidden"
                style={{ width: `${90 + (i % 3) * 20}px` }}
              />

              {/* Role badge */}
              <div className="relative shimmer h-6 w-14 bg-gray-200 rounded-full overflow-hidden" />

              {/* Action buttons */}
              <div className="flex gap-2">
                <div className="relative shimmer h-7 w-14 bg-gray-200 rounded-lg overflow-hidden" />
                <div className="relative shimmer h-7 w-14 bg-gray-200 rounded-lg overflow-hidden" />
                <div className="relative shimmer h-7 w-16 bg-gray-200 rounded-lg overflow-hidden" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="relative shimmer h-4 w-40 bg-gray-100 rounded-full overflow-hidden" />
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="relative shimmer h-8 w-10 bg-gray-200 rounded-lg overflow-hidden" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}