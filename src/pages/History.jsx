import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  Microscope,
  Info,
  ShieldCheck,
  FileText,
  FlaskConical,
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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <ChartNoAxesCombined size={30} />
      </div>

      <h3 className="text-lg font-bold text-slate-800">
        No Analysis Available
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Belum ada hasil klasifikasi. Silakan lakukan simulasi terlebih dahulu
        untuk melihat probabilitas dan proses perhitungan Naive Bayes.
      </p>

      <button
        onClick={onGoClassify}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
      >
        Start Classification
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function ProbabilityBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-800">
          {Number(value).toFixed(2)}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
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
          <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-teal-600">
            Analysis
          </p>
          <h2 className="text-2xl font-bold text-slate-800">Analysis Result</h2>
          <p className="mt-2 text-sm text-slate-500">
            Hasil klasifikasi dan interpretasi probabilitas.
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

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[2px] text-teal-600">
          Analysis
        </p>
        <h2 className="text-2xl font-bold text-slate-800">Analysis Result</h2>
        <p className="mt-2 text-sm text-slate-500">
          Ringkasan hasil klasifikasi berdasarkan karakteristik sel.
        </p>
      </div>

      <div
        className={`rounded-2xl p-6 text-white ${
          isMalignant ? "bg-rose-700" : "bg-teal-700"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Classification Prediction
            </p>
            <h3 className="mt-2 text-3xl font-bold">{result.prediction}</h3>
            <p className="mt-2 text-sm text-white/80">
              {isMalignant
                ? "Prediksi kelas Malignant (4)"
                : "Prediksi kelas Benign (2)"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 p-4">
            <Microscope size={36} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-2">
            <ChartNoAxesCombined className="text-teal-600" size={20} />
            <h3 className="font-bold text-slate-800">Posterior Probability</h3>
          </div>

          <div className="space-y-6">
            <ProbabilityBar
              label="Benign (2)"
              value={benign}
              color="bg-teal-500"
            />
            <ProbabilityBar
              label="Malignant (4)"
              value={malignant}
              color="bg-rose-500"
            />
          </div>

          <p className="mt-6 text-xs leading-5 text-slate-400">
            Probabilitas merupakan hasil perhitungan model, bukan ukuran
            kepastian diagnosis medis.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="text-teal-600" size={20} />
            <h3 className="font-bold text-slate-800">
              Classification Information
            </h3>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Record ID</span>
              <span className="font-semibold text-slate-700">
                {result.id || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-700">
                {result.createdAt || "—"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Method</span>
              <span className="font-semibold text-slate-700">Naive Bayes</span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Status</span>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                Completed
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <FlaskConical className="text-teal-600" size={20} />
          <h3 className="font-bold text-slate-800">Input Characteristics</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(featureLabels).map(([key, label]) => (
            <div key={key} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-2 text-lg font-bold text-slate-800">
                {result.input?.[key] ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {result.calculation && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-slate-800">Calculation Details</h3>
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-teal-200">
            {JSON.stringify(result.calculation, null, 2)}
          </pre>
        </section>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 shrink-0 text-amber-600" size={18} />
        <p className="text-xs leading-6 text-amber-800">
          Hasil ini merupakan klasifikasi akademik berdasarkan dataset
          penelitian. Bukan diagnosis medis dan tidak menggantikan pemeriksaan
          dokter.
        </p>
      </div>
    </div>
  );
}
