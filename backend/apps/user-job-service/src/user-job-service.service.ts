import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { StellarServiceService } from '../../stellar-service/src/stellar-service.service';

@Injectable()
export class UserJobServiceService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private stellarService: StellarServiceService;

  constructor() {
    this.prisma = new PrismaClient();
    this.stellarService = new StellarServiceService();
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

  async createJob(data: any) {
    if (!data.clientPubKey) throw new Error('clientPubKey is required');

    // Dynamically upsert the client user based on their wallet public key
    const client = await this.prisma.user.upsert({
      where: { stellarPubKey: data.clientPubKey },
      update: {},
      create: {
        email: `${data.clientPubKey}@musubix.local`, // Auto-generated dummy email
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

  async acceptJob(jobId: string, freelancerPubKey: string) {
    if (!freelancerPubKey) throw new Error('freelancerPubKey is required');

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'OPEN') throw new Error('Job is not available');

    // Dynamically upsert the freelancer user based on their wallet public key
    const freelancer = await this.prisma.user.upsert({
      where: { stellarPubKey: freelancerPubKey },
      update: {},
      create: {
        email: `${freelancerPubKey}@musubix.local`, // Auto-generated dummy email
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
}
