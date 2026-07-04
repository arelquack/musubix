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

  /**
   * Cross-Border Path Payment (The Magic)
   * Dynamically sets up Treasury, DEX Liquidity, Trustlines, and executes Path Payment.
   */
  async executeCrossBorderPayout(clientSecret: string, freelancerSecret: string, amountInXLM: string) {
    try {
      this.logger.log(`\n--- [1/4] TREASURY SETUP ---`);
      const treasury = await this.generateAndFundWallet();
      const treasuryKeypair = Keypair.fromSecret(treasury.secretKey);
      const idrAsset = new Asset('IDR', treasuryKeypair.publicKey());
      this.logger.log(`Defined custom asset: IDR (Issuer: ${treasury.publicKey})`);

      this.logger.log(`\n--- [2/4] MARKET MAKING (DEX LIQUIDITY) ---`);
      // Treasury sells 100,000 IDR for native XLM
      const treasuryAccount = await this.horizonServer.loadAccount(treasuryKeypair.publicKey());
      const manageSellOfferTx = new TransactionBuilder(treasuryAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(Operation.manageSellOffer({
        selling: idrAsset,
        buying: Asset.native(),
        amount: '100000',
        price: '1', // 1 IDR = 1 XLM for simplicity in this test
      }))
      .setTimeout(30)
      .build();
      
      manageSellOfferTx.sign(treasuryKeypair);
      await this.horizonServer.submitTransaction(manageSellOfferTx);
      this.logger.log(`DEX Liquidity Provided! Treasury is now selling IDR.`);

      this.logger.log(`\n--- [3/4] RECEIVER TRUSTLINE ---`);
      const freelancerKeypair = Keypair.fromSecret(freelancerSecret);
      const freelancerAccount = await this.horizonServer.loadAccount(freelancerKeypair.publicKey());
      const changeTrustTx = new TransactionBuilder(freelancerAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(Operation.changeTrust({
        asset: idrAsset,
      }))
      .setTimeout(30)
      .build();

      changeTrustTx.sign(freelancerKeypair);
      await this.horizonServer.submitTransaction(changeTrustTx);
      this.logger.log(`Trustline Established! Freelancer can now receive IDR.`);

      this.logger.log(`\n--- [4/4] CROSS-BORDER PATH PAYMENT ---`);
      const clientKeypair = Keypair.fromSecret(clientSecret);
      const clientAccount = await this.horizonServer.loadAccount(clientKeypair.publicKey());
      const pathPaymentTx = new TransactionBuilder(clientAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: amountInXLM,
        destination: freelancerKeypair.publicKey(),
        destAsset: idrAsset,
        destMin: '0.0000001', // destMin must be strictly positive in Stellar SDK
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
    } catch (error) {
      this.logger.error('Cross-Border Payout execution failed', error);
      if (error.response && error.response.data) {
        this.logger.error('Stellar Horizon Error details:', JSON.stringify(error.response.data.extras, null, 2));
      }
      throw new Error('Cross-Border Payout failed');
    }
  }
}
