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

// =====================================================
// WISCONSIN BREAST CANCER ORIGINAL
// =====================================================

const UCI_DATASET_URL =
  "/api-uci/ml/machine-learning-databases/breast-cancer-wisconsin/breast-cancer-wisconsin.data";

// Cache baru agar tidak menggunakan cache model sebelumnya
const CACHE_KEY = "cellscope_wbco_original_training_v3";

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

  missing: 16,

  training: 546,
  trainBenign: 355,
  trainMalignant: 191,

  testing: 137,
  testBenign: 89,
  testMalignant: 48,
};

// Zero-frequency estimation.
// m=10 dan p=0.1 merupakan konfigurasi estimasi
// untuk 10 kemungkinan kategori atribut (1-10).
const ZERO_FREQ_M = 10;
const ZERO_FREQ_P = 0.1;

// =====================================================
// SEEDED RANDOM SHUFFLE
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
// PARSE ORIGINAL CSV
// =====================================================

function parseCSVData(rawText) {
  const lines = rawText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  const records = [];

  let missingValues = 0;
  let missingRows = 0;
  let invalidRows = 0;

  let rawBenign = 0;
  let rawMalignant = 0;

  lines.forEach((line) => {
    const cols = line.split(",").map((item) => item.trim());

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

    // Hitung distribusi kelas data mentah
    if (classCode === 2) rawBenign++;
    if (classCode === 4) rawMalignant++;

    const parsedValues = [];
    let rowHasMissing = false;
    let rowInvalid = false;

    cols.slice(1, 10).forEach((value) => {
      if (value === "" || value === "?") {
        parsedValues.push(null);
        missingValues++;
        rowHasMissing = true;
        return;
      }

      const number = Number(value);

      if (!Number.isInteger(number) || number < 1 || number > 10) {
        rowInvalid = true;
      }

      parsedValues.push(number);
    });

    if (rowInvalid) {
      invalidRows++;
      return;
    }

    // Jangan masukkan record incomplete ke training/testing
    if (rowHasMissing) {
      missingRows++;
      return;
    }

    const record = {
      id,
      target: classCode === 2 ? "Jinak" : "Ganas",
    };

    FEATURE_KEYS.forEach((key, index) => {
      record[key] = parsedValues[index];
    });

    record.diagnosis = classCode;

    records.push(record);
  });

  const cleanBenign = records.filter((record) => record.diagnosis === 2).length;

  const cleanMalignant = records.filter(
    (record) => record.diagnosis === 4,
  ).length;

  return {
    records,

    rawRecords: lines.length,

    rawBenign,
    rawMalignant,

    cleanRecords: records.length,
    cleanBenign,
    cleanMalignant,

    missingValues,
    missingRows,

    invalidRows,
  };
}

// =====================================================
// DATASET VALIDATION
// =====================================================

function validateDataset(data) {
  return (
    data &&
    Array.isArray(data.records) &&
    data.rawRecords === EXPECTED.raw &&
    data.rawBenign === EXPECTED.rawBenign &&
    data.rawMalignant === EXPECTED.rawMalignant &&
    data.cleanRecords === EXPECTED.clean &&
    data.cleanBenign === EXPECTED.cleanBenign &&
    data.cleanMalignant === EXPECTED.cleanMalignant &&
    data.missingValues === EXPECTED.missing &&
    data.missingRows === EXPECTED.missing &&
    data.invalidRows === 0
  );
}

// =====================================================
// LOCAL STORAGE CACHE
// =====================================================

function readCachedDataset() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (!cached) return null;

    const parsed = JSON.parse(cached);

    return validateDataset(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveCachedDataset(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Dataset cache unavailable:", error);
  }
}

// =====================================================
// STRATIFIED 80:20 SPLIT
// =====================================================

function createStratifiedSplit(records) {
  const benign = records.filter((record) => record.diagnosis === 2);

  const malignant = records.filter((record) => record.diagnosis === 4);

  // Pisahkan dan acak setiap kelas
  const shuffledBenign = seededShuffle(benign, 42);
  const shuffledMalignant = seededShuffle(malignant, 43);

  // 80% training, 20% testing
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

// =====================================================
// LIKELIHOOD CALCULATION
// =====================================================

function calculateLikelihood(frequency, classTotal) {
  // Jika frekuensi positif, gunakan rumus jurnal
  // P(Ai | Vj) = ni / jumlah kelas

  if (frequency > 0) {
    return {
      frequency,

      numerator: frequency,
      denominator: classTotal,

      probability: frequency / classTotal,

      usedZeroEstimate: false,

      formula: `${frequency}/${classTotal}`,
    };
  }

  // Jika frekuensi nol, gunakan estimasi
  // P(Ai | Vj) = (nc + mp) / (n + m)

  const numerator = frequency + ZERO_FREQ_M * ZERO_FREQ_P;

  const denominator = classTotal + ZERO_FREQ_M;

  return {
    frequency,

    numerator,
    denominator,

    probability: numerator / denominator,

    usedZeroEstimate: true,

    m: ZERO_FREQ_M,
    p: ZERO_FREQ_P,

    formula:
      `(${frequency} + ${ZERO_FREQ_M} × ${ZERO_FREQ_P}) / ` +
      `(${classTotal} + ${ZERO_FREQ_M})`,
  };
}

// =====================================================
// CLASSIFICATION COMPONENT
// =====================================================

export default function Classification({
  values,
  setValues,
  onViewDetails,
  onSaveHistory,
}) {
  const [notice, setNotice] = useState("");

  const [reload, setReload] = useState(0);

  const [dbStatus, setDbStatus] = useState({
    loading: true,
    ready: false,
    message: "Memeriksa ketersediaan dataset...",
  });

  const [trainingData, setTrainingData] = useState([]);
  const [testingData, setTestingData] = useState([]);

  const [classificationResult, setClassificationResult] = useState(null);

  // ===================================================
  // INPUT COMPLETION
  // ===================================================

  const completed = features.filter((feature) => {
    const value = values?.[feature.key];

    return value !== "" && value !== null && value !== undefined;
  }).length;

  // ===================================================
  // LOAD DATASET
  // ===================================================

  useEffect(() => {
    const controller = new AbortController();

    async function initDatabase() {
      try {
        setDbStatus({
          loading: true,
          ready: false,
          message: "Memeriksa dataset Wisconsin Original...",
        });

        let parsedData = readCachedDataset();
        let source = "Local Cache";

        if (!parsedData) {
          source = "UCI Repository";

          const response = await fetch(UCI_DATASET_URL, {
            signal: controller.signal,
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(
              `Gagal mengunduh dataset (HTTP ${response.status}).`,
            );
          }

          const rawText = await response.text();

          parsedData = parseCSVData(rawText);

          if (!validateDataset(parsedData)) {
            throw new Error(
              `Validasi dataset gagal. ` +
                `Raw: ${parsedData.rawRecords}, ` +
                `Clean: ${parsedData.cleanRecords}, ` +
                `Benign: ${parsedData.cleanBenign}, ` +
                `Malignant: ${parsedData.cleanMalignant}, ` +
                `Missing: ${parsedData.missingValues}, ` +
                `Invalid: ${parsedData.invalidRows}.`,
            );
          }

          saveCachedDataset(parsedData);
        }

        const split = createStratifiedSplit(parsedData.records);

        // Validasi hasil split
        if (
          split.training.length !== EXPECTED.training ||
          split.testing.length !== EXPECTED.testing ||
          split.trainBenign !== EXPECTED.trainBenign ||
          split.trainMalignant !== EXPECTED.trainMalignant ||
          split.testBenign !== EXPECTED.testBenign ||
          split.testMalignant !== EXPECTED.testMalignant
        ) {
          throw new Error(
            "Pembagian training/testing tidak sesuai konfigurasi jurnal.",
          );
        }

        if (controller.signal.aborted) return;

        setTrainingData(split.training);
        setTestingData(split.testing);

        setDbStatus({
          loading: false,
          ready: true,

          message: `Dataset berhasil dimuat dari ${source}.`,

          source,

          rawRecords: parsedData.rawRecords,
          cleanRecords: parsedData.cleanRecords,
          missingValues: parsedData.missingValues,

          trainingRecords: split.training.length,
          testingRecords: split.testing.length,

          trainBenign: split.trainBenign,
          trainMalignant: split.trainMalignant,

          testBenign: split.testBenign,
          testMalignant: split.testMalignant,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setTrainingData([]);
          setTestingData([]);

          setDbStatus({
            loading: false,
            ready: false,
            message: `Error saat memuat dataset: ${err.message}`,
          });
        }
      }
    }

    initDatabase();

    return () => controller.abort();
  }, [reload]);

  // ===================================================
  // NAIVE BAYES CLASSIFIER
  // ===================================================

  function calculateNaiveBayes(inputValues) {
    if (trainingData.length !== EXPECTED.training) {
      return null;
    }

    const dataJinak = trainingData.filter(
      (record) => record.target === "Jinak",
    );

    const dataGanas = trainingData.filter(
      (record) => record.target === "Ganas",
    );

    const totalJinak = dataJinak.length;
    const totalGanas = dataGanas.length;
    const totalData = trainingData.length;

    // STEP 1: PRIOR PROBABILITY

    const pJinakPrior = totalJinak / totalData;
    const pGanasPrior = totalGanas / totalData;

    const probAtributJinak = {};
    const probAtributGanas = {};

    const likelihoodDetails = {};

    let prodLikelihoodJinak = 1;
    let prodLikelihoodGanas = 1;

    // STEP 2: LIKELIHOOD 9 ATTRIBUTES

    FEATURE_KEYS.forEach((key) => {
      const val = Number(inputValues[key]);

      const countJinak = dataJinak.filter(
        (record) => record[key] === val,
      ).length;

      const countGanas = dataGanas.filter(
        (record) => record[key] === val,
      ).length;

      const detailJinak = calculateLikelihood(countJinak, totalJinak);

      const detailGanas = calculateLikelihood(countGanas, totalGanas);

      probAtributJinak[key] = detailJinak.probability;

      probAtributGanas[key] = detailGanas.probability;

      prodLikelihoodJinak *= detailJinak.probability;

      prodLikelihoodGanas *= detailGanas.probability;

      const feature = features.find((item) => item.key === key);

      likelihoodDetails[key] = {
        featureName: feature?.name || key,

        inputValue: val,

        jinak: detailJinak,
        ganas: detailGanas,
      };
    });

    // STEP 3: RAW POSTERIOR

    const posteriorJinak = prodLikelihoodJinak * pJinakPrior;

    const posteriorGanas = prodLikelihoodGanas * pGanasPrior;

    // STEP 4: NORMALIZATION

    const totalPosterior = posteriorJinak + posteriorGanas;

    const benignPercent =
      totalPosterior > 0 ? (posteriorJinak / totalPosterior) * 100 : 0;

    const malignantPercent =
      totalPosterior > 0 ? (posteriorGanas / totalPosterior) * 100 : 0;

    // STEP 5: CLASS DECISION

    const predictedClass = posteriorJinak >= posteriorGanas ? "Jinak" : "Ganas";

    const normalizedInput = {};

    FEATURE_KEYS.forEach((key) => {
      normalizedInput[key] = Number(inputValues[key]);
    });

    // =================================================
    // RESULT OBJECT
    // =================================================

    return {
      id: `WBCO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,

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

      input: normalizedInput,

      posterior: {
        jinak: posteriorJinak,
        ganas: posteriorGanas,
      },

      datasetInfo: {
        name: "Breast Cancer Wisconsin Original",

        rawRecords: EXPECTED.raw,
        completeRecords: EXPECTED.clean,
        missingValues: EXPECTED.missing,

        trainingRecords: EXPECTED.training,
        testingRecords: EXPECTED.testing,

        trainingBenign: EXPECTED.trainBenign,
        trainingMalignant: EXPECTED.trainMalignant,

        testingBenign: EXPECTED.testBenign,
        testingMalignant: EXPECTED.testMalignant,

        splitMethod: "Stratified 80:20",
        randomSeed: 42,
      },

      calculation: {
        // PRIOR
        prior: {
          jinak: pJinakPrior,
          ganas: pGanasPrior,

          totalJinak,
          totalGanas,
          totalData,

          numeratorJinak: totalJinak,
          numeratorGanas: totalGanas,
          denominator: totalData,
        },

        // LIKELIHOOD
        likelihood: {
          jinak: probAtributJinak,
          ganas: probAtributGanas,
        },

        // FREQUENCY + NUMERATOR + DENOMINATOR
        likelihoodDetails,

        // ZERO FREQUENCY ESTIMATION
        zeroFrequencyEstimate: {
          m: ZERO_FREQ_M,
          p: ZERO_FREQ_P,
        },

        // POSTERIOR
        posteriorRaw: {
          jinak: posteriorJinak,
          ganas: posteriorGanas,

          productLikelihoodJinak: prodLikelihoodJinak,

          productLikelihoodGanas: prodLikelihoodGanas,
        },

        normalizedPosterior: {
          jinak: benignPercent,
          ganas: malignantPercent,
          total: totalPosterior,
        },
      },
    };
  }

  // ===================================================
  // HANDLE CLASSIFICATION
  // ===================================================

  function handleClassify() {
    if (completed !== 9) {
      setNotice("Silakan lengkapi seluruh 9 atribut terlebih dahulu.");
      return;
    }

    if (!dbStatus.ready) {
      setNotice("Database belum siap. Tunggu hingga pemuatan selesai.");
      return;
    }

    const invalidInput = FEATURE_KEYS.some((key) => {
      const value = Number(values[key]);

      return !Number.isInteger(value) || value < 1 || value > 10;
    });

    if (invalidInput) {
      setNotice("Setiap atribut harus memiliki nilai antara 1 sampai 10.");
      return;
    }

    try {
      const result = calculateNaiveBayes(values);

      if (!result) {
        throw new Error("Hasil perhitungan tidak tersedia.");
      }

      setClassificationResult(result);

      if (onSaveHistory) {
        onSaveHistory(result);
      }

      setNotice("Klasifikasi Naïve Bayes berhasil dihitung dan disimpan!");
    } catch (error) {
      console.error("Classification error:", error);

      setNotice(`Klasifikasi gagal: ${error.message}`);
    }
  }

  // ===================================================
  // RESET
  // ===================================================

  function handleReset() {
    setValues({ ...initialForm });

    setNotice("");
    setClassificationResult(null);
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div>
      <SectionTitle
        eyebrow="Patient classification"
        title="New Classification"
        desc="Masukkan sembilan karakteristik inti sel berdasarkan skala pengukuran Wisconsin Breast Cancer Original Dataset."
      />

      {/* DATABASE STATUS */}

      <div
        className={`mb-6 rounded-xl border p-4 text-xs ${
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
            onClick={() => setReload((value) => value + 1)}
            className="mt-3 rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white transition hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        )}

        {dbStatus.ready && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-emerald-200 pt-3 sm:grid-cols-4">
            {[
              ["Raw Dataset", dbStatus.rawRecords],
              ["Clean Dataset", dbStatus.cleanRecords],
              ["Training", dbStatus.trainingRecords],
              ["Testing", dbStatus.testingRecords],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-emerald-600">{label}</p>
                <p className="mt-1 font-bold">{value}</p>
              </div>
            ))}
          </div>
        )}

        {dbStatus.ready && (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-emerald-200 pt-3">
            <span>
              Training: {dbStatus.trainBenign} Benign +{" "}
              {dbStatus.trainMalignant} Malignant
            </span>

            <span>
              Testing: {dbStatus.testBenign} Benign + {dbStatus.testMalignant}{" "}
              Malignant
            </span>

            <span>Missing: {dbStatus.missingValues}</span>
          </div>
        )}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {/* INPUT FORM */}

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
              style={{
                width: `${(completed / 9) * 100}%`,
              }}
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
                classificationResult
                  ? "bg-teal-50 text-teal-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              {classificationResult ? (
                <CheckCircle2 size={17} />
              ) : (
                <Info size={17} />
              )}

              {notice}
            </div>
          )}
        </section>

        {/* INPUT SUMMARY & RESULTS */}

        <div className="space-y-5">
          {/* INPUT SUMMARY */}

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
                      values[feature.key] !== ""
                        ? "text-teal-700"
                        : "text-slate-300"
                    }`}
                  >
                    {values[feature.key] || "—"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* CLASSIFICATION STATUS */}

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
                  className={`rounded-xl border p-4 text-center ${
                    classificationResult.predictedClass === "Jinak"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    Classification Prediction
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {classificationResult.prediction}
                  </p>

                  <p className="mt-1 text-xs">
                    Prediksi kelas {classificationResult.predictedClass}
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-xs">
                  <p className="border-b pb-1 font-bold text-slate-700">
                    Posterior Probability:
                  </p>

                  <div className="flex justify-between">
                    <span className="text-slate-500">P(Jinak | X):</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      {classificationResult.probabilities.benign.toFixed(6)}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">P(Ganas | X):</span>
                    <span className="font-mono font-semibold text-rose-700">
                      {classificationResult.probabilities.malignant.toFixed(6)}%
                    </span>
                  </div>
                </div>

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
                  Isi sembilan atribut di atas dan tekan tombol untuk memulai
                  perhitungan Naïve Bayes.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* MEDICAL DISCLAIMER */}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 shrink-0 text-amber-600" size={18} />

        <p className="text-xs leading-6 text-amber-800">
          Aplikasi ini dibuat untuk tujuan akademik dan pembelajaran. Hasil
          klasifikasi merupakan prediksi model Naïve Bayes, bukan diagnosis
          medis dan tidak menggantikan pemeriksaan tenaga medis profesional.
        </p>
      </div>
    </div>
  );
}
