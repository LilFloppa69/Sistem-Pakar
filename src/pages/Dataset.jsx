import { useEffect, useMemo, useState } from "react";

import {
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Info,
  Dna,
} from "lucide-react";

import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";

// UCI Wisconsin Breast Cancer Diagnostic
const UCI_DATASET_URL =
  "/api-uci/ml/machine-learning-databases/breast-cancer-wisconsin/wdbc.data";

const PAGE_SIZE = 10;

// 30 FEATURES WDBC
const FEATURE_DEFINITIONS = [
  {
    key: "radius_mean",
    name: "Radius Mean",
    description:
      "Rata-rata jarak dari pusat ke titik-titik pada perimeter inti sel.",
    group: "Mean",
  },
  {
    key: "texture_mean",
    name: "Texture Mean",
    description: "Rata-rata variasi nilai grayscale pada inti sel.",
    group: "Mean",
  },
  {
    key: "perimeter_mean",
    name: "Perimeter Mean",
    description: "Rata-rata keliling inti sel.",
    group: "Mean",
  },
  {
    key: "area_mean",
    name: "Area Mean",
    description: "Rata-rata luas inti sel.",
    group: "Mean",
  },
  {
    key: "smoothness_mean",
    name: "Smoothness Mean",
    description: "Rata-rata variasi lokal panjang radius.",
    group: "Mean",
  },
  {
    key: "compactness_mean",
    name: "Compactness Mean",
    description: "Rata-rata ukuran compactness berdasarkan perimeter dan area.",
    group: "Mean",
  },
  {
    key: "concavity_mean",
    name: "Concavity Mean",
    description:
      "Rata-rata tingkat keparahan bagian cekung pada kontur inti sel.",
    group: "Mean",
  },
  {
    key: "concave_points_mean",
    name: "Concave Points Mean",
    description: "Rata-rata jumlah bagian cekung pada kontur inti sel.",
    group: "Mean",
  },
  {
    key: "symmetry_mean",
    name: "Symmetry Mean",
    description: "Rata-rata tingkat simetri inti sel.",
    group: "Mean",
  },
  {
    key: "fractal_dimension_mean",
    name: "Fractal Dimension Mean",
    description: "Rata-rata kompleksitas kontur inti sel.",
    group: "Mean",
  },

  {
    key: "radius_se",
    name: "Radius SE",
    description: "Standard error dari pengukuran radius.",
    group: "Standard Error",
  },
  {
    key: "texture_se",
    name: "Texture SE",
    description: "Standard error dari pengukuran texture.",
    group: "Standard Error",
  },
  {
    key: "perimeter_se",
    name: "Perimeter SE",
    description: "Standard error dari pengukuran perimeter.",
    group: "Standard Error",
  },
  {
    key: "area_se",
    name: "Area SE",
    description: "Standard error dari pengukuran area.",
    group: "Standard Error",
  },
  {
    key: "smoothness_se",
    name: "Smoothness SE",
    description: "Standard error dari pengukuran smoothness.",
    group: "Standard Error",
  },
  {
    key: "compactness_se",
    name: "Compactness SE",
    description: "Standard error dari pengukuran compactness.",
    group: "Standard Error",
  },
  {
    key: "concavity_se",
    name: "Concavity SE",
    description: "Standard error dari pengukuran concavity.",
    group: "Standard Error",
  },
  {
    key: "concave_points_se",
    name: "Concave Points SE",
    description: "Standard error dari pengukuran concave points.",
    group: "Standard Error",
  },
  {
    key: "symmetry_se",
    name: "Symmetry SE",
    description: "Standard error dari pengukuran symmetry.",
    group: "Standard Error",
  },
  {
    key: "fractal_dimension_se",
    name: "Fractal Dimension SE",
    description: "Standard error dari pengukuran fractal dimension.",
    group: "Standard Error",
  },

  {
    key: "radius_worst",
    name: "Radius Worst",
    description: "Rata-rata dari tiga nilai radius terbesar.",
    group: "Worst",
  },
  {
    key: "texture_worst",
    name: "Texture Worst",
    description: "Rata-rata dari tiga nilai texture terbesar.",
    group: "Worst",
  },
  {
    key: "perimeter_worst",
    name: "Perimeter Worst",
    description: "Rata-rata dari tiga nilai perimeter terbesar.",
    group: "Worst",
  },
  {
    key: "area_worst",
    name: "Area Worst",
    description: "Rata-rata dari tiga nilai area terbesar.",
    group: "Worst",
  },
  {
    key: "smoothness_worst",
    name: "Smoothness Worst",
    description: "Rata-rata dari tiga nilai smoothness terbesar.",
    group: "Worst",
  },
  {
    key: "compactness_worst",
    name: "Compactness Worst",
    description: "Rata-rata dari tiga nilai compactness terbesar.",
    group: "Worst",
  },
  {
    key: "concavity_worst",
    name: "Concavity Worst",
    description: "Rata-rata dari tiga nilai concavity terbesar.",
    group: "Worst",
  },
  {
    key: "concave_points_worst",
    name: "Concave Points Worst",
    description: "Rata-rata dari tiga nilai concave points terbesar.",
    group: "Worst",
  },
  {
    key: "symmetry_worst",
    name: "Symmetry Worst",
    description: "Rata-rata dari tiga nilai symmetry terbesar.",
    group: "Worst",
  },
  {
    key: "fractal_dimension_worst",
    name: "Fractal Dimension Worst",
    description: "Rata-rata dari tiga nilai fractal dimension terbesar.",
    group: "Worst",
  },
];

// PARSE DATASET
function parseDataset(rawText) {
  const lines = rawText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  const records = [];
  let invalidRows = 0;
  let missingValues = 0;

  lines.forEach((line) => {
    const columns = line.split(",").map((value) => value.trim());

    if (columns.length !== 32) {
      invalidRows++;
      return;
    }

    const id = columns[0];
    const diagnosis = columns[1].toUpperCase();

    if (!id || !["B", "M"].includes(diagnosis)) {
      invalidRows++;
      return;
    }

    const rawFeatures = columns.slice(2);

    const missing = rawFeatures.filter(
      (value) => value === "" || value === "?",
    ).length;

    missingValues += missing;

    const values = rawFeatures.map((value) => {
      if (value === "" || value === "?") return null;
      return Number(value);
    });

    if (values.some((value) => value !== null && !Number.isFinite(value))) {
      invalidRows++;
      return;
    }

    records.push({
      id,
      diagnosis,
      features: values,
    });
  });

  const benign = records.filter((record) => record.diagnosis === "B").length;

  const malignant = records.filter((record) => record.diagnosis === "M").length;

  return {
    records,
    totalRecords: records.length,
    totalFeatures: FEATURE_DEFINITIONS.length,
    benign,
    malignant,
    missingValues,
    invalidRows,
  };
}

export default function Dataset() {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [recordSearch, setRecordSearch] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // FETCH DATASET
  useEffect(() => {
    const controller = new AbortController();

    async function loadDataset() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(UCI_DATASET_URL, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Dataset gagal dimuat (HTTP ${response.status}).`);
        }

        const rawText = await response.text();
        const result = parseDataset(rawText);

        if (
          result.totalRecords === 0 ||
          result.totalFeatures !== 30 ||
          result.invalidRows > 0
        ) {
          throw new Error(
            `Dataset tidak valid. Records: ${result.totalRecords}, ` +
              `Invalid rows: ${result.invalidRows}.`,
          );
        }

        setDataset(result.records);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setDataset([]);
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

  // DATASET STATISTICS
  const stats = useMemo(() => {
    const benign = dataset.filter((record) => record.diagnosis === "B").length;

    const malignant = dataset.filter(
      (record) => record.diagnosis === "M",
    ).length;

    return {
      total: dataset.length,
      benign,
      malignant,
      features: FEATURE_DEFINITIONS.length,
      missing: dataset.reduce(
        (total, record) =>
          total + record.features.filter((value) => value === null).length,
        0,
      ),
      benignPercent: dataset.length > 0 ? (benign / dataset.length) * 100 : 0,
      malignantPercent:
        dataset.length > 0 ? (malignant / dataset.length) * 100 : 0,
    };
  }, [dataset]);

  // FEATURE FILTER
  const filteredFeatures = useMemo(() => {
    return FEATURE_DEFINITIONS.filter((feature) => {
      const matchesSearch = (
        feature.name +
        " " +
        feature.key +
        " " +
        feature.description
      )
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter = filter === "all" || feature.group === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  // RECORD FILTER
  const filteredRecords = useMemo(() => {
    return dataset.filter((record) => {
      const matchesSearch = record.id
        .toLowerCase()
        .includes(recordSearch.toLowerCase());

      const matchesDiagnosis =
        diagnosisFilter === "all" || record.diagnosis === diagnosisFilter;

      return matchesSearch && matchesDiagnosis;
    });
  }, [dataset, recordSearch, diagnosisFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(value);

  function changeRecordSearch(value) {
    setRecordSearch(value);
    setCurrentPage(1);
  }

  function changeDiagnosisFilter(value) {
    setDiagnosisFilter(value);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Data management"
        title="Dataset Explorer"
        desc="Eksplorasi Wisconsin Breast Cancer Diagnostic Dataset, distribusi kelas, dan 30 karakteristik inti sel."
      />

      {/* ERROR STATE */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex gap-3">
            <AlertCircle className="shrink-0 text-rose-600" size={20} />

            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Dataset Loading Failed
              </h4>
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

      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-800">
          <Loader2 className="animate-spin" size={20} />
          Mengambil dataset dari UCI Repository...
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Records"
          value={loading ? "..." : formatNumber(stats.total)}
          note="Diagnostic dataset"
          icon={Database}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Benign"
          value={loading ? "..." : formatNumber(stats.benign)}
          note="Class B"
          icon={CheckCircle2}
          color="bg-teal-50 text-teal-600"
        />

        <StatCard
          title="Malignant"
          value={loading ? "..." : formatNumber(stats.malignant)}
          note="Class M"
          icon={AlertCircle}
          color="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="Features"
          value="30"
          note="Predictor attributes"
          icon={Dna}
          color="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Missing Values"
          value={loading ? "..." : formatNumber(stats.missing)}
          note="Feature values"
          icon={Filter}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* DATASET INFORMATION */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-slate-800">Dataset Information</h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Dataset Name", "Breast Cancer Wisconsin (Diagnostic)"],
            ["Data Source", "University of Wisconsin"],
            ["Repository", "UCI Machine Learning Repository"],
            ["Target Classes", "Benign (B) / Malignant (M)"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">
                {value}
              </p>
            </div>
          ))}
        </div>

        <a
          href="https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-900"
        >
          View UCI Dataset Reference
        </a>
      </section>

      {/* CLASS DISTRIBUTION */}
      {!loading && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-800">Class Distribution</h3>

          <p className="mt-1 text-xs text-slate-400">
            Distribusi kelas dihitung langsung dari kolom diagnosis dataset.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">Benign (B)</span>
                <span className="font-bold text-teal-700">
                  {formatNumber(stats.benign)} ({stats.benignPercent.toFixed(2)}
                  %)
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${stats.benignPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  Malignant (M)
                </span>
                <span className="font-bold text-rose-600">
                  {formatNumber(stats.malignant)} (
                  {stats.malignantPercent.toFixed(2)}%)
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all"
                  style={{ width: `${stats.malignantPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURE DICTIONARY */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h3 className="font-bold text-slate-800">Feature Dictionary</h3>
            <p className="mt-1 text-xs text-slate-400">
              30 predictor attributes dalam WDBC dataset.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search features..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-4">
          {[
            ["all", "All Features"],
            ["Mean", "Mean"],
            ["Standard Error", "Standard Error"],
            ["Worst", "Worst"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                filter === value
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Feature</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Measurement</th>
                <th className="px-5 py-4">Data Type</th>
              </tr>
            </thead>

            <tbody>
              {filteredFeatures.map((feature) => (
                <tr
                  key={feature.key}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-slate-400">
                    {FEATURE_DEFINITIONS.indexOf(feature) + 1}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {feature.name}
                    <p className="mt-1 font-mono text-[10px] font-normal text-slate-400">
                      {feature.key}
                    </p>
                  </td>

                  <td className="max-w-md px-5 py-4 text-xs leading-6 text-slate-500">
                    {feature.description}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                      {feature.group}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      Continuous
                    </span>
                  </td>
                </tr>
              ))}

              {filteredFeatures.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No features found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
          Showing {filteredFeatures.length} of 30 features
        </div>
      </section>

      {/* RECORD EXPLORER */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-800">Dataset Records</h3>
          <p className="mt-1 text-xs text-slate-400">
            Preview data pasien yang diambil langsung dari UCI Repository.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />

            <input
              value={recordSearch}
              onChange={(e) => changeRecordSearch(e.target.value)}
              placeholder="Search patient ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={diagnosisFilter}
            onChange={(e) => changeDiagnosisFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-teal-500"
          >
            <option value="all">All Diagnoses</option>
            <option value="B">Benign</option>
            <option value="M">Malignant</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4">Patient ID</th>
                <th className="px-5 py-4">Diagnosis</th>
                <th className="px-5 py-4">Radius Mean</th>
                <th className="px-5 py-4">Texture Mean</th>
                <th className="px-5 py-4">Perimeter Mean</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">
                    {record.id}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        record.diagnosis === "B"
                          ? "bg-teal-50 text-teal-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {record.diagnosis === "B" ? "Benign" : "Malignant"}
                    </span>
                  </td>

                  {[0, 1, 2].map((index) => (
                    <td
                      key={index}
                      className="px-5 py-4 font-mono text-xs text-slate-600"
                    >
                      {record.features[index]?.toFixed(4) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}

              {!loading && paginatedRecords.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-400">
            Showing{" "}
            {filteredRecords.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            {" - "}
            {Math.min(currentPage * PAGE_SIZE, filteredRecords.length)}
            {" of "}
            {formatNumber(filteredRecords.length)} records
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold text-slate-600">
              Page {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* DATASET STATUS */}
      {!loading && !error && (
        <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={20} />

          <div>
            <h4 className="text-sm font-bold text-teal-900">
              Dataset Successfully Loaded
            </h4>

            <p className="mt-1 text-xs leading-6 text-teal-800">
              {formatNumber(stats.total)} records berhasil dibaca, terdiri dari{" "}
              {stats.benign} Benign dan {stats.malignant} Malignant. Dataset
              memiliki {stats.features} fitur dan {stats.missing} missing
              values.
            </p>
          </div>
        </div>
      )}

      {/* MISSING VALUE INFORMATION */}
      {!loading && !error && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <Info className="mt-0.5 shrink-0 text-sky-600" size={20} />

          <div>
            <h4 className="text-sm font-bold text-sky-900">
              Missing Value Information
            </h4>

            <p className="mt-1 text-xs leading-6 text-sky-800">
              Dataset Diagnostic yang digunakan memiliki {stats.missing} missing
              feature values berdasarkan pemeriksaan data yang berhasil dimuat.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
