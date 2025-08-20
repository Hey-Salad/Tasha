# HeySalad ® Tasha 🥗🤖

## AI-Powered Food Analysis and Waste Reduction on Polkadot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Polkadot](https://img.shields.io/badge/Built%20on-Polkadot-E6007A)](https://polkadot.network/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**🚀 Live Demo:** [https://tasha.heysalad.app/](https://tasha.heysalad.app/)

### 🌟 Transform Food Analysis Into Digital Value

HeySalad Tasha is an innovative AI-powered platform that combines food analysis with blockchain technology. Users can analyze food with AI, log their activities through voice interaction, and earn tokens for sustainable choices - all through a beautiful, professional interface.

---

## 🎨 Professional Dark Theme Interface

### Modern Design System
- **🖤 Sleek Black Theme**: Complete dark interface (#000000) throughout the application
- **🎨 HeySalad Brand Colors**: Cherry Red (#ed4c4c), Light Peach (#ffd0cd), Dark Peach (#faa09a)
- **🔧 Professional Icons**: Lucide React icons for a clean, modern look
- **✍️ Typography**: Grandstander (headings) + Figtree (body) from Google Fonts
- **📱 Mobile-First**: Fully responsive design with touch-optimized interactions

### Key UI Features
- ✨ **Simplified Dashboard** with time-based greeting and 2 main action buttons
- 🔗 **Collapsible Wallet Connection** with persistence and auto-reconnect
- 📱 **Mobile Hamburger Menu** with smooth slide animations
- 🎯 **Professional Components** with hover effects and micro-interactions
- 🔄 **Smooth Animations** throughout the interface

---

## 🏗️ Current Architecture

### Frontend Stack
- **Framework**: Next.js 15 with React 19
- **Styling**: Custom CSS with HeySalad dark theme system
- **UI Components**: Professional Lucide React icons
- **Fonts**: Google Fonts (Grandstander + Figtree)
- **Deployment**: Firebase Hosting

### Blockchain Integration
- **Network**: Polkadot Westend Testnet
- **Wallet Support**: Polkadot{.js}, Talisman, SubWallet
- **Features**: Message signing, transaction support, persistent connections

### Planned Integrations
- **AI Analysis**: Google Gemini API for food image analysis
- **Voice Interface**: 11Labs for conversational interactions
- **Backend**: Firebase + Supabase for data management
- **Banking**: Monzo API for transaction verification (in development)

---

## 🚀 Current Features (Live)

### ✅ Wallet Integration
- **Polkadot Wallet Connection**: Support for multiple wallet extensions
- **Persistent Sessions**: Auto-reconnect within 24 hours
- **Message Signing**: Ready for authentication and verification
- **Balance Display**: Real-time token balance from Westend testnet
- **Account Management**: Multiple account support with easy switching

### ✅ Professional Interface
- **Time-Based Greeting**: Dynamic welcome message based on time of day
- **Collapsible Wallet**: Users can minimize wallet section
- **Action-Oriented Design**: Two main buttons for core features
- **Mobile Responsive**: Perfect mobile experience with hamburger menu
- **Dark Theme**: Consistent black theme throughout

### ✅ Navigation & UX
- **Simplified Dashboard**: Clean, focused interface
- **Professional Sidebar**: HeySalad branding with navigation
- **Smooth Animations**: Hover effects and transitions
- **Touch Optimization**: Mobile-first interaction design

---

## 🔄 In Development

### 🛠️ Next Phase Features
- **📸 Image Analysis Page**: Camera integration for food analysis
- **🎤 Voice Assistant Page**: 11Labs integration for voice logging
- **🤖 AI Food Analysis**: Computer vision for food type/freshness detection
- **⚡ Selective Minting**: Users choose what results to tokenize
- **🔐 Signature-Gated Features**: Wallet signing before AI analysis

### 🎯 Planned User Flow
1. **Connect Wallet** → Persistent authentication
2. **Sign Message** → Authorize AI feature access  
3. **Analyze Food** → Camera or voice input
4. **Get Results** → AI analysis with confidence scores
5. **Choose Actions** → Journal, recipe generation, or waste tracking
6. **Mint Tokens** → Selective tokenization of valuable data

---

## 🔧 Technical Implementation

### Current Stack
```javascript
// Frontend
- Next.js 15 (App Router)
- React 19 (Latest)
- TypeScript 5
- Custom CSS with CSS Variables
- Lucide React Icons

// Blockchain
- @polkadot/api
- @polkadot/extension-dapp
- Westend Testnet Integration

// Deployment
- Firebase Hosting
- Custom Domain: tasha.heysalad.app
```

### Architecture Decisions
- **Static Export**: Using Next.js static export for Firebase hosting
- **Client-Side Wallet**: Browser extension integration for security
- **Persistent State**: localStorage for wallet connection persistence
- **Message Signing**: Cryptographic authentication for feature access

---

## 📱 Mobile-First Design

### Responsive Features
- **🍔 Hamburger Menu**: Smooth slide-in navigation
- **👆 Touch Optimization**: 44px minimum touch targets
- **📐 Adaptive Layouts**: Responsive grid systems
- **🎨 Progressive Enhancement**: Mobile base with desktop enhancements

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Clear focus indicators

---

## 🚀 Live Deployment

### Current Status
- **✅ Production Ready**: Live at [tasha.heysalad.app](https://tasha.heysalad.app/)
- **✅ Mobile Optimized**: Perfect mobile experience
- **✅ Wallet Integration**: Full Polkadot wallet support
- **✅ Dark Theme**: Professional interface complete

### Next Deployment Features
- **📸 Image Analysis**: Camera-based food analysis (in development)
- **🎤 Voice Assistant**: Voice-powered logging (in development)
- **🤖 AI Integration**: Google Gemini API (planned)
- **🏦 Banking**: Monzo integration (planned)

---

## 🛠️ Local Development

### Prerequisites
```bash
Node.js 18+
npm or yarn
Git
Polkadot wallet extension (for testing)
```

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/polkadot-hackathon.git
cd polkadot-hackathon/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Add your API keys (when ready for AI features)
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key_here
```

---

## 📊 Project Status

### ✅ Completed (Current Phase)
- [x] **Professional Dark Theme** - Complete black interface
- [x] **Wallet Integration** - Polkadot wallet connection with persistence
- [x] **Mobile Responsive** - Perfect mobile experience
- [x] **Production Deployment** - Live at tasha.heysalad.app
- [x] **Message Signing** - Ready for authentication
- [x] **Professional UI** - Lucide icons, clean design

### 🔄 In Progress (Next Phase)
- [ ] **Image Analysis Page** - Camera integration for food analysis
- [ ] **Voice Assistant Page** - 11Labs voice integration
- [ ] **AI Food Analysis** - Google Gemini API integration
- [ ] **Firebase Backend** - Data management system
- [ ] **Selective Minting** - User-controlled tokenization

### 🎯 Planned Features
- [ ] **Monzo Integration** - Banking transaction verification
- [ ] **NFT Achievements** - Milestone-based rewards
- [ ] **Social Features** - Community leaderboards
- [ ] **Recipe Generation** - AI-powered meal suggestions
- [ ] **Waste Tracking** - Comprehensive logging system

---

## 🏆 Polkadot Grant Project

This project is being developed as part of a **Polkadot Fast Grant** focused on:

### Grant Objectives
- **Voice Technology Integration**: 11Labs voice assistant on Polkadot
- **Real-World Utility**: Practical application for food waste reduction
- **AI Verification**: Computer vision for sustainability tracking
- **Token Economics**: Reward system for verified sustainable actions

### Deliverables Progress
- **✅ Milestone 1**: Professional dApp interface with wallet integration
- **🔄 Milestone 2**: AI analysis and voice assistant features (in development)

---

## 🤝 Contributing

We welcome contributions from developers interested in sustainability and blockchain technology!

### Development Guidelines
- 🎨 Follow HeySalad dark theme design system
- 🔧 Use professional Lucide React icons
- 📱 Ensure mobile responsiveness
- 🧪 Add tests for new features
- 📝 Update documentation

### Getting Started
```bash
# Fork the repository
git fork https://github.com/your-username/polkadot-hackathon.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes
# Commit and push
# Open Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Links

### Team
- **Lead Developer**: [@chilumbam](https://github.com/chilu18)
- **Organization**: SALADHR TECHNOLOGY LTD

### Project Links
- **🌐 Live App**: [https://tasha.heysalad.app/](https://tasha.heysalad.app/)
- **📱 Main Website**: [https://heysalad.io/](https://heysalad.io/)
- **🤖 AI Platform**: [https://ai.heysalad.app/](https://ai.heysalad.app/)
- **📧 Contact**: peter@heysalad.io

### Development
- **🐛 Issues**: [GitHub Issues](https://github.com/your-username/polkadot-hackathon/issues)
- **💡 Discussions**: [GitHub Discussions](https://github.com/your-username/polkadot-hackathon/discussions)

---

<div align="center">

**🥗 Making food analysis accessible through AI and blockchain technology! 🌱**

Built with ❤️ for the Polkadot ecosystem

[⭐ Star this repo](https://github.com/your-username/polkadot-hackathon) • [🍴 Fork it](https://github.com/your-username/polkadot-hackathon/fork) • [🚀 Try the demo](https://tasha.heysalad.app/)

</div>