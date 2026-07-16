export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl border">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">🗑️</div>
          <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">"{productName}"</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}