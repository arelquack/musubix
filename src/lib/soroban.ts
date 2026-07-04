import { Networks, rpc } from '@stellar/stellar-sdk';

export const ESCROW_CONTRACT_ID = 'CC636WXXFDVRA33VMOR3GT2DIKLRPDSKCTLEKILJI3JP3P5ZWYQ2C4FI';
export const TESTNET_NETWORK_PASSPHRASE = Networks.TESTNET;
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const TESTNET_NATIVE_TOKEN = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

export const server = new rpc.Server(SOROBAN_RPC_URL);
