# HeySalad ® Tasha 🥗🤖

## Conversational AI Agent for Food Waste Reduction on Polkadot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Polkadot](https://img.shields.io/badge/Built%20on-Polkadot-E6007A)](https://polkadot.network/)
[![Fast Grant](https://img.shields.io/badge/Polkadot-Fast%20Grant-success)](https://github.com/Polkadot-Fast-Grants/apply)

> **Making sustainability engaging through voice interaction and blockchain rewards**

HeySalad ® Tasha is an AI-powered voice assistant that helps users reduce food waste through natural conversation while earning blockchain rewards. Built during the EasyA Hackathon and funded by Polkadot Fast-Grants, it combines 11Labs voice technology with Google Gemini AI and Azure OpenAI for robust verification on Polkadot's Asset-Hub.

## 🌟 Key Features

- 🎙️ **Voice-First Interface** - Natural conversation with Tasha using 11Labs
- 🪙 **Blockchain Rewards** - Earn FWT (Food Waste Tokens) on Polkadot Asset-Hub
- 🤖 **Dual AI System** - Google Gemini (primary) + Azure OpenAI (fallback) for reliable verification
- 🏦 **Banking Integration** - UberEats API for purchase verification
- 📱 **Web dApp** - React/Next.js interface with wallet integration
- 🌍 **Environmental Impact** - Track CO₂ emissions prevented
- 🔥 **Firebase Integration** - Real-time data synchronization
- 📊 **Supabase Backend** - Robust database and authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MetaMask or Polkadot.js wallet
- Access to Asset-Hub Westend Testnet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hey-Salad/Tasha.git
   cd Tasha/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```env
   # Blockchain
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_fwt_contract_address
   NEXT_PUBLIC_RPC_ENDPOINT=wss://westend-asset-hub-rpc.polkadot.io
   
   # AI Services - Primary: Google Gemini, Secondary: Azure OpenAI
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   
   # Azure OpenAI (Fallback - Advanced Reasoning)
   NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=your_azure_endpoint
   AZURE_OPENAI_KEY=your_azure_key
   NEXT_PUBLIC_AZURE_API_VERSION=2024-05-01-preview
   NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT=gpt-4
   
   # Voice Services - 11Labs
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
   NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your_voice_id
   
   # Banking Integration
   NEXT_PUBLIC_UBER_CLIENT_ID=your_uber_client_id
   UBER_CLIENT_SECRET=your_uber_client_secret
   
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

## 🤖 AI System Architecture

### Dual AI Configuration

**Primary AI: Google Gemini**
- Fast response times
- Cost-effective
- Excellent natural language understanding
- Image analysis capabilities

**Secondary AI: Azure OpenAI (GPT-4)**
- Fallback when Gemini is unavailable
- Advanced reasoning for complex queries
- Enterprise-grade reliability
- Better handling of edge cases

### AI Verification Process

1. **Initial Processing** - Gemini analyzes user input and waste claims
2. **Image Verification** - Computer vision validates uploaded photos
3. **Confidence Scoring** - AI assigns verification confidence (0-100%)
4. **Fallback System** - Switches to Azure OpenAI if Gemini fails or confidence is low
5. **Human Review** - Very low confidence scores trigger manual review

## 💰 Token System (FWT)

### How It Works

1. **Log waste reduction** through voice or manual input
2. **AI Verification** - Dual AI system (Gemini + Azure OpenAI) analyzes your submission
3. **Earn FWT tokens** minted directly to your wallet
4. **Track impact** with environmental metrics

### Token Economics

- **Emission Rate**: 10 FWT per kg of food waste reduced
- **Verification**: Dual AI + optional manual review
- **Rewards**: Instant minting to your wallet
- **Utility**: Governance, staking, marketplace access

### Smart Contract

Our FWT token contract is deployed on Polkadot Asset-Hub:

**Contract Address**: `0x34F4EB3Cce74e851E389E6a9Ad0Ad61f647F1B0c`

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

## 🏦 Banking Integration

### UberEats API Integration

**Features:**
- Transaction verification for food purchases
- Automatic waste reduction detection
- Receipt analysis and categorization
- Spending pattern insights

**Setup:**
1. Register for UberEats Developer API
2. Configure OAuth for secure authentication
3. Set up webhook endpoints for real-time updates

### Transaction Verification Flow

1. **Purchase Detection** - Monitor food-related transactions
2. **Waste Correlation** - Match purchases with waste reduction claims
3. **AI Analysis** - Verify logical consistency
4. **Token Reward** - Automatic FWT minting for verified reductions

## 🔥 Firebase & Supabase Integration

### Firebase Features
- **Real-time Database** - Live updates across all users
- **Authentication** - Secure user management
- **Cloud Functions** - Serverless backend processing
- **Analytics** - User behavior tracking

### Supabase Features
- **PostgreSQL Database** - Robust data storage
- **Row Level Security** - Fine-grained permissions
- **Real-time subscriptions** - Live data updates
- **RESTful API** - Easy integration

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

# AI system tests
npm run test:ai
```

### Test Coverage

- ✅ Smart contract functions
- ✅ Voice processing pipeline
- ✅ Dual AI verification system
- ✅ Wallet integration
- ✅ Banking API interactions
- ✅ Firebase/Supabase integration

## 🏗️ Architecture

### Frontend Structure

```
frontend/src/
├── app/
│   ├── page.tsx              # Main application
│   ├── layout.tsx            # App layout
│   └── api/
│       ├── ai/route.ts       # AI verification API
│       ├── gemini/route.ts   # Google Gemini integration
│       └── openai/route.ts   # Azure OpenAI integration
├── components/
│   ├── Dashboard/            # Dashboard components
│   ├── LogWaste/            # Waste logging forms
│   ├── VoiceInterface/      # Voice interaction components
│   ├── Sidebar.tsx          # Navigation
│   └── WalletConnectionButton.tsx
├── services/
│   ├── ElevenLabsService.ts  # Voice integration
│   ├── ContractInteraction.ts # Blockchain calls
│   ├── GeminiService.ts     # Google Gemini AI
│   ├── OpenAIService.ts     # Azure OpenAI integration
│   ├── FirebaseService.ts   # Firebase integration
│   ├── SupabaseService.ts   # Supabase integration
│   └── UberEatsService.ts   # Banking integration
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   ├── supabase.ts          # Supabase configuration
│   └── ai-fallback.ts       # AI fallback logic
└── types/
    └── index.ts             # TypeScript definitions
```

### Key Services

1. **AI Service** (`GeminiService.ts` + `OpenAIService.ts`)
   - Primary: Google Gemini for fast, cost-effective processing
   - Fallback: Azure OpenAI for complex reasoning
   - Automatic failover and load balancing

2. **Voice Service** (`ElevenLabsService.ts`)
   - Speech-to-text conversion
   - Natural language processing
   - Text-to-speech responses
   - Multiple voice options (Tasha, Chef Mia)

3. **Blockchain Service** (`ContractInteraction.ts`)
   - Wallet connections
   - Smart contract interactions
   - Transaction management

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
- Firebase Analytics integration

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

# Database
npm run db:migrate   # Run Supabase migrations
npm run db:seed      # Seed database with test data
```

### Environment Setup Guide

1. **Create accounts for all services:**
   - Google Cloud (for Gemini API)
   - Microsoft Azure (for OpenAI)
   - 11Labs (for voice)
   - Firebase (for real-time features)
   - Supabase (for database)
   - UberEats Developer Portal

2. **Configure API keys in `.env.local`**

3. **Set up database schemas:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Test all integrations:**
   ```bash
   npm run test:integration
   ```

## 📊 Roadmap

### ✅ Milestone 1 (Completed)
- [x] Basic frontend with wallet integration
- [x] Smart contract deployment
- [x] Package.json dependency fixes
- [x] Development environment setup

### 🚧 Milestone 2 (In Progress)
- [ ] Dual AI system implementation (Gemini + OpenAI)
- [ ] 11Labs voice integration
- [ ] UberEats API integration
- [ ] Firebase/Supabase setup
- [ ] Basic voice commands

### 🔮 Milestone 3 (Next)
- [ ] Advanced AI verification
- [ ] Location-based features
- [ ] NFT achievements
- [ ] Community leaderboards
- [ ] Mobile application

### 🚀 Future Plans
- Cross-chain compatibility
- Enterprise solutions
- Restaurant partnerships
- Global scaling

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Polkadot Fast-Grants Programme** for funding
- **EasyA Hackathon** for the initial platform
- **11Labs** for voice technology
- **Google** for Gemini AI services
- **Microsoft Azure** for OpenAI services
- **Firebase** for real-time infrastructure
- **Supabase** for database services
- **Polkadot community** for ongoing support

---

**Making food waste reduction conversational, verifiable, and rewarding.**

*Built with ❤️ for the Polkadot ecosystem*