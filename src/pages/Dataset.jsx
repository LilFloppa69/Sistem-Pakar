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
} from "lucide-react";

import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { features } from "../data/featureInfo";

// =====================================================
// UCI WISCONSIN BREAST CANCER ORIGINAL
// Dataset mentah tetap diambil dari sumber UCI.
// Pembagian training/testing dibuat sama dengan Classification.jsx.
// =====================================================

const UCI_DATASET_URL =
  "/api-uci/ml/machine-learning-databases/breast-cancer-wisconsin/breast-cancer-wisconsin.data";

const PAGE_SIZE = 10;

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

const EXPECTED = {
  raw: 699,
  rawBenign: 458,
  rawMalignant: 241,

  clean: 683,
  cleanBenign: 444,
  cleanMalignant: 239,

  missingValues: 16,
  missingRows: 16,

  training: 546,
  trainBenign: 355,
  trainMalignant: 191,

  testing: 137,
  testBenign: 89,
  testMalignant: 48,
};

// =====================================================
// SEEDED SHUFFLE
// Harus identik dengan fungsi pada Classification.jsx
// =====================================================

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seed) {
  const result = [...items];
  const random = mulberry32(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// =====================================================
// PARSE DATASET
// rawRecords = 699 data asli, termasuk record dengan "?"
// cleanRecords = 683 data lengkap setelah 16 record missing dibuang
// =====================================================

function parseOriginalDataset(rawText) {
  const lines = rawText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  const rawRecords = [];
  const cleanRecords = [];

  let invalidRows = 0;
  let missingValues = 0;
  let missingRows = 0;
  let rawBenign = 0;
  let rawMalignant = 0;

  lines.forEach((line) => {
    const cols = line.split(",").map((item) => item.trim());

    // Dataset Original memiliki 11 kolom:
    // ID + 9 atribut + class.
    if (cols.length !== 11) {
      invalidRows++;
      return;
    }

    const id = cols[0];
    const classCode = Number(cols[10]);

    if (!id || ![2, 4].includes(classCode)) {
      invalidRows++;
      return;
    }

    if (classCode === 2) rawBenign++;
    if (classCode === 4) rawMalignant++;

    const values = [];
    let rowHasMissing = false;
    let rowInvalid = false;

    cols.slice(1, 10).forEach((value) => {
      if (value === "" || value === "?") {
        values.push(null);
        missingValues++;
        rowHasMissing = true;
        return;
      }

      const number = Number(value);

      if (!Number.isInteger(number) || number < 1 || number > 10) {
        rowInvalid = true;
      }

      values.push(number);
    });

    if (rowInvalid) {
      invalidRows++;
      return;
    }

    const record = {
      id,
      values,
      classCode,
      diagnosis: classCode,
      target: classCode === 2 ? "Jinak" : "Ganas",
    };

    // Simpan semua record valid untuk transparansi dataset mentah.
    rawRecords.push(record);

    // Record dengan missing value tidak dipakai untuk training/testing.
    if (rowHasMissing) {
      missingRows++;
      return;
    }

    cleanRecords.push(record);
  });

  const cleanBenign = cleanRecords.filter(
    (record) => record.classCode === 2,
  ).length;

  const cleanMalignant = cleanRecords.filter(
    (record) => record.classCode === 4,
  ).length;

  return {
    rawRecords,
    cleanRecords,
    summary: {
      rawRecords: rawRecords.length,
      rawBenign,
      rawMalignant,
      cleanRecords: cleanRecords.length,
      cleanBenign,
      cleanMalignant,
      missingValues,
      missingRows,
      invalidRows,
      totalFeatures: 9,
    },
  };
}

// =====================================================
// STRATIFIED 80:20 SPLIT
// Seed harus sama dengan Classification.jsx:
// Benign 42, Malignant 43, Training 44, Testing 45.
// =====================================================

function createStratifiedSplit(records) {
  const benign = records.filter((record) => record.classCode === 2);
  const malignant = records.filter((record) => record.classCode === 4);

  const shuffledBenign = seededShuffle(benign, 42);
  const shuffledMalignant = seededShuffle(malignant, 43);

  const trainBenignCount = Math.floor(shuffledBenign.length * 0.8);
  const trainMalignantCount = Math.floor(shuffledMalignant.length * 0.8);

  const training = seededShuffle(
    [
      ...shuffledBenign.slice(0, trainBenignCount),
      ...shuffledMalignant.slice(0, trainMalignantCount),
    ],
    44,
  );

  const testing = seededShuffle(
    [
      ...shuffledBenign.slice(trainBenignCount),
      ...shuffledMalignant.slice(trainMalignantCount),
    ],
    45,
  );

  return {
    training,
    testing,
    trainBenign: trainBenignCount,
    trainMalignant: trainMalignantCount,
    testBenign: benign.length - trainBenignCount,
    testMalignant: malignant.length - trainMalignantCount,
  };
}

function validateDataset(parsed, split) {
  const { summary } = parsed;

  return (
    summary.rawRecords === EXPECTED.raw &&
    summary.rawBenign === EXPECTED.rawBenign &&
    summary.rawMalignant === EXPECTED.rawMalignant &&
    summary.cleanRecords === EXPECTED.clean &&
    summary.cleanBenign === EXPECTED.cleanBenign &&
    summary.cleanMalignant === EXPECTED.cleanMalignant &&
    summary.missingValues === EXPECTED.missingValues &&
    summary.missingRows === EXPECTED.missingRows &&
    summary.invalidRows === 0 &&
    split.training.length === EXPECTED.training &&
    split.testing.length === EXPECTED.testing &&
    split.trainBenign === EXPECTED.trainBenign &&
    split.trainMalignant === EXPECTED.trainMalignant &&
    split.testBenign === EXPECTED.testBenign &&
    split.testMalignant === EXPECTED.testMalignant
  );
}

export default function Dataset() {
  const [rawRecords, setRawRecords] = useState([]);
  const [cleanRecords, setCleanRecords] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [testingData, setTestingData] = useState([]);

  const [summary, setSummary] = useState(null);
  const [splitSummary, setSplitSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Feature Dictionary
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Dataset records table: default tampilkan 546 data training.
  const [activeSplit, setActiveSplit] = useState("training");
  const [recordSearch, setRecordSearch] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ===================================================
  // FETCH, CLEAN, AND SPLIT DATASET
  // ===================================================

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
          throw new Error(`Gagal memuat dataset (HTTP ${response.status}).`);
        }

        const rawText = await response.text();
        const parsed = parseOriginalDataset(rawText);
        const split = createStratifiedSplit(parsed.cleanRecords);

        if (!validateDataset(parsed, split)) {
          throw new Error(
            [
              "Dataset atau hasil pembagian tidak sesuai dengan konfigurasi CellScope.",
              `Raw: ${parsed.summary.rawRecords} (target ${EXPECTED.raw}).`,
              `Clean: ${parsed.summary.cleanRecords} (target ${EXPECTED.clean}).`,
              `Training: ${split.training.length} (target ${EXPECTED.training}).`,
              `Testing: ${split.testing.length} (target ${EXPECTED.testing}).`,
              `Invalid rows: ${parsed.summary.invalidRows}.`,
            ].join(" "),
          );
        }

        if (!controller.signal.aborted) {
          setRawRecords(parsed.rawRecords);
          setCleanRecords(parsed.cleanRecords);
          setTrainingData(split.training);
          setTestingData(split.testing);
          setSummary(parsed.summary);
          setSplitSummary({
            trainBenign: split.trainBenign,
            trainMalignant: split.trainMalignant,
            testBenign: split.testBenign,
            testMalignant: split.testMalignant,
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Terjadi kesalahan saat memuat dataset.");
          setRawRecords([]);
          setCleanRecords([]);
          setTrainingData([]);
          setTestingData([]);
          setSummary(null);
          setSplitSummary(null);
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

  // ===================================================
  // DYNAMIC STATISTICS
  // ===================================================

  const stats = useMemo(() => {
    const trainBenign = trainingData.filter(
      (record) => record.classCode === 2,
    ).length;

    const trainMalignant = trainingData.filter(
      (record) => record.classCode === 4,
    ).length;

    const testBenign = testingData.filter(
      (record) => record.classCode === 2,
    ).length;

    const testMalignant = testingData.filter(
      (record) => record.classCode === 4,
    ).length;

    const trainingTotal = trainingData.length;
    const testingTotal = testingData.length;

    return {
      trainingTotal,
      testingTotal,
      trainBenign,
      trainMalignant,
      testBenign,
      testMalignant,
      trainBenignPercent:
        trainingTotal > 0 ? (trainBenign / trainingTotal) * 100 : 0,
      trainMalignantPercent:
        trainingTotal > 0 ? (trainMalignant / trainingTotal) * 100 : 0,
      testBenignPercent:
        testingTotal > 0 ? (testBenign / testingTotal) * 100 : 0,
      testMalignantPercent:
        testingTotal > 0 ? (testMalignant / testingTotal) * 100 : 0,
    };
  }, [trainingData, testingData]);

  // ===================================================
  // FEATURE MISSING COUNTS
  // Missing dihitung dari 699 data mentah agar transparan.
  // ===================================================

  const featureMissingCounts = useMemo(() => {
    return features.map((feature, index) => ({
      ...feature,
      index,
      missingCount: rawRecords.filter((record) => record.values[index] === null)
        .length,
    }));
  }, [rawRecords]);

  const filteredFeatures = useMemo(() => {
    return featureMissingCounts.filter((feature) => {
      const matchesSearch = (feature.name + " " + feature.description)
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "missing" && feature.missingCount > 0) ||
        (filter === "complete" && feature.missingCount === 0);

      return matchesSearch && matchesFilter;
    });
  }, [featureMissingCounts, search, filter]);

  // ===================================================
  // TRAINING / TESTING RECORDS TABLE
  // Default table menggunakan data training sebanyak 546 record.
  // ===================================================

  const activeRecords = activeSplit === "training" ? trainingData : testingData;

  const filteredRecords = useMemo(() => {
    return activeRecords.filter((record) => {
      const matchesSearch = record.id
        .toLowerCase()
        .includes(recordSearch.toLowerCase());

      const matchesDiagnosis =
        diagnosisFilter === "all" ||
        String(record.classCode) === diagnosisFilter;

      return matchesSearch && matchesDiagnosis;
    });
  }, [activeRecords, recordSearch, diagnosisFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(value);

  const handleRecordSearch = (value) => {
    setRecordSearch(value);
    setCurrentPage(1);
  };

  const handleDiagnosisFilter = (value) => {
    setDiagnosisFilter(value);
    setCurrentPage(1);
  };

  const handleSplitChange = (value) => {
    setActiveSplit(value);
    setCurrentPage(1);
    setRecordSearch("");
    setDiagnosisFilter("all");
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Data Management"
        title="Dataset Explorer"
        desc="Eksplorasi data training dan testing Wisconsin Breast Cancer Original yang digunakan dalam proses klasifikasi CellScope."
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
        <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
          <Loader2 size={19} className="animate-spin" />
          Mengambil dataset Wisconsin Original dari UCI, membersihkan data, dan
          membentuk pembagian training/testing...
        </div>
      )}

      {/* MAIN STAT CARDS: 546 IS THE PRIMARY DATA COUNT */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Data Training"
          value={loading ? "..." : formatNumber(stats.trainingTotal)}
          note="80% · digunakan model"
          icon={Database}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Benign Training"
          value={loading ? "..." : formatNumber(stats.trainBenign)}
          note="Class 2 · 65,02%"
          icon={CheckCircle2}
          color="bg-teal-50 text-teal-600"
        />

        <StatCard
          title="Malignant Training"
          value={loading ? "..." : formatNumber(stats.trainMalignant)}
          note="Class 4 · 34,98%"
          icon={AlertCircle}
          color="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="Data Testing"
          value={loading ? "..." : formatNumber(stats.testingTotal)}
          note="20% · data pengujian"
          icon={Filter}
          color="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Features"
          value="9"
          note="Predictor attributes"
          icon={Database}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      {/* DATASET INFORMATION */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800">Dataset Information</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Sumber data tetap menggunakan Wisconsin Breast Cancer Original
              dari UCI Machine Learning Repository.
            </p>
          </div>

          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
            Original Dataset
          </span>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Dataset Name", "Breast Cancer Wisconsin (Original)"],
            ["Data Source", "University of Wisconsin Hospitals"],
            ["Repository", "UCI Machine Learning Repository"],
            ["Target Classes", "Benign (2) / Malignant (4)"],
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
          href="https://archive.ics.uci.edu/dataset/15/breast+cancer+wisconsin+original"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex text-xs font-semibold text-teal-700 hover:text-teal-900"
        >
          View Official UCI Dataset
        </a>
      </section>

      {/* DATA PREPARATION FLOW */}
      {!loading && !error && summary && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 shrink-0 text-blue-600" size={19} />
            <div>
              <h3 className="font-bold text-slate-800">
                Data Preparation & Split
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Dataset asli diproses terlebih dahulu. Record dengan nilai Bare
                Nuclei yang hilang dikeluarkan, kemudian data lengkap dibagi
                secara stratified dengan rasio 80:20.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Raw Dataset</p>
              <p className="mt-1 text-2xl font-bold text-slate-800 tabular-nums">
                {formatNumber(summary.rawRecords)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                458 Benign · 241 Malignant
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs text-amber-700">Removed Missing Rows</p>
              <p className="mt-1 text-2xl font-bold text-amber-800 tabular-nums">
                {formatNumber(summary.missingRows)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Nilai hilang pada Bare Nuclei
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs text-blue-700">Clean Dataset</p>
              <p className="mt-1 text-2xl font-bold text-blue-800 tabular-nums">
                {formatNumber(summary.cleanRecords)}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                444 Benign · 239 Malignant
              </p>
            </div>

            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-xs text-teal-700">Training Dataset</p>
              <p className="mt-1 text-2xl font-bold text-teal-800 tabular-nums">
                {formatNumber(stats.trainingTotal)}
              </p>
              <p className="mt-1 text-xs text-teal-700">
                355 Benign · 191 Malignant
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-lg bg-slate-100 px-3 py-2">699 Raw</span>
            <span className="text-slate-400">→</span>
            <span className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
              683 Clean
            </span>
            <span className="text-slate-400">→</span>
            <span className="rounded-lg bg-teal-50 px-3 py-2 text-teal-700">
              546 Training
            </span>
            <span className="text-slate-400">+</span>
            <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-700">
              137 Testing
            </span>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            Pembagian menggunakan seeded stratified split yang sama dengan
            halaman Classification (seed 42, 43, 44, dan 45), sehingga data
            training dan testing konsisten di seluruh aplikasi.
          </p>
        </section>
      )}

      {/* TRAINING CLASS DISTRIBUTION */}
      {!loading && !error && (
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800">
                Training Class Distribution
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Distribusi kelas dari 546 record yang digunakan untuk menghitung
                prior dan likelihood Naïve Bayes.
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
              546 Training Records
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  Benign (Class 2)
                </span>
                <span className="font-bold text-teal-700">
                  {stats.trainBenign} ({stats.trainBenignPercent.toFixed(2)}%)
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${stats.trainBenignPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  Malignant (Class 4)
                </span>
                <span className="font-bold text-rose-600">
                  {stats.trainMalignant} (
                  {stats.trainMalignantPercent.toFixed(2)}%)
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all"
                  style={{ width: `${stats.trainMalignantPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs text-slate-400">Testing Benign</p>
              <p className="mt-1 text-lg font-bold text-slate-700">
                {stats.testBenign} ({stats.testBenignPercent.toFixed(2)}%)
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs text-slate-400">Testing Malignant</p>
              <p className="mt-1 text-lg font-bold text-slate-700">
                {stats.testMalignant} ({stats.testMalignantPercent.toFixed(2)}%)
              </p>
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
              Sembilan atribut prediktor Wisconsin Original Dataset. Status
              missing dihitung dari dataset asli sebelum cleaning.
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

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-4">
          {[
            ["all", "All Features"],
            ["complete", "Complete"],
            ["missing", "Has Missing Values"],
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
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Feature</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Scale</th>
                <th className="px-5 py-4">Data Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredFeatures.map((feature) => (
                <tr
                  key={feature.key}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-slate-400">
                    {feature.index + 1}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {feature.name}
                  </td>

                  <td className="max-w-md px-5 py-4 text-xs leading-6 text-slate-500">
                    {feature.description}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                      {feature.scale || "1–10"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {feature.missingCount > 0 ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {feature.missingCount} Missing (Raw)
                      </span>
                    ) : (
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        Complete
                      </span>
                    )}
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
          Showing {filteredFeatures.length} of 9 features
        </div>
      </section>

      {/* TRAINING / TESTING RECORDS */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800">Dataset Records</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Tabel menampilkan record hasil pembagian dataset. Secara
                default, yang ditampilkan adalah 546 record training yang
                digunakan untuk menghitung probabilitas Naïve Bayes.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Clean Dataset · 683 Records
            </span>
          </div>
        </div>

        {/* SPLIT TABS */}
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-5">
          <button
            onClick={() => handleSplitChange("training")}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeSplit === "training"
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Training ({formatNumber(trainingData.length)})
          </button>

          <button
            onClick={() => handleSplitChange("testing")}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeSplit === "testing"
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Testing ({formatNumber(testingData.length)})
          </button>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              value={recordSearch}
              onChange={(e) => handleRecordSearch(e.target.value)}
              placeholder="Search sample ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={diagnosisFilter}
            onChange={(e) => handleDiagnosisFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-teal-500"
          >
            <option value="all">All Classes</option>
            <option value="2">Benign (2)</option>
            <option value="4">Malignant (4)</option>
          </select>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-4">No.</th>
                <th className="px-4 py-4">Sample ID</th>

                {features.map((feature) => (
                  <th key={feature.key} className="whitespace-nowrap px-4 py-4">
                    {feature.name}
                  </th>
                ))}

                <th className="px-4 py-4">Class</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRecords.map((record, rowIndex) => (
                <tr
                  key={`${record.id}-${(currentPage - 1) * PAGE_SIZE + rowIndex}`}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-400">
                    {(currentPage - 1) * PAGE_SIZE + rowIndex + 1}
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-600">
                    {record.id}
                  </td>

                  {record.values.map((value, index) => (
                    <td
                      key={index}
                      className="px-4 py-3 font-mono text-slate-600"
                    >
                      {value}
                    </td>
                  ))}

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        record.classCode === 2
                          ? "bg-teal-50 text-teal-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {record.classCode === 2 ? "Benign" : "Malignant"}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && paginatedRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={12}
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
            {" · "}
            {activeSplit === "training" ? "Training set" : "Testing set"}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold text-slate-600">
              Page {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* MISSING VALUE INFORMATION */}
      {!loading && !error && summary && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Info className="mt-0.5 shrink-0 text-amber-600" size={20} />

          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Missing Value Information
            </h4>
            <p className="mt-1 text-xs leading-6 text-amber-800">
              Dataset asli terdiri dari {formatNumber(summary.rawRecords)}{" "}
              record. Ditemukan {formatNumber(summary.missingValues)} nilai yang
              tidak tersedia (?) pada atribut Bare Nuclei di{" "}
              {formatNumber(summary.missingRows)} record. Record tersebut tidak
              dimasukkan ke proses training maupun testing. Setelah
              preprocessing, tersisa {formatNumber(summary.cleanRecords)} record
              lengkap, yang kemudian dibagi menjadi{" "}
              {formatNumber(trainingData.length)} data training dan{" "}
              {formatNumber(testingData.length)} data testing.
            </p>
          </div>
        </div>
      )}

      {/* DATASET STATUS */}
      {!loading && !error && summary && (
        <div className="flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={20} />

          <div>
            <h4 className="text-sm font-bold text-teal-900">
              Training and Testing Dataset Successfully Prepared
            </h4>
            <p className="mt-1 text-xs leading-6 text-teal-800">
              {formatNumber(trainingData.length)} record training (
              {splitSummary?.trainBenign} Benign dan{" "}
              {splitSummary?.trainMalignant} Malignant) serta{" "}
              {formatNumber(testingData.length)} record testing (
              {splitSummary?.testBenign} Benign dan{" "}
              {splitSummary?.testMalignant} Malignant) berhasil dibentuk dari
              {` ${formatNumber(cleanRecords.length)} `}record bersih. Seed
              pembagian sama dengan halaman Classification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
