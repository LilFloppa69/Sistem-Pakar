import { Bell, Search, Menu } from "lucide-react";

export default function Header({ activeLabel, setMobileOpen }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs text-slate-400">Workspace / CellScope</p>
          <h2 className="text-base font-bold text-slate-800">{activeLabel}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-500 sm:flex">
          <Search size={15} />
          Research Workspace
        </div>

        <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500">
          <Bell size={18} />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
          CS
        </div>
      </div>
    </header>
  );
}
