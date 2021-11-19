const fs = require("fs");
const { readFile } = fs.promises;

async function read(filePath) {
  const buff = await readFile(filePath);
  return buff.toString();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  read,
  sleep,
};
