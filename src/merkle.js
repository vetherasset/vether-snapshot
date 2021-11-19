const assert = require("assert");
const path = require("path");
const Web3 = require("web3");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { read } = require("./lib");

const CONVERTER = {
  // TODO: mainnet converter address
  1: "0x49CD0e2C632FBb9765520798a93272BeB44278bC",
  42: "0x49CD0e2C632FBb9765520798a93272BeB44278bC",
};

// TODO: test message hash with contract
// TODO: test merkle proof with contract

async function main() {
  const config = JSON.parse(await read(path.join(__dirname, "../config.json")));
  const data = JSON.parse(await read(path.join(__dirname, "../snapshot.json")));

  const web3 = new Web3(config.provider);
  const chainId = await web3.eth.net.getId();

  const converter = CONVERTER[chainId];
  assert(converter, "Converter undefined");

  const leaves = [];
  for (const [account, amount] of Object.entries(data)) {
    if (amount != "0") {
      const values = [
        { type: "address", value: account },
        { type: "uint256", value: amount },
        { type: "address", value: converter },
        { type: "uint256", value: chainId },
      ];

      const digest = web3.utils.soliditySha3(...values);
      assert(digest, `empty digest`);

      leaves.push(digest);
    }
  }

  const tree = new MerkleTree(leaves, (buff) => {
    // buff = left + right leaves
    // const digest = web3.utils.soliditySha3({
    //   type: "bytes",
    //   value: `0x${buff.toString("hex")}`,
    // });

    const digest = keccak256(buff);
    assert(digest, `empty digest`);

    return digest;
  });

  // console.log(tree.toString());

  console.log(`--- merkle root ---`);
  const root = tree.getHexRoot();
  console.log(`0x${root}`);
}

main();
