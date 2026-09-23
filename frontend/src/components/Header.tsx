import React, { useState } from 'react';
import { RotateCcw, Cpu, Layers, HardHat, Award, ShieldAlert, CalendarCheck, GraduationCap } from 'lucide-react';
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

  const navTabs = [
    { id: 'cab', label: 'In-Cab Cockpit', icon: HardHat, badge: 'Live HUD' },
    { id: 'tasks', label: 'Daily Tasks & Estimator', icon: CalendarCheck, badge: 'ML Predictor' },
    { id: 'training', label: 'Training & Simulator', icon: GraduationCap, badge: 'Drill Sim' },
    { id: 'library', label: 'Technique Library', icon: Layers, badge: `${systemMetrics.discoveredTechniques} Mined` },
    { id: 'transfer', label: 'Skill Transfer Proof', icon: Award, badge: 'Climax' },
    { id: 'safety', label: 'Safety & Fleet Logs', icon: ShieldAlert, badge: 'Idling Watch' }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--cat-border)',
      background: 'rgba(11, 14, 20, 0.96)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--cat-gold-hover) 0%, var(--cat-gold) 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px var(--cat-gold-glow)',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
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
              <span className="badge-tag badge-gold" style={{ fontSize: '0.62rem' }}>
                Operational AI
              </span>
            </div>
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--cat-text-muted)',
              marginTop: '2px'
            }}>
              Capture the expertise. Transfer the skill. Keep the knowledge.
            </p>
          </div>
        </div>

        {/* Live System Stats & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '6px 14px',
            background: 'var(--cat-surface)',
            border: '1px solid var(--cat-border)',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-indicator" />
              <span style={{ color: 'var(--cat-text-muted)' }}>Mined:</span>
              <strong style={{ color: 'var(--cat-gold)' }}>
                {systemMetrics.discoveredTechniques} Patterns
              </strong>
            </div>

            <div style={{ width: '1px', height: '14px', background: 'var(--cat-border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--cat-text-muted)' }}>Cycles:</span>
              <strong style={{ color: 'var(--cat-text-main)' }}>
                {systemMetrics.cycles}
              </strong>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="btn-cat-secondary"
            title="Reset system to clean demo presentation state"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <RotateCcw size={13} className={resetting ? 'animate-spin' : ''} />
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
        gap: '6px',
        overflowX: 'auto'
      }}>
        {navTabs.map((tab) => {
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
                padding: '11px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--cat-gold)' : '3px solid transparent',
                color: isActive ? 'var(--cat-gold)' : 'var(--cat-text-muted)',
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.62rem',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: isActive ? 'var(--cat-gold)' : 'rgba(245, 166, 35, 0.12)',
                  color: isActive ? 'var(--cat-black)' : 'var(--cat-gold)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)'
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
