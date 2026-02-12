// src/main.js
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Paths
const pegawaiFile = path.join(__dirname, "data", "pegawai.json");
const keluargaFile = path.join(__dirname, "data", "keluarga.json");

/* =========================
   CREATE WINDOW
========================= */
function createWindow() {
const { width, height } = screen.getPrimaryDisplay().workAreaSize;

const win = new BrowserWindow({
width,
height,
resizable: false,
maximizable: false,
title: "SIPADU",
webPreferences: {
nodeIntegration: true,
contextIsolation: false
}
});

win.setMenuBarVisibility(false);
win.loadFile(path.join(__dirname, "renderer", "pages", "index.html"));

win.webContents.on("did-finish-load", () => {
win.setTitle("SIPADU");
});
}

app.whenReady().then(createWindow);

/* =========================
   UTILS
========================= */
function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* =========================
   PEGAWAI CRUD
========================= */
ipcMain.handle("save-pegawai", async (event, formData) => {
  try {
    let data = readJSON(pegawaiFile);

    let hashedPassword = null;
    if (formData.password && formData.password.trim() !== "") {
      hashedPassword = await bcrypt.hash(formData.password, 10);
    }

    const newPegawai = {
      ...formData,
      password: hashedPassword
    };

    data.push(newPegawai);
    writeJSON(pegawaiFile, data);

    return { success: true };
  } catch (err) {
    console.error("SAVE PEGAWAI ERROR:", err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle("get-user", async (event, nip) => {
  try {
    const data = readJSON(pegawaiFile);
    const user = data.find(p => String(p.nip) === String(nip));
    if (!user) return { success: false };
    return { success: true, user };
  } catch (err) {
    console.error("GET USER ERROR:", err);
    return { success: false };
  }
});

ipcMain.handle("update-user", async (event, dataInput) => {
  try {
    const data = readJSON(pegawaiFile);
    const user = data.find(p => String(p.nip) === String(dataInput.oldNip));
    if (!user) return { success: false };

    // Update fields
    Object.assign(user, {
      nama: dataInput.nama,
      nip: dataInput.nip,
      tempat_lahir: dataInput.tempat_lahir,
      tanggal_lahir: dataInput.tanggal_lahir,
      golongan: dataInput.golongan,
      tmt_golongan: dataInput.tmt_golongan,
      jabatan: dataInput.jabatan,
      tmt_jabatan: dataInput.tmt_jabatan,
      jenis_kelamin: dataInput.jenis_kelamin,
      masa_kerja: dataInput.masa_kerja,
      diklat: dataInput.diklat,
      ijazah: dataInput.ijazah,
      role: dataInput.role
    });

    // Optional password update
    if (dataInput.password && dataInput.password.trim() !== "") {
      user.password = await bcrypt.hash(dataInput.password, 10);
    }

    writeJSON(pegawaiFile, data);
    return { success: true };
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    return { success: false };
  }
});

ipcMain.handle("delete-user", async (event, nip) => {
  try {
    const data = readJSON(pegawaiFile);
    const index = data.findIndex(p => String(p.nip) === String(nip));
    if (index === -1) return { success: false, error: "User tidak ditemukan" };

    data.splice(index, 1);
    writeJSON(pegawaiFile, data);
    return { success: true };
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    return { success: false, error: err.message };
  }
});

/* =========================
   LOGIN
========================= */
ipcMain.handle("login", async (event, { nip, password }) => {
  try {
    const data = readJSON(pegawaiFile);
    const user = data.find(p => String(p.nip) === String(nip));
    if (!user) return { success: false };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { success: false };

    return { success: true, role: user.role };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return { success: false };
  }
});

/* =========================
   KELUARGA CRUD
========================= */
ipcMain.handle("save-keluarga", async (event, formData) => {
  try {
    if (!formData.nip) return { success: false, message: "NIP pegawai tidak ditemukan" };

    let data = readJSON(keluargaFile);

    const newKeluarga = {
      ...formData,
      id: Date.now() // id unik
    };

    data.push(newKeluarga);
    writeJSON(keluargaFile, data);

    return { success: true };
  } catch (err) {
    console.error("SAVE KELUARGA ERROR:", err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle("get-keluarga", async (event, nip) => {
  try {
    const data = readJSON(keluargaFile);
    const keluarga = data.filter(k => String(k.nip) === String(nip));
    return { success: true, keluarga };
  } catch (err) {
    console.error("GET KELUARGA ERROR:", err);
    return { success: false };
  }
});

ipcMain.handle("delete-family-member", async (event, id) => {
  try {
    let data = readJSON(keluargaFile);
    const index = data.findIndex(k => String(k.id) === String(id));
    if (index === -1) return { success: false, message: "Anggota keluarga tidak ditemukan" };

    data.splice(index, 1);
    writeJSON(keluargaFile, data);

    return { success: true };
  } catch (err) {
    console.error("DELETE FAMILY MEMBER ERROR:", err);
    return { success: false, message: err.message };
  }
});

ipcMain.handle("get-keluarga-by-id", async (event, id) => {
  try {
    const data = readJSON(keluargaFile);
    const member = data.find(k => String(k.id) === String(id));
    if (!member) return { success: false };
    return { success: true, member };
  } catch (err) {
    console.error("GET KELUARGA BY ID ERROR:", err);
    return { success: false };
  }
});

ipcMain.handle("update-family-member", async (event, formData) => {
  try {
    const data = readJSON(keluargaFile);
    const member = data.find(k => String(k.id) === String(formData.id));
    if (!member) return { success: false, message: "Member tidak ditemukan" };

    // update fields
    Object.assign(member, {
      role: formData.role,
      nama: formData.nama,
      tanggal_lahir: formData.tanggal_lahir,
      jenis_kelamin: formData.jenis_kelamin,
      pekerjaan: formData.pekerjaan,
      tanggungan: formData.tanggungan
    });

    writeJSON(keluargaFile, data);
    return { success: true, nip: member.nip };
  } catch (err) {
    console.error("UPDATE FAMILY MEMBER ERROR:", err);
    return { success: false, message: err.message };
  }
});
