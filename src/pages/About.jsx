import {
  Users,
  Target,
  Microscope,
  Database,
  BrainCircuit,
  GraduationCap,
  Code2,
  ShieldCheck,
  HeartPulse,
  Lightbulb,
} from "lucide-react";

const teamMembers = [
  {
    name: "Yazid Chairy Syahputra Nasution",
    role: "Project Leader/Frontend Developer",
    image: null,
    initials: "YN",
    nirm: "2026020111",
  },
  {
    name: "Achmad Hadi Rasyid",
    role: "Machine Learning Engineer/ Human :)",
    image: null,
    initials: "SHIO",
    nirm: "2026020166",
  },
  {
    name: "Gabe Try Amanda Lubis ",
    role: "Techincal Writer/Quality Assurance Tester",
    image: null,
    initials: "GABE",
    nirm: "2024020085",
  },
  {
    name: "Jesyca Gracela Sitinjak",
    role: "Technical Writer/Case Study Researcher",
    image: null,
    initials: "JES",
    nirm: "2024020351",
  },
  {
    name: "Andira Syifanny",
    role: "Techincal Writer",
    image: null,
    initials: "DIRA",
    nirm: "2024020092",
  },
];

const projectDetails = [
  {
    icon: Database,
    title: "Dataset",
    value: "Wisconsin Breast Cancer Original",
    description: "Dataset klasifikasi kanker payudara dari UCI Repository.",
  },
  {
    icon: BrainCircuit,
    title: "Algorithm",
    value: "Naive Bayes",
    description: "Metode probabilistik untuk klasifikasi dua kelas.",
  },
  {
    icon: Microscope,
    title: "Classification",
    value: "Binary Classification",
    description: "Benign (jinak) dan Malignant (ganas).",
  },
  {
    icon: Code2,
    title: "Technology",
    value: "React.js & Tailwind CSS",
    description: "Antarmuka aplikasi berbasis web.",
  },
];

const objectives = [
  "Mempelajari penerapan Teorema Bayes dalam klasifikasi data medis.",
  "Membangun sistem klasifikasi karakteristik sel kanker payudara.",
  "Menampilkan proses dan hasil perhitungan probabilitas secara informatif.",
  "Mengembangkan aplikasi web interaktif untuk pembelajaran sistem pakar.",
];

export default function About() {
  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-[#102A43] p-7 text-white md:p-10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-200">
            ABOUT OUR PROJECT
          </span>

          <h1 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
            Meet the Team
            <span className="block text-teal-300">Behind CellScope</span>
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            CellScope merupakan proyek akademik yang dikembangkan untuk
            mempelajari penerapan metode Naive Bayes dalam klasifikasi
            karakteristik sel kanker payudara menggunakan Wisconsin Breast
            Cancer Original Dataset.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-slate-200">
              <Users className="mr-2 inline" size={14} />5 Team Members
            </span>

            <span className="rounded-lg bg-white/10 px-3 py-2 text-xs text-slate-200">
              <GraduationCap className="mr-2 inline" size={14} />
              Academic Project
            </span>
          </div>
        </div>

        <Microscope
          className="absolute -bottom-8 -right-5 hidden text-white/10 md:block"
          size={210}
        />
      </section>

      {/* ABOUT PROJECT */}
      <section>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[2px] text-teal-600">
            Introduction
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            About CellScope
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <p className="text-sm leading-8 text-slate-600">
            Kanker payudara merupakan salah satu permasalahan kesehatan yang
            membutuhkan pemeriksaan dan penanganan secara tepat. Dalam bidang
            teknologi informasi, metode machine learning dapat digunakan untuk
            mempelajari pola data medis dan membantu proses klasifikasi.
          </p>

          <p className="mt-4 text-sm leading-8 text-slate-600">
            Melalui CellScope, kami mengembangkan aplikasi berbasis web yang
            menerapkan metode Naive Bayes untuk mengklasifikasikan karakteristik
            sel ke dalam dua kategori, yaitu Benign (jinak) dan Malignant
            (ganas).
          </p>

          <p className="mt-4 text-sm leading-8 text-slate-600">
            Proyek ini menggunakan Wisconsin Breast Cancer Original Dataset
            sebagai sumber data pembelajaran dan pengembangan sistem
            klasifikasi.
          </p>
        </div>
      </section>

      {/* PROJECT DETAILS */}
      <section>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[2px] text-teal-600">
            Project Overview
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            Project Information
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {projectDetails.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon size={21} />
                </div>

                <p className="text-xs text-slate-400">{item.title}</p>

                <h3 className="mt-1 font-bold text-slate-800">{item.value}</h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* OBJECTIVES */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
              <Target size={22} />
            </div>

            <h3 className="font-bold text-slate-800">Project Objectives</h3>
          </div>

          <div className="space-y-4">
            {objectives.map((item, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                  {index + 1}
                </span>

                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Lightbulb size={22} />
            </div>

            <h3 className="font-bold text-slate-800">Our Approach</h3>
          </div>

          <p className="text-sm leading-7 text-slate-500">
            Pengembangan dilakukan melalui pemahaman dataset, pengolahan
            karakteristik sel, penerapan metode probabilistik Naive Bayes, serta
            penyajian hasil klasifikasi melalui antarmuka web yang interaktif.
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">
              Benign vs Malignant
            </p>

            <div className="mt-3 flex gap-3">
              <span className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700">
                Benign
              </span>

              <span className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                Malignant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[2px] text-teal-600">
            The People
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            Meet Our Team
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Lima anggota yang berkolaborasi dalam pengembangan CellScope.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* PHOTO PLACEHOLDER */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={`${member.name} - ${member.nirm}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-teal-50">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-teal-100 text-2xl font-bold text-teal-700 shadow-sm">
                      {member.initials}
                    </div>

                    <p className="mt-4 text-xs font-medium text-slate-400 items-center justify-center text-center">
                      Unfortunately the members are camera-shy, so it's a blank
                      circle
                    </p>
                  </div>
                )}
              </div>

              {/* MEMBER INFO */}
              <div className="p-4">
                <p className="text-xs font-semibold text-teal-600">
                  {index === 0 ? "01 · LEADER" : `0${index + 1} · MEMBER`}
                </p>

                <h3 className="mt-2 text-sm font-bold text-slate-800">
                  {member.name} - {member.nirm}
                </h3>

                <p className="mt-1 text-xs text-slate-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <ShieldCheck className="mt-0.5 shrink-0 text-amber-600" size={20} />

        <div>
          <h3 className="text-sm font-bold text-amber-900">
            Academic Disclaimer
          </h3>

          <p className="mt-1 text-xs leading-6 text-amber-800">
            CellScope merupakan proyek akademik untuk pembelajaran dan
            demonstrasi algoritma klasifikasi. Sistem ini bukan perangkat
            diagnosis medis dan tidak menggantikan pemeriksaan profesional oleh
            tenaga kesehatan.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <div className="py-5 text-center">
        <HeartPulse className="mx-auto mb-2 text-teal-600" size={23} />

        <p className="text-sm font-bold text-slate-700">CellScope</p>

        <p className="mt-1 text-xs text-slate-400">
          Developed for Academic and Educational Purposes · 2026
        </p>
      </div>
    </div>
  );
}
