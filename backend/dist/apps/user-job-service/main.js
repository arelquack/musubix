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
    async getJobs() {
        return this.userJobServiceService.getJobs();
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
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserJobServiceController.prototype, "getJobs", null);
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
let UserJobServiceService = class UserJobServiceService {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async onModuleInit() {
        await this.prisma.$connect();
        await this.seedMockUsers();
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
    async seedMockUsers() {
        const mockClient = await this.prisma.user.upsert({
            where: { email: 'client@musubix.com' },
            update: {},
            create: {
                id: 'mock-client-id',
                email: 'client@musubix.com',
                name: 'Mock Client',
                role: 'CLIENT',
                stellarPubKey: 'CLIENT_PUB_KEY',
            },
        });
        const mockFreelancer = await this.prisma.user.upsert({
            where: { email: 'freelancer@musubix.com' },
            update: {},
            create: {
                id: 'mock-freelancer-id',
                email: 'freelancer@musubix.com',
                name: 'Mock Freelancer',
                role: 'FREELANCER',
                stellarPubKey: 'FREELANCER_PUB_KEY',
            },
        });
    }
    async createJob(data) {
        return this.prisma.job.create({
            data: {
                title: data.title,
                description: data.description,
                budgetAmount: parseFloat(data.budgetAmount),
                currency: data.currency || 'USDC',
                status: 'OPEN',
                clientId: data.clientId || 'mock-client-id',
            },
        });
    }
    async getJobs() {
        return this.prisma.job.findMany({
            where: { status: 'OPEN' },
            orderBy: { id: 'desc' },
            include: {
                client: {
                    select: { name: true }
                }
            }
        });
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