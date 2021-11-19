// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract TestMerkle {
    using MerkleProof for bytes32[];

    function getMessageHash(address account, uint amount, address _contract, uint chainId) public view returns (bytes32) {
      return keccak256(
          abi.encodePacked(
              account,
              amount,
              _contract,
              chainId
          )
      );
    }

    function verify(bytes32 root, bytes32[] calldata proof, bytes32 leaf) external returns (bool) {
      return proof.verify(root, leaf);
    }

    function getChainId() public view returns (uint chainId) {
      assembly {
        chainId := chainid()
      }
    }
}
