import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';

@Injectable()
export class WalletService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor() {
    // In production, this MUST come from process.env and be a 32-byte hex string or base64.
    // For MVP, we use a fallback if not provided.
    const secretStr = process.env.ENCRYPTION_KEY || 'default_secret_key_for_mvp_must_be_32_bytes_long';
    
    // Ensure the key is exactly 32 bytes
    if (secretStr.length === 32) {
      this.key = Buffer.from(secretStr, 'utf8');
    } else {
      // Hash it to make it 32 bytes
      this.key = crypto.createHash('sha256').update(String(secretStr)).digest();
    }
  }

  encryptSecret(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryptSecret(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedData = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    // Note: the decipher output is typed as `any` in some Node types, but generally returns Buffer or string based on final arg.
    let decrypted: any = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateWallet(): { publicKey: string; secretKey: string } {
    const keypair = Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  signTransaction(encryptedSecret: string, xdr: string, networkPassphrase: string): string {
    const secretKey = this.decryptSecret(encryptedSecret);
    const keypair = Keypair.fromSecret(secretKey);
    const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase);
    tx.sign(keypair);
    return tx.toXDR();
  }
}
