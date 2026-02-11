const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const filePath = path.join(__dirname, "data", "pegawai.json");

/* =========================
   CREATE WINDOW
========================= */
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
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
   SAVE PEGAWAI
========================= */
ipcMain.handle("save-pegawai", async (event, formData) => {
  try {
    let data = [];

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const newPegawai = {
      ...formData,
      password: hashedPassword,
      foto: null
    };

    data.push(newPegawai);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { success: true };

  } catch (error) {
    console.error("SAVE ERROR:", error);
    return { success: false };
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

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const user = data.find(p => String(p.nip) === String(nip));
    if (!user) return { success: false };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { success: false };

    return { success: true, role: user.role };

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return { success: false };
  }
});


/* =========================
   GET USER (FOR EDIT PAGE)
========================= */
ipcMain.handle("get-user", async (event, nip) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false };
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const user = data.find(p => String(p.nip) === String(nip));
    if (!user) return { success: false };

    return { success: true, user };

  } catch (error) {
    console.error("GET USER ERROR:", error);
    return { success: false };
  }
});


/* =========================
   UPDATE USER
========================= */
ipcMain.handle("update-user", async (event, dataInput) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false };
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const user = data.find(p => String(p.nip) === String(dataInput.oldNip));
    if (!user) return { success: false };

    const picDir = path.join(__dirname, "data", "profile_pics");
    if (!fs.existsSync(picDir)) {
      fs.mkdirSync(picDir, { recursive: true });
    }

    // UPDATE FIELD
    user.nama = dataInput.nama;
    user.nip = dataInput.nip;
    user.tempat_lahir = dataInput.tempat_lahir;
    user.tanggal_lahir = dataInput.tanggal_lahir;
    user.golongan = dataInput.golongan;
    user.tmt_golongan = dataInput.tmt_golongan;
    user.jabatan = dataInput.jabatan;
    user.tmt_jabatan = dataInput.tmt_jabatan;
    user.jenis_kelamin = dataInput.jenis_kelamin;
    user.masa_kerja = dataInput.masa_kerja;
    user.diklat = dataInput.diklat;
    user.ijazah = dataInput.ijazah;
    user.role = dataInput.role;

    // UPDATE PASSWORD (optional)
    if (dataInput.password && dataInput.password.trim() !== "") {
      const hashed = await bcrypt.hash(dataInput.password, 10);
      user.password = hashed;
    }

    // HANDLE FOTO
    if (dataInput.fileBuffer && dataInput.fileName) {

      // hapus foto lama
      if (user.foto) {
        const oldPhotoPath = path.join(picDir, user.foto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      const ext = path.extname(dataInput.fileName);
      const newFileName = dataInput.nip + "_" + Date.now() + ext;
      const newPath = path.join(picDir, newFileName);

      fs.writeFileSync(newPath, Buffer.from(dataInput.fileBuffer));

      user.foto = newFileName;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return { success: true };

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return { success: false };
  }
});
