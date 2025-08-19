// components/Dashboard/StatsCards.tsx
import React, { useState } from 'react';
import { Coins, Leaf, Globe } from 'lucide-react';

type StatsCardsProps = {
  tokenBalance: string;
  getTotalWasteReduction: () => number;
};

export default function StatsCards({ 
  tokenBalance, 
  getTotalWasteReduction 
}: StatsCardsProps) {
  const totalWasteReduction = getTotalWasteReduction();

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '24px',
      marginBottom: '32px'
    }}>
      {/* Token Balance Card */}
      <StatCard 
        title="SALAD Tokens"
        value={`${tokenBalance}`}
        description="Earned from waste reduction"
        color="#ed4c4c"
        icon={<Coins size={28} />}
        gradient="linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)"
      />
      
      {/* Total Waste Reduced Card */}
      <StatCard 
        title="Waste Prevented"
        value={`${totalWasteReduction.toFixed(1)}kg`}
        description="Total food waste saved"
        color="#28a745"
        icon={<Leaf size={28} />}
        gradient="linear-gradient(135deg, #28a745 0%, #20c997 100%)"
      />
      
      {/* Environmental Impact Card */}
      <StatCard 
        title="CO₂ Saved"
        value={`${(totalWasteReduction * 2.5).toFixed(1)}kg`}
        description="Carbon footprint reduced"
        color="#17a2b8"
        icon={<Globe size={28} />}
        gradient="linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%)"
      />
    </div>
  );
}

// Enhanced Stat Card Component with Black Background
type StatCardProps = {
  title: string;
  value: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  gradient: string;
};

function StatCard({ title, value, description, color, icon, gradient }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    background: '#000000',
    borderRadius: '25px',
    padding: '24px',
    boxShadow: isHovered 
      ? '0 20px 40px rgba(237, 76, 76, 0.3), 0 8px 16px rgba(237, 76, 76, 0.2)' 
      : '0 8px 24px rgba(237, 76, 76, 0.15), 0 4px 8px rgba(237, 76, 76, 0.1)',
    border: '2px solid #333333',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    fontFamily: 'Figtree, sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  };

  const iconStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 12px ${color}33`,
    color: '#ffffff'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#faa09a',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'Figtree, sans-serif'
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '8px 0',
    fontFamily: 'Grandstander, cursive',
    lineHeight: '1.2'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#ffd0cd',
    margin: 0,
    fontWeight: '500',
    fontFamily: 'Figtree, sans-serif'
  };

  const decorativeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '100px',
    height: '100px',
    background: `linear-gradient(45deg, ${color}15, transparent)`,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    transform: isHovered ? 'scale(1.2)' : 'scale(1)'
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={decorativeStyle} />
      
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <div style={iconStyle}>
          {icon}
        </div>
      </div>
      
      <div style={valueStyle}>
        {value}
      </div>
      
      <p style={descriptionStyle}>
        {description}
      </p>
      
      {/* Progress indicator */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: gradient,
        borderRadius: '0 0 23px 23px'
      }} />
    </div>
  );
}