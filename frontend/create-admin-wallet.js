// Script to create a new admin wallet for token distribution
const { mnemonicGenerate } = require('@polkadot/util-crypto');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function createWallet() {
  // Wait for crypto to be ready
  await cryptoWaitReady();

  // Generate new mnemonic (12 words)
  const mnemonic = mnemonicGenerate(12);

  // Create keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Add account from mnemonic
  const pair = keyring.addFromMnemonic(mnemonic);

  console.log('\n🎉 NEW ADMIN WALLET CREATED!\n');
  console.log('=' .repeat(60));
  console.log('\n📝 SEED PHRASE (SAVE THIS SECURELY!):');
  console.log('   ', mnemonic);
  console.log('\n📬 POLKADOT ADDRESS:');
  console.log('   ', pair.address);
  console.log('\n' + '='.repeat(60));
  console.log('\n⚠️  IMPORTANT NEXT STEPS:\n');
  console.log('1. Copy the seed phrase above');
  console.log('2. Add to .env.local:');
  console.log(`   POLKADOT_ADMIN_SEED="${mnemonic}"`);
  console.log('\n3. Get WND testnet tokens:');
  console.log('   https://faucet.polkadot.io/westend');
  console.log('   Paste address:', pair.address);
  console.log('\n4. Create FWT asset & mint tokens:');
  console.log('   https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-asset-hub-rpc.polkadot.io#/assets');
  console.log('   - Create Asset ID: 2024');
  console.log('   - Mint 1,000,000 FWT to:', pair.address);
  console.log('\n5. Restart dev server: npm run dev\n');
}

createWallet().catch(console.error);
