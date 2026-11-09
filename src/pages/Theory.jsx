import {
  BookOpen,
  FlaskConical,
  Calculator,
  Target,
  ArrowRight,
  Info,
} from "lucide-react";

import SectionTitle from "../components/SectionTitle";

const steps = [
  {
    number: "01",
    title: "Prior Probability",
    description:
      "Menghitung peluang awal masing-masing kelas berdasarkan distribusi data training.",
  },
  {
    number: "02",
    title: "Likelihood",
    description:
      "Menghitung peluang karakteristik sel berdasarkan kelas Benign atau Malignant.",
  },
  {
    number: "03",
    title: "Posterior Probability",
    description:
      "Menggabungkan prior dan likelihood untuk mendapatkan peluang setiap kelas setelah menerima data baru.",
  },
  {
    number: "04",
    title: "Classification",
    description:
      "Membandingkan probabilitas posterior untuk menentukan kelas dengan nilai terbesar.",
  },
];

export default function Theory() {
  return (
    <div>
      <SectionTitle
        eyebrow="Learning center"
        title="Method & Theory"
        desc="Memahami konsep Teorema Bayes dan penerapannya dalam klasifikasi karakteristik sel kanker payudara."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Bayes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
              <BookOpen size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">Teorema Bayes</h3>
              <p className="text-xs text-slate-400">Fundamental probability</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-lg font-bold text-slate-800 md:text-xl">
              P(C|X) = P(X|C) × P(C) / P(X)
            </p>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Teorema Bayes digunakan untuk memperbarui probabilitas suatu
            hipotesis setelah memperoleh bukti atau informasi baru.
          </p>

          <div className="mt-5 space-y-3 text-xs">
            {[
              ["P(C|X)", "Probabilitas kelas setelah memperoleh bukti."],
              ["P(X|C)", "Probabilitas bukti berdasarkan kelas."],
              ["P(C)", "Probabilitas awal kelas."],
              ["P(X)", "Probabilitas total bukti."],
            ].map(([formula, desc]) => (
              <div key={formula} className="flex gap-3">
                <span className="w-16 shrink-0 font-bold text-teal-700">
                  {formula}
                </span>
                <span className="text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Naive Bayes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <FlaskConical size={22} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                Naive Bayes Classifier
              </h3>
              <p className="text-xs text-slate-400">Classification method</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-lg font-bold text-slate-800">
              P(C|X) ∝ P(C) ∏ P(Xᵢ|C)
            </p>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Naive Bayes merupakan metode klasifikasi probabilistik yang
            menggunakan asumsi bahwa setiap atribut bersifat independen secara
            kondisional terhadap kelas.
          </p>

          <div className="mt-5 rounded-xl bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Info size={16} />
              <p className="text-xs font-bold">Target Classification</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-3">
                <p className="text-sm font-bold text-teal-700">Benign (2)</p>
                <p className="mt-1 text-xs text-slate-500">Tumor jinak</p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-sm font-bold text-rose-700">Malignant (4)</p>
                <p className="mt-1 text-xs text-slate-500">Tumor ganas</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Workflow */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
            <Calculator size={22} />
          </div>

          <div>
            <h3 className="font-bold text-slate-800">
              Classification Workflow
            </h3>
            <p className="text-xs text-slate-400">
              Tahapan perhitungan Naive Bayes
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 rounded-xl bg-slate-50 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102A43] text-sm font-bold text-white">
                {step.number}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {step.title}
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Target className="text-teal-600" size={20} />
          <h3 className="font-bold text-slate-800">Project Objective</h3>
        </div>

        <p className="text-sm leading-7 text-slate-500">
          Mengimplementasikan metode Naive Bayes untuk mengklasifikasikan
          karakteristik sel berdasarkan Wisconsin Breast Cancer Original Dataset
          ke dalam kelas Benign dan Malignant.
        </p>
      </section>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info className="mt-0.5 shrink-0 text-amber-600" size={18} />
        <p className="text-xs leading-6 text-amber-800">
          Materi ini digunakan untuk pembelajaran algoritma klasifikasi. Hasil
          sistem tidak menggantikan pemeriksaan dan keputusan tenaga medis.
        </p>
      </div>
    </div>
  );
}
