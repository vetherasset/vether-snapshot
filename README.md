# vether-snapshot

```shell
npm i
cd test && npm i

cp config.sample.json config.json

node src/get-logs.js
node src/snapshot.js
node src/merkle.js

# test
cp snapshot.json test/test/data.json
cd test
npx truffle test
```

### Snapshots

| chain | block height |
| ----- | ------------ |
| main  | 13662469     |
| kovan | 13639670     |
