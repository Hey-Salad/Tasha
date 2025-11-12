// lib/server/accountImport.ts
// Utility to import and use exported Polkadot account JSON files
// SERVER-ONLY MODULE - Do not import in client code

import 'server-only';
import { type PolkadotSigner } from 'polkadot-api';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

// Polkadot JSON keyfile format
interface PolkadotKeyfile {
  encoded: string;
  encoding: {
    content: string[];
    type: string[];
    version: string;
  };
  address: string;
  meta: {
    name?: string;
    whenCreated?: number;
    genesisHash?: string | null;
  };
}

/**
 * Decrypts a Polkadot JSON keyfile using @polkadot/keyring
 * @param keyfile - The JSON keyfile object
 * @param password - The password to decrypt the keyfile
 * @returns The decrypted keypair
 */
async function decryptKeyfile(keyfile: PolkadotKeyfile, password: string) {
  // Wait for crypto libraries to be ready
  await cryptoWaitReady();

  // Create keyring instance
  const keyring = new Keyring({ type: 'sr25519' });

  try {
    // Use Polkadot's built-in keyring to restore from JSON
    // This handles all the decryption automatically
    const pair = keyring.addFromJson(keyfile);

    // Unlock the pair with password
    pair.unlock(password);

    return pair;
  } catch (error: any) {
    if (error.message?.includes('password')) {
      throw new Error('Failed to decrypt keyfile. Check your password.');
    }
    throw new Error(`Failed to decrypt keyfile: ${error.message}`);
  }
}

/**
 * Creates a PolkadotSigner from an exported JSON keyfile
 * @param keyfile - The JSON keyfile object or JSON string
 * @param password - The password to decrypt the keyfile
 * @returns A PolkadotSigner that can be used for signing transactions
 */
export async function createSignerFromKeyfile(
  keyfile: PolkadotKeyfile | string,
  password: string
): Promise<PolkadotSigner> {
  // Parse keyfile if it's a string
  const parsedKeyfile = typeof keyfile === 'string' ? JSON.parse(keyfile) : keyfile;

  // Decrypt the keyfile using Polkadot's keyring
  const pair = await decryptKeyfile(parsedKeyfile, password);

  // Extract public key and create sign function
  const publicKey = pair.publicKey;

  // Create sign function that uses the keypair
  const signFn = (message: Uint8Array): Uint8Array => {
    return pair.sign(message);
  };

  // Create PolkadotSigner
  const signer = getPolkadotSigner(
    publicKey,
    'Sr25519',
    signFn
  );

  console.log('✅ Polkadot signer created from keyfile');
  console.log('📬 Account address:', parsedKeyfile.address);
  console.log('📝 Account name:', parsedKeyfile.meta.name || 'Unnamed');
  console.log('🔑 Public key:', u8aToHex(publicKey));

  return signer;
}

/**
 * Load keyfile from environment variable
 * Expects POLKADOT_ADMIN_KEYFILE to contain the JSON string
 * and POLKADOT_ADMIN_PASSWORD to contain the decryption password
 */
export async function createSignerFromEnv(): Promise<PolkadotSigner> {
  const keyfileJson = process.env.POLKADOT_ADMIN_KEYFILE;
  const password = process.env.POLKADOT_ADMIN_PASSWORD;

  if (!keyfileJson) {
    throw new Error('POLKADOT_ADMIN_KEYFILE not set in environment variables');
  }

  if (!password) {
    throw new Error('POLKADOT_ADMIN_PASSWORD not set in environment variables');
  }

  return await createSignerFromKeyfile(keyfileJson, password);
}
