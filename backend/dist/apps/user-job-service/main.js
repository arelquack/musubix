/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserJobServiceModule = void 0;
const common_1 = __webpack_require__(4);
const user_job_service_controller_1 = __webpack_require__(5);
const user_job_service_service_1 = __webpack_require__(6);
let UserJobServiceModule = class UserJobServiceModule {
};
exports.UserJobServiceModule = UserJobServiceModule;
exports.UserJobServiceModule = UserJobServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [user_job_service_controller_1.UserJobServiceController],
        providers: [user_job_service_service_1.UserJobServiceService],
    })
], UserJobServiceModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserJobServiceController = void 0;
const common_1 = __webpack_require__(4);
const microservices_1 = __webpack_require__(2);
const user_job_service_service_1 = __webpack_require__(6);
let UserJobServiceController = class UserJobServiceController {
    userJobServiceService;
    constructor(userJobServiceService) {
        this.userJobServiceService = userJobServiceService;
    }
    async createJob(data) {
        const job = await this.userJobServiceService.createJob(data);
        return {
            status: 'success',
            job,
        };
    }
    getJobs(query) {
        return this.userJobServiceService.getJobs(query);
    }
    getTreasury() {
        return { issuerPubKey: this.userJobServiceService['stellarService'].getTreasuryPubKey() };
    }
    acceptJob(data) {
        return this.userJobServiceService.acceptJob(data.jobId, data.freelancerPubKey);
    }
    lockEscrow(data) {
        return this.userJobServiceService.lockEscrow(data.jobId);
    }
    submitWork(data) {
        return this.userJobServiceService.submitWork(data.jobId, data.workSubmission);
    }
    approveWork(data) {
        return this.userJobServiceService.approveWork(data.jobId, data.rating, data.review);
    }
    syncStatus(data) {
        return this.userJobServiceService.syncStatus(data.jobId, data.status);
    }
    analyzeJob(data) {
        return this.userJobServiceService.analyzeJobSpecs(data.title, data.description, data.budget);
    }
    getFreelancer(data) {
        return this.userJobServiceService.getFreelancerProfile(data.pubkey);
    }
};
exports.UserJobServiceController = UserJobServiceController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_job' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserJobServiceController.prototype, "createJob", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_jobs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "getJobs", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_treasury' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "getTreasury", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'accept_job' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "acceptJob", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'lock_escrow' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "lockEscrow", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'submit_work' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "submitWork", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'approve_work' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "approveWork", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'sync_status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "syncStatus", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'analyze_job' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "analyzeJob", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_freelancer' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserJobServiceController.prototype, "getFreelancer", null);
exports.UserJobServiceController = UserJobServiceController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof user_job_service_service_1.UserJobServiceService !== "undefined" && user_job_service_service_1.UserJobServiceService) === "function" ? _a : Object])
], UserJobServiceController);


/***/ }),
/* 6 */
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserJobServiceService = void 0;
const common_1 = __webpack_require__(4);
const client_1 = __webpack_require__(7);
const stellar_service_service_1 = __webpack_require__(8);
let UserJobServiceService = class UserJobServiceService {
    prisma;
    stellarService;
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.stellarService = new stellar_service_service_1.StellarServiceService();
    }
    async onModuleInit() {
        await this.prisma.$connect();
        await this.stellarService.setupGlobalTreasury();
        await this.seedMockUsers();
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
    async seedMockUsers() {
        let mockClient = await this.prisma.user.findUnique({ where: { email: 'client@musubix.com' } });
        if (!mockClient || !mockClient.stellarSecret) {
            console.log('Generating persistent wallet for Mock Client...');
            const wallet = await this.stellarService.generateAndFundWallet();
            mockClient = await this.prisma.user.upsert({
                where: { email: 'client@musubix.com' },
                update: { stellarPubKey: wallet.publicKey, stellarSecret: wallet.secretKey },
                create: {
                    id: 'mock-client-id',
                    email: 'client@musubix.com',
                    name: 'Mock Client',
                    role: 'CLIENT',
                    stellarPubKey: wallet.publicKey,
                    stellarSecret: wallet.secretKey,
                },
            });
        }
        let mockFreelancer = await this.prisma.user.findUnique({ where: { email: 'freelancer@musubix.com' } });
        if (!mockFreelancer || !mockFreelancer.stellarSecret) {
            console.log('Generating persistent wallet for Mock Freelancer...');
            const wallet = await this.stellarService.generateAndFundWallet();
            mockFreelancer = await this.prisma.user.upsert({
                where: { email: 'freelancer@musubix.com' },
                update: { stellarPubKey: wallet.publicKey, stellarSecret: wallet.secretKey },
                create: {
                    id: 'mock-freelancer-id',
                    email: 'freelancer@musubix.com',
                    name: 'Mock Freelancer',
                    role: 'FREELANCER',
                    stellarPubKey: wallet.publicKey,
                    stellarSecret: wallet.secretKey,
                },
            });
        }
    }
    async createJob(data) {
        if (!data.clientPubKey)
            throw new Error('clientPubKey is required');
        const client = await this.prisma.user.upsert({
            where: { stellarPubKey: data.clientPubKey },
            update: {},
            create: {
                email: `${data.clientPubKey}@musubix.local`,
                name: `Client ${data.clientPubKey.slice(0, 5)}`,
                role: 'CLIENT',
                stellarPubKey: data.clientPubKey,
            },
        });
        return this.prisma.job.create({
            data: {
                title: data.title,
                description: data.description,
                budgetAmount: parseFloat(data.budgetAmount),
                currency: data.currency || 'USDC',
                status: 'OPEN',
                clientId: client.id,
                aiScore: data.aiScore ? parseInt(data.aiScore) : null,
                aiFeedback: data.aiFeedback || null,
            },
        });
    }
    async getJobs(query = {}) {
        const where = {};
        if (query.clientPubKey) {
            const client = await this.prisma.user.findUnique({ where: { stellarPubKey: query.clientPubKey } });
            if (client)
                where.clientId = client.id;
        }
        if (query.freelancerPubKey) {
            const freelancer = await this.prisma.user.findUnique({ where: { stellarPubKey: query.freelancerPubKey } });
            if (freelancer)
                where.freelancerId = freelancer.id;
        }
        if (query.status)
            where.status = query.status;
        return this.prisma.job.findMany({
            where,
            orderBy: { id: 'desc' },
            include: {
                client: { select: { name: true, stellarPubKey: true } },
                freelancer: { select: { name: true, stellarPubKey: true } },
            },
        });
    }
    async acceptJob(jobId, freelancerPubKey) {
        if (!freelancerPubKey)
            throw new Error('freelancerPubKey is required');
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.status !== 'OPEN')
            throw new Error('Job is not available');
        const freelancer = await this.prisma.user.upsert({
            where: { stellarPubKey: freelancerPubKey },
            update: {},
            create: {
                email: `${freelancerPubKey}@musubix.local`,
                name: `Freelancer ${freelancerPubKey.slice(0, 5)}`,
                role: 'FREELANCER',
                stellarPubKey: freelancerPubKey,
            },
        });
        return this.prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'IN_PROGRESS',
                freelancerId: freelancer.id,
            },
        });
    }
    async lockEscrow(jobId) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { client: true, freelancer: true }
        });
        if (!job || job.status !== 'IN_PROGRESS')
            throw new Error('Job is not in progress');
        if (!job.client?.stellarPubKey || !job.freelancer?.stellarPubKey)
            throw new Error('Missing wallets');
        console.log(`\n--- DEPLOYING ESCROW FOR JOB ${jobId} ---`);
        let contractId;
        try {
            const deployer = await this.stellarService.generateAndFundWallet();
            contractId = await this.stellarService.deployEscrowInstance(deployer.secretKey);
        }
        catch (e) {
            console.error('Failed to deploy escrow on blockchain:', e);
            throw new ((__webpack_require__(2).RpcException))('Network error while deploying escrow contract on-chain. Please ensure your connection is stable and try again.');
        }
        return this.prisma.job.update({
            where: { id: jobId },
            data: { escrowId: contractId },
            include: { client: true, freelancer: true }
        });
    }
    async submitWork(jobId, workSubmission) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job || job.status !== 'LOCKED')
            throw new Error('Job escrow is not locked');
        return this.prisma.job.update({
            where: { id: jobId },
            data: { status: 'IN_REVIEW', workSubmission },
        });
    }
    async approveWork(jobId, rating, review) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { client: true }
        });
        if (!job || job.status !== 'IN_REVIEW')
            throw new Error('Job is not ready for approval');
        if (!job.escrowId)
            throw new Error('Missing escrow ID');
        return this.prisma.job.update({
            where: { id: jobId },
            data: {
                clientRating: rating,
                clientReview: review
            },
        });
    }
    async syncStatus(jobId, status) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job)
            throw new Error('Job not found');
        return this.prisma.job.update({
            where: { id: jobId },
            data: { status: status },
        });
    }
    async analyzeJobSpecs(title, description, budget) {
        const { GoogleGenerativeAI } = __webpack_require__(12);
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is missing in backend environment variables');
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const prompt = `Act as a freelance platform QA. Analyze this job: Title: ${title}, Desc: ${description}, Budget: $${budget}. Return ONLY a JSON object with two keys: 'score' (a number from 1-100 indicating clarity and price fairness) and 'feedback' (a 1-sentence concise feedback).`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        try {
            const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            return parsed;
        }
        catch (e) {
            console.error('Failed to parse Gemini response:', text);
            throw new Error('AI analysis failed to produce valid JSON');
        }
    }
    async getFreelancerProfile(pubkey) {
        const user = await this.prisma.user.findUnique({
            where: { stellarPubKey: pubkey },
            include: {
                jobsTaken: {
                    where: {
                        status: { in: ['COMPLETED', 'WITHDRAWN'] }
                    },
                    orderBy: { id: 'desc' }
                }
            }
        });
        if (!user)
            throw new Error('Freelancer not found');
        return user;
    }
};
exports.UserJobServiceService = UserJobServiceService;
exports.UserJobServiceService = UserJobServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UserJobServiceService);


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),
/* 8 */
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
const common_1 = __webpack_require__(4);
const stellar_sdk_1 = __webpack_require__(9);
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
            const fs = __webpack_require__(10);
            const path = __webpack_require__(11);
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
/* 9 */
/***/ ((module) => {

module.exports = require("@stellar/stellar-sdk");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@google/generative-ai");

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
const microservices_1 = __webpack_require__(2);
const user_job_service_module_1 = __webpack_require__(3);
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(user_job_service_module_1.UserJobServiceModule);
        app.connectMicroservice({
            transport: microservices_1.Transport.TCP,
            options: {
                host: '127.0.0.1',
                port: 3001,
            },
        });
        await app.startAllMicroservices();
        await app.listen(3002);
        console.log('User-Job Microservice is listening on TCP port 3001 (and HTTP 3002)');
    }
    catch (error) {
        console.error('Failed to start microservice:', error);
    }
}
bootstrap();

})();

/******/ })()
;