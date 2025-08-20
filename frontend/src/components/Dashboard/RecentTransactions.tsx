// components/Dashboard/RecentTransactions.tsx
import React, { useState } from 'react';
import { 
  BarChart3, 
  HandHeart, 
  Truck, 
  Leaf, 
  Coins, 
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';
import { Transaction } from '../../types/index';

type RecentTransactionsProps = {
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
};

export default function RecentTransactions({ 
  transactions, 
  setActiveTab 
}: RecentTransactionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    return amount.toLocaleString('en-US');
  };

  const containerStyle: React.CSSProperties = {
    background: '#000000',
    borderRadius: '25px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(237, 76, 76, 0.15), 0 4px 8px rgba(237, 76, 76, 0.1)',
    border: '2px solid #333333',
    fontFamily: 'Figtree, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #333333'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    fontFamily: 'Grandstander, cursive',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const viewAllButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Figtree, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)'
  };

  // Show recent transactions or empty state
  const displayTransactions = transactions.slice(0, 5);

  if (displayTransactions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            <BarChart3 size={20} />
            Recent Activity
          </h2>
        </div>
        
        <EmptyState setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <BarChart3 size={20} />
          Recent Activity
        </h2>
        <button 
          style={viewAllButtonStyle}
          onClick={() => setActiveTab('history')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
          }}
        >
          View All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayTransactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id || `transaction-${index}`}
            transaction={transaction}
            isHovered={hoveredIndex === index}
            onHover={() => setHoveredIndex(index)}
            onLeave={() => setHoveredIndex(null)}
            formatWasteType={formatWasteType}
          />
        ))}
      </div>

      {transactions.length > 5 && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #333333'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#faa09a',
            fontWeight: '500'
          }}>
            Showing 5 of {transactions.length} transactions
          </span>
        </div>
      )}
    </div>
  );
}

// Transaction Item Component
type TransactionItemProps = {
  transaction: Transaction;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  formatWasteType: (type: string) => string;
};

function TransactionItem({ transaction, isHovered, onHover, onLeave, formatWasteType }: TransactionItemProps) {
  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: '16px',
    background: isHovered ? 'rgba(237, 76, 76, 0.1)' : 'transparent',
    border: '1px solid',
    borderColor: isHovered ? '#ed4c4c' : '#333333',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const iconStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: getStatusGradient(transaction.status),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(237, 76, 76, 0.2)',
    color: '#ffffff'
  };

  const textSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
    fontFamily: 'Figtree, sans-serif'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#faa09a',
    margin: 0,
    fontFamily: 'Figtree, sans-serif'
  };

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px'
  };

  const amountStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ed4c4c',
    margin: 0,
    fontFamily: 'Grandstander, cursive'
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: '10px',
    padding: '4px 8px',
    borderRadius: '12px',
    background: getStatusColor(transaction.status),
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'Figtree, sans-serif'
  };

  return (
    <div 
      style={itemStyle}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div style={leftSectionStyle}>
        <div style={iconStyle}>
          {getTransactionIcon(transaction.type)}
        </div>
        <div style={textSectionStyle}>
          <h4 style={titleStyle}>
            {formatWasteType(transaction.type)}
          </h4>
          <p style={subtitleStyle}>
            {new Date(transaction.date || transaction.timestamp || Date.now()).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div style={rightSectionStyle}>
        <span style={amountStyle}>
          +{transaction.tokens || transaction.amount} SALAD
        </span>
        <span style={badgeStyle}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px'
  };

  const iconStyle: React.CSSProperties = {
    marginBottom: '16px',
    opacity: '0.7',
    color: '#faa09a'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 8px 0',
    fontFamily: 'Grandstander, cursive'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#faa09a',
    margin: '0 0 24px 0',
    lineHeight: '1.5',
    fontFamily: 'Figtree, sans-serif'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Figtree, sans-serif',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div style={emptyStateStyle}>
      <div style={iconStyle}>
        <Leaf size={48} />
      </div>
      <h3 style={titleStyle}>No activity yet!</h3>
      <p style={descriptionStyle}>
        Start logging your food waste reduction to earn SALAD tokens and see your impact here.
      </p>
      <button 
        style={buttonStyle}
        onClick={() => setActiveTab('log-waste')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
        }}
      >
        Log Your First Entry
        <Leaf size={16} />
      </button>
    </div>
  );
}

// Helper Functions with Icons
function getTransactionIcon(type: string): React.ReactNode {
  switch (type) {
    case 'donation': return <HandHeart size={20} />;
    case 'efficient-delivery': return <Truck size={20} />;
    case 'used-before-expiry': return <Leaf size={20} />;
    case 'waste_reduction': return <Leaf size={20} />;
    case 'token_earned': return <Coins size={20} />;
    case 'verification': return <CheckCircle size={20} />;
    default: return <FileText size={20} />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'verified': return '#28a745';
    case 'pending': return '#ffc107';
    case 'rejected': return '#dc3545';
    default: return '#6c757d';
  }
}

function getStatusGradient(status: string): string {
  switch (status) {
    case 'verified': return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    case 'pending': return 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)';
    case 'rejected': return 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)';
    default: return 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)';
  }
}