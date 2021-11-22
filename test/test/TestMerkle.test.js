const Web3 = require("web3");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const data = require("./data.json");
const TestMerkle = artifacts.require("TestMerkle");

const web3 = new Web3("http://localhost:8545");

const SALT = 13662469;
const CHAIN_ID = 1;

function hash(account, amount) {
  const values = [
    { type: "address", value: account },
    { type: "uint256", value: amount },
    { type: "uint256", value: SALT },
    { type: "uint256", value: CHAIN_ID },
  ];

  const digest = web3.utils.soliditySha3(...values);
  return digest;
}

contract("TestMerkle", (accounts) => {
  let contract;
  before(async () => {
    contract = await TestMerkle.new();
  });

  it("should create correct message hash", async () => {
    // check web3 generates digest = solidity digest
    const account = "0x88C3AdCa695A935699356250d54eB0d3E0c1a206";
    const amount = "174809497844176753438";
    const digest = hash(account, amount);

    const d = await contract.getMessageHash(account, amount, SALT, CHAIN_ID);

    assert.equal(d, digest);
  });

  it("should verify merkle proofs", async () => {
    // build merkle tree
    const leaves = [];
    for (const [account, amount] of Object.entries(data)) {
      if (amount != "0") {
        const digest = hash(account, amount);
        assert(digest, `empty digest`);

        leaves.push(digest);
      }
    }

    console.log(`leaves: ${leaves.length}`);

    const tree = new MerkleTree(leaves, keccak256, {
      hashLeaves: false,
      sortPairs: true,
    });

    // verify merkle proof
    const root = tree.getHexRoot();

    for (const [account, amount] of Object.entries(data)) {
      if (amount != "0") {
        console.log(`verifying ${account} ${amount}`);

        const leaf = hash(account, amount);
        const proof = tree.getHexProof(leaf);

        const valid = await contract.verify(
          root,
          proof,
          leaf,
          account,
          amount,
          SALT,
          CHAIN_ID
        );
        assert.equal(valid, true);
      }
    }
  });
});
