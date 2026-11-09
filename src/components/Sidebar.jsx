import { Microscope, ChevronRight, X } from "lucide-react";

export default function Sidebar({
  active,
  setActive,
  mobileOpen,
  setMobileOpen,
  items,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
        bg-[#102A43] text-white transition-transform lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="rounded-xl bg-teal-500 p-2.5">
            <Microscope size={23} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wider">CELLSCOPE</h1>
            <p className="text-[9px] tracking-[2px] text-slate-400">
              MEDICAL DATA SYSTEM
            </p>
          </div>

          <button
            className="ml-auto lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pt-7">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const selected = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActive(item.id);
                    setMobileOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    selected
                      ? "bg-teal-500 text-white"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}

                  {selected && <ChevronRight className="ml-auto" size={16} />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-teal-300">
              Academic Project
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Sistem klasifikasi berbasis data penelitian. Bukan alat diagnosis
              medis.
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] text-slate-500">
            CELLSCOPE v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
