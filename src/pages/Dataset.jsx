import { useMemo, useState } from "react";
import {
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";

import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { features } from "../data/featureInfo";

export default function Dataset() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      const matchesSearch = (feature.name + " " + feature.description)
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "missing" && feature.key === "bareNuclei") ||
        (filter === "complete" && feature.key !== "bareNuclei");

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div>
      <SectionTitle
        eyebrow="Data management"
        title="Dataset Explorer"
        desc="Eksplorasi struktur Wisconsin Breast Cancer Original Dataset, distribusi kelas, dan sembilan atribut prediktor."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Records"
          value="699"
          note="Raw dataset"
          icon={Database}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Benign"
          value="458"
          note="Class 2"
          icon={CheckCircle2}
          color="bg-teal-50 text-teal-600"
        />

        <StatCard
          title="Malignant"
          value="241"
          note="Class 4"
          icon={AlertCircle}
          color="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="Missing Values"
          value="16"
          note="Bare Nuclei"
          icon={Filter}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Dataset information */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-slate-800">Dataset Information</h3>

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
      </section>

      {/* Feature table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h3 className="font-bold text-slate-800">Feature Dictionary</h3>
            <p className="mt-1 text-xs text-slate-400">
              Sembilan atribut prediktor dalam dataset.
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
            ["complete", "Other Features"],
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
          <table className="w-full min-w-[600px] text-left text-sm">
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
              {filteredFeatures.map((feature, index) => (
                <tr
                  key={feature.key}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 text-slate-400">
                    {features.indexOf(feature) + 1}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {feature.name}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {feature.description}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                      {feature.scale}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {feature.key === "bareNuclei" ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        16 Missing
                      </span>
                    ) : (
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        Available
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

      {/* Missing information */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={20} />

        <div>
          <h4 className="text-sm font-bold text-amber-900">
            Missing Value Information
          </h4>

          <p className="mt-1 text-xs leading-6 text-amber-800">
            Dataset asli memiliki 16 nilai kosong pada atribut Bare Nuclei.
            Penanganan nilai kosong akan ditentukan pada tahap pengolahan
            dataset dan integrasi algoritma.
          </p>
        </div>
      </div>
    </div>
  );
}
