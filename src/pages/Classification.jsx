import { useState } from "react";
import {
  ClipboardList,
  Activity,
  RotateCcw,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";

import SectionTitle from "../components/SectionTitle";
import FeatureInput from "../components/FeatureInput";
import { features, initialForm } from "../data/featureInfo";

export default function Classification({ values, setValues }) {
  const [notice, setNotice] = useState("");

  const completed = features.filter(
    (feature) => values[feature.key] !== "",
  ).length;

  function handlePreview() {
    if (completed !== features.length) {
      setNotice("Silakan lengkapi seluruh 9 atribut terlebih dahulu.");
      return;
    }

    setNotice(
      "Seluruh atribut sudah terisi dan siap untuk integrasi algoritma.",
    );
  }

  function handleReset() {
    setValues({ ...initialForm });
    setNotice("");
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Patient classification"
        title="New Classification"
        desc="Masukkan sembilan karakteristik inti sel berdasarkan skala pengukuran Wisconsin Breast Cancer Original Dataset."
      />

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {/* Input Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="text-teal-600" size={20} />
                <h3 className="font-bold text-slate-800">
                  Cell Characteristics
                </h3>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Pilih nilai untuk setiap atribut.
              </p>
            </div>

            <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
              {completed}/9 Completed
            </span>
          </div>

          {/* Progress */}
          <div className="mb-7 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${(completed / 9) * 100}%` }}
            />
          </div>

          <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
            {features.map((feature, index) => (
              <FeatureInput
                key={feature.key}
                feature={feature}
                index={index}
                value={values[feature.key]}
                onChange={(value) => {
                  setValues((old) => ({
                    ...old,
                    [feature.key]: value,
                  }));
                  setNotice("");
                }}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Validate Input
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Reset Form
            </button>
          </div>

          {notice && (
            <div
              className={`mt-5 flex items-start gap-2 rounded-xl p-4 text-xs leading-5 ${
                completed === 9
                  ? "bg-teal-50 text-teal-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {completed === 9 ? (
                <CheckCircle2 size={17} />
              ) : (
                <Info size={17} />
              )}
              {notice}
            </div>
          )}
        </section>

        {/* Summary */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <ClipboardList className="text-teal-600" size={19} />
              <h3 className="font-bold text-slate-800">Input Summary</h3>
            </div>

            <div className="space-y-3">
              {features.map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="text-slate-500">{feature.name}</span>

                  <span
                    className={`font-bold ${
                      values[feature.key] ? "text-teal-700" : "text-slate-300"
                    }`}
                  >
                    {values[feature.key] || "—"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="text-teal-600" size={19} />
              <h3 className="font-bold text-slate-800">
                Classification Status
              </h3>
            </div>

            <div className="py-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300">
                <Activity size={27} />
              </div>

              <p className="text-sm font-semibold text-slate-600">
                Awaiting Algorithm
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Hasil klasifikasi akan tersedia setelah mesin Naive Bayes
                diintegrasikan.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
