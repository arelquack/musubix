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

  async createJob(data: any) {
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

  async getJobs(query: any = {}) {
    const where: any = {};
    if (query.clientId) where.clientId = query.clientId;
    if (query.freelancerId) where.freelancerId = query.freelancerId;
    if (query.status) where.status = query.status;

    return this.prisma.job.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        client: { select: { name: true } },
        freelancer: { select: { name: true } },
      },
    });
  }

  async acceptJob(jobId: string, freelancerId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'OPEN') throw new Error('Job is not available');

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'IN_PROGRESS',
        freelancerId,
      },
    });
  }

  async lockEscrow(jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'IN_PROGRESS') throw new Error('Job is not in progress');

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'LOCKED' },
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

  async approveWork(jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'IN_REVIEW') throw new Error('Job is not in review');

    console.log(`\n--- INITIATING STELLAR PAYOUT FOR JOB ${jobId} ---`);
    
    // 1. Generate & fund Client Wallet (Sender)
    console.log('Setting up Client Wallet...');
    const clientWallet = await this.stellarService.generateAndFundWallet();
    
    // 2. Generate & fund Freelancer Wallet (Receiver)
    console.log('Setting up Freelancer Wallet...');
    const freelancerWallet = await this.stellarService.generateAndFundWallet();
    
    // 3. Execute real XLM Payout
    await this.stellarService.executePayout(
      clientWallet.secretKey,
      freelancerWallet.publicKey,
      job.budgetAmount.toString()
    );
    console.log('--- STELLAR PAYOUT COMPLETE ---\n');

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' },
    });
  }
}
