const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "pegawai.json");

function savePegawai(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadPegawai() {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = { savePegawai, loadPegawai };
