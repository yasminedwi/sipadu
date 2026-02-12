const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const os = require("os");

// =============================
// RANKING GOLONGAN
// =============================
function getGolonganRank(gol) {
  if (!gol) return 0;

  const [romawi, huruf] = gol.split("/");
  const romawiMap = { I: 1, II: 2, III: 3, IV: 4 };
  const hurufMap = { a: 1, b: 2, c: 3, d: 4, e: 5 };

  return (romawiMap[romawi] || 0) * 10 + (hurufMap[huruf] || 0);
}

// =============================
// GENERATE DUK EXCEL
// =============================
function generateExcel() {
  try {

    // =============================
    // AMBIL DATA JSON
    // =============================
    const filePath = path.resolve(__dirname, "../../data/pegawai.json");

    if (!fs.existsSync(filePath)) {
      alert("❌ File pegawai.json tidak ditemukan");
      return;
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const pegawaiData = JSON.parse(rawData);

    if (!Array.isArray(pegawaiData) || pegawaiData.length === 0) {
      alert("❌ Data pegawai kosong");
      return;
    }

    // =============================
    // SORT BERDASARKAN GOLONGAN
    // =============================
    pegawaiData.sort(
      (a, b) => getGolonganRank(b.golongan) - getGolonganRank(a.golongan)
    );

    // =============================
    // HEADER
    // =============================
    const header = [
      ["DAFTAR URUT KEPANGKATAN PEGAWAI NEGERI SIPIL"],
      ["DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU"],
      ["KOTA KENDARI"],
      []
    ];

    const tableHeader = [[
      "NO",
      "NAMA / NIP",
      "TEMPAT TANGGAL LAHIR",
      "GOL",
      "TMT GOL",
      "JABATAN",
      "TMT JABATAN",
      "MASA KERJA",
      "DIKLAT",
      "IJAZAH TERAKHIR",
      "JENIS KELAMIN"
    ]];

    // =============================
    // FORMAT DATA
    // =============================
    const rows = pegawaiData.map((p, i) => {

    const ttl = [
        p.tempat_lahir,
        p.tanggal_lahir
    ].filter(Boolean).join(", ");

    return [
        i + 1,
        `${p.nama || ""}\n${p.nip || ""}`,
        ttl,
        p.golongan || "",
        p.tmt_golongan || "",
        p.jabatan || "",
        p.tmt_jabatan || "",
        p.masa_kerja || "",
        p.diklat || "",
        p.ijazah || "",
        p.jenis_kelamin || ""
      ];
    });

    const sheetData = [...header, ...tableHeader, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // =============================
    // MERGE HEADER
    // =============================
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }
    ];

    // =============================
    // LEBAR KOLOM
    // =============================
    ws["!cols"] = [
        { wch: 5 },   // no
        { wch: 30 },  // nama nip
        { wch: 25 },  // ttl
        { wch: 10 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 }
    ];


    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } }
    ];


    // =============================
    // BUAT WORKBOOK
    // =============================
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DUK");

    // =============================
    // SIMPAN FILE (ANTI EBUSY)
    // =============================
    const downloadsPath = path.join(os.homedir(), "Downloads");

    const fileName = `DUK_DPMPTSP_${Date.now()}.xlsx`;
    const outputPath = path.join(downloadsPath, fileName);

    XLSX.writeFile(wb, outputPath);

    alert("✅ DUK berhasil dibuat!\nFile: " + fileName);

  } catch (err) {
    console.error("ERROR GENERATE DUK:", err);
    alert("❌ Gagal membuat DUK\nLihat Console");
  }
}

// =============================
// EXPORT KE HTML
// =============================
window.generateExcel = generateExcel;
