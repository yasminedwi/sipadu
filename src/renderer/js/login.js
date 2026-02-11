const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const filePath = path.join(__dirname, "../../data", "pegawai.json"); 
// Adjust path if needed

function loadUsers() {
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("Error reading pegawai.json:", err);
    return [];
  }
}

function login() {
  const nip = document.getElementById("nip").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  const users = loadUsers();

  const user = users.find(u => String(u.nip) === nip);

  if (!user) {
    errorBox.innerText = "NIP atau password salah";
    return;
  }

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid) {
    errorBox.innerText = "NIP atau password salah";
    return;
  }

  localStorage.setItem(
    "loginUser",
    JSON.stringify({
      nip: user.nip,
      role: user.role
    })
  );

  window.location.href = "all-read-dashboard.html";
}

module.exports = { login };
