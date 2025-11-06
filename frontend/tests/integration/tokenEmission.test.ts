import { describe, expect, it } from 'vitest';
import { PolkadotTokenService } from '../../src/services/PolkadotTokenService';
import type { WasteType } from '../../src/services/PolkadotTokenService';

describe('Token emission multipliers', () => {
  it('applies configured emission rates for each waste type', () => {
    const service = new PolkadotTokenService(null);
    const baseAmount = 1000;
    const values = (['donation', 'efficient-delivery', 'used-before-expiry'] as WasteType[]).map(
      (type) => ({ type, value: service.calculateTokenReward(baseAmount, type) })
    );

    expect(values.find((entry) => entry.type === 'donation')?.value).toBeGreaterThan(
      values.find((entry) => entry.type === 'efficient-delivery')?.value ?? 0
    );
  });
});
