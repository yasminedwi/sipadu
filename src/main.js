const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");


  function createWindow() {

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const win = new BrowserWindow({
      width: width,
      height: height,
      resizable: false,     // kalau mau tidak bisa diubah ukurannya
      maximizable: false,   // tidak bisa maximize lagi
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    win.setMenuBarVisibility(false);

    win.loadFile(path.join(__dirname, "renderer", "pages", "index.html"));
  }

app.whenReady().then(createWindow);



  app.whenReady().then(createWindow);

  ipcMain.handle("get-photo-base64", async (event, fileName) => {
    try {
      if (!fileName) return null;

      const picPath = path.join(__dirname, "data", "profile_pics", fileName);

      if (!fs.existsSync(picPath)) return null;

      const fileData = fs.readFileSync(picPath);
      const ext = path.extname(picPath).substring(1);

      return `data:image/${ext};base64,${fileData.toString("base64")}`;

    } catch (err) {
      console.error(err);
      return null;
    }
  });

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
      console.log("FOTO TERSIMPAN:", newPegawai.foto);

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

      const user = data.find(p => String(p.nip) === String(nip));

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

      const user = data.find(p => String(p.nip) === String(nip));

      if (!user) return { success: false };

      return { success: true, user };

    } catch (error) {
      console.error(error);
      return { success: false };
    }
  });

  ipcMain.handle("get-photo-path", async (event, fileName) => {
    const picDir = path.join(__dirname, "data", "profile_pics");
    return path.join(picDir, fileName);
  });

  // UPDATE USER
  ipcMain.handle("update-user", async (event, { oldNip, newNip, nama, password, fileBuffer, fileName }) => {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const user = data.find(p => String(p.nip) === String(oldNip));
      if (!user) return { success: false };

      const picDir = path.join(__dirname, "data", "profile_pics");

      if (!fs.existsSync(picDir)) {
        fs.mkdirSync(picDir, { recursive: true });
      }

      // UPDATE BASIC
      user.nama = nama;
      user.nip = newNip;

      // UPDATE PASSWORD
      if (password && password.trim() !== "") {
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
      }

      // =============================
      // HANDLE FOTO (BUFFER VERSION)
      // =============================
      if (fileBuffer && fileName) {

        // hapus foto lama
        if (user.foto) {
          const oldPhotoPath = path.join(picDir, user.foto);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }

        const ext = path.extname(fileName);
        const newFileName = newNip + "_" + Date.now() + ext;
        const newPath = path.join(picDir, newFileName);

        fs.writeFileSync(newPath, Buffer.from(fileBuffer));

        user.foto = newFileName;
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      return { success: true };

    } catch (error) {
      console.error("UPDATE ERROR:", error);
      return { success: false };
    }
  });
