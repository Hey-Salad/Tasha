import React from 'react';

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
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '20px',
      marginBottom: '30px'
    }}>
      {/* Token Balance Card */}
      <StatCard 
        title="Token Balance"
        value={`${tokenBalance} FWT`}
        description="Available for redemption"
        color="#ed4c4c"
      />
      
      {/* Total Waste Reduced Card */}
      <StatCard 
        title="Total Waste Reduced"
        value={`${totalWasteReduction.toFixed(0)} g`}
        description="Food waste saved from landfill"
        color="#ed4c4c"
      />
      
      {/* Environmental Impact Card */}
      <StatCard 
        title="Environmental Impact"
        value={`${(totalWasteReduction * 0.0034).toFixed(2)} kg`}
        description="CO₂ emissions prevented"
        color="#ed4c4c"
      />
    </div>
  );
}

// Sub-component for individual stat cards
type StatCardProps = {
  title: string;
  value: string;
  description: string;
  color: string;
};

function StatCard({ title, value, description, color }: StatCardProps) {
  return (
    <div style={{ 
      backgroundColor: '#111111', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 2px 10px rgba(237,76,76,0.2)',
      border: '1px solid #333333'
    }}>
      <div style={{ color, marginBottom: '10px', fontSize: '0.9rem' }}>
        {title}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff' }}>
        {value}
      </div>
      <div style={{ color: '#faa09a', fontSize: '0.8rem', marginTop: '5px' }}>
        {description}
      </div>
    </div>
  );
}