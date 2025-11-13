// Script to create FWT (Food Waste Token) asset on Westend Asset Hub
// Run: node create-fwt-asset.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('polkadot-api');
const { getWsProvider } = require('@polkadot-api/ws-provider/node');
const { assetHubWestend, MultiAddress } = require('@polkadot-api/descriptors');
const { sr25519CreateDerive } = require('@polkadot-labs/hdkd');
const { mnemonicToEntropy, entropyToMiniSecret } = require('@polkadot-labs/hdkd-helpers');
const { getPolkadotSigner } = require('polkadot-api/signer');
const { AccountId } = require('@polkadot-api/substrate-bindings');

const ASSET_ID = 2024;
const ASSET_NAME = 'Food Waste Token';
const ASSET_SYMBOL = 'FWT';
const DECIMALS = 12;
const MIN_BALANCE = 1n; // 1 unit minimum balance

async function main() {
  console.log('🚀 Creating FWT Asset on Westend Asset Hub\n');

  // Get admin seed from env
  const seedPhrase = process.env.POLKADOT_ADMIN_SEED?.replace(/"/g, '').trim();
  if (!seedPhrase) {
    console.error('❌ POLKADOT_ADMIN_SEED not found in .env.local');
    process.exit(1);
  }

  // Create signer
  const entropy = mnemonicToEntropy(seedPhrase);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const keypair = derive('');
  const signer = getPolkadotSigner(keypair.publicKey, 'Sr25519', keypair.sign);

  // Get address from public key
  const adminAddress = AccountId().dec(keypair.publicKey);

  console.log('✅ Admin signer created');
  console.log('📍 Admin address:', adminAddress);
  console.log('');

  // Connect to Asset Hub
  const provider = getWsProvider('wss://westend-asset-hub-rpc.polkadot.io');
  const client = createClient(provider);
  const api = client.getTypedApi(assetHubWestend);

  console.log('🔗 Connected to Westend Asset Hub\n');

  try {
    // Step 1: Create the asset
    console.log(`📝 Step 1: Creating asset ID ${ASSET_ID}...`);
    const createTx = api.tx.Assets.create({
      id: ASSET_ID,
      admin: MultiAddress.Id(adminAddress),
      min_balance: MIN_BALANCE
    });

    console.log('⏳ Submitting create transaction...');
    const createResult = await createTx.signSubmitAndWatch(signer);

    await new Promise((resolve) => {
      createResult.subscribe({
        next: (event) => {
          console.log('📡 Event:', event.type);
          if (event.type === 'finalized') {
            console.log('✅ Asset created successfully!');
            console.log('📝 Block hash:', event.block.hash);
            resolve();
          }
        },
        error: (err) => {
          console.error('❌ Error creating asset:', err.message);
          process.exit(1);
        }
      });
    });

    // Step 2: Set metadata
    console.log('\n📝 Step 2: Setting asset metadata...');
    const metadataTx = api.tx.Assets.set_metadata({
      id: ASSET_ID,
      name: ASSET_NAME,
      symbol: ASSET_SYMBOL,
      decimals: DECIMALS
    });

    console.log('⏳ Submitting metadata transaction...');
    const metadataResult = await metadataTx.signSubmitAndWatch(signer);

    await new Promise((resolve) => {
      metadataResult.subscribe({
        next: (event) => {
          console.log('📡 Event:', event.type);
          if (event.type === 'finalized') {
            console.log('✅ Metadata set successfully!');
            resolve();
          }
        },
        error: (err) => {
          console.error('❌ Error setting metadata:', err.message);
          process.exit(1);
        }
      });
    });

    // Step 3: Mint initial supply
    const INITIAL_SUPPLY = 1_000_000n * BigInt(Math.pow(10, DECIMALS)); // 1 million FWT
    console.log(`\n📝 Step 3: Minting ${Number(INITIAL_SUPPLY) / Math.pow(10, DECIMALS)} FWT to admin...`);

    const mintTx = api.tx.Assets.mint({
      id: ASSET_ID,
      beneficiary: MultiAddress.Id(adminAddress),
      amount: INITIAL_SUPPLY
    });

    console.log('⏳ Submitting mint transaction...');
    const mintResult = await mintTx.signSubmitAndWatch(signer);

    await new Promise((resolve) => {
      mintResult.subscribe({
        next: (event) => {
          console.log('📡 Event:', event.type);
          if (event.type === 'finalized') {
            console.log('✅ Tokens minted successfully!');
            resolve();
          }
        },
        error: (err) => {
          console.error('❌ Error minting tokens:', err.message);
          process.exit(1);
        }
      });
    });

    console.log('\n🎉 SUCCESS! FWT Asset created and tokens minted!');
    console.log(`\n📊 Asset Summary:`);
    console.log(`   Asset ID: ${ASSET_ID}`);
    console.log(`   Name: ${ASSET_NAME}`);
    console.log(`   Symbol: ${ASSET_SYMBOL}`);
    console.log(`   Decimals: ${DECIMALS}`);
    console.log(`   Initial Supply: ${Number(INITIAL_SUPPLY) / Math.pow(10, DECIMALS)} FWT`);
    console.log(`   Owner: ${adminAddress}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    client.destroy();
    process.exit(0);
  }
}

main();
