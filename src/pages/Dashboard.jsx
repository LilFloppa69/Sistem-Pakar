import { useEffect, useState } from "react";

import {
  Activity,
  Database,
  FlaskConical,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowUpRight,
  Dna,
  RefreshCw,
} from "lucide-react";

import StatCard from "../components/StatCard";

// Wisconsin Breast Cancer Original Dataset
const UCI_DATASET_URL =
  "/api-uci/ml/machine-learning-databases/breast-cancer-wisconsin/breast-cancer-wisconsin.data";

const FEATURE_NAMES = [
  "Clump Thickness",
  "Uniformity of Cell Size",
  "Uniformity of Cell Shape",
  "Marginal Adhesion",
  "Single Epithelial Cell Size",
  "Bare Nuclei",
  "Bland Chromatin",
  "Normal Nucleoli",
  "Mitoses",
];

// Parse dataset Wisconsin Original
function parseDataset(rawText) {
  const lines = rawText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  const records = [];
  let missingValues = 0;
  let invalidRows = 0;

  const missingByFeature = Object.fromEntries(
    FEATURE_NAMES.map((name) => [name, 0]),
  );

  lines.forEach((line) => {
    const columns = line.split(",").map((value) => value.trim());

    // Original dataset memiliki 11 kolom:
    // ID + 9 Attributes + Class
    if (columns.length !== 11) {
      invalidRows++;
      return;
    }

    const id = columns[0];
    const featureValues = columns.slice(1, 10);
    const diagnosis = columns[10];

    if (!id || !["2", "4"].includes(diagnosis)) {
      invalidRows++;
      return;
    }

    let rowMissing = 0;
    const parsedFeatures = [];
    const rowMissingByFeature = {};

    let invalidFeature = false;

    featureValues.forEach((value, index) => {
      if (value === "" || value === "?") {
        parsedFeatures.push(null);
        rowMissing++;
        rowMissingByFeature[FEATURE_NAMES[index]] = 1;
      } else {
        const number = Number(value);

        if (!Number.isFinite(number)) {
          invalidFeature = true;
        }

        parsedFeatures.push(number);
      }
    });

    if (invalidFeature) {
      invalidRows++;
      return;
    }

    // Missing values tidak menghapus record.
    // Semua 699 record tetap dipertahankan.
    missingValues += rowMissing;

    Object.entries(rowMissingByFeature).forEach(([name, count]) => {
      missingByFeature[name] += count;
    });

    records.push({
      id,
      features: parsedFeatures,
      diagnosis: Number(diagnosis),
    });
  });

  const benign = records.filter((record) => record.diagnosis === 2).length;

  const malignant = records.filter((record) => record.diagnosis === 4).length;

  const totalRecords = records.length;

  return {
    totalRecords,
    totalFeatures: FEATURE_NAMES.length,
    benign,
    malignant,
    missingValues,
    missingByFeature,
    invalidRows,

    benignPercent: totalRecords > 0 ? (benign / totalRecords) * 100 : 0,

    malignantPercent: totalRecords > 0 ? (malignant / totalRecords) * 100 : 0,
  };
}

export default function Dashboard({ setActive }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Ambil dataset secara otomatis
  useEffect(() => {
    const controller = new AbortController();

    async function loadDataset() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(UCI_DATASET_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Dataset gagal dimuat. HTTP ${response.status}`);
        }

        const rawText = await response.text();
        const result = parseDataset(rawText);

        // Validasi Wisconsin Original Dataset
        if (
          result.totalRecords !== 699 ||
          result.benign !== 458 ||
          result.malignant !== 241 ||
          result.missingValues !== 16 ||
          result.invalidRows !== 0
        ) {
          throw new Error(
            `Validasi dataset gagal. Records: ${result.totalRecords}, ` +
              `Benign: ${result.benign}, ` +
              `Malignant: ${result.malignant}, ` +
              `Missing: ${result.missingValues}, ` +
              `Invalid: ${result.invalidRows}.`,
          );
        }

        setStats(result);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setStats(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDataset();

    return () => controller.abort();
  }, [reload]);

  const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(value);

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-[#102A43] p-7 text-white md:p-9">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1.5 text-xs text-teal-200">
            <Activity size={14} />
            Medical Data Classification
          </div>

          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Breast Cancer
            <span className="block text-teal-300">Classification System</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Eksplorasi dan klasifikasi karakteristik inti sel kanker payudara
            menggunakan Wisconsin Breast Cancer Original Dataset dengan sembilan
            atribut prediktor dan metode Naive Bayes.
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

      {/* ERROR */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex gap-3">
            <AlertCircle className="shrink-0 text-rose-600" />

            <div>
              <p className="text-sm font-bold text-rose-800">
                Dataset Loading Failed
              </p>

              <p className="mt-1 text-xs leading-5 text-rose-700">{error}</p>
            </div>
          </div>

          <button
            onClick={() => setReload((value) => value + 1)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-700"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* DATASET OVERVIEW */}
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
            Explore Dataset
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Records"
            value={
              loading ? "..." : stats ? formatNumber(stats.totalRecords) : "-"
            }
            note="Original dataset records"
            icon={Database}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Features"
            value={loading ? "..." : (stats?.totalFeatures ?? "-")}
            note="Cell nucleus characteristics"
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
        </div>
      </section>

      {/* CLASS DISTRIBUTION */}
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <h3 className="font-bold text-slate-800">Class Distribution</h3>

          <p className="mt-1 text-xs text-slate-400">
            Distribusi kelas berdasarkan dataset yang dimuat.
          </p>

          {loading ? (
            <div className="mt-8 space-y-7">
              <div className="h-3 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 animate-pulse rounded-full bg-slate-100" />
            </div>
          ) : stats ? (
            <div className="mt-7 space-y-6">
              {/* BENIGN */}
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">Benign (2)</span>

                  <span className="font-bold text-teal-700">
                    {formatNumber(stats.benign)} ·{" "}
                    {stats.benignPercent.toFixed(2)}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-700"
                    style={{
                      width: `${stats.benignPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* MALIGNANT */}
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    Malignant (4)
                  </span>

                  <span className="font-bold text-rose-600">
                    {formatNumber(stats.malignant)} ·{" "}
                    {stats.malignantPercent.toFixed(2)}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-700"
                    style={{
                      width: `${stats.malignantPercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-slate-400">
              Dataset belum tersedia.
            </p>
          )}

          <div className="mt-7 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
            Distribusi dihitung langsung dari kolom Class pada dataset. Kode 2
            menunjukkan Benign (Jinak), sedangkan kode 4 menunjukkan Malignant
            (Ganas).
          </div>
        </div>

        {/* RESEARCH INFO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <Info className="text-teal-600" size={19} />

            <h3 className="font-bold text-slate-800">Research Information</h3>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Dataset</p>
              <p className="mt-1 font-medium text-slate-700">
                Breast Cancer Wisconsin (Original)
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Data Source</p>
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
              <p className="text-xs text-slate-400">Classification Method</p>
              <p className="mt-1 font-medium text-slate-700">Naive Bayes</p>
            </div>

            <a
              href="https://archive.ics.uci.edu/dataset/15/breast+cancer+wisconsin+original"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 pt-2 text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              UCI Dataset Reference
              <ArrowUpRight size={14} />
            </a>
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

      {/* DATASET STATUS */}
      {stats && (
        <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <Info className="mt-0.5 shrink-0 text-teal-700" size={18} />

          <div>
            <p className="text-sm font-bold text-teal-900">
              Dataset Successfully Loaded
            </p>

            <p className="mt-1 text-xs leading-6 text-teal-800">
              {formatNumber(stats.totalRecords)} records berhasil dibaca,
              terdiri dari {stats.benign} Benign dan {stats.malignant}{" "}
              Malignant, dengan {stats.totalFeatures} fitur dan{" "}
              {stats.missingValues} missing values pada atribut Bare Nuclei.
              Seluruh record tetap dipertahankan.
            </p>
          </div>
        </div>
      )}

      {/* DISCLAIMER */}
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
