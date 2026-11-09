export default function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-teal-600">
        {eyebrow}
      </p>

      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  );
}
