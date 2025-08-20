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
- 📋 **Swipeable Cards** for better mobile UX in analysis results

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

### AI & Voice Integration
- **AI Analysis**: Google Gemini API for food image analysis
- **Voice Interface**: 11Labs for conversational interactions (ready for integration)
- **Backend**: Firebase + Supabase architecture planned
- **Banking**: Monzo API for transaction verification (in development)

---

## 🚀 Current Features (Live)

### ✅ Wallet Integration
- **Polkadot Wallet Connection**: Support for multiple wallet extensions
- **Persistent Sessions**: Auto-reconnect within 24 hours
- **Message Signing**: Cryptographic authentication for features
- **Balance Display**: Real-time token balance from Westend testnet
- **Account Management**: Multiple account support with easy switching

### ✅ Image Analysis (Live)
- **Camera Integration**: Native camera support for iOS/Android
- **File Upload**: Support for JPEG, PNG, WebP, MP4, WebM, MOV
- **Mobile Optimized**: Environment camera (back camera) on mobile devices
- **AI Food Analysis**: Google Gemini API integration for food recognition
- **Swipeable Results**: 5 card interface for better mobile UX
- **Selective Minting**: Users choose what analysis data to tokenize

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
- **Card-Based Results**: Swipeable interface prevents excessive scrolling

---

## 📱 Mobile-First Design

### Enhanced Mobile Features
- **🍔 Hamburger Menu**: Smooth slide-in navigation
- **📸 Native Camera**: Environment camera for food photos
- **👆 Touch Optimization**: 44px minimum touch targets
- **📐 Adaptive Layouts**: Responsive grid systems
- **🎨 Progressive Enhancement**: Mobile base with desktop enhancements
- **📋 Swipeable Cards**: Better content navigation on small screens

### Cross-Platform Support
- **📱 iOS Support**: Native camera integration, proper video formats
- **🤖 Android Support**: Environment camera, WebM/MP4 video support
- **💻 Desktop**: Enhanced with larger layouts and hover effects
- **🔄 File Upload**: Support for gallery/camera roll selection

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Clear focus indicators

---

## 🎯 User Experience Flow

### Current Working Flow
1. **Visit Dashboard** → [tasha.heysalad.app](https://tasha.heysalad.app/)
2. **Connect Wallet** → Choose from Polkadot{.js}, Talisman, or SubWallet
3. **Image Analysis** → Click "Image Analysis" button
4. **Authenticate** → Sign message with wallet for AI access
5. **Capture/Upload** → Take photo, record video, or upload file
6. **AI Analysis** → Google Gemini analyzes food automatically
7. **Swipe Results** → Navigate through 5 analysis cards:
   - Overview & confidence score
   - Analysis results (freshness, nutrition, etc.)
   - Environmental impact (CO2, water footprint)
   - Action recommendations (journal, recipes, waste tips)
   - Selective minting options
8. **Choose Minting** → Select which data to tokenize
9. **Sign & Mint** → Cryptographic signing for token creation

---

## 🔄 In Development

### 🛠️ Next Phase Features
- **🎤 Voice Assistant Page**: 11Labs integration for voice logging
- **🤖 Enhanced AI**: Integration with 11Labs conversational AI
- **💾 Firebase Backend**: Data persistence and user profiles
- **⚡ Token Minting**: Actual blockchain token creation
- **🔐 Advanced Authentication**: Multi-factor wallet security

### 🎯 Planned Voice Features
1. **Voice Conversations** → Natural food discussions with AI
2. **Speech Recognition** → Convert voice to structured data
3. **AI Responses** → 11Labs voice synthesis for replies
4. **Food Logging** → Voice-powered waste reduction tracking
5. **Recipe Suggestions** → Spoken recipe recommendations
6. **Minting Integration** → Voice approval for token creation

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

// AI Integration
- Google Gemini API (Food Analysis)
- 11Labs API (Voice - Ready)
- Custom analysis pipelines

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
- **Mobile-First**: Environment camera and touch optimization

---

## 🚀 Live Deployment

### Current Status
- **✅ Production Ready**: Live at [tasha.heysalad.app](https://tasha.heysalad.app/)
- **✅ Mobile Optimized**: Perfect mobile experience with native camera
- **✅ Wallet Integration**: Full Polkadot wallet support
- **✅ AI Analysis**: Working Google Gemini food analysis
- **✅ Dark Theme**: Professional interface complete
- **✅ Swipeable UX**: Card-based results for mobile

### Environment Setup
```bash
# Required API Keys
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here

# Optional for future features
NEXT_PUBLIC_MONZO_CLIENT_ID=your_monzo_client_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
```

---

## 🛠️ Local Development

### Prerequisites
```bash
Node.js 18+
npm or yarn
Git
Polkadot wallet extension (for testing)
Google Gemini API key
11Labs API key (for voice features)
```

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-username/polkadot-hackathon.git
cd polkadot-hackathon/frontend

# Install dependencies
npm install

# Add environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Testing Features
```bash
# Test image analysis
1. Connect a Polkadot wallet
2. Navigate to /image-analysis
3. Take a photo of food
4. Review AI analysis results
5. Test selective minting options

# Test mobile features
1. Open on mobile device
2. Test environment camera
3. Upload from camera roll
4. Swipe through result cards
5. Test responsive navigation
```

---

## 📊 Project Status

### ✅ Completed Features
- [x] **Professional Dark Theme** - Complete black interface
- [x] **Wallet Integration** - Polkadot wallet connection with persistence
- [x] **Mobile Camera** - Native iOS/Android camera support
- [x] **AI Food Analysis** - Google Gemini integration
- [x] **Swipeable Results** - Card-based mobile UX
- [x] **Message Signing** - Cryptographic authentication
- [x] **Production Deployment** - Live at tasha.heysalad.app
- [x] **Cross-Platform** - iOS, Android, desktop support

### 🔄 In Progress
- [ ] **Voice Assistant Page** - 11Labs voice integration
- [ ] **Firebase Backend** - Data management system
- [ ] **Token Minting** - Actual blockchain token creation
- [ ] **Advanced Analytics** - Food waste tracking over time

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
- **✅ Milestone 1.5**: AI food analysis with mobile camera support
- **🔄 Milestone 2**: Voice assistant and token minting (in development)

---

## 🤝 Contributing

We welcome contributions from developers interested in sustainability and blockchain technology!

### Development Guidelines
- 🎨 Follow HeySalad dark theme design system
- 🔧 Use professional Lucide React icons
- 📱 Ensure mobile responsiveness with touch optimization
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

</div> Lucide React icons
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