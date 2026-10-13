import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { StellarServiceService } from '../../stellar-service/src/stellar-service.service';
import { WalletService } from '../../stellar-service/src/wallet.service';

@Injectable()
export class UserJobServiceService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private stellarService: StellarServiceService;
  private walletService: WalletService;

  constructor() {
    this.prisma = new PrismaClient();
    this.stellarService = new StellarServiceService();
    this.walletService = new WalletService();
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
      const encryptedSecret = this.walletService.encryptSecret(wallet.secretKey);
      mockClient = await this.prisma.user.upsert({
        where: { email: 'client@musubix.com' },
        update: { stellarPubKey: wallet.publicKey, stellarSecret: encryptedSecret },
        create: {
          id: 'mock-client-id',
          email: 'client@musubix.com',
          name: 'Mock Client',
          role: 'CLIENT',
          stellarPubKey: wallet.publicKey,
          stellarSecret: encryptedSecret,
        },
      });
    }

    let mockFreelancer = await this.prisma.user.findUnique({ where: { email: 'freelancer@musubix.com' } });
    if (!mockFreelancer || !mockFreelancer.stellarSecret) {
      console.log('Generating persistent wallet for Mock Freelancer...');
      const wallet = await this.stellarService.generateAndFundWallet();
      const encryptedSecret = this.walletService.encryptSecret(wallet.secretKey);
      mockFreelancer = await this.prisma.user.upsert({
        where: { email: 'freelancer@musubix.com' },
        update: { 
          stellarPubKey: wallet.publicKey, 
          stellarSecret: encryptedSecret,
          bio: 'Fullstack Web3 Developer with 5+ years of experience building dApps on Stellar and Soroban. I specialize in NestJS and Next.js.',
          portfolioUrl: 'https://musubix.com/portfolio',
          githubUrl: 'https://github.com/musubix-dev',
          calendlyUrl: 'https://calendly.com/musubix-demo'
        },
        create: {
          id: 'mock-freelancer-id',
          email: 'freelancer@musubix.com',
          name: 'Satoshi Nakamoto',
          role: 'FREELANCER',
          stellarPubKey: wallet.publicKey,
          stellarSecret: encryptedSecret,
          bio: 'Fullstack Web3 Developer with 5+ years of experience building dApps on Stellar and Soroban. I specialize in NestJS and Next.js.',
          portfolioUrl: 'https://musubix.com/portfolio',
          githubUrl: 'https://github.com/musubix-dev',
          calendlyUrl: 'https://calendly.com/musubix-demo'
        },
      });
    }
  }

  async createJob(data: any) {
    if (!data.clientPubKey) throw new Error('clientPubKey is required');

    const client = await this.prisma.user.findUnique({ where: { stellarPubKey: data.clientPubKey } });
    if (!client) throw new Error('Client not found');

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

  async getJobs(query: any = {}) {
    const where: any = {};
    if (query.clientPubKey) {
      const client = await this.prisma.user.findUnique({ where: { stellarPubKey: query.clientPubKey } });
      if (client) where.clientId = client.id;
    }
    if (query.freelancerPubKey) {
      const freelancer = await this.prisma.user.findUnique({ where: { stellarPubKey: query.freelancerPubKey } });
      if (freelancer) where.freelancerId = freelancer.id;
    }
    if (query.status) where.status = query.status;

    return this.prisma.job.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        client: { select: { name: true, stellarPubKey: true } },
        freelancer: { select: { name: true, stellarPubKey: true } },
      },
    });
  }

  async getJobById(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, stellarPubKey: true, avatarUrl: true } },
        freelancer: { select: { name: true, stellarPubKey: true, avatarUrl: true } },
      },
    });
  }

  async acceptJob(jobId: string, freelancerPubKey: string) {
    if (!freelancerPubKey) throw new Error('freelancerPubKey is required');

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'OPEN') throw new Error('Job is not available');

    const freelancer = await this.prisma.user.findUnique({ where: { stellarPubKey: freelancerPubKey } });
    if (!freelancer) throw new Error('Freelancer not found');

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'IN_PROGRESS',
        freelancerId: freelancer.id,
      },
    });
  }

  async lockEscrow(jobId: string) {
    const job = await this.prisma.job.findUnique({ 
      where: { id: jobId },
      include: { client: true, freelancer: true }
    });
    if (!job || job.status !== 'IN_PROGRESS') throw new Error('Job is not in progress');
    if (!job.client?.stellarPubKey || !job.freelancer?.stellarPubKey) throw new Error('Missing wallets');

    console.log(`\n--- DEPLOYING ESCROW FOR JOB ${jobId} ---`);
    let contractId: string;
    try {
      const deployer = await this.stellarService.generateAndFundWallet();
      contractId = await this.stellarService.deployEscrowInstance(deployer.secretKey);
    } catch (e: any) {
      console.error('Failed to deploy escrow on blockchain:', e);
      // We throw a standardized error that the gateway can forward to the client
      throw new (require('@nestjs/microservices').RpcException)('Network error while deploying escrow contract on-chain. Please ensure your connection is stable and try again.');
    }

    // Save escrowId but keep status IN_PROGRESS because frontend will handle init and deposit
    return this.prisma.job.update({
      where: { id: jobId },
      data: { escrowId: contractId },
      include: { client: true, freelancer: true }
    });
  }

  async submitWork(jobId: string, workSubmission: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'LOCKED') throw new Error('Job escrow is not locked');

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'IN_REVIEW', workSubmission },
    });
  }

  async approveWork(jobId: string, rating?: number, review?: string) {
    const job = await this.prisma.job.findUnique({ 
      where: { id: jobId },
      include: { client: true }
    });
    if (!job || job.status !== 'IN_REVIEW') throw new Error('Job is not ready for approval');
    if (!job.escrowId) throw new Error('Missing escrow ID');

    // We only save ratings here. The actual Soroban approval is done on frontend.
    return this.prisma.job.update({
      where: { id: jobId },
      data: { 
        clientRating: rating,
        clientReview: review
      },
    });
  }

  async syncStatus(jobId: string, status: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: status as any },
    });
  }

  async analyzeJobSpecs(title: string, description: string, budget: string) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
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
      // Strip markdown code block backticks if they exist
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (e) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('AI analysis failed to produce valid JSON');
    }
  }

  async getFreelancerProfile(pubkey: string) {
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
    if (!user) throw new Error('Freelancer not found');
    return user;
  }

  async getStats() {
    const aggregate = await this.prisma.job.aggregate({
      where: { status: { in: ['COMPLETED', 'WITHDRAWN'] } },
      _sum: { budgetAmount: true },
      _count: { id: true },
    });
    return {
      totalJobsCompleted: aggregate._count.id || 0,
      totalFundsDistributed: aggregate._sum.budgetAmount || 0,
    };
  }

  async authLogin(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) return user;
    
    // Auto-register mock flow
    const wallet = await this.stellarService.generateAndFundWallet();
    const encryptedSecret = this.walletService.encryptSecret(wallet.secretKey);
    const role = email.toLowerCase().includes('client') ? 'CLIENT' : 'FREELANCER';
    
    return this.prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        role: role as any,
        stellarPubKey: wallet.publicKey,
        stellarSecret: encryptedSecret,
      }
    });
  }

  async signTransaction(userId: string, xdr: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stellarSecret) throw new Error('User wallet not found');

    return this.walletService.signTransaction(user.stellarSecret, xdr, 'Test SDF Network ; September 2015');
  }

  async updateProfile(pubKey: string, data: { bio?: string, skills?: string, avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { stellarPubKey: pubKey },
      data: {
        bio: data.bio,
        skills: data.skills,
        avatarUrl: data.avatarUrl
      }
    });
  }
}
