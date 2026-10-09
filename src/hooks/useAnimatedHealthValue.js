import { useEffect, useRef, useState } from "react";

import { useRevealActive } from "@/components/ui/PageReveal";

function clampPercentage(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(Math.max(number, 0), 100);
}

export default function useAnimatedHealthValue(
  value,
  { delay = 0, duration = 800 } = {},
) {
  const isRevealActive = useRevealActive();
  const target = clampPercentage(value);

  const latestTargetRef = useRef(target);
  latestTargetRef.current = target;

  const initialTargetRef = useRef(null);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!isRevealActive) return;

    const initialTarget = latestTargetRef.current;
    initialTargetRef.current = initialTarget;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || initialTarget === 0) {
      setFinished(true);
      return;
    }

    let frameId = null;
    let timeoutId = null;
    let startTime = null;
    let cancelled = false;

    const animate = (timestamp) => {
      if (cancelled) return;

      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) / Math.max(duration, 1),
        1,
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedValue(initialTarget * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setAnimatedValue(initialTarget);
        setFinished(true);
      }
    };

    timeoutId = window.setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isRevealActive, delay, duration]);

  // Section has not entered viewport.
  if (!isRevealActive) {
    return 0;
  }

  // On API refresh, show the new value directly.
  if (
    finished ||
    (initialTargetRef.current !== null && target !== initialTargetRef.current)
  ) {
    return target;
  }

  return animatedValue;
}
