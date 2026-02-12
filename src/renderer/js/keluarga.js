const tableBody = document.querySelector("#pegawaiTable tbody");

function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach((pegawai, index) => {
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

    if (pegawai.keluarga && pegawai.keluarga.length > 0) {
      const familyTable = document.createElement("table");
      familyTable.innerHTML = `
        <thead>...</thead>
        <tbody>
          ${pegawai.keluarga.map((k,i)=>`
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
fetch("keluarga.json")
  .then(res => res.json())
  .then(data => renderTable(data))
  .catch(err => console.error("JSON error:", err));

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
