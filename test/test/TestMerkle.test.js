const Web3 = require("web3");
const TestMerkle = artifacts.require("TestMerkle");

const web3 = new Web3("http://localhost:9545");

const CONVERTER = "0x49CD0e2C632FBb9765520798a93272BeB44278bC";
const CHAIN_ID = 1;

function hash(account, amount) {
  const values = [
    { type: "address", value: account },
    { type: "uint256", value: amount },
    { type: "address", value: CONVERTER },
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

    const d = await contract.getMessageHash(
      account,
      amount,
      CONVERTER,
      CHAIN_ID
    );

    assert.equal(d, digest);
  });
});
