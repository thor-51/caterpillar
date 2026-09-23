import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Zap, Sparkles, Volume2, VolumeX, Bot, Repeat, Mic, MicOff } from 'lucide-react';
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
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [kioskLoop, setKioskLoop] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper for text-to-speech synthesis
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05 * speedMultiplier;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      // Prefer high-quality voices if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Google') || v.name.includes('Natural')));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech autoplay policy fallback
    }
  };

  const steps = [
    {
      title: "1. Shift Dispatch & Predictive ML",
      tab: "tasks",
      narration: "Step 1 of 6 — Aryan begins his shift. Our Bayesian Predictive Model estimates completing the 120-meter trench 27% faster by applying Fernandes's soft-soil technique.",
      action: () => {
        onCloseTechniqueModal();
        setActiveTab('tasks');
        speakText("Step 1. Aryan begins his shift. Our predictive model estimates completing the 120-meter trench 27% faster by applying Fernandes's soft-soil technique.");
      },
      duration: 9000
    },
    {
      title: "2. In-Cab Kinematics & Blindspot Radar",
      tab: "cab",
      narration: "Step 2 of 6 — In-Cab Cockpit: Observe the 2D kinematic arm, dual-channel oscilloscope, and 360-degree LiDAR radar scanning ground workers and trench edges.",
      action: () => {
        onCloseTechniqueModal();
        setActiveTab('cab');
        onSimulatePreCoaching();
        sound.playClick();
        speakText("Step 2. Inside the cab, observe the 2D kinematic arm, dual-channel oscilloscope, and 360-degree LiDAR radar scanning for ground workers.");
      },
      duration: 10000
    },
    {
      title: "3. Mined Empirical Knowledge",
      tab: "library",
      narration: "Step 3 of 6 — Technique #17 was not hardcoded. Our unsupervised engine mined it from 94 cycles by veteran Fernandes, proving a 16.3% repositioning advantage.",
      action: () => {
        setActiveTab('library');
        setTimeout(() => {
          onOpenTechniqueModal();
        }, 500);
        sound.playChime();
        speakText("Step 3. Technique 17 was not hardcoded. Our unsupervised engine mined it from 94 cycles by veteran Fernandes, proving a 16.3% repositioning advantage.");
      },
      duration: 9000
    },
    {
      title: "4. Interactive Simulation Drill",
      tab: "training",
      narration: "Step 4 of 6 — Operator Training Hub: Aryan practices the low-boom reposition drill on the interactive simulator, earning a 96% certified competency score.",
      action: () => {
        onCloseTechniqueModal();
        setActiveTab('training');
        speakText("Step 4. In the Operator Training Hub, Aryan practices the low-boom reposition drill on the interactive simulator, earning a certified competency score.");
      },
      duration: 9000
    },
    {
      title: "5. Real-Time Coached Execution",
      tab: "cab",
      narration: "Step 5 of 6 — Applying the technique in real time. Low boom elevation pins the center of gravity; reposition latency collapses from 11.6 seconds to 8.4 seconds.",
      action: () => {
        onCloseTechniqueModal();
        setActiveTab('cab');
        onSimulateCoached();
        sound.playClick();
        speakText("Step 5. Applying the technique in real time. Low boom elevation pins the center of gravity; reposition latency collapses from 11.6 seconds to 8.4 seconds.");
      },
      duration: 10000
    },
    {
      title: "6. The Climax: Knowledge Transferred",
      tab: "transfer",
      narration: "Step 6 of 6 — Climax: 'Fernandes retired 6 months ago. His technique didn't.' Repositioning latency reduced 27.1%, variance collapsed 50.8%!",
      action: () => {
        onCloseTechniqueModal();
        setActiveTab('transfer');
        onTriggerTransferEvaluation();
        sound.playFanfare();
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#F5A623', '#FFBA42', '#05C46B', '#00D2D3']
        });
        speakText("Step 6. The climax. Fernandes retired 6 months ago. His technique didn't. Repositioning latency reduced 27.1%, and variance collapsed 50.8%!");
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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
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
        if (kioskLoop) {
          // Auto-loop after celebration
          setTimeout(() => {
            setCurrentStep(0);
            steps[0].action();
          }, 3000);
        } else {
          setIsRunning(false);
        }
      }
    }, adjustedDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, currentStep, speedMultiplier, kioskLoop]);

  const toggleAutoPilot = () => {
    if (!isRunning) {
      setIsRunning(true);
      executeStep(currentStep >= steps.length - 1 ? 0 : currentStep);
    } else {
      setIsRunning(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
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

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      {/* Floating Auto-Pilot Executive Dock */}
      <div style={{
        position: 'fixed',
        top: '74px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        background: 'rgba(16, 21, 30, 0.96)',
        backdropFilter: 'blur(16px)',
        border: isRunning ? '2px solid var(--cat-gold)' : '1px solid var(--cat-border)',
        borderRadius: '30px',
        padding: '6px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: isRunning ? '0 8px 32px var(--cat-gold-glow)' : '0 6px 20px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.3s ease'
      }}>
        {/* Play/Pause Auto-Pilot */}
        <button
          onClick={toggleAutoPilot}
          style={{
            background: isRunning ? 'var(--cat-gold)' : 'var(--cat-surface)',
            color: isRunning ? 'var(--cat-black)' : 'var(--cat-gold)',
            border: isRunning ? 'none' : '1px solid var(--cat-gold)',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}
        >
          <Bot size={15} />
          {isRunning ? 'Pause Autonomous Demo' : 'Start Autonomous Demo'}
        </button>

        {/* Current Step Tracker Indicators */}
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
                background: currentStep === idx ? 'var(--cat-gold)' : idx < currentStep ? 'var(--cat-success)' : 'var(--cat-border)',
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
          <span style={{ fontSize: '0.78rem', color: 'var(--cat-text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {[1.0, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              style={{
                background: speedMultiplier === s ? 'var(--cat-gold)' : 'transparent',
                color: speedMultiplier === s ? 'var(--cat-black)' : 'var(--cat-text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Voice Speech Synthesis Toggle */}
        <button
          onClick={toggleVoice}
          title={voiceEnabled ? 'Mute AI voice narration' : 'Enable AI voice narration'}
          style={{
            background: 'transparent',
            border: 'none',
            color: voiceEnabled ? 'var(--cat-gold)' : 'var(--cat-text-dim)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {voiceEnabled ? <Mic size={15} /> : <MicOff size={15} />}
        </button>

        {/* Kiosk Loop Mode Toggle */}
        <button
          onClick={() => setKioskLoop(!kioskLoop)}
          title={kioskLoop ? 'Continuous Kiosk Loop Enabled' : 'Enable Continuous Kiosk Loop'}
          style={{
            background: 'transparent',
            border: 'none',
            color: kioskLoop ? 'var(--cat-radar)' : 'var(--cat-text-dim)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Repeat size={15} />
        </button>

        {/* Sound Effects Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute cab audio' : 'Enable cab audio'}
          style={{
            background: 'transparent',
            border: 'none',
            color: soundEnabled ? 'var(--cat-gold)' : 'var(--cat-text-dim)',
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
          background: 'rgba(11, 15, 22, 0.98)',
          border: '1px solid var(--cat-gold)',
          boxShadow: '0 8px 36px rgba(0, 0, 0, 0.85), 0 0 20px var(--cat-gold-glow)',
          borderRadius: '10px',
          padding: '14px 24px',
          maxWidth: '880px',
          width: '90%',
          textAlign: 'center',
          animation: 'pulse-glow 3s infinite ease-in-out'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--cat-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900 }}>
            Autonomous Demo Flight Deck • {steps[currentStep].title}
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
