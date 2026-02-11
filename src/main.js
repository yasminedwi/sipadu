const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const filePath = path.join(__dirname, "data", "pegawai.json");

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
      role: formData.role,
      foto: null
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
    console.error("ERROR SAVE:", error);
    return { success: false, message: error.message };
  }
});
// GET USER
ipcMain.handle("get-user", async (event, nip) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const user = data.find(p => p.nip === oldNip);

    return { success: true, user };

  } catch (error) {
    console.error(error);
    return { success: false };
  }
});


// UPDATE USER
ipcMain.handle("update-user", async (event, { oldNip, nip, nama, password, filePath }) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const user = data.find(p => p.nip === oldNip);

    if (!user) return { success: false };

    // update nama
    user.nama = nama;

    // update password kalau diisi
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    // update foto kalau ada file baru
    if (newFile) {
      const picDir = path.join(__dirname, "data", "profile_pics");

      if (!fs.existsSync(picDir)) {
        fs.mkdirSync(picDir);
      }

      const ext = path.extname(newFile);
      const newFileName = nip + ext;
      const newPath = path.join(picDir, newFileName);

      fs.copyFileSync(newFile, newPath);

      user.foto = path.join("data", "profile_pics", newFileName);
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { success: true };

  } catch (error) {
    console.error(error);
    return { success: false };
  }
}
);