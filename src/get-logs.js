const fs = require("fs");
const path = require("path");
const Web3 = require("web3");
const IERC20 = require("./IERC20.json");
const { read } = require("./lib");

const BATCH_SIZE = 1000;

async function main() {
  const writeStream = fs.createWriteStream(path.join(__dirname, "../logs.csv"));

  const config = JSON.parse(await read(path.join(__dirname, "../config.json")));
  console.log(config);

  const web3 = new Web3(config.provider);
  const contract = new web3.eth.Contract(IERC20, config.address);

  let fromBlock = config.fromBlock;
  while (fromBlock <= config.toBlock) {
    const toBlock = Math.min(fromBlock + BATCH_SIZE, config.toBlock);
    console.log(`--- blocks: ${fromBlock} - ${toBlock} ---`);

    const logs = await contract.getPastEvents("Transfer", {
      fromBlock: config.fromBlock,
      toBlock: config.toBlock,
    });

    for (const log of logs) {
      const { from, to, amount } = log.returnValues;
      console.log({
        from,
        to,
        amount,
      });
      writeStream.write(`${from},${to},${amount}\n`);
    }

    fromBlock += BATCH_SIZE + 1;
  }

  writeStream.end();

  console.log("logs saved to logs.csv");
}

main();
