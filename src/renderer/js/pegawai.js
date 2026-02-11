document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#pegawaiTable tbody");
  const searchInput = document.getElementById("searchInput");

  const path = require("path");
  const fs = require("fs");

  const filePath = path.join(__dirname, "../../data/pegawai.json");
  const rawData = fs.readFileSync(filePath);
  let pegawaiData = JSON.parse(rawData);

  const today = new Date();

  // Calculate next TMT properly
  pegawaiData.forEach(p => {
        const [year, month, day] = p.tmt_golongan.split("-").map(Number);
        let tmtDate = new Date(year, month - 1, day); // LOCAL time

    // Calculate number of 2-year jumps needed
    let diffYears = today.getFullYear() - tmtDate.getFullYear();
    if (
      today.getMonth() > tmtDate.getMonth() ||
      (today.getMonth() === tmtDate.getMonth() && today.getDate() > tmtDate.getDate())
    ) {
      diffYears += 1; // if past month/day, add 1
    }
    const jumps = Math.ceil(diffYears / 2);
    tmtDate.setFullYear(tmtDate.getFullYear() + jumps * 2);

    p.next_tmt = new Date(tmtDate);
  });

  // Sort by closest upcoming deadline
  pegawaiData.sort((a, b) => a.next_tmt - b.next_tmt);

  // Helper: days until next TMT
  function getDaysUntil(date) {
    const now = new Date();
    const diffTime = date - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Render table with color-coded rows
  function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach((pegawai, index) => {
      const daysLeft = getDaysUntil(pegawai.next_tmt);
      let rowColor = "";

      if (daysLeft <= 14) {
        rowColor = "background-color: #ff6a6a;";
      } else if (daysLeft <= 30) {
        rowColor = "background-color: yellow;";
      } else if (daysLeft <= 60) {
        rowColor = "background-color: lightgreen;";
      }

      const row = `
        <tr style="${rowColor}">
          <td>${index + 1}</td>
          <td>${pegawai.nama}</td>
          <td>${pegawai.golongan}</td>
          <td>${formatDate(pegawai.next_tmt)}</td>
          <td>${pegawai.jabatan}</td>
          <td>${pegawai.jenis_kelamin}</td>
          <td><button>></button></td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  }

  renderTable(pegawaiData);

  // Search filter
  searchInput.addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();

    const filtered = pegawaiData.filter(p =>
      p.nama.toLowerCase().includes(keyword) ||
      p.golongan.toLowerCase().includes(keyword) ||
      p.jabatan.toLowerCase().includes(keyword)
    );

    renderTable(filtered);
  });
});
