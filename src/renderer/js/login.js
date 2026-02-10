const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const filePath = path.join(__dirname, "../../data", "users.json");

function loadUsers() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

function login() {
  const nip = document.querySelector('input[name="nip"]').value;
  const password = document.querySelector('input[name="password"]').value;
  const errorBox = document.getElementById("error");

  const users = loadUsers();
  const user = users.find(u => u.nip === nip);

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
    JSON.stringify({ nip: user.nip, role: user.role })
  );

  if (user.role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    window.location.href = "user-read-dashboard.html";
  }
}

module.exports = { login };
