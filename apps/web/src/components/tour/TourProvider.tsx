import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { welcomeTourSteps, TourStep } from '../../config/tours.config';

interface TourContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  startTour: (steps?: TourStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType>({
  isActive: false,
  currentStepIndex: 0,
  currentStep: null,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  endTour: () => {},
});

export const useTour = () => useContext(TourContext);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<TourStep[]>(welcomeTourSteps);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = isActive && steps[currentStepIndex] ? steps[currentStepIndex] : null;

  // Measure element location & dimensions
  const updateTargetRect = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(currentStep.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  // Elevate the toured element so it is 100% sharp, bright, and interactive
  useEffect(() => {
    if (!isActive || !currentStep) return;
    const el = document.querySelector(currentStep.target) as HTMLElement | null;
    if (el) {
      const prevZ = el.style.zIndex;
      const prevPos = el.style.position;
      const prevBoxShadow = el.style.boxShadow;
      const prevFilter = el.style.filter;

      // Elevate parent stacking context (e.g. topbar header or sidebar) so target breaks out above overlay
      const parentStack = el.closest('header, nav, aside') as HTMLElement | null;
      const prevParentZ = parentStack ? parentStack.style.zIndex : '';
      if (parentStack) {
        parentStack.style.zIndex = '99995';
      }

      el.style.zIndex = '99998';
      if (!prevPos || prevPos === 'static') {
        el.style.position = 'relative';
      }
      el.style.filter = 'brightness(1.15) contrast(1.05)';
      el.style.boxShadow = '0 0 25px rgba(168, 85, 247, 0.5)';

      return () => {
        el.style.zIndex = prevZ;
        if (!prevPos || prevPos === 'static') {
          el.style.position = prevPos;
        }
        el.style.boxShadow = prevBoxShadow;
        el.style.filter = prevFilter;
        if (parentStack) {
          parentStack.style.zIndex = prevParentZ;
        }
      };
    }
  }, [isActive, currentStep, currentStepIndex]);

  useEffect(() => {
    if (isActive) {
      updateTargetRect();
      const timer = setTimeout(updateTargetRect, 150);
      window.addEventListener('resize', updateTargetRect);
      window.addEventListener('scroll', updateTargetRect, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTargetRect);
        window.removeEventListener('scroll', updateTargetRect, true);
      };
    }
  }, [isActive, currentStepIndex, updateTargetRect]);

  // Auto-launch on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('skillforge_guided_tour_done');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = (customSteps?: TourStep[]) => {
    if (customSteps && customSteps.length > 0) {
      setSteps(customSteps);
    } else {
      setSteps(welcomeTourSteps);
    }
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    localStorage.setItem('skillforge_guided_tour_done', 'true');
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex, steps.length]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        endTour,
      }}
    >
      {children}

      {/* =========================================================================
          SPOTLIGHT OVERLAY & POPUP (SVG Cutout Hole + Floating Tooltip)
      ========================================================================= */}
      {isActive && currentStep && (
        <div className="fixed inset-0 z-[99990] pointer-events-auto overflow-hidden">
          {/* Spotlight Highlight Mask: 9999px spread box-shadow guarantees the cutout hole is 100% crystal-clear and the rest of the screen is dimmed */}
          {targetRect ? (
            <div
              className="fixed rounded-xl transition-all duration-300 pointer-events-none z-[99992]"
              style={{
                top: `${Math.max(0, targetRect.top - 6)}px`,
                left: `${Math.max(0, targetRect.left - 6)}px`,
                width: `${targetRect.width + 12}px`,
                height: `${targetRect.height + 12}px`,
                boxShadow: '0 0 0 9999px rgba(5, 7, 15, 0.82), 0 0 30px rgba(168, 85, 247, 0.75), inset 0 0 15px rgba(168, 85, 247, 0.25)',
                border: '2px solid #a855f7',
              }}
            >
              {/* Outer pulsing ring */}
              <div className="absolute -inset-1 rounded-2xl border border-[#a855f7]/60 animate-ping pointer-events-none" />
            </div>
          ) : (
            <div className="fixed inset-0 bg-[#05070f]/80 pointer-events-none z-[99992]" />
          )}

          {/* Floating Tooltip Popover Card */}
          <div
            className="fixed transition-all duration-300 z-[99999] p-5 rounded-2xl bg-gradient-to-b from-[#1c1b2b] via-[#161524] to-[#12111d] border border-[#3c3a54] shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white w-[92vw] max-w-sm pointer-events-auto"
            style={{
              top: targetRect
                ? Math.min(
                    window.innerHeight - 240,
                    Math.max(20, targetRect.bottom + 16 > window.innerHeight - 200 ? targetRect.top - 220 : targetRect.bottom + 16)
                  )
                : '50%',
              left: targetRect
                ? Math.min(
                    window.innerWidth - 380,
                    Math.max(20, targetRect.left + targetRect.width / 2 - 180)
                  )
                : '50%',
              transform: !targetRect ? 'translate(-50%, -50%)' : undefined,
            }}
          >
            {/* Header: Step counter & Close button */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d2c3e]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
                <span className="text-[11px] font-extrabold text-[#c4b5fd] uppercase tracking-wider">
                  Tour • Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
              <button
                onClick={endTour}
                className="text-[#9ca3af] hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-[#252436] transition-colors"
                title="Dismiss tour"
              >
                ✕
              </button>
            </div>

            {/* Title & Description */}
            <h3 className="text-base font-extrabold text-white tracking-tight mb-1.5">
              {currentStep.title}
            </h3>
            <p className="text-xs text-[#d1d5db] leading-relaxed mb-4">
              {currentStep.description}
            </p>

            {/* Step Progress Dots */}
            <div className="flex items-center gap-1.5 mb-4">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-gradient-to-r from-[#8861dc] to-[#c4b5fd]'
                      : idx < currentStepIndex
                      ? 'w-2 bg-[#8861dc]'
                      : 'w-2 bg-[#2d2c3e]'
                  }`}
                />
              ))}
            </div>

            {/* Footer Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2d2c3e]">
              <button
                onClick={endTour}
                className="text-xs text-[#9ca3af] hover:text-white transition-colors"
              >
                Skip Tour
              </button>
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-3 py-1.5 rounded-xl bg-[#232233] hover:bg-[#2c2b3f] text-xs font-semibold text-[#d1d5db] hover:text-white border border-[#333246] transition-all"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-xs font-bold text-white shadow-[0_0_16px_rgba(124,58,237,0.5)] border border-[#c4b5fd]/40 transition-all flex items-center gap-1"
                >
                  <span>{currentStepIndex === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TourContext.Provider>
  );
};
