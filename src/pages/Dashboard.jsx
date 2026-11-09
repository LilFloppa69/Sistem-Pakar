import {
  Activity,
  Database,
  FlaskConical,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowUpRight,
  Dna,
} from "lucide-react";

import StatCard from "../components/StatCard";

export default function Dashboard({ setActive }) {
  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#102A43] p-7 text-white md:p-9">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1.5 text-xs text-teal-200">
            <Activity size={14} />
            Medical Research Classification
          </div>

          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Breast Cancer
            <span className="block text-teal-300">Classification System</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Eksplorasi klasifikasi karakteristik sel kanker payudara menggunakan
            Wisconsin Breast Cancer Original Dataset dengan metode Naive Bayes.
          </p>

          <button
            onClick={() => setActive("classification")}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-400"
          >
            Open Classification
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-20 h-80 w-80 rounded-full border-[45px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-36 right-32 h-80 w-80 rounded-full border-[45px] border-teal-400/10" />

        <Dna
          className="absolute bottom-8 right-8 hidden text-white/10 md:block"
          size={170}
        />
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Dataset Overview</h3>
            <p className="mt-1 text-xs text-slate-400">
              Wisconsin Breast Cancer Original
            </p>
          </div>

          <button
            onClick={() => setActive("dataset")}
            className="flex items-center gap-1 text-xs font-semibold text-teal-700"
          >
            Explore Dataset <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Records"
            value="699"
            note="Raw dataset records"
            icon={Database}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Features"
            value="9"
            note="Cell characteristics"
            icon={FlaskConical}
            color="bg-teal-50 text-teal-600"
          />

          <StatCard
            title="Classification"
            value="2"
            note="Benign and Malignant"
            icon={Activity}
            color="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Missing Values"
            value="16"
            note="Bare Nuclei attribute"
            icon={AlertCircle}
            color="bg-amber-50 text-amber-600"
          />
        </div>
      </section>

      {/* Distribution */}
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <h3 className="font-bold text-slate-800">Class Distribution</h3>

          <p className="mt-1 text-xs text-slate-400">
            Distribusi kelas pada dataset mentah.
          </p>

          <div className="mt-7 space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">Benign (2)</span>
                <span className="font-bold text-teal-700">458 · 65.5%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[65.5%] rounded-full bg-teal-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Malignant (4)
                </span>
                <span className="font-bold text-rose-600">241 · 34.5%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[34.5%] rounded-full bg-rose-500" />
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
            Distribusi ini berdasarkan 699 record mentah. Sebanyak 16 record
            memiliki nilai kosong pada Bare Nuclei.
          </div>
        </div>

        {/* Research info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <Info className="text-teal-600" size={19} />
            <h3 className="font-bold text-slate-800">Research Information</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Dataset</p>
              <p className="mt-1 font-medium text-slate-700">
                Wisconsin Breast Cancer Original
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Data source</p>
              <p className="mt-1 font-medium text-slate-700">
                University of Wisconsin Hospitals
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Repository</p>
              <p className="mt-1 font-medium text-slate-700">
                UCI Machine Learning Repository
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Classification method</p>
              <p className="mt-1 font-medium text-slate-700">Naive Bayes</p>
            </div>
          </div>

          <button
            onClick={() => setActive("theory")}
            className="mt-6 flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-700"
          >
            Learn the method
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 shrink-0 text-amber-600" size={18} />

        <p className="text-xs leading-6 text-amber-800">
          Aplikasi ini dibuat untuk tujuan akademik dan pembelajaran. Hasil
          klasifikasi tidak dapat digunakan sebagai diagnosis atau pengganti
          pemeriksaan tenaga medis.
        </p>
      </div>
    </div>
  );
}
