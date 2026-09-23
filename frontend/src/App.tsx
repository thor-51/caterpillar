import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CabAssistant } from './components/CabAssistant';
import { TechniqueLibrary } from './components/TechniqueLibrary';
import { SkillTransfer } from './components/SkillTransfer';
import { SafetyFleet } from './components/SafetyFleet';
import { AutoPilotDock } from './components/AutoPilotDock';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('cab');
  const [systemMetrics, setSystemMetrics] = useState({
    cycles: 384,
    discoveredTechniques: 12,
    machines: 5,
    operators: 8
  });

  // Action refs to allow AutoPilot to control child views seamlessly
  const preCoachingTriggerRef = useRef<(() => void) | null>(null);
  const coachedTriggerRef = useRef<(() => void) | null>(null);
  const openModalRef = useRef<((techId?: string) => void) | null>(null);
  const closeModalRef = useRef<(() => void) | null>(null);
  const transferTriggerRef = useRef<(() => void) | null>(null);

  const loadHealth = async () => {
    try {
      const data = await api.getHealth();
      if (data && data.metrics) {
        setSystemMetrics({
          cycles: data.metrics.cycles,
          discoveredTechniques: data.metrics.discovered_techniques,
          machines: data.metrics.machines,
          operators: data.metrics.operators
        });
      }
    } catch (err) {
      console.warn('Backend not responding yet; using cached state:', err);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemMetrics={systemMetrics}
        onRefresh={loadHealth}
      />

      {/* Autonomous Auto-Pilot Controller */}
      <AutoPilotDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSimulatePreCoaching={() => preCoachingTriggerRef.current?.()}
        onSimulateCoached={() => coachedTriggerRef.current?.()}
        onOpenTechniqueModal={() => openModalRef.current?.('TECH_017')}
        onCloseTechniqueModal={() => closeModalRef.current?.()}
        onTriggerTransferEvaluation={() => transferTriggerRef.current?.()}
      />

      {/* Main Content View */}
      <main style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px 60px',
        flex: 1
      }}>
        {activeTab === 'cab' && (
          <CabAssistant
            onPreCoachingTriggerRef={preCoachingTriggerRef}
            onCoachedTriggerRef={coachedTriggerRef}
          />
        )}
        {activeTab === 'library' && (
          <TechniqueLibrary
            onOpenModalRef={openModalRef}
            onCloseModalRef={closeModalRef}
          />
        )}
        {activeTab === 'transfer' && (
          <SkillTransfer
            onTriggerTransferRef={transferTriggerRef}
          />
        )}
        {activeTab === 'safety' && <SafetyFleet />}
      </main>

      {/* Industrial Footer */}
      <footer style={{
        borderTop: '1px solid var(--cat-border)',
        background: 'rgba(15, 18, 22, 0.98)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--cat-text-muted)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--cat-yellow)' }}>CAT Legacy</strong> — Operational AI & Knowledge Preservation Platform
          </div>

          <div style={{ fontStyle: 'italic', color: 'var(--cat-text-dim)', fontSize: '0.78rem' }}>
            "This dataset is synthetic and is intended to demonstrate the analytical architecture. Not representative of proprietary CAT machine telemetry."
          </div>

          <div>
            <a
              href="https://github.com/thor-51/caterpillar"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--cat-yellow)', textDecoration: 'none', fontWeight: 600 }}
            >
              GitHub Repository ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
