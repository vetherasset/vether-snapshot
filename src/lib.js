const fs = require("fs");
const { readFile } = fs.promises;

async function read(filePath) {
  const buff = await readFile(filePath);
  return buff.toString();
}

module.exports = {
  read,
};
