import React from 'react';
import { Transaction } from '../../types/index';

type RecentTransactionsProps = {
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
};

export default function RecentTransactions({ 
  transactions, 
  setActiveTab 
}: RecentTransactionsProps) {
  // Format waste type for display
  const formatWasteType = (type: string) => {
    switch(type) {
      case 'donation':
        return 'Food Donation';
      case 'efficient-delivery':
        return 'Efficient Delivery';
      case 'used-before-expiry':
        return 'Used Before Expiry';
      default:
        return type;
    }
  };

  // Format amount with null/undefined handling and consistent locale formatting
  const formatAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) {
      return '0';
    }
    // Use 'en-US' locale explicitly for consistent formatting between server and client
    return amount.toLocaleString('en-US');
  };

  return (
    <div style={{ 
      backgroundColor: '#111111', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 2px 10px rgba(237,76,76,0.2)',
      border: '1px solid #333333'
    }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#ffffff' }}>
        Recent Transactions
      </h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333333' }}>
            <th style={{ textAlign: 'left', padding: '10px 5px', color: '#faa09a', fontWeight: 'normal', fontSize: '0.9rem' }}>Date</th>
            <th style={{ textAlign: 'left', padding: '10px 5px', color: '#faa09a', fontWeight: 'normal', fontSize: '0.9rem' }}>Type</th>
            <th style={{ textAlign: 'right', padding: '10px 5px', color: '#faa09a', fontWeight: 'normal', fontSize: '0.9rem' }}>Amount (g)</th>
            <th style={{ textAlign: 'right', padding: '10px 5px', color: '#faa09a', fontWeight: 'normal', fontSize: '0.9rem' }}>Tokens</th>
            <th style={{ textAlign: 'right', padding: '10px 5px', color: '#faa09a', fontWeight: 'normal', fontSize: '0.9rem' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, 5).map((tx, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #222222' }}>
              <td style={{ padding: '12px 5px', color: '#ffffff' }}>{tx.date}</td>
              <td style={{ padding: '12px 5px', color: '#ffffff' }}>{formatWasteType(tx.type)}</td>
              <td style={{ padding: '12px 5px', textAlign: 'right', color: '#ffffff' }}>{formatAmount(tx.amount)}</td>
              <td style={{ padding: '12px 5px', textAlign: 'right', color: '#ed4c4c', fontWeight: 'bold' }}>+{tx.tokens} FWT</td>
              <td style={{ padding: '12px 5px', textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(237,76,76,0.1)',
                  color: '#ed4c4c',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {transactions.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              backgroundColor: 'transparent',
              color: '#ed4c4c',
              border: 'none',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            View All Transactions →
          </button>
        </div>
      )}

      {transactions.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#faa09a',
          padding: '20px',
          fontSize: '0.9rem'
        }}>
          No recent transactions. Start reducing food waste to earn tokens!
        </div>
      )}
    </div>
  );
}