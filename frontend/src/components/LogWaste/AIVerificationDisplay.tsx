import React from 'react';
import { AIVerification } from '../../types/index';

type AIVerificationDisplayProps = {
  verification: AIVerification;
};

export default function AIVerificationDisplay({ 
  verification 
}: AIVerificationDisplayProps) {
  return (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      backgroundColor: verification.isVerified 
        ? 'rgba(237,76,76,0.1)' 
        : 'rgba(237,76,76,0.2)',
      borderRadius: '4px',
      border: `1px solid ${verification.isVerified ? '#ed4c4c' : '#ed4c4c80'}`
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '5px',
        color: verification.isVerified ? '#ed4c4c' : '#ed4c4c',
        fontWeight: 'bold'
      }}>
        {verification.isVerified ? '✓' : '⚠️'} AI Verification:
      </div>
      <p style={{ margin: '0 0 10px 0', color: '#ffffff' }}>
        {verification.feedback}
      </p>
      <div style={{ 
        width: '100%', 
        height: '6px', 
        backgroundColor: '#333333', 
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(verification.confidence * 100)}%`,
          height: '100%',
          backgroundColor: verification.isVerified ? '#ed4c4c' : '#faa09a'
        }}></div>
      </div>
      <div style={{ 
        fontSize: '0.8rem', 
        color: '#faa09a', 
        marginTop: '5px', 
        textAlign: 'right' 
      }}>
        Confidence: {(verification.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}