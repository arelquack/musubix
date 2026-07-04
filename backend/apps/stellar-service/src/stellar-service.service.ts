import { Injectable, Logger } from '@nestjs/common';
import { Keypair, Horizon, rpc, TransactionBuilder, Operation, Asset } from '@stellar/stellar-sdk';

@Injectable()
export class StellarServiceService {
  private readonly logger = new Logger(StellarServiceService.name);
  private horizonServer: Horizon.Server;
  private rpcServer: rpc.Server;
  
  // Hardcoded testnet network passphrase for Soroban & standard transactions
  private readonly networkPassphrase = 'Test SDF Network ; September 2015';

  constructor() {
    // Connect to Stellar Testnet
    this.horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');
    this.rpcServer = new rpc.Server('https://soroban-testnet.stellar.org');
    this.logger.log('Connected to Stellar Testnet (Horizon & RPC)');
  }

  /**
   * Generates a new Stellar Keypair and funds it using Friendbot on Testnet.
   * Note: Friendbot only works on Testnet/Futurenet.
   */
  async generateAndFundWallet(): Promise<{ publicKey: string; secretKey: string }> {
    try {
      const keypair = Keypair.random();
      const publicKey = keypair.publicKey();
      const secretKey = keypair.secret();
      
      this.logger.log(`Generated new wallet: ${publicKey}. Funding via Friendbot...`);
      
      const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
      if (!response.ok) {
        throw new Error(`Friendbot failed with status ${response.status}`);
      }
      
      this.logger.log(`Wallet ${publicKey} successfully funded with test XLM!`);
      
      return { publicKey, secretKey };
    } catch (error) {
      this.logger.error('Failed to generate and fund Stellar wallet', error);
      throw new Error('Wallet generation and funding failed');
    }
  }

  /**
   * Execute a real Stellar Native Payment (XLM) from Sender to Receiver.
   */
  async executePayout(senderSecret: string, receiverPublicKey: string, amount: string) {
    try {
      this.logger.log(`Executing payout of ${amount} XLM to ${receiverPublicKey}...`);
      
      const senderKeypair = Keypair.fromSecret(senderSecret);
      const senderAccount = await this.horizonServer.loadAccount(senderKeypair.publicKey());

      const transaction = new TransactionBuilder(senderAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(Operation.payment({
        destination: receiverPublicKey,
        asset: Asset.native(),
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
    } catch (error) {
      this.logger.error('Payout execution failed', error);
      if (error.response && error.response.data) {
        this.logger.error('Stellar Horizon Error details:', error.response.data);
      }
      throw new Error('Payout failed');
    }
  }
}
