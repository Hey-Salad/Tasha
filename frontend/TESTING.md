# HeySalad Tasha - Testing Guide

## Overview

This guide explains how to run and verify tests for HeySalad Tasha. The project uses Vitest for fast, modern testing with TypeScript support.

## Prerequisites

**Required:**
- Node.js 18 or higher
- npm or yarn package manager
- Polkadot wallet extension (Polkadot{.js}, Talisman, or SubWallet)

**For Manual Testing:**
- Microphone access for voice features
- Camera access for image analysis
- Stable internet connection
- (Optional) Monzo account for banking integration testing

## Installation

```bash
# Install dependencies
cd frontend
npm install
```

## Running Automated Tests

### Run All Tests

```bash
npm test
```

This executes all unit and integration tests once and displays results.

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Watch mode automatically re-runs tests when files change. Useful during development.

### Run Integration Tests Only

```bash
npm run test:integration
```

Executes only tests in the `tests/integration` directory.

### Run Unit Tests Only

```bash
npm run test:unit
```

Executes only tests in the `tests/unit` directory (if script exists, otherwise use test:watch with path filter).

## Test Coverage

### Current Test Suite

#### 1. Token Service Unit Tests
**Location:** `tests/unit/tokenService.test.ts`

**Coverage:**
- Token reward calculation based on waste amount and type
- Emission rate verification
- Type safety validation

**Example Test:**
```typescript
it('returns emission based on grams and type', () => {
  const service = new PolkadotTokenService(null);
  const reward = service.calculateTokenReward(500, 'donation');
  expect(reward).toBeGreaterThan(0);
});
```

#### 2. Token Emission Integration Tests
**Location:** `tests/integration/tokenEmission.test.ts`

**Coverage:**
- Configured emission rates for each waste type
- Relative emission multiplier verification
- Cross-waste-type reward comparison

**Example Test:**
```typescript
it('applies configured emission rates for each waste type', () => {
  const service = new PolkadotTokenService(null);
  const values = ['donation', 'efficient-delivery', 'used-before-expiry'].map(
    (type) => ({ type, value: service.calculateTokenReward(1000, type) })
  );

  expect(values.find(e => e.type === 'donation')?.value)
    .toBeGreaterThan(values.find(e => e.type === 'efficient-delivery')?.value);
});
```

### Expected Test Results

All tests should **PASS**:

```
✓ tests/unit/tokenService.test.ts (1)
  ✓ PolkadotTokenService.calculateTokenReward (1)
    ✓ returns emission based on grams and type

✓ tests/integration/tokenEmission.test.ts (1)
  ✓ Token emission multipliers (1)
    ✓ applies configured emission rates for each waste type

Test Files  2 passed (2)
     Tests  2 passed (2)
  Start at  [timestamp]
  Duration  [time]ms
```

## Manual Testing Procedures

### 1. Wallet Connection Testing

**Objective:** Verify Polkadot wallet integration

**Steps:**
1. Visit [https://tasha.heysalad.app/](https://tasha.heysalad.app/)
2. Click "Connect Wallet" in the dashboard
3. Select your wallet extension (Polkadot{.js}, Talisman, or SubWallet)
4. Approve the connection in the popup
5. Select an account from the list
6. Verify balance displays correctly (format: `X.XXXX WND`)

**Expected Results:**
- ✅ Wallet connects within 3-5 seconds
- ✅ Balance displays with 4 decimal places
- ✅ Connection persists across page reloads
- ✅ Account switching works seamlessly
- ✅ Disconnect functionality works

**Common Issues:**
- No wallet found: Install Polkadot{.js} or compatible extension
- Balance shows 0: Account may not have Westend testnet tokens
- Connection fails: Check browser console for errors

---

### 2. Voice Assistant Testing

**Objective:** Test complete voice interaction workflow

**Steps:**
1. Navigate to `/voice-assistant` page
2. Ensure wallet is connected (reconnect if needed)
3. Click "Sign to Authenticate" button
4. Sign the authentication message in wallet popup
5. Grant microphone permissions when prompted
6. Click the microphone button to start recording
7. Speak clearly: *"I donated 2 kilograms of bread to the local food bank today"*
8. Click the square button to stop recording
9. Click the play button to review your recording
10. Click "Send to Tasha" to process with AI
11. Wait 5-10 seconds for processing
12. Verify AI response appears in conversation history

**Expected Results:**
- ✅ Authentication completes without errors
- ✅ Microphone access granted (visual feedback during recording)
- ✅ Recording timer shows elapsed time
- ✅ Playback works correctly
- ✅ Processing completes within 10 seconds
- ✅ AI extracts food items: ["bread"]
- ✅ AI identifies actions: ["donation"]
- ✅ Confidence score displays (typically >80%)
- ✅ Conversation persists in session history
- ✅ Transcript displays accurately

**Common Issues:**
- Microphone access denied: Check browser settings
- Processing timeout: Check network connection, verify API keys configured
- No AI response: Check browser console for Firebase Function errors

---

### 3. Token Minting Testing

**Objective:** Verify end-to-end token creation workflow

**Steps:**
1. Complete a voice interaction (see test #2) OR scroll to Quick Token Minting
2. In "Quick Token Minting" section:
   - Enter waste amount: `2000` grams
   - Select type: "Donation"
   - Enter description: "Donated bread to food bank"
3. Review calculated token amount (should show ~30 FWT)
4. Click "Mint X.XXXXXX FWT" button
5. Review transaction details in wallet popup
6. Sign the transaction
7. Wait 30-60 seconds for block confirmation
8. Verify success message with transaction hash
9. Check wallet balance for increased FWT tokens

**Expected Results:**
- ✅ Token calculation: 2000g × 0.15 rate = 30 FWT
- ✅ Transaction signs successfully
- ✅ Block hash returned from Asset-Hub
- ✅ Success message displays
- ✅ Wallet balance increases by exact token amount
- ✅ Transaction visible on Polkadot.js Apps explorer

**Asset Configuration:**
- **Asset ID:** 2024
- **Symbol:** FWT
- **Network:** Westend Testnet
- **Decimals:** 12

**Common Issues:**
- Transaction fails: Ensure account has WND for gas fees
- Asset not found: Asset ID 2024 may not exist on your test network
- Balance doesn't update: Wait ~60 seconds, refresh page

---

### 4. Image Analysis Testing

**Objective:** Test AI food analysis with camera/upload

**Steps:**
1. Navigate to `/image-analysis` page
2. Click "Take Photo" or "Upload File"
3. If using camera:
   - Grant camera permissions
   - Ensure good lighting
   - Center food item in frame
   - Take photo
4. If uploading:
   - Select image file (JPEG, PNG, WebP)
   - Or select video file (MP4, WebM, MOV)
5. Wait 5-10 seconds for Google Gemini analysis
6. Swipe through 5 analysis cards:
   - **Card 1:** Overview (food type + confidence score)
   - **Card 2:** Analysis (freshness, nutrition, quantity)
   - **Card 3:** Environmental impact (CO2, water, value)
   - **Card 4:** Recommendations (journal, recipes, tips)
   - **Card 5:** Minting options (selective data tokenization)
7. Select data categories for minting (e.g., journal + environmental)
8. Process token minting
9. Verify separate tokens created for selected categories

**Expected Results:**
- ✅ Food identification accuracy >70% for clear images
- ✅ All 5 cards populate with relevant data
- ✅ Environmental metrics show quantified values
- ✅ Swipe/navigation works smoothly
- ✅ Selective minting creates correct number of tokens
- ✅ Analysis metadata stored on-chain

**Common Issues:**
- Low confidence: Use clear, well-lit photos
- Camera not working: Check browser permissions
- Analysis fails: Verify image format is supported

---

### 5. Monzo Banking Integration Testing

**Objective:** Test banking verification (optional - requires Monzo account)

**Steps:**
1. Navigate to `/banking` page
2. Click "Connect with Monzo" button
3. Login to Monzo in OAuth popup
4. Grant read permissions for transactions
5. Approve connection in Monzo app (mobile)
6. Return to application after successful authorization
7. View spending analysis dashboard:
   - Total food spending (last 30 days)
   - Transaction count and averages
   - Top merchants for food purchases
   - Spending by category breakdown
8. Test transaction matching:
   - Log waste reduction for recently purchased food
   - System searches for matching transactions (7-day window)
   - Verify confidence boost for verified purchases

**Expected Results:**
- ✅ OAuth flow completes without errors
- ✅ Analysis displays realistic transaction data
- ✅ Top merchants list shows food retailers
- ✅ Transaction matching identifies relevant purchases
- ✅ Verified claims receive 1.5x token multiplier
- ✅ Privacy maintained (only categories accessed)

**Security Note:**
- Access tokens currently stored in localStorage
- Use only in development/testing environment
- Production deployment will use secure server-side storage

**Common Issues:**
- OAuth fails: Check redirect URI configuration
- No transactions shown: Ensure Monzo account has recent food purchases
- Mobile app approval: May require opening Monzo app to approve

---

### 6. Cross-Platform Compatibility Testing

#### Mobile Testing

**iOS Devices:**
1. Open Safari on iPhone/iPad
2. Navigate to `https://tasha.heysalad.app/`
3. Test hamburger menu navigation
4. Verify camera opens to back camera (environment mode)
5. Test voice recording with device microphone
6. Confirm swipe gestures work smoothly
7. Verify touch targets are easily tappable (44px minimum)
8. Test wallet connection (Polkadot Vault, Nova Wallet)

**Android Devices:**
1. Open Chrome on Android device
2. Navigate to `https://tasha.heysalad.app/`
3. Test all features as per iOS testing
4. Verify WebM video recording works
5. Test wallet connection (SubWallet, Talisman)

**Expected Results:**
- ✅ Full functionality on mobile devices
- ✅ No horizontal scrolling on any screen
- ✅ Touch targets appropriately sized
- ✅ Native camera access works
- ✅ Responsive layouts adapt correctly

#### Desktop Testing

**Browsers to Test:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Desktop-Specific Features:**
1. Hover effects and animations
2. Keyboard navigation (Tab, Enter, Escape)
3. Drag-and-drop file upload
4. Window resizing responsiveness
5. Copy-to-clipboard functionality

**Expected Results:**
- ✅ Hover states visible on buttons/cards
- ✅ Full keyboard navigation support
- ✅ File upload works via drag-drop
- ✅ Responsive breakpoints function correctly

---

### 7. Performance Testing

**Objective:** Verify app performance meets targets

**Metrics to Check:**

1. **Page Load Time**
   - Target: <2 seconds on 3G connection
   - Test: Open DevTools Network tab, set throttling to "Fast 3G"
   - Expected: Initial paint <1s, interactive <2s

2. **AI Analysis Response Time**
   - Target: <10 seconds
   - Test: Upload image, measure time to results
   - Expected: 3-7 seconds for image, 5-10 seconds for video

3. **Voice Processing Latency**
   - Target: <5 seconds
   - Test: Send voice clip to 11Labs
   - Expected: 2-5 seconds for transcription + response

4. **Wallet Connection Speed**
   - Target: <3 seconds
   - Test: Click connect, measure to balance display
   - Expected: 1-3 seconds

**Tools:**
- Chrome DevTools Performance tab
- Lighthouse CI (run `npm run lighthouse` if configured)
- Network tab for API call timing

**Expected Lighthouse Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

### 8. Error Handling Testing

**Objective:** Verify graceful error handling

**Scenarios to Test:**

1. **Microphone Access Denied**
   - Deny permissions, verify clear error message
   - Expected: Prompt to check browser settings

2. **Camera Access Denied**
   - Deny permissions, verify fallback to file upload
   - Expected: Upload option remains available

3. **Wallet Disconnected Mid-Session**
   - Connect wallet, then disconnect extension
   - Attempt token minting
   - Expected: "Wallet not connected" error

4. **Network Interruption**
   - Start token minting, disconnect internet
   - Reconnect after 10 seconds
   - Expected: Transaction resumes or clear retry option

5. **Invalid File Format**
   - Upload unsupported file (e.g., .txt, .exe)
   - Expected: "Unsupported file type" error

6. **API Rate Limiting**
   - Make rapid API calls (10+ in succession)
   - Expected: Rate limit message, retry suggestion

**Expected Behavior:**
- ✅ User-friendly error messages (no technical jargon)
- ✅ Clear recovery instructions
- ✅ No app crashes or blank screens
- ✅ Automatic retry where appropriate

---

## Troubleshooting

### Common Test Failures

#### "No Polkadot API connection"
**Cause:** API initialization failed
**Solution:**
```bash
# Check network connection
ping westend-rpc.polkadot.io

# Verify wallet extension installed
# Restart browser
```

#### "Token calculation mismatch"
**Cause:** Emission rates changed or calculation logic modified
**Solution:**
```typescript
// Verify ASSET_HUB_CONFIG in PolkadotTokenService.ts
const ASSET_HUB_CONFIG = {
  EMISSION_RATES: {
    'donation': 0.15,
    'efficient-delivery': 0.10,
    'used-before-expiry': 0.12
  }
};
```

#### "11Labs API error"
**Cause:** API key not configured or invalid
**Solution:**
```bash
# Check Firebase Functions configuration
firebase functions:config:get elevenlabs

# Set if missing
firebase functions:config:set elevenlabs.api_key="..." elevenlabs.agent_id="..."
```

#### "Gemini analysis failed"
**Cause:** API key not configured or quota exceeded
**Solution:**
```bash
# Check configuration
firebase functions:config:get gemini

# Verify quota at https://console.cloud.google.com/apis/
```

---

## Continuous Integration

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
```

---

## Test Development Guide

### Writing New Tests

#### 1. Create Test File

```bash
# For unit tests
touch tests/unit/myFeature.test.ts

# For integration tests
touch tests/integration/myWorkflow.test.ts
```

#### 2. Basic Test Structure

```typescript
import { describe, expect, it } from 'vitest';
import { MyService } from '../../src/services/MyService';

describe('MyService', () => {
  it('should perform expected behavior', () => {
    const service = new MyService();
    const result = service.myMethod();
    expect(result).toBe(expectedValue);
  });
});
```

#### 3. Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const service = new MyService();
  const result = await service.asyncMethod();
  expect(result).resolves.toBe(expectedValue);
});
```

#### 4. Mocking Dependencies

```typescript
import { vi } from 'vitest';

it('should use mocked API', async () => {
  const mockFetch = vi.fn(() => Promise.resolve({ json: () => ({}) }));
  global.fetch = mockFetch;

  await service.callAPI();
  expect(mockFetch).toHaveBeenCalled();
});
```

---

## Test Coverage Goals

### Current Coverage
- Token Services: 60%
- Voice Services: 40% (manual testing primary)
- Wallet Integration: 30% (E2E testing required)

### Target Coverage (Milestone 2)
- Token Services: 90%+
- Voice Services: 70%+
- Wallet Integration: 80%+
- Overall: 75%+

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Polkadot.js Documentation](https://polkadot.js.org/docs/)
- [11Labs API Docs](https://elevenlabs.io/docs/)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

## Support

**Issues:** [GitHub Issues](https://github.com/Hey-Salad/Tasha/issues)
**Email:** peter@heysalad.io
**Website:** https://heysalad.io/

---

**Last Updated:** November 6, 2025
**Version:** 1.0 (Milestone 1)
