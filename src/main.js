const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const filePath = path.join(__dirname, "../../data", "pegawai.json");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "pages", "index.html"));
}

app.whenReady().then(createWindow);


/* =========================
   SAVE PEGAWAI
========================= */

ipcMain.handle("save-pegawai", async (event, formData) => {
  try {
    let data = [];

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath));
    }

    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const newPegawai = {
      nama: formData.nama,
      nip: formData.nip,
      tempat_lahir: formData.tempat_lahir,
      tanggal_lahir: formData.tanggal_lahir,
      golongan: formData.golongan,
      tmt_golongan: formData.tmt_golongan,
      jabatan: formData.jabatan,
      tmt_jabatan: formData.tmt_jabatan,
      jenis_kelamin: formData.jenis_kelamin,
      masa_kerja: formData.masa_kerja,
      diklat: formData.diklat,
      ijazah: formData.ijazah,
      password: hashedPassword,
      role: formData.role
    };

    data.push(newPegawai);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { success: true };

  } catch (error) {
    return { success: false, message: error.message };
  }
});


/* =========================
   LOGIN
========================= */

ipcMain.handle("login", async (event, { nip, password }) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false };
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    const user = data.find(p => p.nip === nip);

    if (!user) return { success: false };

    const match = await bcrypt.compare(password, user.password);

    if (!match) return { success: false };

    return { success: true, role: user.role };

  } catch (error) {
    return { success: false };
  }
});
