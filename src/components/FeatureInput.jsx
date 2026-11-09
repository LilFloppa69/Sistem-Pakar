export default function FeatureInput({ feature, index, value, onChange }) {
  return (
    <div>
      <label className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
        <span>
          {index + 1}. {feature.name}
        </span>

        <span className="text-[10px] font-normal text-slate-400">
          {feature.scale}
        </span>
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
      >
        <option value="">Select value</option>

        {Array.from({ length: 10 }, (_, i) => i + 1).map((number) => (
          <option key={number} value={number}>
            {number}
          </option>
        ))}
      </select>

      <p className="mt-1.5 text-xs text-slate-400">{feature.description}</p>
    </div>
  );
}
