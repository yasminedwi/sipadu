document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#pegawaiTable tbody");
  const searchInput = document.getElementById("searchInput");

  const path = require("path");
  const fs = require("fs");

  // File paths
  const pegawaiFilePath = path.join(__dirname, "../../data/pegawai.json");
  const keluargaFilePath = path.join(__dirname, "../../data/keluarga.json");

  // Baca data pegawai
  const rawPegawai = fs.readFileSync(pegawaiFilePath);
  let pegawaiData = JSON.parse(rawPegawai);

  // Baca data keluarga
  let keluargaData = [];
  if (fs.existsSync(keluargaFilePath)) {
    const rawKeluarga = fs.readFileSync(keluargaFilePath);
    keluargaData = JSON.parse(rawKeluarga);
  }

  const today = new Date();

  // Hitung next TMT
  pegawaiData.forEach(p => {
    const [year, month, day] = p.tmt_golongan.split("-").map(Number);
    let tmtDate = new Date(year, month - 1, day);

    let diffYears = today.getFullYear() - tmtDate.getFullYear();
    if (
      today.getMonth() > tmtDate.getMonth() ||
      (today.getMonth() === tmtDate.getMonth() && today.getDate() > tmtDate.getDate())
    ) {
      diffYears += 1;
    }
    const jumps = Math.ceil(diffYears / 2);
    tmtDate.setFullYear(tmtDate.getFullYear() + jumps * 2);

    p.next_tmt = new Date(tmtDate);

    // assign keluarga berdasarkan NIP
    p.keluarga = keluargaData.filter(k => k.nip === p.nip);
  });

  // Sort by next TMT
  pegawaiData.sort((a, b) => a.next_tmt - b.next_tmt);

  // Helper
  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach((pegawai, index) => {
      let keluargaDropdown = "";

      if (pegawai.keluarga && pegawai.keluarga.length > 0) {
        const options = pegawai.keluarga
          .map(
            (k, i) =>
              `<option value="${i}">${k.role} - ${k.nama}</option>`
          )
          .join("");

        keluargaDropdown = `
          <select class="keluarga-select" data-nip="${pegawai.nip}">
            <option value="">-- Pilih Keluarga --</option>
            ${options}
          </select>
        `;
      } else {
        keluargaDropdown = `
          <select disabled>
            <option>Tidak Ada Data</option>
          </select>
        `;
      }

      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${pegawai.nama}</td>
          <td>${pegawai.golongan}</td>
          <td>${formatDate(pegawai.next_tmt)}</td>
          <td>${pegawai.jabatan}</td>
          <td>${pegawai.jenis_kelamin}</td>
          <td>${keluargaDropdown}</td>
        </tr>
      `;

      tableBody.innerHTML += row;
    });
  }

  renderTable(pegawaiData);

  // Event dropdown keluarga
  tableBody.addEventListener("change", function (e) {
    if (e.target.classList.contains("keluarga-select")) {
      const nip = e.target.dataset.nip;
      const keluargaIndex = e.target.value;
      if (keluargaIndex === "") return;

      const selectedPegawai = pegawaiData.find(p => p.nip === nip);
      if (!selectedPegawai) return;

      const selectedKeluarga = selectedPegawai.keluarga[keluargaIndex];

      alert(
        `Hubungan: ${selectedKeluarga.role}\n` +
        `Nama: ${selectedKeluarga.nama}\n` +
        `Tanggal Lahir: ${selectedKeluarga.tanggal_lahir}\n` +
        `Jenis Kelamin: ${selectedKeluarga.jenis_kelamin}\n` +
        `Pekerjaan: ${selectedKeluarga.pekerjaan}\n` +
        `Status Tanggungan: ${selectedKeluarga.tanggungan}`
      );
    }
  });

  // Search filter
  searchInput.addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();

    const filtered = pegawaiData.filter(p =>
      p.nama.toLowerCase().includes(keyword) ||
      (p.golongan && p.golongan.toLowerCase().includes(keyword)) ||
      (p.jabatan && p.jabatan.toLowerCase().includes(keyword))
    );

    renderTable(filtered);
  });
});
