const { Keypair, Horizon, rpc, TransactionBuilder, Operation, Address, Asset, Contract, nativeToScVal } = require('@stellar/stellar-sdk');

async function main() {
  const rpcServer = new rpc.Server('https://soroban-testnet.stellar.org');
  console.log(typeof rpcServer.prepareTransaction);
  console.log(typeof rpcServer.sendTransaction);
  console.log(typeof Contract);
}
main();
