const fs = require("fs");

function savePegawai(data) {
  fs.writeFileSync("pegawai.json", JSON.stringify(data, null, 2));
}

module.exports = { savePegawai };
