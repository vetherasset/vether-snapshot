# vether-snapshot

```shell
npm i

cp config.sample.json config.json

cd test && npm i
```

### 1. Get logs

```shell
node src/get-logs.js
```

### 2. Create snapshot

```shell
# set web3 provider Alchemy
WEB3_PROVIDER=https://eth-mainnet.alchemyapi.io/v2/<api key here>
# set block height of snapshot
BLOCK=13662469

# run ganache
npx ganache-cli --fork $WEB3_PROVIDER@$BLOCK

node src/snapshot.js
```

### 3. Compute Merkle root

```shell
node src/merkle.js
```

### 4. Test

```shell
cp snapshot.json test/test/data.json
cd test
npx truffle test
```

### Snapshots

| chain | block height | contract                                   | merkle root                                                        |
| ----- | ------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| main  | 13662469     | 0x4Ba6dDd7b89ed838FEd25d208D4f644106E34279 | 0x93bc4275f0e850574c848d04f1a8edbb63a1d961524541e618d28f31b2c6684d |
| kovan | 28516565     | 0x87D96b9f386d70C72fD7DBcE5a3d2a7D3321446d | 0x076beee425cd687f1c68f81585d9cd19398b7e80cdcc48465c175e959946fdcd |
