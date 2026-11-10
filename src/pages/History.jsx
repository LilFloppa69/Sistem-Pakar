import { useState, useEffect } from "react";
import {
  Activity,
  ArrowRight,
  ChartNoAxesCombined,
  Microscope,
  Info,
  FileText,
  FlaskConical,
  History as HistoryIcon,
  CheckCircle2,
  Trash2,
} from "lucide-react";

import SectionTitle from "../components/SectionTitle";
import { features } from "../data/featureInfo";

function EmptyResults({ onGoClassify }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <ChartNoAxesCombined size={30} />
      </div>

      <h3 className="text-lg font-bold text-slate-800">
        No Analysis History Available
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Belum ada hasil klasifikasi yang tersimpan. Silakan lakukan klasifikasi terlebih dahulu untuk melihat analisis dan probabilitas Naïve Bayes.
      </p>

      <button
        onClick={onGoClassify}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        Start Classification
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function ProbabilityBar({ label, value, color }) {
  const numericVal = Number(value) || 0;

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono text-slate-800">
          {numericVal < 0.0001 && numericVal > 0
            ? numericVal.toExponential(4)
            : `${numericVal.toFixed(2)}%`}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{
            width: `${Math.min(100, Math.max(0, numericVal))}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function HistoryPage({ items, onSelect, onDelete, onGoClassify }) {
  const [historyList, setHistoryList] = useState(items || []);
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("classification_history");
    const parsed = saved ? JSON.parse(saved) : [];
    setHistoryList(items && items.length > 0 ? items : parsed);
  }, [items]);

  const handleClearHistory = () => {
    localStorage.removeItem("classification_history");
    setHistoryList([]);
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    } else {
      const updated = historyList.filter((item) => item.id !== id);
      setHistoryList(updated);
      localStorage.setItem("classification_history", JSON.stringify(updated));
    }
  };

  if (historyList.length === 0) {
    return (
      <div>
        <SectionTitle
          eyebrow="Patient classification"
          title="Analysis History & Result"
          desc="Hasil klasifikasi dan interpretasi probabilitas berbasis Naïve Bayes Classifier."
        />
        <EmptyResults onGoClassify={onGoClassify} />
      </div>
    );
  }

  const currentResult = historyList[selectedRecordIndex] || historyList[0];

  const isMalignant =
    currentResult.predictedClass === "Ganas" ||
    currentResult.prediction === "Malignant" ||
    currentResult.prediction === "Ganas";

  const posteriorJinak =
    currentResult.probabilities?.benign ?? currentResult.posterior?.jinak ?? 0;
  const posteriorGanas =
    currentResult.probabilities?.malignant ?? currentResult.posterior?.ganas ?? 0;

  const inputValues = currentResult.input || currentResult.values || {};

  return (
    <div>
      <SectionTitle
        eyebrow="Patient classification"
        title="Analysis History & Result"
        desc="Hasil klasifikasi dan interpretasi probabilitas berbasis Naïve Bayes Classifier."
      />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {/* Kolom Kiri: Detail Rekam Klasifikasi Terpilih */}
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Microscope className="text-teal-600" size={20} />
                  <h3 className="font-bold text-slate-800">Diagnosis Outcome</h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Hasil pengujian sampel berdasarkan Naïve Bayes Classifier.
                </p>
              </div>

              <span
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  isMalignant
                    ? "bg-rose-50 text-rose-700"
                    : "bg-teal-50 text-teal-700"
                }`}
              >
                ID: {currentResult.id || "REC-" + Date.now().toString().slice(-4)}
              </span>
            </div>

            <div
              className={`rounded-2xl p-6 text-white ${
                isMalignant ? "bg-rose-600" : "bg-teal-600"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                    Hasil Klasifikasi
                  </p>
                  <h3 className="mt-1 text-3xl font-black">
                    KANKER {isMalignant ? "GANAS" : "JINAK"}
                  </h3>
                  <p className="mt-2 text-xs text-white/80">
                    {isMalignant
                      ? "Sampel sel diidentifikasi memiliki karakteristik tingkat keganasan tinggi (Malignant)."
                      : "Sampel sel diidentifikasi cenderung bersifat jinak/non-kanker (Benign)."}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 text-white">
                  <Activity size={32} />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Probabilitas Posterior
              </h4>

              <ProbabilityBar
                label="Klasifikasi Jinak (Benign)"
                value={posteriorJinak}
                color="bg-teal-500"
              />
              <ProbabilityBar
                label="Klasifikasi Ganas (Malignant)"
                value={posteriorGanas}
                color="bg-rose-500"
              />
            </div>
          </section>

          {/* Input Characteristics Grid */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="text-teal-600" size={20} />
                  <h3 className="font-bold text-slate-800">
                    Input Characteristics
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Rincian 9 atribut sel yang dimasukkan.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.key}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3.5"
                >
                  <span className="text-[11px] font-medium text-slate-400">
                    {feature.name}
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-slate-800">
                      {inputValues[feature.key] ?? "—"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Skala {feature.scale}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Saved History List */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <FileText className="text-teal-600" size={19} />
              <h3 className="font-bold text-slate-800">Execution Info</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                <span className="text-slate-500">Metode</span>
                <span className="font-bold text-slate-700">Naïve Bayes</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                <span className="text-slate-500">Waktu</span>
                <span className="font-bold text-slate-700">
                  {currentResult.createdAt || new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Status</span>
                <span className="flex items-center gap-1 font-bold text-teal-600">
                  <CheckCircle2 size={14} /> Processed
                </span>
              </div>
            </div>
          </section>

          {/* List Riwayat Terpantau dari Local Storage */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HistoryIcon className="text-teal-600" size={19} />
                <h3 className="font-bold text-slate-800">Saved History</h3>
              </div>
              <button
                onClick={handleClearHistory}
                title="Hapus Semua Riwayat"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {historyList.map((item, index) => {
                const itemMalignant =
                  item.predictedClass === "Ganas" ||
                  item.prediction === "Malignant" ||
                  item.prediction === "Ganas";

                return (
                  <div
                    key={item.id || index}
                    onClick={() => {
                      setSelectedRecordIndex(index);
                      if (onSelect) onSelect(item);
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                      selectedRecordIndex === index
                        ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500"
                        : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-700">
                          {item.id}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            itemMalignant
                              ? "bg-rose-100 text-rose-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {itemMalignant ? "GANAS" : "JINAK"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.createdAt || "Baru saja"}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <ChartNoAxesCombined className="text-teal-600" size={19} />
              <h3 className="font-bold text-slate-800">Klasifikasi Baru</h3>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Ingin melakukan pengujian pada sampel pasien lain?
            </p>
            <button
              onClick={onGoClassify}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700"
            >
              Ke Form Klasifikasi
              <ArrowRight size={14} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}