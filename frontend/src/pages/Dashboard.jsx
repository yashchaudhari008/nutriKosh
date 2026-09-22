import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Hi, {user?.name}</h1>
          <button
            onClick={logout}
            className="rounded-md border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Protein goal: {user?.proteinGoal ?? "—"} g/day
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Food and weight logging land in later build phases.
          </p>
        </div>
      </div>
    </div>
  );
}
