const tableBody = document.querySelector("#pegawaiTable tbody");

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr; // fallback if invalid
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function renderTable(pegawaiList, keluargaList) {
  tableBody.innerHTML = "";

pegawaiList.forEach((pegawai, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${pegawai.nama}</td>
      <td>${pegawai.golongan}</td>
      <td>${formatDate(pegawai.next_tmt)}</td>
      <td>${pegawai.jabatan}</td>
      <td>${pegawai.jenis_kelamin}</td>
      <td>
        <button class="btn-show-family" data-nip="${pegawai.nip}">
          Tampilkan Keluarga
        </button>
      </td>
    `;
    tableBody.appendChild(row);

    const familyRow = document.createElement("tr");
    familyRow.classList.add("family-row");
    familyRow.style.display = "none";

    const familyCell = document.createElement("td");
    familyCell.colSpan = 7;

    const keluargaPegawai = keluargaList.filter(k => k.nip === pegawai.nip);

    if (keluargaPegawai.length > 0) {
      const familyTable = document.createElement("table");
      familyTable.innerHTML = `
        <thead>...</thead>
        <tbody>
        ${keluargaPegawai.map((k,i)=>`
            <tr>
              <td>${i+1}</td>
              <td>${k.role}</td>
              <td>${k.nama}</td>
              <td>${k.tanggal_lahir}</td>
              <td>${k.jenis_kelamin}</td>
              <td>${k.pekerjaan}</td>
              <td>${k.tanggungan}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
      familyCell.appendChild(familyTable);
    } else {
      familyCell.innerHTML = "<em>Tidak ada anggota keluarga</em>";
    }

    familyRow.appendChild(familyCell);
    tableBody.appendChild(familyRow);
  });
}

// 👇 LOAD JSON HERE
const fs = require("fs");
const path = require("path");

const pegawaiPath = path.join(__dirname, "../../data/pegawai.json");
const keluargaPath = path.join(__dirname, "../../data/keluarga.json");

fs.readFile(pegawaiPath, "utf-8", (err, pegawaiRaw) => {
  if (err) return console.error("Failed to load pegawai.json", err);
  const pegawaiData = JSON.parse(pegawaiRaw);

  fs.readFile(keluargaPath, "utf-8", (err2, keluargaRaw) => {
    if (err2) return console.error("Failed to load keluarga.json", err2);
    const keluargaData = JSON.parse(keluargaRaw);

    renderTable(pegawaiData, keluargaData); // 👈 pass both
  });
});


// Toggle handler
tableBody.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-show-family");
  if (!btn) return;

  const tr = btn.closest("tr");
  const nextTr = tr.nextElementSibling;

  if (nextTr && nextTr.classList.contains("family-row")) {
    nextTr.style.display =
      nextTr.style.display === "none" ? "table-row" : "none";
  }
});
