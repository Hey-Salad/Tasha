import React from 'react';
import { Transaction } from '../types/index';

type TransactionHistoryProps = {
  transactions: Transaction[];
  setActiveTab?: (tab: string) => void;
};

export default function TransactionHistory({ 
  transactions 
}: TransactionHistoryProps) {
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

  return (
    <div style={{ 
      backgroundColor: '#111111', 
      borderRadius: '8px', 
      padding: '25px', 
      boxShadow: '0 2px 10px rgba(237,76,76,0.2)',
      border: '1px solid #333333'
    }}>
      <h3 style={{ 
        fontSize: '1.2rem', 
        marginBottom: '20px',
        borderBottom: '1px solid #333333',
        paddingBottom: '15px',
        color: '#ffffff'
      }}>
        Transaction History
      </h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333333' }}>
            <th style={{ 
              textAlign: 'left', 
              padding: '12px 10px', 
              color: '#faa09a', 
              fontWeight: '500', 
              fontSize: '0.9rem' 
            }}>
              Date
            </th>
            <th style={{ 
              textAlign: 'left', 
              padding: '12px 10px', 
              color: '#faa09a', 
              fontWeight: '500', 
              fontSize: '0.9rem' 
            }}>
              Type
            </th>
            <th style={{ 
              textAlign: 'right', 
              padding: '12px 10px', 
              color: '#faa09a', 
              fontWeight: '500', 
              fontSize: '0.9rem' 
            }}>
              Amount (g)
            </th>
            <th style={{ 
              textAlign: 'right', 
              padding: '12px 10px', 
              color: '#faa09a', 
              fontWeight: '500', 
              fontSize: '0.9rem' 
            }}>
              Tokens
            </th>
            <th style={{ 
              textAlign: 'right', 
              padding: '12px 10px', 
              color: '#faa09a', 
              fontWeight: '500', 
              fontSize: '0.9rem' 
            }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr 
              key={index} 
              style={{ 
                borderBottom: '1px solid #222222',
                backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(237,76,76,0.05)'
              }}
            >
              <td style={{ 
                padding: '15px 10px', 
                color: '#ffffff' 
              }}>
                {tx.date}
              </td>
              <td style={{ 
                padding: '15px 10px', 
                color: '#ffffff' 
              }}>
                {formatWasteType(tx.type)}
              </td>
              <td style={{ 
                padding: '15px 10px', 
                textAlign: 'right', 
                color: '#ffffff' 
              }}>
                {tx.amount.toLocaleString()}
              </td>
              <td style={{ 
                padding: '15px 10px', 
                textAlign: 'right', 
                color: '#ed4c4c', 
                fontWeight: 'bold' 
              }}>
                +{tx.tokens} FWT
              </td>
              <td style={{ 
                padding: '15px 10px', 
                textAlign: 'right' 
              }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '4px 10px',
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

      {transactions.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#faa09a',
          padding: '20px',
          fontSize: '0.9rem'
        }}>
          No transactions yet. Start reducing food waste to earn tokens!
        </div>
      )}
    </div>
  );
}