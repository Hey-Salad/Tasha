import { describe, expect, it } from 'vitest';
import { PolkadotTokenService } from '../../src/services/PolkadotTokenService';

describe('PolkadotTokenService.calculateTokenReward', () => {
  it('returns emission based on grams and type', () => {
    const service = new PolkadotTokenService(null);
    const reward = service.calculateTokenReward(500, 'donation');
    expect(reward).toBeGreaterThan(0);
  });
});
