import { useEffect, useRef, useState } from "react";

import { useRevealActive } from "@/components/ui/PageReveal";

function AnimatedKpiValue({
  value,
  numericValue,
  formatValue,
  delay = 0,
  duration = 700,
}) {
  const isRevealActive = useRevealActive();

  const [displayNumber, setDisplayNumber] = useState(0);
  const [finished, setFinished] = useState(false);

  const target = Number(numericValue);

  const isValid =
    numericValue !== null &&
    numericValue !== undefined &&
    numericValue !== "" &&
    Number.isFinite(target);

  // Keep the latest value available to the animation
  // without restarting the effect on API updates.
  const latestTargetRef = useRef(target);
  latestTargetRef.current = target;

  // Store the value captured when the reveal begins.
  const initialTargetRef = useRef(null);

  useEffect(() => {
    if (!isRevealActive) return;

    const initialTarget = latestTargetRef.current;

    initialTargetRef.current = initialTarget;

    // Skip animation for invalid, zero,
    // or reduced-motion values.
    if (
      !Number.isFinite(initialTarget) ||
      initialTarget === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
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

      // Smooth ease-out cubic.
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayNumber(initialTarget * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayNumber(initialTarget);
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

  // Invalid data: preserve original display.
  if (!isValid) {
    return value ?? "—";
  }

  // Before entering the viewport, display zero.
  if (!isRevealActive) {
    return typeof formatValue === "function" ? formatValue(0) : "0";
  }

  // After animation finishes, or after an API update,
  // immediately display the latest formatted value.
  if (
    finished ||
    (initialTargetRef.current !== null && target !== initialTargetRef.current)
  ) {
    return value ?? "—";
  }

  // Prevent count-up from starting before the
  // initial target has been captured.
  if (initialTargetRef.current === null) {
    return typeof formatValue === "function" ? formatValue(0) : "0";
  }

  const animatedNumber = Number.isInteger(initialTargetRef.current)
    ? Math.round(displayNumber)
    : Number(displayNumber.toFixed(2));

  return typeof formatValue === "function"
    ? formatValue(animatedNumber)
    : (value ?? "—");
}

export default AnimatedKpiValue;
