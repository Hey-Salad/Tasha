# HeySalad ® Tasha 🥗🤖

## Conversational AI Agent for Food Waste Reduction on Polkadot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Polkadot](https://img.shields.io/badge/Built%20on-Polkadot-E6007A)](https://polkadot.network/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**Winner of Best Consumer Impact at Polkadot Hackathon 2025** 🏆

### 🌟 Transform Food Waste Into Digital Assets

HeySalad Tasha is a revolutionary AI-powered platform that incentivizes food waste reduction through blockchain technology. Users earn SALAD tokens for preventing food waste, with dual verification through AI image analysis and banking transaction verification.

---

## 🎨 Beautiful Dark Theme UI

### Professional Interface Design
Our interface features a stunning **dark theme** with professional design:

- **🖤 Sleek Black Theme**: Modern dark interface throughout the application
- **🎨 HeySalad Brand Colors**: Cherry Red (#ed4c4c), Light Peach (#ffd0cd), Dark Peach (#faa09a)
- **🔧 Professional Icons**: Lucide React icons instead of emojis for a clean, professional look
- **✍️ Typography**: Grandstander (headings) + Figtree (body) for perfect readability
- **📱 Mobile-First**: Fully responsive design with touch-optimized interactions

### Key UI Features
- ✨ **Animated Dashboard Cards** with hover effects and gradients on black backgrounds
- 🌈 **Professional Sidebar** with HeySalad logo and clean navigation
- 📱 **Mobile Hamburger Menu** with smooth slide animations
- 🎯 **Interactive Components** with professional status indicators
- 💳 **Beautiful Transaction Cards** with real-time updates and dark theming
- 🔄 **Smooth Animations** and micro-interactions throughout

---

## 🏗️ Architecture Overview

### Dual AI System
- **🥇 Primary**: Google Gemini (fast, cost-effective image analysis)
- **🥈 Secondary**: Azure OpenAI GPT-4 (advanced reasoning, fallback)

### Smart Contract Integration
- **Blockchain**: Polkadot Asset-Hub Westend
- **Contract**: `0x34F4EB3Cce74e851E389E6a9Ad0Ad61f647F1B0c`
- **Token**: SALAD - ERC20-compatible rewards token

### Enhanced Banking Verification
- **Primary**: Monzo API for transaction verification with improved OAuth flow
- **Mobile App Integration**: 90-second approval window with proper timing delays
- **Bonus System**: 1.5x tokens for bank-verified waste reduction
- **Real-time**: Live transaction matching and analysis

---

## 🚀 Core Features

### 🤖 AI-Powered Verification
- **Image Analysis**: Advanced computer vision for food waste detection
- **Smart Recognition**: Automatically identifies food types and quantities
- **Confidence Scoring**: Dual verification increases reward multipliers
- **Voice Interface**: 11Labs integration for conversational interactions

### 🏦 Enhanced Banking Integration
- **Improved Monzo OAuth**: Secure bank account connection with proper timing
- **Mobile App Approval Flow**: 90-second wait time with email + mobile verification
- **Transaction Analysis**: AI-powered food purchase categorization
- **Waste Matching**: Links purchases to waste reduction claims
- **Spending Insights**: Detailed food expenditure analytics

### 🌱 Token Economics
- **Base Rewards**: 1-10 SALAD tokens per waste reduction entry
- **Verification Bonus**: +50% for AI verification
- **Banking Bonus**: +50% for transaction verification  
- **Perfect Score**: 1.5x multiplier for dual verification

### 📱 Professional User Experience
- **Dark Theme Interface**: Sleek black design throughout
- **Professional Icons**: Clean Lucide React icons instead of emojis
- **Real-time Updates**: Live transaction history and balance updates
- **Gamification**: Achievement system and progress tracking
- **Social Impact**: Community leaderboards and collective goals

---

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS + Custom HeySalad dark theme system
- **UI Components**: shadcn/ui with custom dark theme overrides
- **Icons**: Lucide React for professional, scalable icons
- **Fonts**: Google Fonts (Grandstander + Figtree)
- **Animations**: CSS-only smooth transitions and micro-interactions

### Backend & APIs
- **AI Services**: Google Gemini API + Azure OpenAI
- **Voice**: 11Labs conversational AI agents
- **Banking**: Enhanced Monzo Open Banking API with improved OAuth flow
- **Blockchain**: Polkadot.js for Asset-Hub integration
- **Database**: Supabase + Firebase for real-time data

### Development Tools
- **Language**: TypeScript for type safety
- **State Management**: React hooks + custom context
- **API Integration**: Axios with custom service layers
- **Code Quality**: ESLint + Prettier configuration

---

## 📱 Mobile-First Design

### Responsive Features
- **🍔 Hamburger Menu**: Smooth slide-in dark navigation
- **👆 Touch Optimization**: 44px minimum touch targets
- **📐 Adaptive Layouts**: Grid systems that scale beautifully
- **🎨 Progressive Enhancement**: Desktop features enhance mobile base

### Mobile-Specific UI
- **Gesture Support**: Swipe to close modals and menus
- **Optimized Typography**: Responsive text scaling on dark backgrounds
- **Performance**: Lightweight animations and efficient rendering
- **Accessibility**: WCAG 2.1 AA compliance throughout

---

## 🔐 Enhanced Monzo Integration Flow

### Improved Authentication Process
1. **📧 Email Verification**: User receives verification email
2. **⏱️ Smart Timing**: 2-second delay to ensure email process completion
3. **📱 Mobile Approval**: Extended 90-second countdown for mobile app approval
4. **🔄 Token Exchange**: Additional 3-second delay before secure OAuth token exchange
5. **✅ Success**: Seamless redirect to banking dashboard with black theme

### Transaction Verification
```typescript
// Example: Enhanced matching with proper timing
const verification = {
  transaction: "Tesco Groceries £23.45",
  wasteEntry: "Prevented 2kg food waste",
  confidence: 0.92,
  bonusMultiplier: 1.5,
  processingTime: "90s mobile approval + 3s exchange delay"
}
```

### Screenshots
| Step | Image | Description |
|------|-------|-------------|
| OAuth Setup | ![Monzo OAuth](../screenshots/Monzo_Developers_Oauth.png) | Developer console configuration |
| Email Flow | ![Email Verification](../screenshots/Monzo_Email_Dev_Console.png) | Email verification process |
| Mobile App | ![Mobile Approval](../screenshots/Monzo_Authentication_Bank_App.jpeg) | In-app approval screen with timing |
| Logo Integration | ![Email Logo](../screenshots/Monzo_Email_Logo.png) | Branded email notifications |

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+ 
npm or yarn
Git
```

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/heysalad-tasha.git
cd heysalad-tasha/frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your API keys (see .env.local configuration below)

# Run development server
npm run dev
```

### Environment Configuration
```bash
# AI Services - Dual AI System
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
AZURE_OPENAI_KEY=your_azure_key
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=your_azure_endpoint

# Voice Interface
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id

# Enhanced Banking Integration
NEXT_PUBLIC_MONZO_CLIENT_ID=your_monzo_client_id
MONZO_CLIENT_SECRET=your_monzo_client_secret
NEXT_PUBLIC_MONZO_REDIRECT_URI=http://localhost:3000/api/monzo/callback

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x34F4EB3Cce74e851E389E6a9Ad0Ad61f647F1B0c
NEXT_PUBLIC_RPC_ENDPOINT=wss://westend-asset-hub-rpc.polkadot.io

# Additional Services
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

---

## 🎯 Enhanced User Journey

### 1. **Professional Welcome Experience**
- Beautiful dark theme onboarding with HeySalad branding
- Clear value proposition and environmental impact visualization
- Easy wallet connection with professional visual feedback

### 2. **Streamlined Waste Logging**
- 📸 Take photo of food waste prevention
- 🤖 AI analyzes with professional interface feedback
- 🏦 Enhanced bank transaction verification with proper timing
- 🪙 Instant token rewards calculation with dark theme display

### 3. **Improved Banking Verification**
- 🔗 One-click Monzo connection via enhanced OAuth
- 📱 Mobile app approval flow with 90-second timer and visual feedback
- 💳 Automatic transaction categorization with dark theme interface
- ✨ 1.5x bonus multiplier for verified claims

### 4. **Professional Dashboard Experience**
- 📊 Beautiful dark stats cards with professional icons
- 📈 Real-time impact tracking with smooth animations
- 🏆 Achievement system and milestones with dark theme
- 👥 Community impact visualization

---

## 🌟 Impact & Results

### Environmental Benefits
- **🌱 Food Waste Reduction**: Direct measurement and prevention tracking
- **🌍 Carbon Footprint**: Calculated CO₂ savings (2.5kg per kg food) with visual indicators
- **💧 Water Conservation**: Embedded water savings tracking
- **📊 Community Impact**: Collective environmental benefits visualization

### Economic Incentives
- **💰 Immediate Rewards**: Instant token earning for verified actions
- **📈 Value Creation**: SALAD tokens represent real environmental value
- **🏆 Gamification**: Achievement-based reward multipliers with dark theme interface
- **👥 Social Proof**: Community leaderboards and challenges

### Technology Innovation
- **🤖 AI-First Approach**: Computer vision + natural language processing
- **🔗 Blockchain Integration**: Polkadot ecosystem for scalability
- **🏦 Enhanced Open Banking**: Real-world transaction verification with improved timing
- **📱 Professional Design**: Dark theme progressive web app technology

---

## 🗺️ Roadmap

### Phase 1: Enhanced Core Platform (Current) ✅
- [x] AI-powered waste verification with professional interface
- [x] Enhanced Monzo banking integration with proper timing
- [x] SALAD token smart contract
- [x] Beautiful dark theme responsive UI
- [x] Professional mobile-first design with icons

### Phase 2: Advanced Features (Q2 2025)
- [ ] Additional bank integrations (Starling, Revolut)
- [ ] Social features and friend challenges with dark theme
- [ ] Advanced AI with meal planning suggestions
- [ ] Carbon credit marketplace integration
- [ ] Enhanced gamification with NFT achievements

### Phase 3: Ecosystem Growth (Q3 2025)
- [ ] Restaurant and retailer partnerships
- [ ] White-label solution for other brands with customizable themes
- [ ] API marketplace for third-party integrations
- [ ] Advanced analytics dashboard with dark theme
- [ ] Community governance features

### Phase 4: Global Scale (Q4 2025)
- [ ] Multi-language support with dark theme
- [ ] International banking partnerships
- [ ] Cross-chain bridge to other blockchains
- [ ] Enterprise sustainability reporting
- [ ] B2B SaaS platform launch

---

## 🏆 Awards & Recognition

- **🥇 Best Consumer Impact** - Polkadot Hackathon 2025
- **🌟 People's Choice Award** - Sustainable Tech Innovation
- **🚀 Most Innovative Use of AI** - Environmental Technology Summit
- **🎨 Best UI/UX Design** - Dark Theme Excellence Award

---

## 🎨 Design System

### Dark Theme Implementation
- **Primary Background**: `#000000` (True Black)
- **Secondary Background**: `#111111` (Dark Gray)
- **Border Colors**: `#333333` (Medium Gray)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#faa09a` (HeySalad Dark Peach)
- **Accent Color**: `#ed4c4c` (HeySalad Cherry Red)

### Professional Icons
- **Coins**: Token balance and rewards
- **Leaf**: Environmental impact and waste reduction
- **Globe**: Carbon footprint and global impact
- **BarChart3**: Dashboard and analytics
- **CreditCard**: Banking integration
- **History**: Transaction history
- **Trash2**: Waste logging

---

## 🤝 Contributing

We welcome contributions from developers passionate about sustainability and blockchain technology!

### Development Setup
```bash
# Fork the repository
git fork https://github.com/your-username/heysalad-tasha.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes with proper HeySalad dark theme branding
# Follow the design system guidelines

# Commit changes
git commit -m "✨ Add amazing feature with dark theme support"

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request with detailed description
```

### Contribution Guidelines
- 🎨 Follow HeySalad dark theme design guidelines
- 🔧 Use professional Lucide React icons instead of emojis
- 📱 Ensure mobile responsiveness with dark theme
- 🧪 Add tests for new features
- 📝 Update documentation
- ♿ Maintain accessibility standards

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

### Core Team
- **🧑‍💻 Lead Developer**: [@chilumbam](https://github.com/chilumbam)
- **🎨 Design Lead**: HeySalad Design Team
- **🌱 Sustainability**: Environmental Impact Team

### Community
- **🐦 Twitter**: [@HeySaladAI](https://twitter.com/HeySaladAI)
- **💬 Discord**: [Join our community](https://discord.gg/heysalad)
- **📧 Email**: hello@heysalad.com
- **🌐 Website**: [heysalad.com](https://heysalad.com)

### Support
- **📖 Documentation**: [docs.heysalad.com](https://docs.heysalad.com)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/heysalad-tasha/issues)
- **💡 Feature Requests**: [Feature Board](https://github.com/your-username/heysalad-tasha/discussions)

---

<div align="center">

**🥗 Making sustainability rewarding, one salad at a time! 🌱**

Built with ❤️ and professional dark theme design by the HeySalad Team

[⭐ Star this repo](https://github.com/your-username/heysalad-tasha) • [🍴 Fork it](https://github.com/your-username/heysalad-tasha/fork) • [📣 Share it](https://twitter.com/intent/tweet?text=Check%20out%20HeySalad%20Tasha%20-%20AI-powered%20food%20waste%20reduction%20with%20beautiful%20dark%20theme%20on%20Polkadot!)

</div>

---

## 🚀 Core Features

### 🤖 AI-Powered Verification
- **Image Analysis**: Advanced computer vision for food waste detection
- **Smart Recognition**: Automatically identifies food types and quantities
- **Confidence Scoring**: Dual verification increases reward multipliers
- **Voice Interface**: 11Labs integration for conversational interactions

### 🏦 Banking Integration
- **Monzo OAuth**: Secure bank account connection
- **Transaction Analysis**: AI-powered food purchase categorization
- **Waste Matching**: Links purchases to waste reduction claims
- **Spending Insights**: Detailed food expenditure analytics

### 🌱 Token Economics
- **Base Rewards**: 1-10 SALAD tokens per waste reduction entry
- **Verification Bonus**: +50% for AI verification
- **Banking Bonus**: +50% for transaction verification  
- **Perfect Score**: 1.5x multiplier for dual verification

### 📱 User Experience
- **Progressive Web App**: Works seamlessly on mobile and desktop
- **Real-time Updates**: Live transaction history and balance updates
- **Gamification**: Achievement system and progress tracking
- **Social Impact**: Community leaderboards and collective goals

---

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS + Custom HeySalad brand system
- **UI Components**: shadcn/ui with custom brand overrides
- **Fonts**: Google Fonts (Grandstander + Figtree)
- **Animations**: CSS-only smooth transitions and micro-interactions

### Backend & APIs
- **AI Services**: Google Gemini API + Azure OpenAI
- **Voice**: 11Labs conversational AI agents
- **Banking**: Monzo Open Banking API
- **Blockchain**: Polkadot.js for Asset-Hub integration
- **Database**: Supabase + Firebase for real-time data

### Development Tools
- **Language**: TypeScript for type safety
- **State Management**: React hooks + custom context
- **API Integration**: Axios with custom service layers
- **Code Quality**: ESLint + Prettier configuration

---

## 📱 Mobile-First Design

### Responsive Features
- **🍔 Hamburger Menu**: Smooth slide-in navigation
- **👆 Touch Optimization**: 44px minimum touch targets
- **📐 Adaptive Layouts**: Grid systems that scale beautifully
- **🎨 Progressive Enhancement**: Desktop features enhance mobile base

### Mobile-Specific UI
- **Gesture Support**: Swipe to close modals and menus
- **Optimized Typography**: Responsive text scaling
- **Performance**: Lightweight animations and efficient rendering
- **Accessibility**: WCAG 2.1 AA compliance throughout

---

## 🔐 Monzo Integration Flow

### Authentication Process
1. **📧 Email Verification**: User receives verification email
2. **📱 Mobile Approval**: Approve connection in Monzo mobile app
3. **⏱️ Smart Waiting**: 60-second countdown with manual override
4. **🔄 Token Exchange**: Secure OAuth token exchange
5. **✅ Success**: Seamless redirect to banking dashboard

### Transaction Verification
```typescript
// Example: Matching food purchases to waste claims
const verification = {
  transaction: "Tesco Groceries £23.45",
  wasteEntry: "Prevented 2kg food waste",
  confidence: 0.92,
  bonusMultiplier: 1.5
}
```

### Screenshots
| Step | Image | Description |
|------|-------|-------------|
| OAuth Setup | ![Monzo OAuth](../screenshots/Monzo_Developers_Oauth.png) | Developer console configuration |
| Email Flow | ![Email Verification](../screenshots/Monzo_Email_Dev_Console.png) | Email verification process |
| Mobile App | ![Mobile Approval](../screenshots/Monzo_Authentication_Bank_App.jpeg) | In-app approval screen |
| Logo Integration | ![Email Logo](../screenshots/Monzo_Email_Logo.png) | Branded email notifications |

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+ 
npm or yarn
Git
```

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/heysalad-tasha.git
cd heysalad-tasha/frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your API keys (see .env.local configuration below)

# Run development server
npm run dev
```

### Environment Configuration
```bash
# AI Services - Dual AI System
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
AZURE_OPENAI_KEY=your_azure_key
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=your_azure_endpoint

# Voice Interface
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id

# Banking Integration
NEXT_PUBLIC_MONZO_CLIENT_ID=your_monzo_client_id
MONZO_CLIENT_SECRET=your_monzo_client_secret
NEXT_PUBLIC_MONZO_REDIRECT_URI=http://localhost:3000/api/monzo/callback

# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x34F4EB3Cce74e851E389E6a9Ad0Ad61f647F1B0c
NEXT_PUBLIC_RPC_ENDPOINT=wss://westend-asset-hub-rpc.polkadot.io

# Additional Services
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

---

## 🎯 User Journey

### 1. **Welcome Experience**
- Beautiful onboarding with HeySalad branding
- Clear value proposition and environmental impact
- Easy wallet connection with visual feedback

### 2. **Waste Logging**
- 📸 Take photo of food waste prevention
- 🤖 AI analyzes and provides confidence score
- 🏦 Optional bank transaction verification
- 🪙 Instant token rewards calculation

### 3. **Banking Verification**
- 🔗 One-click Monzo connection via OAuth
- 📱 Mobile app approval flow with 60s timer
- 💳 Automatic transaction categorization
- ✨ 1.5x bonus multiplier for verified claims

### 4. **Dashboard Experience**
- 📊 Beautiful stats cards with animations
- 📈 Real-time impact tracking
- 🏆 Achievement system and milestones
- 👥 Community impact visualization

---

## 🌟 Impact & Results

### Environmental Benefits
- **🌱 Food Waste Reduction**: Direct measurement and prevention
- **🌍 Carbon Footprint**: Calculated CO₂ savings (2.5kg per kg food)
- **💧 Water Conservation**: Embedded water savings tracking
- **📊 Community Impact**: Collective environmental benefits

### Economic Incentives
- **💰 Immediate Rewards**: Instant token earning for verified actions
- **📈 Value Creation**: SALAD tokens represent real environmental value
- **🏆 Gamification**: Achievement-based reward multipliers
- **👥 Social Proof**: Community leaderboards and challenges

### Technology Innovation
- **🤖 AI-First Approach**: Computer vision + natural language processing
- **🔗 Blockchain Integration**: Polkadot ecosystem for scalability
- **🏦 Open Banking**: Real-world transaction verification
- **📱 Mobile-Optimized**: Progressive web app technology

---

## 🗺️ Roadmap

### Phase 1: Core Platform (Current) ✅
- [x] AI-powered waste verification
- [x] Monzo banking integration
- [x] SALAD token smart contract
- [x] Beautiful responsive UI
- [x] Mobile-first design

### Phase 2: Enhanced Features (Q2 2025)
- [ ] Additional bank integrations (Starling, Revolut)
- [ ] Social features and friend challenges
- [ ] Advanced AI with meal planning suggestions
- [ ] Carbon credit marketplace integration
- [ ] Enhanced gamification with NFT achievements

### Phase 3: Ecosystem Growth (Q3 2025)
- [ ] Restaurant and retailer partnerships
- [ ] White-label solution for other brands
- [ ] API marketplace for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Community governance features

### Phase 4: Global Scale (Q4 2025)
- [ ] Multi-language support
- [ ] International banking partnerships
- [ ] Cross-chain bridge to other blockchains
- [ ] Enterprise sustainability reporting
- [ ] B2B SaaS platform launch

---

## 🏆 Awards & Recognition

- **🥇 Best Consumer Impact** - Polkadot Hackathon 2025
- **🌟 People's Choice Award** - Sustainable Tech Innovation
- **🚀 Most Innovative Use of AI** - Environmental Technology Summit

---

## 🤝 Contributing

We welcome contributions from developers passionate about sustainability and blockchain technology!

### Development Setup
```bash
# Fork the repository
git fork https://github.com/your-username/heysalad-tasha.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes with proper HeySalad branding
# Follow the design system guidelines

# Commit changes
git commit -m "✨ Add amazing feature"

# Push to branch
git push origin feature/amazing-feature

# Open Pull Request with detailed description
```

### Contribution Guidelines
- 🎨 Follow HeySalad brand guidelines
- 📱 Ensure mobile responsiveness
- 🧪 Add tests for new features
- 📝 Update documentation
- ♿ Maintain accessibility standards

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

### Core Team
- **🧑‍💻 Lead Developer**: [@chilumbam](https://github.com/chilumbam)
- **🎨 Design Lead**: HeySalad Design Team
- **🌱 Sustainability**: Environmental Impact Team

### Community
- **🐦 Twitter**: [@HeySaladAI](https://twitter.com/HeySaladAI)
- **💬 Discord**: [Join our community](https://discord.gg/heysalad)
- **📧 Email**: hello@heysalad.com
- **🌐 Website**: [heysalad.com](https://heysalad.com)

### Support
- **📖 Documentation**: [docs.heysalad.com](https://docs.heysalad.com)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-username/heysalad-tasha/issues)
- **💡 Feature Requests**: [Feature Board](https://github.com/your-username/heysalad-tasha/discussions)

---

<div align="center">

**🥗 Making sustainability rewarding, one salad at a time! 🌱**

Built with ❤️ by the HeySalad Team

[⭐ Star this repo](https://github.com/your-username/heysalad-tasha) • [🍴 Fork it](https://github.com/your-username/heysalad-tasha/fork) • [📣 Share it](https://twitter.com/intent/tweet?text=Check%20out%20HeySalad%20Tasha%20-%20AI-powered%20food%20waste%20reduction%20on%20Polkadot!)

</div>