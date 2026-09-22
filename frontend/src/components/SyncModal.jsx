export default function SyncModal({ isOpen, onClose, pendingEntries }) {
  if (!isOpen) return null;

  const foodEntries = pendingEntries.filter(e => e.type === "food");
  const weightEntries = pendingEntries.filter(e => e.type === "weight");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Syncing Data</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {foodEntries.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Food Entries ({foodEntries.length})</h3>
              <ul className="space-y-2">
                {foodEntries.map((entry, idx) => (
                  <li key={idx} className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-xs text-slate-500">{entry.date}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weightEntries.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Weight Entries ({weightEntries.length})</h3>
              <ul className="space-y-2">
                {weightEntries.map((entry, idx) => (
                  <li key={idx} className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                    <p className="font-medium">{entry.weight} kg</p>
                    <p className="text-xs text-slate-500">{entry.date}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pendingEntries.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">All data synced!</p>
          )}
        </div>
      </div>
    </div>
  );
}
