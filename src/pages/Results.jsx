import React from "react";
import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  Microscope,
  Info,
  FileText,
  FlaskConical,
  Calculator,
  Layers,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

const featureLabels = {
  clump: "Clump Thickness",
  cellSize: "Uniformity of Cell Size",
  cellShape: "Uniformity of Cell Shape",
  adhesion: "Marginal Adhesion",
  epithelial: "Single Epithelial Cell Size",
  bareNuclei: "Bare Nuclei",
  chromatin: "Bland Chromatin",
  nucleoli: "Normal Nucleoli",
  mitoses: "Mitoses",
};

function EmptyResults({ onGoClassify }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <ChartNoAxesCombined size={30} />
      </div>

      <h3 className="text-lg font-bold text-slate-800">
        No Analysis Available
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Belum ada hasil klasifikasi. Silakan lakukan simulasi terlebih dahulu
        untuk melihat probabilitas dan rincian proses perhitungan Naïve Bayes.
      </p>

      <button
        onClick={onGoClassify}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-teal-700 transition"
      >
        Start Classification
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function ProbabilityBar({ label, value, color, rawValue }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <div className="text-right">
          <span className="font-bold text-slate-900 font-mono">
            {Number(value).toFixed(4)}%
          </span>
          {rawValue !== undefined && (
            <span className="block text-[11px] text-slate-400 font-mono">
              (Raw: {Number(rawValue).toExponential(4)})
            </span>
          )}
        </div>
      </div>

      <div className="h-3.5 overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{
            width: `${Math.min(100, Math.max(0, Number(value)))}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function Results({ result, onGoClassify }) {
  if (!result) {
    return (
      <div>
        <div className="mb-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-teal-600">
            Analysis
          </p>
          <h2 className="text-2xl font-bold text-slate-800">Analysis Result</h2>
          <p className="mt-1 text-sm text-slate-500">
            Hasil klasifikasi dan interpretasi probabilitas Naïve Bayes.
          </p>
        </div>

        <EmptyResults onGoClassify={onGoClassify} />
      </div>
    );
  }

  const probabilities = result.probabilities || {};
  const benign = Number(probabilities.benign || 0);
  const malignant = Number(probabilities.malignant || 0);
  const isMalignant = result.prediction === "Malignant";
  const calc = result.calculation || {};

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-teal-600">
          Detailed Analysis Report
        </p>
        <h2 className="text-2xl font-bold text-slate-800">
          Hasil Klasifikasi & Perhitungan Detail
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Laporan rinci hasil prediksi beserta pembuktian langkah matematis algoritma Naïve Bayes.
        </p>
      </div>

      {/* Hero Prediction Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${
          isMalignant
            ? "bg-gradient-to-r from-rose-600 to-rose-800"
            : "bg-gradient-to-r from-teal-600 to-teal-800"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold tracking-wide uppercase text-white backdrop-blur-md">
              Hasil Diagnosis Model
            </span>
            <h3 className="mt-2 text-4xl font-extrabold tracking-tight">
              {result.prediction === "Malignant" ? "Malignant (Ganas)" : "Benign (Jinak)"}
            </h3>
            <p className="mt-2 text-sm text-white/90 max-w-xl leading-relaxed">
              Berdasarkan probabilitas posterior tertinggi (<i>V_map</i>), sampel diprediksi masuk ke dalam kategori{" "}
              <strong>{isMalignant ? "Kanker Ganas (Malignant)" : "Kanker Jinak (Benign)"}</strong>.
            </p>
          </div>

          <div className="flex items-center justify-center rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20">
            <Microscope size={48} className="text-white" />
          </div>
        </div>
      </div>

      {/* Probabilitas & Metadata Ringkas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posterior Probability Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <ChartNoAxesCombined className="text-teal-600" size={22} />
              <h3 className="font-bold text-slate-800 text-base">
                Posterior Probability
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Normalized P(V_j | X)
            </span>
          </div>

          <div className="space-y-6">
            <ProbabilityBar
              label="Benign (Jinak)"
              value={benign}
              rawValue={calc.posteriorRaw?.jinak}
              color="bg-teal-500"
            />
            <ProbabilityBar
              label="Malignant (Ganas)"
              value={malignant}
              rawValue={calc.posteriorRaw?.ganas}
              color="bg-rose-500"
            />
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 flex items-start gap-2">
            <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              Persentase di atas dihitung dengan meng-normalisasi nilai perkalian posterior raw:{" "}
              <code className="font-mono bg-slate-200/60 px-1 rounded">P(C) / ∑ P(C_all)</code>.
            </span>
          </div>
        </section>

        {/* Classification Info Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <FileText className="text-teal-600" size={22} />
            <h3 className="font-bold text-slate-800 text-base">
              Metadata & Parameter Model
            </h3>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Record / Sample ID</span>
              <span className="font-semibold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded">
                {result.id || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Waktu Analisis</span>
              <span className="font-semibold text-slate-700">
                {result.createdAt || new Date().toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Algoritma Klasifikasi</span>
              <span className="font-semibold text-slate-700">
                Naïve Bayes Classifier (NBC)
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Dataset Acuan</span>
              <span className="font-semibold text-slate-700">
                Breast Cancer Wisconsin (WBC)
              </span>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Status Komputasi</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={14} /> Success
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Input Characteristics */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="text-teal-600" size={22} />
            <h3 className="font-bold text-slate-800 text-base">
              Karakteristik Atribut Input (9 Atribut WBC)
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400">Skala Nilai: 1 - 10</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(featureLabels).map(([key, label]) => {
            const val = result.input?.[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 hover:bg-slate-100/60 transition"
              >
                <div>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="text-xs font-mono text-slate-400 font-semibold">{key}</p>
                </div>
                <span className="text-lg font-extrabold text-teal-700 font-mono bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                  {val ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detail Perhitungan Rinci Naïve Bayes */}
      {calc && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
            <Calculator className="text-teal-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">
              Langkah Perhitungan Matematis Naïve Bayes
            </h3>
          </div>

          {/* Step 1: Prior Probability */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="text-teal-600" size={20} />
                <h4 className="font-bold text-slate-800 text-base">
                  1. Perhitungan Probabilitas Awal / Prior Probability P(V_j)
                </h4>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600">
                P(V_j) = N_class / N_total
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-xs font-medium text-slate-500">Total Data Training</span>
                <p className="mt-1 text-2xl font-bold text-slate-800 font-mono">
                  {calc.prior?.totalData || 0}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">Total Sampel Observasi</p>
              </div>

              <div className="rounded-xl bg-teal-50/60 p-4 border border-teal-100">
                <span className="text-xs font-semibold text-teal-700">P(Jinak / Benign)</span>
                <p className="mt-1 text-2xl font-bold text-teal-900 font-mono">
                  {calc.prior?.jinak !== undefined ? (calc.prior.jinak * 100).toFixed(4) : 0}%
                </p>
                <p className="mt-1 text-xs text-teal-700 font-mono">
                  = {calc.prior?.totalJinak || 0} / {calc.prior?.totalData || 0} = {calc.prior?.jinak?.toFixed(6)}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50/60 p-4 border border-rose-100">
                <span className="text-xs font-semibold text-rose-700">P(Ganas / Malignant)</span>
                <p className="mt-1 text-2xl font-bold text-rose-900 font-mono">
                  {calc.prior?.ganas !== undefined ? (calc.prior.ganas * 100).toFixed(4) : 0}%
                </p>
                <p className="mt-1 text-xs text-rose-700 font-mono">
                  = {calc.prior?.totalGanas || 0} / {calc.prior?.totalData || 0} = {calc.prior?.ganas?.toFixed(6)}
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: Likelihood Table */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <span>2. Iterasi Likelihood Atribut</span>
                  <code className="text-xs font-mono font-normal bg-slate-100 px-2 py-0.5 rounded text-teal-700">
                    P(a_i | V_j)
                  </code>
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Menghitung peluang kemunculan nilai atribut input pada masing-masing kelas target.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Nama Atribut (a_i)</th>
                    <th className="py-3 px-4 text-center bg-teal-50/50 text-teal-800">Nilai Input</th>
                    <th className="py-3 px-4">Kemunculan (Jinak)</th>
                    <th className="py-3 px-4 font-mono">P(a_i | Jinak)</th>
                    <th className="py-3 px-4">Kemunculan (Ganas)</th>
                    <th className="py-3 px-4 font-mono">P(a_i | Ganas)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.keys(featureLabels).map((key) => {
                    const valInput = result.input?.[key];
                    const countJinak = calc.details?.jinakCounts?.[key];
                    const countGanas = calc.details?.ganasCounts?.[key];
                    const probJinak = calc.likelihood?.jinak?.[key];
                    const probGanas = calc.likelihood?.ganas?.[key];

                    return (
                      <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-700 font-sans">
                          {featureLabels[key]}
                          <span className="block text-[10px] font-mono font-normal text-slate-400">{key}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-teal-700 bg-teal-50/30 font-mono text-sm">
                          {valInput}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {countJinak !== undefined ? `${countJinak} / ${calc.prior?.totalJinak}` : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-teal-700">
                          {probJinak !== undefined ? probJinak.toFixed(6) : "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {countGanas !== undefined ? `${countGanas} / ${calc.prior?.totalGanas}` : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-rose-700">
                          {probGanas !== undefined ? probGanas.toFixed(6) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Step 3: Raw Posterior & Decision Rule */}
          <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-md">
            <div className="mb-4 border-b border-slate-800 pb-3 flex items-center justify-between">
              <h4 className="font-bold text-teal-400 text-base">
                3. Perhitungan Posterior Likelihood Product & Hasil Akhir (V_map)
              </h4>
              <span className="text-xs font-mono text-slate-400">
                V_map = arg max P(V_j) × ∏ P(a_i | V_j)
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700 space-y-3">
                <p className="text-slate-300 font-sans font-semibold border-b border-slate-700 pb-1">
                  Perkalian Kumulatif Likelihood & Prior:
                </p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-teal-400">P(Jinak) × ∏ P(a_i | Jinak):</span>
                    <p className="text-sm font-bold text-slate-100 mt-0.5 break-all">
                      {calc.prior?.jinak?.toFixed(4)} × {Object.values(calc.likelihood?.jinak || {}).map(v => v.toFixed(4)).join(" × ")}
                    </p>
                    <p className="text-teal-300 text-sm mt-1 font-extrabold">
                      = {calc.posteriorRaw?.jinak?.toExponential(8)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60">
                    <span className="text-rose-400">P(Ganas) × ∏ P(a_i | Ganas):</span>
                    <p className="text-sm font-bold text-slate-100 mt-0.5 break-all">
                      {calc.prior?.ganas?.toFixed(4)} × {Object.values(calc.likelihood?.ganas || {}).map(v => v.toFixed(4)).join(" × ")}
                    </p>
                    <p className="text-rose-300 text-sm mt-1 font-extrabold">
                      = {calc.posteriorRaw?.ganas?.toExponential(8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kesimpulan Rule */}
              <div className="rounded-xl bg-teal-950/60 border border-teal-800/80 p-4 font-sans space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Keputusan Klasifikasi Akhir:
                </span>
                <p className="text-sm leading-relaxed text-slate-200">
                  Karena nilai <code className="font-mono text-teal-300">V_map ({result.prediction === "Malignant" ? "Ganas" : "Jinak"})</code>{" "}
                  <strong>({(result.prediction === "Malignant" ? calc.posteriorRaw?.ganas : calc.posteriorRaw?.jinak)?.toExponential(6)})</strong>{" "}
                  lebih besar daripada{" "}
                  <code className="font-mono text-slate-400">V_map ({result.prediction === "Malignant" ? "Jinak" : "Ganas"})</code>{" "}
                  <strong>({(result.prediction === "Malignant" ? calc.posteriorRaw?.jinak : calc.posteriorRaw?.ganas)?.toExponential(6)})</strong>,
                  maka sistem secara sah mengklasifikasikan data ini ke dalam kelas <strong>{result.prediction.toUpperCase()}</strong>.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Catatan / Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-xs">
        <Info className="mt-0.5 shrink-0 text-amber-600" size={20} />
        <div className="text-xs leading-6 text-amber-900 space-y-1">
          <p className="font-bold">Catatan Disclaimer Akademis:</p>
          <p>
            Hasil dan simulasi perhitungan di atas sepenuhnya ditujukan untuk kepentingan akademik dan demonstrasi ilmiah algoritma 
            <i> Naïve Bayes Classifier</i> berbasis dataset <i>Breast Cancer Wisconsin (Original)</i>. Hasil ini tidak dapat digunakan sebagai acuan diagnosis medis langsung tanpa verifikasi laboratorium medis resmi.
          </p>
        </div>
      </div>
    </div>
  );
}