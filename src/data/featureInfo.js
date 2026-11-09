export const features = [
  {
    key: "clump",
    name: "Clump Thickness",
    description: "Ketebalan gumpalan sel",
    scale: "1–10",
  },
  {
    key: "cellSize",
    name: "Uniformity of Cell Size",
    description: "Keseragaman ukuran sel",
    scale: "1–10",
  },
  {
    key: "cellShape",
    name: "Uniformity of Cell Shape",
    description: "Keseragaman bentuk sel",
    scale: "1–10",
  },
  {
    key: "adhesion",
    name: "Marginal Adhesion",
    description: "Pelekatan antar sel",
    scale: "1–10",
  },
  {
    key: "epithelial",
    name: "Single Epithelial Cell Size",
    description: "Ukuran sel epitel tunggal",
    scale: "1–10",
  },
  {
    key: "bareNuclei",
    name: "Bare Nuclei",
    description: "Karakteristik inti sel",
    scale: "1–10",
  },
  {
    key: "chromatin",
    name: "Bland Chromatin",
    description: "Tekstur kromatin",
    scale: "1–10",
  },
  {
    key: "nucleoli",
    name: "Normal Nucleoli",
    description: "Karakteristik nukleolus",
    scale: "1–10",
  },
  {
    key: "mitoses",
    name: "Mitoses",
    description: "Aktivitas pembelahan sel",
    scale: "1–10",
  },
];

export const initialForm = Object.fromEntries(
  features.map((feature) => [feature.key, ""]),
);
