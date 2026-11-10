import { useState, useEffect } from "react";
import {
  ClipboardList,
  Activity,
  RotateCcw,
  ArrowRight,
  Info,
  CheckCircle2,
  Database,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";

import SectionTitle from "../components/SectionTitle";
import FeatureInput from "../components/FeatureInput";
import { features, initialForm } from "../data/featureInfo";

const UCI_DATASET_URL = "/api-uci/ml/machine-learning-databases/breast-cancer-wisconsin/breast-cancer-wisconsin.data";

const FEATURE_KEYS = [
  "clump",
  "cellSize",
  "cellShape",
  "adhesion",
  "epithelial",
  "bareNuclei",
  "chromatin",
  "nucleoli",
  "mitoses",
];

export default function Classification({ values, setValues, onViewDetails, onSaveHistory }) {
  const [notice, setNotice] = useState("");
  const [dbStatus, setDbStatus] = useState({
    loading: true,
    ready: false,
    message: "Memeriksa ketersediaan dataset...",
    totalRecords: 0,
  });
  const [dataset, setDataset] = useState([]);
  const [classificationResult, setClassificationResult] = useState(null);

  const completed = features.filter(
    (feature) => values[feature.key] !== ""
  ).length;

  useEffect(() => {
    initDatabase();
  }, []);

  const parseCSVData = (text) => {
    const lines = text.trim().split("\n");
    const parsed = [];

    lines.forEach((line) => {
      const cols = line.split(",").map((item) => item.trim());
      if (cols.length === 11 && !line.includes("?")) {
        const record = {
          id: cols[0],
          clump: parseInt(cols[1], 10),
          cellSize: parseInt(cols[2], 10),
          cellShape: parseInt(cols[3], 10),
          adhesion: parseInt(cols[4], 10),
          epithelial: parseInt(cols[5], 10),
          bareNuclei: parseInt(cols[6], 10),
          chromatin: parseInt(cols[7], 10),
          nucleoli: parseInt(cols[8], 10),
          mitoses: parseInt(cols[9], 10),
          target: cols[10] === "4" ? "Ganas" : "Jinak",
        };
        parsed.push(record);
      }
    });

    return parsed;
  };

  const initDatabase = async () => {
    try {
      setDbStatus({
        loading: true,
        ready: false,
        message: "Memeriksa ketersediaan database lokal...",
        totalRecords: 0,
      });

      const cachedData = localStorage.getItem("wbco_breast_cancer_db");

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setDataset(parsed);
        setDbStatus({
          loading: false,
          ready: true,
          message: `Database ditemukan di penyimpanan lokal (${parsed.length} record).`,
          totalRecords: parsed.length,
        });
        return;
      }

      setDbStatus({
        loading: true,
        ready: false,
        message: "Database belum ada. Mengunduh dataset dari UCI Repository...",
        totalRecords: 0,
      });

      const response = await fetch(UCI_DATASET_URL);
      if (!response.ok) {
        throw new Error(`Gagal mengunduh dataset (HTTP ${response.status})`);
      }

      const rawText = await response.text();
      const parsedData = parseCSVData(rawText);

      localStorage.setItem("wbco_breast_cancer_db", JSON.stringify(parsedData));
      setDataset(parsedData);

      setDbStatus({
        loading: false,
        ready: true,
        message: `Dataset berhasil diunduh dan disimpan (${parsedData.length} record terverifikasi).`,
        totalRecords: parsedData.length,
      });
    } catch (err) {
      setDbStatus({
        loading: false,
        ready: false,
        message: `Error saat memuat dataset: ${err.message}`,
        totalRecords: 0,
      });
    }
  };

  const calculateNaiveBayes = (inputValues) => {
    if (!dataset || dataset.length === 0) return null;

    const dataJinak = dataset.filter((d) => d.target === "Jinak");
    const dataGanas = dataset.filter((d) => d.target === "Ganas");

    const totalJinak = dataJinak.length;
    const totalGanas = dataGanas.length;
    const totalData = dataset.length;

    const pJinakPrior = totalJinak / totalData;
    const pGanasPrior = totalGanas / totalData;

    const probAtributJinak = {};
    const probAtributGanas = {};

    let prodLikelihoodJinak = 1;
    let prodLikelihoodGanas = 1;

    FEATURE_KEYS.forEach((key) => {
      const val = parseInt(inputValues[key], 10);

      const countJinak = dataJinak.filter((d) => d[key] === val).length;
      const countGanas = dataGanas.filter((d) => d[key] === val).length;

      let pAiJinak = countJinak / totalJinak;
      if (countJinak === 0) {
        pAiJinak = (0 + 1) / (totalJinak + 10);
      }

      let pAiGanas = countGanas / totalGanas;
      if (countGanas === 0) {
        pAiGanas = (0 + 1) / (totalGanas + 10);
      }

      probAtributJinak[key] = pAiJinak;
      probAtributGanas[key] = pAiGanas;

      prodLikelihoodJinak *= pAiJinak;
      prodLikelihoodGanas *= pAiGanas;
    });

    const posteriorJinak = prodLikelihoodJinak * pJinakPrior;
    const posteriorGanas = prodLikelihoodGanas * pGanasPrior;

    const totalPosterior = posteriorJinak + posteriorGanas;
    const benignPercent = totalPosterior > 0 ? (posteriorJinak / totalPosterior) * 100 : 0;
    const malignantPercent = totalPosterior > 0 ? (posteriorGanas / totalPosterior) * 100 : 0;

    const predictedClass = posteriorJinak >= posteriorGanas ? "Jinak" : "Ganas";

    return {
      id: `WBCO-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      prediction: predictedClass === "Jinak" ? "Benign" : "Malignant",
      predictedClass,
      probabilities: {
        benign: benignPercent,
        malignant: malignantPercent,
      },
      input: { ...inputValues },
      posterior: {
        jinak: posteriorJinak,
        ganas: posteriorGanas,
      },
      calculation: {
        prior: {
          jinak: pJinakPrior,
          ganas: pGanasPrior,
          totalJinak,
          totalGanas,
          totalData,
        },
        likelihood: {
          jinak: probAtributJinak,
          ganas: probAtributGanas,
        },
        posteriorRaw: {
          jinak: posteriorJinak,
          ganas: posteriorGanas,
        },
      },
    };
  };

  function handleClassify() {
    if (completed !== features.length) {
      setNotice("Silakan lengkapi seluruh 9 atribut terlebih dahulu.");
      return;
    }

    if (!dbStatus.ready) {
      setNotice("Database belum siap. Tunggu hingga pemuatan selesai.");
      return;
    }

    const result = calculateNaiveBayes(values);
    setClassificationResult(result);
    setNotice("Klasifikasi Naïve Bayes berhasil dihitung dan disimpan!");

    // Simpan ke Local Storage & trigger callback parent
    if (result && onSaveHistory) {
      onSaveHistory(result);
    }
  }

  function handleReset() {
    setValues({ ...initialForm });
    setNotice("");
    setClassificationResult(null);
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Patient classification"
        title="New Classification"
        desc="Masukkan sembilan karakteristik inti sel berdasarkan skala pengukuran Wisconsin Breast Cancer Original Dataset."
      />

      <div
        className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-xs ${
          dbStatus.ready
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : dbStatus.loading
              ? "border-sky-200 bg-sky-50 text-sky-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {dbStatus.loading ? (
            <Loader2 className="animate-spin text-sky-600" size={18} />
          ) : dbStatus.ready ? (
            <Database className="text-emerald-600" size={18} />
          ) : (
            <AlertCircle className="text-rose-600" size={18} />
          )}
          <span className="font-medium">{dbStatus.message}</span>
        </div>

        {!dbStatus.ready && !dbStatus.loading && (
          <button
            onClick={initDatabase}
            className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white transition hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        )}
      </div>

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
                  setClassificationResult(null);
                }}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <button
              onClick={handleClassify}
              disabled={!dbStatus.ready}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              Proses Klasifikasi NBC
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

        {/* Summary & NBC Results */}
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

          {/* Status Hasil Klasifikasi */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="text-teal-600" size={19} />
              <h3 className="font-bold text-slate-800">
                Classification Status
              </h3>
            </div>

            {classificationResult ? (
              <div className="space-y-4 py-2">
                <div
                  className={`rounded-xl p-4 text-center border ${
                    classificationResult.predictedClass === "Jinak"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    Hasil Diagnosis
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    KANKER {classificationResult.predictedClass.toUpperCase()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                  <p className="font-bold text-slate-700 border-b pb-1">
                    Probabilitas Posterior:
                  </p>
                  <div className="flex justify-between">
                    <span className="text-slate-500">P(Jinak | X):</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      {classificationResult.probabilities.benign.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">P(Ganas | X):</span>
                    <span className="font-mono font-semibold text-rose-700">
                      {classificationResult.probabilities.malignant.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* TOMBOL LIHAT DETAIL & PINDAH KE Halaman Analysis Result */}
                <button
                  onClick={() =>
                    onViewDetails && onViewDetails(classificationResult)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                >
                  <Eye size={16} />
                  Lihat Detail & Pergi ke Results
                </button>
              </div>
            ) : (
              <div className="py-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300">
                  <Activity size={27} />
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  Awaiting Algorithm
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Isi 9 atribut sel di atas dan tekan tombol untuk memulai
                  perhitungan Naïve Bayes.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}