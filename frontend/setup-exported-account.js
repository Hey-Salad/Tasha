// Script to set up your exported Polkadot account as the admin account
const fs = require('fs');
const path = require('path');

async function setupAccount() {
  console.log('\n🔐 Setting up exported Polkadot account as admin account\n');
  console.log('=' .repeat(70));

  // Read the exported account JSON file
  const keyfilePath = process.argv[2];

  if (!keyfilePath) {
    console.error('\n❌ Error: Please provide the path to your exported account JSON file\n');
    console.log('Usage: node setup-exported-account.js <path-to-keyfile.json>\n');
    console.log('Example: node setup-exported-account.js ~/Downloads/5Fh9k...json\n');
    process.exit(1);
  }

  if (!fs.existsSync(keyfilePath)) {
    console.error(`\n❌ Error: File not found: ${keyfilePath}\n`);
    process.exit(1);
  }

  // Read and parse the keyfile
  const keyfileContent = fs.readFileSync(keyfilePath, 'utf8');
  let keyfile;

  try {
    keyfile = JSON.parse(keyfileContent);
  } catch (error) {
    console.error('\n❌ Error: Invalid JSON file\n');
    process.exit(1);
  }

  // Validate keyfile structure
  if (!keyfile.address || !keyfile.encoded || !keyfile.encoding) {
    console.error('\n❌ Error: Invalid Polkadot keyfile format\n');
    process.exit(1);
  }

  console.log('\n✅ Account loaded successfully!\n');
  console.log('📬 Address:', keyfile.address);
  console.log('📝 Name:', keyfile.meta?.name || 'Unnamed');
  console.log('📅 Created:', keyfile.meta?.whenCreated ? new Date(keyfile.meta.whenCreated).toLocaleString() : 'Unknown');
  console.log('\n' + '='.repeat(70));

  // Create the environment variable content
  // We need to escape the JSON string for .env file
  const keyfileJsonEscaped = JSON.stringify(keyfileContent);

  console.log('\n📋 Add these lines to your .env file:\n');
  console.log('# Polkadot Admin Account (Exported Keyfile)');
  console.log(`POLKADOT_ADMIN_KEYFILE='${keyfileContent}'`);
  console.log('POLKADOT_ADMIN_PASSWORD=YOUR_PASSWORD_HERE');
  console.log('\n⚠️  IMPORTANT: Replace YOUR_PASSWORD_HERE with your actual password!\n');

  console.log('=' .repeat(70));
  console.log('\n📝 Next steps:\n');
  console.log('1. Copy the POLKADOT_ADMIN_KEYFILE line above to your .env file');
  console.log('2. Set POLKADOT_ADMIN_PASSWORD to your account password');
  console.log('3. You can remove or comment out POLKADOT_ADMIN_SEED (it\'s now a fallback)');
  console.log('4. Verify your account is funded:');
  console.log(`   https://assethub-westend.subscan.io/account/${keyfile.address}`);
  console.log('5. Restart your dev server: npm run dev\n');

  console.log('🔒 Security tips:');
  console.log('   - Never commit your .env file to git');
  console.log('   - Keep your password secure');
  console.log('   - This account will be used to distribute FWT tokens\n');
}

setupAccount().catch(console.error);
