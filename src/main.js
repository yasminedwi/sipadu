// src/main.js
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Paths
const pegawaiFile = path.join(__dirname, "data", "pegawai.json");
const keluargaFile = path.join(__dirname, "data", "keluarga.json");
const profilePicsDir = path.join(__dirname, "data", "profile_pics");

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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "renderer", "pages", "index.html"));
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

if (!fs.existsSync(profilePicsDir)) fs.mkdirSync(profilePicsDir, { recursive: true });

/* =========================
   PEGAWAI CRUD
========================= */
ipcMain.handle("save-pegawai", async (event, formData) => {
  try {
    let data = readJSON(pegawaiFile);

    // Password wajib, tapi boleh kosong
    let hashedPassword = null;
    if (formData.password && formData.password.trim() !== "") {
      hashedPassword = await bcrypt.hash(formData.password, 10);
    }

    const newPegawai = {
      ...formData,
      password: hashedPassword,
      foto: null
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

    // Handle photo
    if (dataInput.fileBuffer && dataInput.fileName) {
      if (user.foto) {
        const oldPhoto = path.join(profilePicsDir, user.foto);
        if (fs.existsSync(oldPhoto)) fs.unlinkSync(oldPhoto);
      }

      const ext = path.extname(dataInput.fileName);
      const newFileName = dataInput.nip + "_" + Date.now() + ext;
      fs.writeFileSync(path.join(profilePicsDir, newFileName), Buffer.from(dataInput.fileBuffer));
      user.foto = newFileName;
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

    const user = data[index];
    if (user.foto) {
      const photoPath = path.join(profilePicsDir, user.foto);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

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
