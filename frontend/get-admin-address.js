// Script to get the admin wallet address from the seed phrase in .env
require('dotenv').config({ path: '../.env' });
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function getAdminAddress() {
  // Wait for crypto to be ready
  await cryptoWaitReady();

  const seedPhrase = process.env.POLKADOT_ADMIN_SEED;

  if (!seedPhrase) {
    console.error('\n❌ ERROR: POLKADOT_ADMIN_SEED not found in .env file\n');
    console.log('Please add your seed phrase to .env:');
    console.log('POLKADOT_ADMIN_SEED="your twelve word seed phrase here"\n');
    process.exit(1);
  }

  try {
    // Create keyring with Westend prefix (42)
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });

    // Add account from mnemonic
    const pair = keyring.addFromMnemonic(seedPhrase);

    // Get the Westend address
    const westendAddress = pair.address;

    console.log('\n🔑 ADMIN ACCOUNT DETAILS\n');
    console.log('='.repeat(70));
    console.log('\n📬 Westend Address:');
    console.log('   ', westendAddress);
    console.log('\n📝 Public Key (hex):');
    console.log('   ', Buffer.from(pair.publicKey).toString('hex'));
    console.log('\n' + '='.repeat(70));
    console.log('\n💰 FUND YOUR ACCOUNT:\n');
    console.log('1. Visit the Westend faucet:');
    console.log(`   https://faucet.polkadot.io/westend?address=${westendAddress}`);
    console.log('\n2. Request WND tokens (needed for transaction fees)');
    console.log('\n3. Check your balance:');
    console.log(`   https://westend.subscan.io/account/${westendAddress}`);
    console.log('\n4. Create FWT Asset #2024 and mint tokens to this address\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message, '\n');
    process.exit(1);
  }
}

getAdminAddress().catch(console.error);
