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
    </header>
  );
}
