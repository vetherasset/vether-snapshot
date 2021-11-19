const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const Web3 = require("web3");
const IERC20 = require("./IERC20.json");
const { writeFile } = fs.promises;
const { read, sleep } = require("./lib");

const RATE_LIMIT = 100;
const SLEEP = 10 * 1000;

const accounts = new Set();
const snapshot = {};

async function main() {
  const config = JSON.parse(await read(path.join(__dirname, "../config.json")));

  const web3 = new Web3(config.provider);
  const contract = new web3.eth.Contract(IERC20, config.address);

  const parser = fs
    .createReadStream(path.join(__dirname, "../logs.csv"))
    .pipe(parse({ delimiter: "," }));

  for await (const row of parser) {
    const [from, to, amount] = row;
    accounts.add(from);
    accounts.add(to);
  }

  let i = 0;
  for (const account of accounts) {
    if (i > 0 && i % RATE_LIMIT == 0) {
      console.log(`--- ${i} / ${accounts.size} processed ---`);
      await sleep(SLEEP);
    }

    const bal = await contract.methods.balanceOf(account).call();
    // if (bal != "0") {
    //   snapshot[account] = bal;
    // }
    snapshot[account] = bal;
    console.log(account, bal);
    i++;
  }

  await writeFile(
    path.join(__dirname, "../snapshot.json"),
    JSON.stringify(snapshot, null, 2)
  );
  console.log("snapshot saved to snapshot.json");
}

main();
