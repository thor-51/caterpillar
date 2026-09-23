import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Truck, Wrench, CheckCircle } from 'lucide-react';
import { api, Machine, SafetyOverview } from '../services/api';

export const SafetyFleet: React.FC = () => {
  const [safety, setSafety] = useState<SafetyOverview | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [safetyData, machineData] = await Promise.all([
          api.getSafetyOverview(),
          api.getMachines()
        ]);
        setSafety(safetyData);
        setMachines(machineData);
      } catch (err) {
        console.error('Failed to load safety and fleet data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !safety) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cat-text-muted)' }}>
        Loading safety telemetry and fleet diagnostics...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge-tag badge-yellow">
            Site Operations & Compliance
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>
            Active Machines: <strong style={{ color: 'var(--cat-text-main)' }}>{machines.length} Units</strong>
          </span>
        </div>
        <h2 style={{ fontSize: '1.8rem', marginTop: '6px' }}>
          Job Site Safety & Fleet Machine Health
        </h2>
        <p style={{ color: 'var(--cat-text-muted)', fontSize: '0.9rem' }}>
          Real-time tracking of operator restraint compliance, machine hydraulic health, and equipment duty cycles.
        </p>
      </div>

      {/* Safety Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
            Logged Safety Incidents
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--cat-yellow)', marginTop: '4px' }}>
            {safety.total_events}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>Recorded during 384 cycles</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
            Critical Violations
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>
            {safety.critical_events}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>Unbuckled during track movement</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
            Restraint Warnings
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F59E0B', marginTop: '4px' }}>
            {safety.warning_events}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>Stationary throttle warnings</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
            Fleet Hydraulic Integrity
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--cat-success)', marginTop: '4px' }}>
            97.2%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>Across 5 active excavators</span>
        </div>
      </div>

      {/* Fleet Machines Grid */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="var(--cat-yellow)" />
          Connected Fleet Excavators
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {machines.map((m) => (
            <div
              key={m.machine_id}
              style={{
                background: 'var(--cat-surface)',
                padding: '18px',
                borderRadius: '8px',
                border: '1px solid var(--cat-border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge-tag badge-yellow" style={{ fontSize: '0.7rem' }}>
                  {m.machine_id}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>
                  {m.year}
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', marginTop: '8px', color: 'var(--cat-text-main)' }}>
                {m.model}
              </h4>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--cat-text-muted)' }}>Operating Hours:</span>
                  <strong>{m.operating_hours.toLocaleString()} hrs</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--cat-text-muted)' }}>Fuel Multiplier:</span>
                  <strong style={{ color: m.fuel_efficiency_factor > 1.0 ? '#EF4444' : 'var(--cat-success)' }}>
                    {m.fuel_efficiency_factor}x
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--cat-text-muted)' }}>Hydraulic Health:</span>
                  <strong style={{ color: 'var(--cat-success)' }}>
                    {Math.round(m.hydraulic_health_index * 100)}%
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Incident Log & Operator Rankings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Incident History Table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#EF4444" />
            Safety Alerts & Proximity Telemetry
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--cat-surface)', color: 'var(--cat-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Event</th>
                  <th style={{ padding: '8px 10px' }}>Severity</th>
                  <th style={{ padding: '8px 10px' }}>Duration</th>
                  <th style={{ padding: '8px 10px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {safety.events.map((evt) => (
                  <tr key={evt.event_id} style={{ borderBottom: '1px solid var(--cat-border)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--cat-yellow)' }}>
                      {evt.event_id}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span className={evt.severity === 'CRITICAL' ? 'badge-tag badge-red' : 'badge-tag badge-yellow'} style={{ fontSize: '0.65rem' }}>
                        {evt.severity}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>{evt.duration_seconds}s</td>
                    <td style={{ padding: '8px 10px', color: 'var(--cat-text-muted)' }}>{evt.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operator Compliance Ranking */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--cat-success)" />
            Operator Restraint Compliance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {safety.compliance_rankings.map((op) => (
              <div
                key={op.operator_id}
                style={{
                  background: 'var(--cat-surface)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: 'var(--cat-text-main)' }}>{op.name}</strong>
                    <span className="badge-tag badge-yellow" style={{ fontSize: '0.65rem' }}>
                      {op.skill_level}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>
                    Incidents Logged: {op.incident_count}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: op.safety_compliance >= 0.95 ? 'var(--cat-success)' : op.safety_compliance >= 0.90 ? 'var(--cat-yellow)' : '#EF4444'
                  }}>
                    {Math.round(op.safety_compliance * 100)}%
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-dim)' }}>Compliance Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
