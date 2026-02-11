const { ipcRenderer } = require("electron");

let originalNip = null;

document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const nip = params.get("nip");

  if (!nip) {
    alert("NIP tidak ditemukan!");
    return;
  }

  originalNip = nip;

  // 🔥 Ambil data lama
  const response = await ipcRenderer.invoke("get-user", nip);

  if (!response.success) {
    alert("Data pegawai tidak ditemukan!");
    return;
  }

  const user = response.user;

  // 🔥 Isi form dengan data lama
  document.querySelector('[name="nama"]').value = user.nama || "";
  document.querySelector('[name="nip"]').value = user.nip || "";
  document.querySelector('[name="tempat_lahir"]').value = user.tempat_lahir || "";
  document.querySelector('[name="tanggal_lahir"]').value = user.tanggal_lahir || "";
  document.querySelector('[name="golongan"]').value = user.golongan || "";
  document.querySelector('[name="tmt_golongan"]').value = user.tmt_golongan || "";
  document.querySelector('[name="jabatan"]').value = user.jabatan || "";
  document.querySelector('[name="tmt_jabatan"]').value = user.tmt_jabatan || "";
  document.querySelector('[name="jenis_kelamin"]').value = user.jenis_kelamin || "";
  document.querySelector('[name="masa_kerja"]').value = user.masa_kerja || "";
  document.querySelector('[name="diklat"]').value = user.diklat || "";
  document.querySelector('[name="ijazah"]').value = user.ijazah || "";
  document.querySelector('[name="role"]').value = user.role || "";

});

// 🔥 HANDLE HAPUS BUTTON
document.querySelector(".btn-hapus").addEventListener("click", async () => {
  if (!originalNip) return alert("NIP tidak tersedia!");

  const confirmed = confirm("Apakah Anda yakin ingin menghapus data ini?");
  if (!confirmed) return;

  const result = await ipcRenderer.invoke("delete-user", originalNip);

  if (result.success) {
    alert("Data berhasil dihapus!");
    window.location.href = "admin-page.html";
  } else {
    alert("Gagal menghapus data!");
  }
});

// 🔥 HANDLE EDIT KELUARGA BUTTON
document.querySelector(".btn-keluarga").addEventListener("click", () => {
  if (!originalNip) return alert("NIP tidak tersedia!");

  // Misal buka halaman edit keluarga dengan query param nip
  window.location.href = `edit-keluarga.html?nip=${originalNip}`;
});

// 🔥 HANDLE SUBMIT UPDATE
document.getElementById("pegawaiForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(e.target).entries());

  const result = await ipcRenderer.invoke("update-user", {
    oldNip: originalNip,
    ...formData
  });

  if (result.success) {
    alert("Data berhasil diupdate!");
    window.location.href = "admin-page.html";
  } else {
    alert("Gagal update data!");
  }
});
