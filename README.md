# HeySalad ® Tasha 🥗🤖

## Conversational AI Agent for Food Waste Reduction on Polkadot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Polkadot](https://img.shields.io/badge/Built%20on-Polkadot-E6007A)](https://polkadot.network/)
[![Fast Grant](https://img.shields.io/badge/Polkadot-Fast%20Grant-success)](https://github.com/Polkadot-Fast-Grants/apply)

> **Making sustainability engaging through voice interaction and blockchain rewards**

HeySalad ® Tasha is an AI-powered voice assistant that helps users reduce food waste through natural conversation while earning blockchain rewards. Built during the EasyA Hackathon and funded by Polkadot Fast-Grants, it combines 11Labs voice technology with Microsoft Azure AI verification on Polkadot's Asset-Hub.

## 🌟 Key Features

- 🎙️ **Voice-First Interface** - Natural conversation with Tasha using 11Labs
- 🪙 **Blockchain Rewards** - Earn FWT (Food Waste Tokens) on Polkadot Asset-Hub
- 🤖 **AI Verification** - Microsoft Azure AI validates waste reduction claims
- 🏦 **Bank Integration** - Monzo API for purchase verification
- 📱 **Web dApp** - React/Next.js interface with wallet integration
- 🌍 **Environmental Impact** - Track CO₂ emissions prevented

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MetaMask or Polkadot.js wallet
- Access to Asset-Hub Westend Testnet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hey-Salad/Tasha.git
<<<<<<< HEAD
   cd Tasha/frontend
=======
   cd Tasha
>>>>>>> 8049455715a83d733b9573a8b42a2d0c1b028c2c
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   # Blockchain
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_fwt_contract_address
   NEXT_PUBLIC_RPC_ENDPOINT=wss://westend-asset-hub-rpc.polkadot.io
   
   # Voice & AI Services
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
   AZURE_AI_ENDPOINT=your_azure_endpoint
   AZURE_AI_KEY=your_azure_key
   
   # Banking Integration
   MONZO_CLIENT_ID=your_monzo_client_id
   MONZO_CLIENT_SECRET=your_monzo_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗣️ Voice Interface Usage

### Starting a Conversation

1. **Connect your wallet** using the wallet button in the top right
2. **Click the microphone** icon or say "Hey Tasha"
3. **Start logging waste reduction**:

   ```
   User: "Hey Tasha, I just donated 2kg of leftover food to the food bank"
   Tasha: "That's amazing! I can help you log that donation. Can you tell me more about what you donated?"
   User: "It was leftover pasta and bread from yesterday's dinner"
   Tasha: "Perfect! I'll verify this and mint your FWT tokens. Can you take a photo for verification?"
   ```

### Voice Commands

- `"Hey Tasha, log food waste reduction"`
- `"What's my token balance?"`
- `"Show me my recent transactions"`
- `"Help me find a restaurant nearby"`

## 💰 Token System (FWT)

### How It Works

1. **Log waste reduction** through voice or manual input
2. **AI verification** analyzes your submission
3. **Earn FWT tokens** minted directly to your wallet
4. **Track impact** with environmental metrics

### Token Economics

- **Emission Rate**: 10 FWT per kg of food waste reduced
- **Verification**: AI + optional manual review
- **Rewards**: Instant minting to your wallet
- **Utility**: Governance, staking, marketplace access

### Smart Contract

Our FWT token contract is deployed on Polkadot Asset-Hub:

**Contract Address**: `[To be added after deployment]`

**Key Functions**:
- `logWasteReduction(uint256 amount, string actionType)` - Log and earn tokens
- `getUserContribution(address user)` - Check total contributions
- `balanceOf(address account)` - Check token balance

## 🔗 Wallet Integration

### Supported Wallets

- **MetaMask** - Primary wallet support
- **Polkadot.js** - Native Polkadot wallet
- **SubWallet** - Mobile-friendly option

### Connecting Your Wallet

1. Install your preferred wallet extension
2. Configure for Asset-Hub Westend Testnet:
   - **Network**: Asset Hub Westend
   - **RPC**: `wss://westend-asset-hub-rpc.polkadot.io`
   - **Chain ID**: 1000

3. Get testnet tokens:
   - Visit [Westend Faucet](https://faucet.polkadot.io/)
   - Request WND tokens for gas fees

## 🏦 Bank Integration (Monzo)

### Setup

1. **Create Monzo Developer Account**
   - Visit [Monzo Developers](https://developers.monzo.com/)
   - Create an OAuth application

2. **Configure OAuth Redirect**
   ```
   Redirect URI: http://localhost:3000/auth/monzo/callback
   ```

3. **Authentication Flow**
   - Users click "Connect Monzo"
   - OAuth flow redirects to Monzo
   - Tokens stored securely for API calls

### Purchase Verification

The system automatically:
- Fetches recent food-related transactions
- Matches purchases with waste reduction claims
- Provides additional verification context

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Smart contract tests
cd ../contracts
npx hardhat test

# Integration tests
npm run test:integration

# Voice processing tests
npm run test:voice
```

### Test Coverage

- ✅ Smart contract functions
- ✅ Voice processing pipeline
- ✅ AI verification system
- ✅ Wallet integration
- ✅ Bank API interactions

### Testing Guide

1. **Local Development**
   ```bash
   npm run dev
   npm test
   ```

2. **Smart Contract Testing**
   ```bash
   cd contracts
   npx hardhat compile
   npx hardhat test
   ```

3. **Voice Testing**
   - Use test audio files in `/test/audio/`
   - Mock 11Labs API responses
   - Verify speech-to-text accuracy

## 🏗️ Architecture

### Frontend Structure

```
frontend/src/
├── app/
│   ├── page.tsx              # Main application
│   ├── layout.tsx            # App layout
│   └── api/ai/route.ts       # AI verification API
├── components/
│   ├── Dashboard/            # Dashboard components
│   ├── LogWaste/            # Waste logging forms
│   ├── Sidebar.tsx          # Navigation
│   └── WalletConnectionButton.tsx
├── services/
│   ├── ElevenLabsService.ts  # Voice integration
│   ├── ContractInteraction.ts # Blockchain calls
│   ├── AzureAIService.ts    # AI verification
│   └── MonzoService.ts      # Bank integration
└── types/
    └── index.ts             # TypeScript definitions
```

### Smart Contract

```
contracts/
└── FoodWasteToken.sol       # ERC-20 token with waste logging
```

### Key Services

1. **Voice Service** (`ElevenLabsService.ts`)
   - Speech-to-text conversion
   - Natural language processing
   - Text-to-speech responses

2. **Blockchain Service** (`ContractInteraction.ts`)
   - Wallet connections
   - Smart contract interactions
   - Transaction management

3. **AI Verification** (`AzureAIService.ts`)
   - Image analysis
   - Claim verification
   - Confidence scoring

## 🌍 Environmental Impact

### Calculations

- **Food Waste to CO₂**: 1kg food waste = 3.4kg CO₂ emissions
- **Real-time Tracking**: Dashboard shows environmental impact
- **Community Impact**: Leaderboards and achievements

### Metrics Tracked

- Total food waste reduced (grams)
- CO₂ emissions prevented (kg)
- FWT tokens earned
- Community ranking

## 🔧 Development

### Project Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run unit tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Smart Contracts
npm run contract:compile  # Compile contracts
npm run contract:deploy   # Deploy to testnet
npm run contract:verify   # Verify on explorer
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Workflow

1. **Backend Changes**: Update services in `/src/services/`
2. **Frontend Changes**: Update components in `/src/components/`
3. **Contract Changes**: Update `/contracts/FoodWasteToken.sol`
4. **Tests**: Add tests for all new functionality

## 📊 Roadmap

### ✅ Milestone 1 (Current)
- [x] Basic frontend with wallet integration
- [x] Smart contract development
- [ ] 11Labs voice integration
- [ ] Monzo API integration
- [ ] AI verification system

### 🚧 Milestone 2 (Next)
- [ ] Advanced AI verification
- [ ] Location-based features
- [ ] NFT achievements
- [ ] Community leaderboards

### 🔮 Future Plans
- Mobile applications (iOS/Android)
- Food delivery integrations
- Cross-chain compatibility
- Enterprise solutions

## 🤝 Community & Support

### Links

- 🌐 **Website**: [https://heysalad.io/](https://heysalad.io/)
- 🤖 **AI Platform**: [https://ai.heysalad.app/](https://ai.heysalad.app/)
- 🧑‍⚕️ **Nutritionist Platform**: [https://nutritionists.heysalad.app/](https://nutritionists.heysalad.app/)
- 📱 **Previous dApp**: [https://dapp.saladhr.com/waste](https://dapp.saladhr.com/waste)

### Contact

- **Email**: peter@heysalad.io
- **GitHub**: [@chilu18](https://github.com/chilu18)
- **LinkedIn**: [Peter Machona](https://www.linkedin.com/in/chilumba-peter-machona/)

### Grant Information

This project is funded by the **Polkadot Fast-Grants Programme**:
- **Grant Amount**: $10,000 USD
- **Duration**: 4 weeks
- **Focus**: Voice technology + blockchain integration

## 📄 License

<<<<<<< HEAD
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
=======
MIT License
>>>>>>> 8049455715a83d733b9573a8b42a2d0c1b028c2c

## 🙏 Acknowledgments

- **Polkadot Fast-Grants Programme** for funding
- **EasyA Hackathon** for the initial platform
- **11Labs** for voice technology
- **Microsoft Azure** for AI services
- **Polkadot community** for ongoing support

---

<<<<<<< HEAD
**Making food waste reduction conversational, verifiable, and rewarding.**

*Built with ❤️ for the Polkadot ecosystem*
=======
Peter - HeySalad Team
- Email: peter@heysalad.io
- Project Link: https://github.com/Hey-Salad/Tasha

## 🙏 Acknowledgements

- Polkadot Hackathon
- Azure AI Services
- ElevenLabs Voice AI
- Open-source community
>>>>>>> 8049455715a83d733b9573a8b42a2d0c1b028c2c
