import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserJobServiceService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
    // Auto-seed mock users for testing
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
}
