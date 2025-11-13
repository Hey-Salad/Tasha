// Test script to verify the exported account import works correctly
require('dotenv').config({ path: '../.env' });

async function testAccountImport() {
  console.log('\n🧪 Testing exported account import...\n');
  console.log('=' .repeat(70));

  try {
    // Dynamically import the ES module
    const { createSignerFromKeyfile } = await import('./src/lib/server/accountImport.ts');
    const { encodeAddress } = await import('@polkadot/util-crypto');

    // Get keyfile and password from environment
    const keyfileJson = process.env.POLKADOT_ADMIN_KEYFILE;
    const password = process.env.POLKADOT_ADMIN_PASSWORD;

    if (!keyfileJson) {
      console.error('\n❌ Error: POLKADOT_ADMIN_KEYFILE not set in .env file');
      console.log('\nPlease add it to your .env file as shown by the setup script.\n');
      process.exit(1);
    }

    if (!password || password === 'YOUR_PASSWORD_HERE') {
      console.error('\n❌ Error: POLKADOT_ADMIN_PASSWORD not set or still has placeholder value');
      console.log('\nPlease set your actual password in the .env file.\n');
      process.exit(1);
    }

    console.log('✅ Environment variables found');
    console.log('\n🔓 Attempting to decrypt and import account...\n');

    // Try to create signer (now async)
    const signer = await createSignerFromKeyfile(keyfileJson, password);

    // Convert public key to address
    const address = encodeAddress(signer.publicKey, 42); // 42 is Westend prefix

    console.log('=' .repeat(70));
    console.log('\n✅ SUCCESS! Account imported successfully!\n');
    console.log('📬 Address:', address);
    console.log('📝 Public Key:', Buffer.from(signer.publicKey).toString('hex'));
    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 Your exported account is ready to use for token distribution!');
    console.log('\n📊 Next steps:\n');
    console.log('1. Verify the account is funded:');
    console.log(`   https://assethub-westend.subscan.io/account/${address}`);
    console.log('\n2. Check WND balance (for transaction fees)');
    console.log('3. Check FWT token balance (Asset ID: 2024)');
    console.log('\n4. Your application will automatically use this account for distributions\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n');

    if (error.message.includes('password')) {
      console.log('💡 Tip: Make sure you\'re using the correct password for this account');
      console.log('   This is the password you set when you exported the account.\n');
    } else if (error.message.includes('decrypt')) {
      console.log('💡 Tip: The account file might be corrupted or the password is incorrect\n');
    } else {
      console.error('Full error:', error);
    }

    process.exit(1);
  }
}

testAccountImport().catch(console.error);
