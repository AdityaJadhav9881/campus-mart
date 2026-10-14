import { useCallback, useEffect, useRef, useState } from "react";

/* Drives the 3-step agent pipeline with per-step timing.
   step: 0 = idle, 1..3 = running that step, 4 = complete. */

const STEP_DURATION = 900;
const STEP_GAP = 260;

export function usePipeline() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const run = useCallback(
    (onComplete) => {
      clearTimers();
      setRunning(true);
      setDone(false);
      setStep(1);

      [2, 3, 4].forEach((next, index) => {
        const at = (index + 1) * (STEP_DURATION + STEP_GAP);
        const id = window.setTimeout(() => {
          setStep(next);
          if (next === 4) {
            setRunning(false);
            setDone(true);
            onComplete?.();
          }
        }, at);
        timersRef.current.push(id);
      });
    },
    [clearTimers]
  );

  const reset = useCallback(() => {
    clearTimers();
    setRunning(false);
    setDone(false);
    setStep(0);
  }, [clearTimers]);

  return { step, running, done, run, reset, STEP_DURATION };
}
