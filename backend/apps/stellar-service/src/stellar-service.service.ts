import { Injectable, Logger } from '@nestjs/common';
import { Keypair, Horizon, rpc, TransactionBuilder, Operation, Asset, Contract, nativeToScVal, Address, StrKey, xdr } from '@stellar/stellar-sdk';

@Injectable()
export class StellarServiceService {
  private readonly logger = new Logger(StellarServiceService.name);
  private horizonServer: Horizon.Server;
  private rpcServer: rpc.Server;
  
  // Hardcoded testnet network passphrase for Soroban & standard transactions
  private readonly networkPassphrase = 'Test SDF Network ; September 2015';

  // Escrow WASM hash
  private readonly escrowWasmHash = '6a8b7fe6ac6c89c40d57152f15af7fceef3cf86f9f78eecb5e1fa88912d420e5';

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

  private async submitSorobanTransaction(tx: any, keypair: Keypair): Promise<any> {
    const preparedTx = await this.rpcServer.prepareTransaction(tx);
    preparedTx.sign(keypair);
    
    let sendResult = await this.rpcServer.sendTransaction(preparedTx);
    if (sendResult.status === 'ERROR') {
      throw new Error(`Submit failed: ${JSON.stringify(sendResult)}`);
    }

    let getTxResult: any;
    let status = 'NOT_FOUND';
    while (status === 'NOT_FOUND') {
      await new Promise(r => setTimeout(r, 2000));
      getTxResult = await this.rpcServer.getTransaction(sendResult.hash);
      status = getTxResult.status;
    }

    if (status === 'SUCCESS') {
      return getTxResult;
    } else {
      throw new Error(`Transaction failed: ${JSON.stringify(getTxResult)}`);
    }
  }
  async deployEscrowInstance(deployerSecret: string): Promise<string> {
    try {
      this.logger.log(`\n--- DEPLOYING NEW ESCROW INSTANCE ---`);
      const deployerKeypair = Keypair.fromSecret(deployerSecret);
      const deployerAccount = await this.horizonServer.loadAccount(deployerKeypair.publicKey());
      
      const tx = new TransactionBuilder(deployerAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(Operation.createCustomContract({
        address: Address.fromString(deployerKeypair.publicKey()),
        wasmHash: Buffer.from(this.escrowWasmHash, 'hex')
      }))
      .setTimeout(30)
      .build();

      const getTxResult = await this.submitSorobanTransaction(tx, deployerKeypair);
      
      // Extract contract ID from returnValue
      const contractAddress = Address.fromScVal(getTxResult.returnValue).toString();
      this.logger.log(`Success! New Escrow Contract ID: ${contractAddress}`);
      return contractAddress;
    } catch (error) {
      this.logger.error('Failed to deploy escrow instance', error);
      throw error;
    }
  }

  async initializeAndFundEscrow(contractId: string, clientSecret: string, freelancerPubKey: string, amountStr: string): Promise<void> {
    try {
      this.logger.log(`\n--- INITIALIZING & FUNDING ESCROW ---`);
      const clientKeypair = Keypair.fromSecret(clientSecret);
      let clientAccount = await this.horizonServer.loadAccount(clientKeypair.publicKey());
      const contract = new Contract(contractId);
      
      const amountNative = Math.floor(parseFloat(amountStr) * 10000000); // Convert to stroops

      const initOp = contract.call('initialize', 
        nativeToScVal(clientKeypair.publicKey(), { type: 'address' }),
        nativeToScVal(freelancerPubKey, { type: 'address' }),
        nativeToScVal(amountNative, { type: 'i128' })
      );

      const txInit = new TransactionBuilder(clientAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(initOp)
      .setTimeout(30)
      .build();

      this.logger.log('Submitting initialize transaction...');
      await this.submitSorobanTransaction(txInit, clientKeypair);

      // Reload account to update sequence number
      clientAccount = await this.horizonServer.loadAccount(clientKeypair.publicKey());

      const depositOp = contract.call('deposit', 
        nativeToScVal('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', { type: 'address' }) // Testnet Native Token
      );

      const txDeposit = new TransactionBuilder(clientAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(depositOp)
      .setTimeout(30)
      .build();

      this.logger.log('Submitting deposit transaction...');
      await this.submitSorobanTransaction(txDeposit, clientKeypair);
      
      this.logger.log(`Success! Escrow initialized and funded with ${amountStr} XLM`);
    } catch (error) {
      this.logger.error('Failed to initialize and fund escrow', error);
      throw error;
    }
  }

  async releaseEscrow(contractId: string, clientSecret: string): Promise<void> {
    try {
      this.logger.log(`\n--- RELEASING ESCROW TO FREELANCER ---`);
      const clientKeypair = Keypair.fromSecret(clientSecret);
      const clientAccount = await this.horizonServer.loadAccount(clientKeypair.publicKey());
      const contract = new Contract(contractId);

      const approveOp = contract.call('approve_and_pay', 
        nativeToScVal('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC', { type: 'address' }) // Testnet Native Token
      );

      const tx = new TransactionBuilder(clientAccount, {
        fee: '1000',
        networkPassphrase: this.networkPassphrase,
      })
      .addOperation(approveOp)
      .setTimeout(30)
      .build();

      await this.submitSorobanTransaction(tx, clientKeypair);
      this.logger.log(`Success! Escrow released!`);
    } catch (error) {
      this.logger.error('Failed to release escrow', error);
      throw error;
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
