import React, { useState } from 'react';
import { RotateCcw, Cpu, Layers, HardHat, Compass, ShieldAlert, Award } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemMetrics: {
    cycles: number;
    discoveredTechniques: number;
    machines: number;
    operators: number;
  };
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemMetrics,
  onRefresh
}) => {
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    try {
      setResetting(true);
      await api.resetDemo();
      onRefresh();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--cat-border)',
      background: 'rgba(15, 18, 22, 0.95)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'var(--cat-yellow)',
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 205, 17, 0.3)'
          }}>
            {/* CAT Triangle / Equipment Icon */}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: '1.25rem',
              color: 'var(--cat-black)'
            }}>
              CAT
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '1.35rem',
                color: 'var(--cat-text-main)',
                letterSpacing: '-0.01em',
                lineHeight: 1.1
              }}>
                CAT Legacy
              </h1>
              <span className="badge-tag badge-yellow" style={{ fontSize: '0.65rem' }}>
                Operational AI
              </span>
            </div>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--cat-text-muted)',
              marginTop: '2px'
            }}>
              Capture the expertise. Transfer the skill. Keep the knowledge.
            </p>
          </div>
        </div>

        {/* Live System Stats & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '6px 14px',
            background: 'var(--cat-surface)',
            border: '1px solid var(--cat-border)',
            borderRadius: '8px',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-indicator" />
              <span style={{ color: 'var(--cat-text-muted)' }}>Mined:</span>
              <strong style={{ color: 'var(--cat-yellow)' }}>
                {systemMetrics.discoveredTechniques} Techniques
              </strong>
            </div>

            <div style={{ width: '1px', height: '14px', background: 'var(--cat-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--cat-text-muted)' }}>Dataset:</span>
              <strong style={{ color: 'var(--cat-text-main)' }}>
                {systemMetrics.cycles} Cycles
              </strong>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="btn-cat-secondary"
            title="Reset system to clean demo presentation state"
            style={{ fontSize: '0.82rem', padding: '7px 14px' }}
          >
            <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
            {resetting ? 'Resetting...' : 'Demo Reset'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'cab', label: 'In-Cab Assistant', icon: HardHat, badge: 'Live Stream' },
          { id: 'library', label: 'Technique Library', icon: Layers, badge: `${systemMetrics.discoveredTechniques} Mined` },
          { id: 'transfer', label: 'Skill Transfer Proof', icon: Award, badge: 'Goosebumps' },
          { id: 'safety', label: 'Safety & Fleet', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--cat-yellow)' : '3px solid transparent',
                color: isActive ? 'var(--cat-yellow)' : 'var(--cat-text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: isActive ? 'var(--cat-yellow)' : 'rgba(255, 205, 17, 0.1)',
                  color: isActive ? 'var(--cat-black)' : 'var(--cat-yellow)',
                  fontWeight: 700
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
