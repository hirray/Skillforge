import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  TourDefinition,
  TourStep,
  allToursCatalog,
  getWelcomeTourForContext,
  welcomeIndividualTour
} from '../../config/tours.config';

interface TourContextType {
  isActive: boolean;
  currentTour: TourDefinition | null;
  currentStepIndex: number;
  currentStep: TourStep | null;
  startTour: (tourIdOrDef?: string | TourDefinition) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: (status?: 'completed' | 'skipped') => void;
  resetAllTours: () => void;
  isTourCompleted: (tourId: string) => boolean;
  allTours: TourDefinition[];
}

const TourContext = createContext<TourContextType>({
  isActive: false,
  currentTour: null,
  currentStepIndex: 0,
  currentStep: null,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  endTour: () => {},
  resetAllTours: () => {},
  isTourCompleted: () => false,
  allTours: allToursCatalog,
});

export const useTour = () => useContext(TourContext);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTour, setCurrentTour] = useState<TourDefinition | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const clickHandlerRef = useRef<(() => void) | null>(null);

  const steps = currentTour?.steps || welcomeIndividualTour.steps;
  const currentStep = isActive && steps[currentStepIndex] ? steps[currentStepIndex] : null;
  const currentUserId = localStorage.getItem('token') || 'user-001';

  // Persistence keys
  const getTourStorageKey = (tourId: string, version: number) =>
    `sf_tour_${currentUserId}_${tourId}_v${version}`;

  const isTourCompleted = useCallback(
    (tourId: string): boolean => {
      const tour = allToursCatalog.find((t) => t.tourId === tourId);
      if (!tour) return false;
      const record = localStorage.getItem(getTourStorageKey(tour.tourId, tour.version));
      return record === 'completed';
    },
    [currentUserId]
  );

  // Measure element location & dimensions
  const updateTargetRect = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(currentStep.target) as HTMLElement | null;
    if (el) {
      const placement = currentStep.placement || 'bottom';
      // Ensure sufficient clearance above or below element
      if (placement === 'top') {
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else if (placement === 'bottom') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => {
        if (el) setTargetRect(el.getBoundingClientRect());
      }, 120);
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  // Navigate to step route if different
  useEffect(() => {
    if (!isActive || !currentStep?.route) return;
    const currentPath = window.location.pathname;
    if (currentPath !== currentStep.route && !currentPath.startsWith(currentStep.route)) {
      window.history.pushState({}, '', currentStep.route);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [isActive, currentStep]);

  // Target element elevation & mutation observer resilience
  useEffect(() => {
    if (!isActive || !currentStep) return;

    let observer: MutationObserver | null = null;
    let timeoutId: any = null;

    const attachToElement = (el: HTMLElement) => {
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

      updateTargetRect();

      // Click-to-advance handling
      if (currentStep.advanceOn === 'click-target') {
        const handleClick = () => {
          setTimeout(() => nextStep(), 100);
        };
        el.addEventListener('click', handleClick, { capture: true, once: true });
        clickHandlerRef.current = () => el.removeEventListener('click', handleClick, { capture: true });
      }

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
        if (clickHandlerRef.current) {
          clickHandlerRef.current();
          clickHandlerRef.current = null;
        }
      };
    };

    const targetEl = document.querySelector(currentStep.target) as HTMLElement | null;
    if (targetEl) {
      return attachToElement(targetEl);
    } else {
      // Resilience: wait up to 3s for target to render via MutationObserver
      observer = new MutationObserver(() => {
        const el = document.querySelector(currentStep.target) as HTMLElement | null;
        if (el) {
          if (observer) observer.disconnect();
          attachToElement(el);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // If never appears within 3000ms, auto-advance silently to avoid blocking user
      timeoutId = setTimeout(() => {
        if (observer) observer.disconnect();
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      }, 3000);

      return () => {
        if (observer) observer.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [isActive, currentStep, currentStepIndex, steps.length, updateTargetRect]);

  // Window resize & scroll listeners
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

  // Deep-link check for ?tour=<tourId> and auto-launch
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deepLinkTour = params.get('tour');
    if (deepLinkTour) {
      const match = allToursCatalog.find((t) => t.tourId === deepLinkTour);
      if (match) {
        startTour(match);
        return;
      }
    }

    // Auto-launch context-appropriate welcome tour on first login
    const activeCtx = localStorage.getItem('skillforge_active_context') || 'individual';
    const welcomeDef = getWelcomeTourForContext(activeCtx);
    const hasSeenWelcome = localStorage.getItem(getTourStorageKey(welcomeDef.tourId, welcomeDef.version));

    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        startTour(welcomeDef);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = (tourIdOrDef?: string | TourDefinition) => {
    let selectedTour: TourDefinition = welcomeIndividualTour;
    if (typeof tourIdOrDef === 'string') {
      const found = allToursCatalog.find((t) => t.tourId === tourIdOrDef);
      if (found) selectedTour = found;
    } else if (tourIdOrDef) {
      selectedTour = tourIdOrDef;
    } else {
      const activeCtx = localStorage.getItem('skillforge_active_context') || 'individual';
      selectedTour = getWelcomeTourForContext(activeCtx);
    }

    setCurrentTour(selectedTour);
    setCurrentStepIndex(0);
    setIsActive(true);
    setShowExitConfirm(false);
  };

  const endTour = (status: 'completed' | 'skipped' = 'completed') => {
    if (currentTour) {
      localStorage.setItem(getTourStorageKey(currentTour.tourId, currentTour.version), status);
    }
    setIsActive(false);
    setShowExitConfirm(false);
  };

  const resetAllTours = () => {
    allToursCatalog.forEach((t) => {
      localStorage.removeItem(getTourStorageKey(t.tourId, t.version));
    });
    const activeCtx = localStorage.getItem('skillforge_active_context') || 'individual';
    startTour(getWelcomeTourForContext(activeCtx));
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour('completed');
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
      if (e.key === 'Escape') {
        setShowExitConfirm(true);
      }
      if (e.key === 'ArrowRight' || (e.key === 'Enter' && !showExitConfirm)) nextStep();
      if (e.key === 'ArrowLeft' && !showExitConfirm) prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStepIndex, steps.length, showExitConfirm]);

  const remainingSeconds = Math.max(
    10,
    Math.round(((steps.length - currentStepIndex) / steps.length) * (currentTour?.estimatedSeconds || 40))
  );

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentTour,
        currentStepIndex,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        endTour,
        resetAllTours,
        isTourCompleted,
        allTours: allToursCatalog,
      }}
    >
      {children}

      {/* =========================================================================
          SPOTLIGHT OVERLAY & POPUP (9999px Box-Shadow Cutout + Tooltip Popover)
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
                boxShadow:
                  '0 0 0 9999px rgba(5, 7, 15, 0.82), 0 0 30px rgba(168, 85, 247, 0.75), inset 0 0 15px rgba(168, 85, 247, 0.25)',
                border: '2px solid #a855f7',
              }}
            >
              <div className="absolute -inset-1 rounded-2xl border border-[#a855f7]/60 animate-ping pointer-events-none" />
            </div>
          ) : (
            <div className="fixed inset-0 bg-[#05070f]/80 pointer-events-none z-[99992]" />
          )}

          {/* Escape Exit Confirmation Dialog */}
          {showExitConfirm && (
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-[#181726] border border-[#393750] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-white">
                <h4 className="text-base font-bold mb-2">Pause Guided Tour?</h4>
                <p className="text-xs text-[#d1d5db] mb-5 leading-relaxed">
                  Would you like to skip this tour completely, or pause and replay it anytime from the top-bar ✨ Tour button?
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#252436] hover:bg-[#302f44] text-xs font-semibold text-white transition-colors"
                  >
                    Resume Tour
                  </button>
                  <button
                    onClick={() => endTour('skipped')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#8861dc] hover:bg-[#784fce] text-xs font-bold text-white transition-colors"
                  >
                    Skip Tour
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Tooltip Popover Card */}
          {(() => {
            // Precise zero-overlap positioning
            let stylePos: React.CSSProperties = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
            if (targetRect) {
              const tooltipW = Math.min(360, window.innerWidth - 32);
              const tooltipH = 230;
              const margin = 16;
              const desired = currentStep?.placement || 'bottom';

              const spaceAbove = targetRect.top;
              const spaceBelow = window.innerHeight - targetRect.bottom;
              const spaceRight = window.innerWidth - targetRect.right;
              const spaceLeft = targetRect.left;

              let top = 0;
              let left = targetRect.left + (targetRect.width - tooltipW) / 2;

              if (desired === 'top' && spaceAbove >= tooltipH + margin) {
                top = targetRect.top - tooltipH - margin;
              } else if (desired === 'bottom' && spaceBelow >= tooltipH + margin) {
                top = targetRect.bottom + margin;
              } else if (spaceBelow >= tooltipH + margin) {
                top = targetRect.bottom + margin;
              } else if (spaceAbove >= tooltipH + margin) {
                top = targetRect.top - tooltipH - margin;
              } else if (spaceRight >= tooltipW + margin) {
                top = Math.max(margin, Math.min(window.innerHeight - tooltipH - margin, targetRect.top));
                left = targetRect.right + margin;
              } else if (spaceLeft >= tooltipW + margin) {
                top = Math.max(margin, Math.min(window.innerHeight - tooltipH - margin, targetRect.top));
                left = targetRect.left - tooltipW - margin;
              } else {
                // If element covers most of screen, place safely at top-right
                top = margin + 12;
                left = window.innerWidth - tooltipW - margin;
              }

              left = Math.max(margin, Math.min(window.innerWidth - tooltipW - margin, left));
              top = Math.max(margin, Math.min(window.innerHeight - tooltipH - margin, top));

              stylePos = {
                top: `${top}px`,
                left: `${left}px`,
              };
            }

            return (
              <div
                className="fixed transition-all duration-300 z-[99999] p-5 rounded-2xl bg-gradient-to-b from-[#1c1b2b] via-[#161524] to-[#12111d] border border-[#3c3a54] shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white w-[92vw] max-w-sm pointer-events-auto"
                style={stylePos}
              >
                {/* Header: Step counter, time left & Close button */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2d2c3e]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
                    <span className="text-[11px] font-extrabold text-[#c4b5fd] uppercase tracking-wider">
                      {currentTour?.title || 'Tour'} • Step {currentStepIndex + 1} of {steps.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#9ca3af] font-medium">~{remainingSeconds}s left</span>
                    <button
                      onClick={() => setShowExitConfirm(true)}
                      className="text-[#9ca3af] hover:text-white p-1 rounded-md hover:bg-[#252436] transition-colors"
                      title="Dismiss tour"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-extrabold text-white tracking-tight mb-1.5">
                  {currentStep.title}
                </h3>
                <p className="text-xs text-[#d1d5db] leading-relaxed mb-3">
                  {currentStep.description}
                </p>

                {/* Advance On Click-Target Hint */}
                {currentStep.advanceOn === 'click-target' && (
                  <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-[#a855f7]/15 border border-[#a855f7]/30 text-[11px] text-[#e9d5ff] flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-pulse text-[#c4b5fd] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span>Click the highlighted button above to continue.</span>
                  </div>
                )}

                {/* Learn More Links (Manual & Flowchart) */}
                {currentStep.learnMore && (
                  <div className="flex items-center gap-3 mb-3 text-[11px]">
                    {currentStep.learnMore.chapter && (
                      <a
                        href={`/help#${currentStep.learnMore.chapter}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#93b2f8] hover:text-white underline decoration-[#93b2f8]/50 flex items-center gap-1 font-medium"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                        </svg>
                        <span>Read full guide</span>
                      </a>
                    )}
                    {currentStep.learnMore.flowchart && (
                      <a
                        href={`/help#${currentStep.learnMore.flowchart}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#f1b94c] hover:text-white underline decoration-[#f1b94c]/50 flex items-center gap-1 font-medium"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <span>View workflow</span>
                      </a>
                    )}
                  </div>
                )}

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
                    onClick={() => setShowExitConfirm(true)}
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
            );
          })()}
        </div>
      )}
    </TourContext.Provider>
  );
};
