import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Zap, Sparkles, Volume2, VolumeX, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/sound';

export interface AutoPilotProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSimulatePreCoaching: () => void;
  onSimulateCoached: () => void;
  onOpenTechniqueModal: () => void;
  onCloseTechniqueModal: () => void;
  onTriggerTransferEvaluation: () => void;
}

export const AutoPilotDock: React.FC<AutoPilotProps> = ({
  activeTab,
  setActiveTab,
  onSimulatePreCoaching,
  onSimulateCoached,
  onOpenTechniqueModal,
  onCloseTechniqueModal,
  onTriggerTransferEvaluation
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.5);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = [
    {
      title: "1. Baseline Novice Hesitation",
      tab: "cab",
      narration: "Step 1/5 — Aryan (1st year novice) begins soft-soil trenching. Observe high boom elevation and hesitation during repositioning (11.6s baseline).",
      action: () => {
        setActiveTab('cab');
        onCloseTechniqueModal();
        onSimulatePreCoaching();
      },
      duration: 10000
    },
    {
      title: "2. Contextual Technique Identified",
      tab: "cab",
      narration: "Step 2/5 — Unsupervised pattern matcher identifies soft-soil match with retired veteran Fernandes (14 yrs). Proactively delivers gentle low-boom guidance.",
      action: () => {
        setActiveTab('cab');
        sound.playChime();
      },
      duration: 7000
    },
    {
      title: "3. Applying Coached Execution",
      tab: "cab",
      narration: "Step 3/5 — Aryan applies Technique #17 in real time. Low boom posture eliminates counterweight sway; repositioning collapses to 8.4s.",
      action: () => {
        setActiveTab('cab');
        onSimulateCoached();
      },
      duration: 10000
    },
    {
      title: "4. Mined Empirical Evidence",
      tab: "library",
      narration: "Step 4/5 — Technique #17 is not hardcoded. Our unsupervised engine derived it from 94 verified cycles with +16.3% repositioning efficiency.",
      action: () => {
        setActiveTab('library');
        setTimeout(() => {
          onOpenTechniqueModal();
        }, 500);
      },
      duration: 8000
    },
    {
      title: "5. The Climax: Knowledge Transferred",
      tab: "transfer",
      narration: "Step 5/5 — Climax: 'Fernandes retired 6 months ago. His technique didn't.' Repositioning latency reduced 27.1%, variance collapsed 50.8%.",
      action: () => {
        onCloseTechniqueModal();
        setActiveTab('transfer');
        onTriggerTransferEvaluation();
        sound.playFanfare();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFCD11', '#FFE047', '#10B981', '#3B82F6']
        });
      },
      duration: 12000
    }
  ];

  const executeStep = (stepIdx: number) => {
    if (stepIdx < 0 || stepIdx >= steps.length) return;
    setCurrentStep(stepIdx);
    steps[stepIdx].action();
  };

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const step = steps[currentStep];
    const adjustedDuration = Math.round(step.duration / speedMultiplier);

    timerRef.current = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        const next = currentStep + 1;
        setCurrentStep(next);
        steps[next].action();
      } else {
        setIsRunning(false);
      }
    }, adjustedDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, currentStep, speedMultiplier]);

  const toggleAutoPilot = () => {
    if (!isRunning) {
      setIsRunning(true);
      executeStep(currentStep >= steps.length - 1 ? 0 : currentStep);
    } else {
      setIsRunning(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      executeStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      executeStep(currentStep - 1);
    }
  };

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  return (
    <>
      {/* Floating Auto-Pilot Executive Dock */}
      <div style={{
        position: 'fixed',
        top: '76px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        background: 'rgba(20, 25, 34, 0.95)',
        backdropFilter: 'blur(16px)',
        border: isRunning ? '2px solid var(--cat-yellow)' : '1px solid var(--cat-border)',
        borderRadius: '30px',
        padding: '6px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: isRunning ? '0 8px 30px rgba(255, 205, 17, 0.3)' : '0 6px 20px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.3s ease'
      }}>
        {/* Play/Pause Auto-Pilot */}
        <button
          onClick={toggleAutoPilot}
          style={{
            background: isRunning ? 'var(--cat-yellow)' : 'var(--cat-surface)',
            color: isRunning ? 'var(--cat-black)' : 'var(--cat-yellow)',
            border: isRunning ? 'none' : '1px solid var(--cat-yellow)',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Bot size={15} />
          {isRunning ? 'Pause Autonomous Demo' : 'Start Autonomous Demo'}
        </button>

        {/* Current Step Tracker Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {steps.map((s, idx) => (
            <div
              key={s.title}
              onClick={() => executeStep(idx)}
              title={s.title}
              style={{
                width: currentStep === idx ? '22px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentStep === idx ? 'var(--cat-yellow)' : idx < currentStep ? 'var(--cat-success)' : 'var(--cat-border)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            />
          ))}
        </div>

        {/* Step Forward / Backward */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentStep === 0 ? 'var(--cat-text-dim)' : 'var(--cat-text-main)',
              cursor: currentStep === 0 ? 'default' : 'pointer',
              padding: '4px'
            }}
          >
            <SkipBack size={14} />
          </button>
          <span style={{ fontSize: '0.78rem', color: 'var(--cat-text-muted)', fontWeight: 600 }}>
            {currentStep + 1}/{steps.length}
          </span>
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentStep === steps.length - 1 ? 'var(--cat-text-dim)' : 'var(--cat-text-main)',
              cursor: currentStep === steps.length - 1 ? 'default' : 'pointer',
              padding: '4px'
            }}
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Speed Multiplier */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              style={{
                background: speedMultiplier === s ? 'var(--cat-yellow)' : 'transparent',
                color: speedMultiplier === s ? 'var(--cat-black)' : 'var(--cat-text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute cab audio' : 'Enable cab audio'}
          style={{
            background: 'transparent',
            border: 'none',
            color: soundEnabled ? 'var(--cat-yellow)' : 'var(--cat-text-dim)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>

      {/* Synchronized Presenter Talk-Track Subtitle Bar */}
      {isRunning && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(11, 14, 18, 0.96)',
          border: '1px solid var(--cat-yellow)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
          padding: '14px 24px',
          maxWidth: '850px',
          width: '90%',
          textAlign: 'center',
          animation: 'pulse-glow 3s infinite ease-in-out'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cat-yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
            Autonomous Demo Talk Track • {steps[currentStep].title}
          </div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--cat-text-main)',
            marginTop: '4px',
            lineHeight: 1.4
          }}>
            {steps[currentStep].narration}
          </p>
        </div>
      )}
    </>
  );
};
