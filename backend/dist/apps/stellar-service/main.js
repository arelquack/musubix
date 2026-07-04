/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StellarServiceModule = void 0;
const common_1 = __webpack_require__(3);
const stellar_service_controller_1 = __webpack_require__(4);
const stellar_service_service_1 = __webpack_require__(5);
let StellarServiceModule = class StellarServiceModule {
};
exports.StellarServiceModule = StellarServiceModule;
exports.StellarServiceModule = StellarServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [stellar_service_controller_1.StellarServiceController],
        providers: [stellar_service_service_1.StellarServiceService],
    })
], StellarServiceModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StellarServiceController = void 0;
const common_1 = __webpack_require__(3);
const stellar_service_service_1 = __webpack_require__(5);
let StellarServiceController = class StellarServiceController {
    stellarServiceService;
    constructor(stellarServiceService) {
        this.stellarServiceService = stellarServiceService;
    }
};
exports.StellarServiceController = StellarServiceController;
exports.StellarServiceController = StellarServiceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof stellar_service_service_1.StellarServiceService !== "undefined" && stellar_service_service_1.StellarServiceService) === "function" ? _a : Object])
], StellarServiceController);


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StellarServiceService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StellarServiceService = void 0;
const common_1 = __webpack_require__(3);
const stellar_sdk_1 = __webpack_require__(6);
let StellarServiceService = StellarServiceService_1 = class StellarServiceService {
    logger = new common_1.Logger(StellarServiceService_1.name);
    horizonServer;
    rpcServer;
    networkPassphrase = 'Test SDF Network ; September 2015';
    escrowWasmHash = '6a8b7fe6ac6c89c40d57152f15af7fceef3cf86f9f78eecb5e1fa88912d420e5';
    treasuryPubKey = null;
    constructor() {
        this.horizonServer = new stellar_sdk_1.Horizon.Server('https://horizon-testnet.stellar.org');
        this.rpcServer = new stellar_sdk_1.rpc.Server('https://soroban-testnet.stellar.org');
        this.logger.log('Connected to Stellar Testnet (Horizon & RPC)');
    }
    async onModuleInit() {
        await this.setupGlobalTreasury();
    }
    async setupGlobalTreasury() {
        if (this.treasuryPubKey)
            return;
        try {
            this.logger.log('\n--- SETTING UP GLOBAL TREASURY FOR IDR DEX LIQUIDITY ---');
            let xlmToIdrRate = 3804;
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=idr');
                const data = await response.json();
                if (data?.stellar?.idr) {
                    xlmToIdrRate = Math.round(data.stellar.idr);
                    this.logger.log(`Fetched Live Rate: 1 XLM = ${xlmToIdrRate} IDR`);
                }
            }
            catch (e) {
                this.logger.error('Failed to fetch live rate, using fallback', e);
            }
            let treasury;
            const fs = __webpack_require__(7);
            const path = __webpack_require__(8);
            const treasuryFile = path.join(process.cwd(), 'treasury.json');
            if (fs.existsSync(treasuryFile)) {
                treasury = JSON.parse(fs.readFileSync(treasuryFile, 'utf8'));
                this.logger.log(`Loaded existing Treasury from ${treasuryFile}`);
            }
            else {
                treasury = await this.generateAndFundWallet();
                fs.writeFileSync(treasuryFile, JSON.stringify(treasury, null, 2));
                this.logger.log(`Saved new Treasury to ${treasuryFile}`);
            }
            this.treasuryPubKey = treasury.publicKey;
            const treasuryKeypair = stellar_sdk_1.Keypair.fromSecret(treasury.secretKey);
            const idrAsset = new stellar_sdk_1.Asset('IDR', treasury.publicKey);
            this.logger.log(`Defined custom asset: IDR (Issuer: ${treasury.publicKey})`);
            const treasuryAccount = await this.horizonServer.loadAccount(treasuryKeypair.publicKey());
            const manageSellOfferTx = new stellar_sdk_1.TransactionBuilder(treasuryAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(stellar_sdk_1.Operation.manageSellOffer({
                selling: idrAsset,
                buying: stellar_sdk_1.Asset.native(),
                amount: '100000000',
                price: { n: 1, d: xlmToIdrRate },
            }))
                .setTimeout(30)
                .build();
            manageSellOfferTx.sign(treasuryKeypair);
            await this.horizonServer.submitTransaction(manageSellOfferTx);
            this.logger.log(`DEX Liquidity Provided! Treasury is now selling IDR at 1 XLM = ${xlmToIdrRate} IDR on Testnet DEX.`);
        }
        catch (e) {
            this.logger.error('Failed to setup Treasury', e);
        }
    }
    getTreasuryPubKey() {
        return this.treasuryPubKey || '';
    }
    async generateAndFundWallet() {
        try {
            const keypair = stellar_sdk_1.Keypair.random();
            const publicKey = keypair.publicKey();
            const secretKey = keypair.secret();
            this.logger.log(`Generated new wallet: ${publicKey}. Funding via Friendbot...`);
            const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
            if (!response.ok) {
                throw new Error(`Friendbot failed with status ${response.status}`);
            }
            this.logger.log(`Wallet ${publicKey} successfully funded with test XLM!`);
            return { publicKey, secretKey };
        }
        catch (error) {
            this.logger.error('Failed to generate and fund Stellar wallet', error);
            throw new Error('Wallet generation and funding failed');
        }
    }
    async submitSorobanTransaction(tx, keypair) {
        const preparedTx = await this.rpcServer.prepareTransaction(tx);
        preparedTx.sign(keypair);
        let sendResult = await this.rpcServer.sendTransaction(preparedTx);
        if (sendResult.status === 'ERROR') {
            throw new Error(`Submit failed: ${JSON.stringify(sendResult)}`);
        }
        let getTxResult;
        let status = 'NOT_FOUND';
        while (status === 'NOT_FOUND') {
            await new Promise(r => setTimeout(r, 2000));
            getTxResult = await this.rpcServer.getTransaction(sendResult.hash);
            status = getTxResult.status;
        }
        if (status === 'SUCCESS') {
            return getTxResult;
        }
        else {
            throw new Error(`Transaction failed: ${JSON.stringify(getTxResult)}`);
        }
    }
    async deployEscrowInstance(deployerSecret) {
        try {
            this.logger.log(`\n--- DEPLOYING NEW ESCROW INSTANCE ---`);
            const deployerKeypair = stellar_sdk_1.Keypair.fromSecret(deployerSecret);
            const deployerAccount = await this.horizonServer.loadAccount(deployerKeypair.publicKey());
            const tx = new stellar_sdk_1.TransactionBuilder(deployerAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(stellar_sdk_1.Operation.createCustomContract({
                address: stellar_sdk_1.Address.fromString(deployerKeypair.publicKey()),
                wasmHash: Buffer.from(this.escrowWasmHash, 'hex')
            }))
                .setTimeout(30)
                .build();
            const getTxResult = await this.submitSorobanTransaction(tx, deployerKeypair);
            const contractAddress = stellar_sdk_1.Address.fromScVal(getTxResult.returnValue).toString();
            this.logger.log(`Success! New Escrow Contract ID: ${contractAddress}`);
            return contractAddress;
        }
        catch (error) {
            this.logger.error('Failed to deploy escrow instance', error);
            throw error;
        }
    }
    async initializeEscrow(contractId, clientSecret, freelancerPubKey, amountStr) {
        try {
            this.logger.log(`\n--- INITIALIZING ESCROW ---`);
            const clientKeypair = stellar_sdk_1.Keypair.fromSecret(clientSecret);
            let clientAccount = await this.horizonServer.loadAccount(clientKeypair.publicKey());
            const contract = new stellar_sdk_1.Contract(contractId);
            const amountNative = Math.floor(parseFloat(amountStr) * 10000000);
            const initOp = contract.call('initialize', (0, stellar_sdk_1.nativeToScVal)(clientKeypair.publicKey(), { type: 'address' }), (0, stellar_sdk_1.nativeToScVal)(freelancerPubKey, { type: 'address' }), (0, stellar_sdk_1.nativeToScVal)(amountNative, { type: 'i128' }));
            const txInit = new stellar_sdk_1.TransactionBuilder(clientAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(initOp)
                .setTimeout(30)
                .build();
            this.logger.log('Submitting initialize transaction...');
            await this.submitSorobanTransaction(txInit, clientKeypair);
            this.logger.log(`Success! Escrow initialized with ${amountStr} XLM`);
        }
        catch (error) {
            this.logger.error('Failed to initialize escrow', error);
            throw error;
        }
    }
    async releaseEscrow(contractId, clientSecret) {
        try {
            this.logger.log(`\n--- RELEASING ESCROW TO FREELANCER ---`);
            const clientKeypair = stellar_sdk_1.Keypair.fromSecret(clientSecret);
            const clientAccount = await this.horizonServer.loadAccount(clientKeypair.publicKey());
            const contract = new stellar_sdk_1.Contract(contractId);
            const approveOp = contract.call('approve_and_pay', (0, stellar_sdk_1.nativeToScVal)('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', { type: 'address' }));
            const tx = new stellar_sdk_1.TransactionBuilder(clientAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(approveOp)
                .setTimeout(30)
                .build();
            await this.submitSorobanTransaction(tx, clientKeypair);
            this.logger.log(`Success! Escrow released!`);
        }
        catch (error) {
            this.logger.error('Failed to release escrow', error);
            throw error;
        }
    }
    async executePayout(senderSecret, receiverPublicKey, amount) {
        try {
            this.logger.log(`Executing payout of ${amount} XLM to ${receiverPublicKey}...`);
            const senderKeypair = stellar_sdk_1.Keypair.fromSecret(senderSecret);
            const senderAccount = await this.horizonServer.loadAccount(senderKeypair.publicKey());
            const transaction = new stellar_sdk_1.TransactionBuilder(senderAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(stellar_sdk_1.Operation.payment({
                destination: receiverPublicKey,
                asset: stellar_sdk_1.Asset.native(),
                amount: amount,
            }))
                .setTimeout(30)
                .build();
            transaction.sign(senderKeypair);
            this.logger.log(`Submitting transaction to Horizon...`);
            const response = await this.horizonServer.submitTransaction(transaction);
            this.logger.log(`Payout successful! Transaction Hash: ${response.hash}`);
            this.logger.log(`Verify here: https://stellar.expert/explorer/testnet/tx/${response.hash}`);
            return response;
        }
        catch (error) {
            this.logger.error('Payout execution failed', error);
            if (error.response && error.response.data) {
                this.logger.error('Stellar Horizon Error details:', error.response.data);
            }
            throw new Error('Payout failed');
        }
    }
    async executeCrossBorderPayout(clientSecret, freelancerSecret, amountInXLM) {
        try {
            this.logger.log(`\n--- [1/4] TREASURY SETUP ---`);
            const treasury = await this.generateAndFundWallet();
            const treasuryKeypair = stellar_sdk_1.Keypair.fromSecret(treasury.secretKey);
            const idrAsset = new stellar_sdk_1.Asset('IDR', treasuryKeypair.publicKey());
            this.logger.log(`Defined custom asset: IDR (Issuer: ${treasury.publicKey})`);
            this.logger.log(`\n--- [2/4] MARKET MAKING (DEX LIQUIDITY) ---`);
            const treasuryAccount = await this.horizonServer.loadAccount(treasuryKeypair.publicKey());
            const manageSellOfferTx = new stellar_sdk_1.TransactionBuilder(treasuryAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(stellar_sdk_1.Operation.manageSellOffer({
                selling: idrAsset,
                buying: stellar_sdk_1.Asset.native(),
                amount: '100000',
                price: '1',
            }))
                .setTimeout(30)
                .build();
            manageSellOfferTx.sign(treasuryKeypair);
            await this.horizonServer.submitTransaction(manageSellOfferTx);
            this.logger.log(`DEX Liquidity Provided! Treasury is now selling IDR.`);
            this.logger.log(`\n--- [3/4] RECEIVER TRUSTLINE ---`);
            const freelancerKeypair = stellar_sdk_1.Keypair.fromSecret(freelancerSecret);
            const freelancerAccount = await this.horizonServer.loadAccount(freelancerKeypair.publicKey());
            const changeTrustTx = new stellar_sdk_1.TransactionBuilder(freelancerAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(stellar_sdk_1.Operation.changeTrust({
                asset: idrAsset,
            }))
                .setTimeout(30)
                .build();
            changeTrustTx.sign(freelancerKeypair);
            await this.horizonServer.submitTransaction(changeTrustTx);
            this.logger.log(`Trustline Established! Freelancer can now receive IDR.`);
            this.logger.log(`\n--- [4/4] CROSS-BORDER PATH PAYMENT ---`);
            const clientKeypair = stellar_sdk_1.Keypair.fromSecret(clientSecret);
            const clientAccount = await this.horizonServer.loadAccount(clientKeypair.publicKey());
            const pathPaymentTx = new stellar_sdk_1.TransactionBuilder(clientAccount, {
                fee: '1000',
                networkPassphrase: this.networkPassphrase,
            })
                .addOperation(stellar_sdk_1.Operation.pathPaymentStrictSend({
                sendAsset: stellar_sdk_1.Asset.native(),
                sendAmount: amountInXLM,
                destination: freelancerKeypair.publicKey(),
                destAsset: idrAsset,
                destMin: '0.0000001',
            }))
                .setTimeout(30)
                .build();
            pathPaymentTx.sign(clientKeypair);
            const response = await this.horizonServer.submitTransaction(pathPaymentTx);
            this.logger.log(`\n========================================`);
            this.logger.log(`CROSS-BORDER PAYOUT SUCCESSFUL!`);
            this.logger.log(`Transaction Hash: ${response.hash}`);
            this.logger.log(`Verify here: https://stellar.expert/explorer/testnet/tx/${response.hash}`);
            this.logger.log(`========================================\n`);
            return response;
        }
        catch (error) {
            this.logger.error('Cross-Border Payout execution failed', error);
            if (error.response && error.response.data) {
                this.logger.error('Stellar Horizon Error details:', JSON.stringify(error.response.data.extras, null, 2));
            }
            throw new Error('Cross-Border Payout failed');
        }
    }
};
exports.StellarServiceService = StellarServiceService;
exports.StellarServiceService = StellarServiceService = StellarServiceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StellarServiceService);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@stellar/stellar-sdk");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const stellar_service_module_1 = __webpack_require__(2);
async function bootstrap() {
    const app = await core_1.NestFactory.create(stellar_service_module_1.StellarServiceModule);
    await app.listen(process.env.port ?? 3000);
}
bootstrap();

})();

/******/ })()
;