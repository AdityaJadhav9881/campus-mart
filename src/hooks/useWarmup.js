import { useEffect, useState } from "react";

/* Returns { show, elapsed } for a long-running backend call.
   Stays hidden for the first `delayMs`, then reports whole seconds
   so the UI can show a reassuring warmup banner. */
export function useWarmup(active, delayMs = 2000) {
  const [show, setShow] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setShow(false);
      setElapsed(0);
      return;
    }

    const startedAt = Date.now();
    const revealTimer = window.setTimeout(() => setShow(true), delayMs);
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const counter = window.setInterval(tick, 1000);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearInterval(counter);
    };
  }, [active, delayMs]);

  return { show, elapsed };
}
