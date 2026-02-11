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

    function getGolonganRank(gol) {
    if (!gol) return 0;

    const [romawi, huruf] = gol.split("/");

    const romawiMap = {
        "I": 1,
        "II": 2,
        "III": 3,
        "IV": 4
    };

    const hurufMap = {
        "a": 1,
        "b": 2,
        "c": 3,
        "d": 4,
        "e": 5
    };

    const romawiValue = romawiMap[romawi] || 0;
    const hurufValue = hurufMap[huruf] || 0;

    return romawiValue * 10 + hurufValue;
    }

    pegawaiData.sort((a, b) => {
    return getGolonganRank(b.golongan) - getGolonganRank(a.golongan);
    });

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

    function calculateAge(birthDate) {
    const [y, m, d] = birthDate.split("-").map(Number);
    const today = new Date();
    let age = today.getFullYear() - y;
    if (
        today.getMonth() + 1 < m ||
        (today.getMonth() + 1 === m && today.getDate() < d)
    ) {
        age--;
    }
    return age;
    }

    function renderTable(data) {
    tableBody.innerHTML = "";

    data.forEach((pegawai, index) => {

        const usia = pegawai.tanggal_lahir ? calculateAge(pegawai.tanggal_lahir) : "-";

        const row = `
        <tr>
            <td>${index + 1}</td>
            <td>
            <strong>${pegawai.nama}</strong><br>
            <small>${pegawai.nip}</small>
            </td>
            <td>
            ${pegawai.tempat_lahir || "-"}<br>
            ${pegawai.tanggal_lahir || "-"}
            </td>
            <td>${pegawai.golongan}</td>
            <td>${formatDate(pegawai.next_tmt)}</td>
            <td class="td2">${pegawai.jabatan || "-"}</td>
            <td>${pegawai.tmt_jabatan || "-"}</td>
            <td>${pegawai.masa_kerja || "-"}</td>
            <td>${pegawai.diklat || "-"}</td>
            <td>${pegawai.ijazah || "-"}</td>
            <td>${usia}</td>
            <td>${pegawai.jenis_kelamin}</td>
            <td>
              <button class="btn-edit" data-nip="${pegawai.nip}">
                >
              </button>
            </td>
        </tr>
        `;

        tableBody.innerHTML += row;
    });
    }
    renderTable(pegawaiData);

      document.addEventListener("click", function(e) {
      if (e.target.classList.contains("btn-edit")) {
        const nip = e.target.getAttribute("data-nip");

        // pindah ke halaman edit
        window.location.href = `admin-edit-data-pegawai.html?nip=${nip}`;
      }
    });

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