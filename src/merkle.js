const assert = require("assert");
const path = require("path");
const Web3 = require("web3");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { read } = require("./lib");

const SALT = {
  // using block height for salt
  1: 13662469,
  42: 28516565,
};

async function main() {
  const config = JSON.parse(await read(path.join(__dirname, "../config.json")));
  const data = JSON.parse(await read(path.join(__dirname, "../snapshot.json")));

  const web3 = new Web3(config.provider);
  const chainId = await web3.eth.net.getId();

  const salt = SALT[chainId];
  assert(salt, "salt undefined");

  const leaves = [];
  for (const [account, amount] of Object.entries(data)) {
    if (amount != "0") {
      const values = [
        { type: "address", value: account },
        { type: "uint256", value: amount },
        { type: "uint256", value: salt },
        { type: "uint256", value: chainId },
      ];

      const digest = web3.utils.soliditySha3(...values);
      assert(digest, `empty digest`);

      leaves.push(digest);
    }
  }

  const tree = new MerkleTree(leaves, keccak256, {
    hashLeaves: false,
    sortPairs: true,
  });

  // console.log(tree.toString());

  console.log(`--- merkle root ---`);
  const root = tree.getHexRoot();
  console.log(root);
}

main();
