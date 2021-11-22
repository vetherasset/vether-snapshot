const assert = require("assert");
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

  const web3 = new Web3(config.fork);
  const contract = new web3.eth.Contract(IERC20, config.address);

  function bn(str) {
    return web3.utils.toBN(str);
  }

  const block = await web3.eth.getBlock("latest");
  console.log(`block: ${block.number}`);
  // block.number == forked block + 1
  // current block mined 0 transaction so state of current block is same
  // as state at forked block
  assert(block.number == config.toBlock + 1, "forked block != snapshot block");

  const parser = fs
    .createReadStream(path.join(__dirname, "../logs.csv"))
    .pipe(parse({ delimiter: "," }));

  for await (const row of parser) {
    const [block, from, to, amount] = row;
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
    snapshot[account] = bal;
    console.log(account, bal);
    i++;
  }

  await writeFile(
    path.join(__dirname, "../snapshot.json"),
    JSON.stringify(snapshot, null, 2)
  );
  console.log("snapshot saved to snapshot.json");

  const total = bn(await contract.methods.totalSupply().call());
  let sum = bn("0");
  for (const bal of Object.values(snapshot)) {
    sum = sum.add(bn(bal));
  }

  console.log(`total: ${total.toString()}, sum: ${sum.toString()}`);
  assert(total.eq(sum));
}

main();
