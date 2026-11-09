export default function StatCard({ title, value, note, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-800">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}
