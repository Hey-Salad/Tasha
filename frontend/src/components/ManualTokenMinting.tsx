'use client';

import React, { useState } from 'react';
import TokenMinting from './TokenMinting';
import type { WasteType } from '../services/PolkadotTokenService';

const wasteOptions: { label: string; value: WasteType }[] = [
  { label: 'Donation', value: 'donation' },
  { label: 'Efficient delivery', value: 'efficient-delivery' },
  { label: 'Used before expiry', value: 'used-before-expiry' }
];

export default function ManualTokenMinting() {
  const [wasteAmount, setWasteAmount] = useState(250);
  const [wasteType, setWasteType] = useState<WasteType>('donation');
  const [description, setDescription] = useState('Manual waste reduction entry');

  return (
    <div
      style={{
        background: '#111111',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #222222',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div>
        <h3 style={{ fontFamily: 'Grandstander, cursive', fontSize: '20px', marginBottom: '4px' }}>
          Quick Token Minting
        </h3>
        <p style={{ color: '#faa09a', fontSize: '14px', margin: 0 }}>
          Enter a verified waste reduction and mint Food Waste Tokens instantly.
        </p>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
        Waste amount (grams)
        <input
          type="number"
          value={wasteAmount}
          min={1}
          onChange={(event) => setWasteAmount(parseInt(event.target.value || '0', 10))}
          style={{
            background: '#000000',
            border: '1px solid #333333',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#ffffff'
          }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
        Waste reduction type
        <select
          value={wasteType}
          onChange={(event) => setWasteType(event.target.value as WasteType)}
          style={{
            background: '#000000',
            border: '1px solid #333333',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#ffffff'
          }}
        >
          {wasteOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the activity that reduced waste."
          rows={3}
          style={{
            background: '#000000',
            border: '1px solid #333333',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#ffffff',
            resize: 'none'
          }}
        />
      </label>

      <TokenMinting
        wasteAmount={Number.isFinite(wasteAmount) ? wasteAmount : 0}
        wasteType={wasteType}
        wasteDescription={description}
      />
    </div>
  );
}
