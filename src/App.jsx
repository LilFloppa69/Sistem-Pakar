import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  ScanSearch,
  Database,
  BookOpen,
  ChartNoAxesCombined,
  History as HistoryIcon,
  Info,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import { initialForm } from "./data/featureInfo";

import Dashboard from "./pages/Dashboard";
import Classification from "./pages/Classification";
import Dataset from "./pages/Dataset";
import Theory from "./pages/Theory";
import Results from "./pages/Results";
import HistoryPage from "./pages/History";
import About from "./pages/About";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "classification", label: "Classification", icon: ScanSearch },
  { id: "dataset", label: "Dataset Explorer", icon: Database },
  { id: "theory", label: "Method & Theory", icon: BookOpen },
  { id: "results", label: "Analysis Result", icon: ChartNoAxesCombined },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "about", label: "About", icon: Info },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [values, setValues] = useState({ ...initialForm });

  // 1. Inisialisasi History dari localStorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("classification_history");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedResult, setSelectedResult] = useState(null);

  // Sync state history ke LocalStorage setiap kali history berubah
  useEffect(() => {
    localStorage.setItem("classification_history", JSON.stringify(history));
  }, [history]);

  // Fungsi simpan history dari form klasifikasi
  const handleSaveHistory = (newResult) => {
    setSelectedResult(newResult);
    setHistory((prev) => {
      const exists = prev.some((item) => item.id === newResult.id);
      return exists ? prev : [newResult, ...prev];
    });
  };

  // Navigasi saat mengeklik tombol "Lihat Detail" di Classification
  const handleViewDetails = (resultData) => {
    handleSaveHistory(resultData);
    setActive("results");
  };

  function renderPage() {
    switch (active) {
      case "dashboard":
        return <Dashboard setActive={setActive} />;

      case "classification":
        return (
          <Classification
            values={values}
            setValues={setValues}
            onViewDetails={handleViewDetails}
            onSaveHistory={handleSaveHistory}
          />
        );

      case "dataset":
        return <Dataset />;

      case "theory":
        return <Theory />;

      case "results":
        return (
          <Results
            result={selectedResult || history[0]}
            onGoClassify={() => setActive("classification")}
          />
        );

      case "history":
        return (
          <HistoryPage
            items={history}
            onSelect={(item) => {
              setSelectedResult(item);
              setActive("results");
            }}
            onDelete={(id) => {
              setHistory((old) => old.filter((item) => item.id !== id));
              if (selectedResult?.id === id) {
                setSelectedResult(null);
              }
            }}
            onGoClassify={() => setActive("classification")}
          />
        );

      case "about":
        return <About />;

      default:
        return <Dashboard setActive={setActive} />;
    }
  }

  const activeLabel =
    navItems.find((item) => item.id === active)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <Sidebar
        active={active}
        setActive={setActive}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        items={navItems}
      />

      <div className="min-h-screen lg:pl-64">
        <Header activeLabel={activeLabel} setMobileOpen={setMobileOpen} />

        <main className="mx-auto min-h-[calc(100vh-150px)] max-w-[1500px] p-5 md:p-8">
          {renderPage()}
        </main>

        <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-xs text-slate-400">
          CellScope · Breast Cancer Classification System · Academic Purpose
          Only
        </footer>
      </div>
    </div>
  );
}