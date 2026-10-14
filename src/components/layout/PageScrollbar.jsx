import { useCallback, useEffect, useRef, useState } from "react";

function PageScrollbar() {
  const [visible, setVisible] = useState(false);
  const [scrollable, setScrollable] = useState(false);

  const [thumb, setThumb] = useState({
    top: 0,
    height: 40,
  });

  const hideTimer = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({
    clientY: 0,
    scrollY: 0,
  });

  const updateScrollbar = useCallback(() => {
    const root = document.documentElement;

    const viewportHeight = window.innerHeight;
    const documentHeight = root.scrollHeight;

    const maxScroll = Math.max(documentHeight - viewportHeight, 0);

    if (maxScroll <= 1) {
      setScrollable(false);
      return;
    }

    setScrollable(true);

    const thumbHeight = Math.min(
      viewportHeight,
      Math.max((viewportHeight / documentHeight) * viewportHeight, 36),
    );

    const trackHeight = viewportHeight - thumbHeight;

    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

    setThumb({
      top: progress * trackHeight,
      height: thumbHeight,
    });
  }, []);

  useEffect(() => {
    const showScrollbar = () => {
      updateScrollbar();
      setVisible(true);

      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      if (!dragging.current) {
        hideTimer.current = setTimeout(() => {
          setVisible(false);
        }, 1100);
      }
    };

    const observer = new ResizeObserver(updateScrollbar);

    observer.observe(document.documentElement);

    window.addEventListener("scroll", showScrollbar, {
      passive: true,
    });

    window.addEventListener("resize", updateScrollbar);

    updateScrollbar();

    return () => {
      observer.disconnect();

      window.removeEventListener("scroll", showScrollbar);
      window.removeEventListener("resize", updateScrollbar);

      clearTimeout(hideTimer.current);
    };
  }, [updateScrollbar]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    event.preventDefault();

    dragging.current = true;

    dragStart.current = {
      clientY: event.clientY,
      scrollY: window.scrollY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);

    clearTimeout(hideTimer.current);
    setVisible(true);
  };

  const handlePointerMove = (event) => {
    if (!dragging.current) return;

    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const maxScroll = Math.max(documentHeight - viewportHeight, 0);

    const trackHeight = viewportHeight - thumb.height;

    if (trackHeight <= 0) return;

    const deltaY = event.clientY - dragStart.current.clientY;
    const scrollDelta = (deltaY / trackHeight) * maxScroll;

    window.scrollTo({
      top: dragStart.current.scrollY + scrollDelta,
      behavior: "instant",
    });

    updateScrollbar();
  };

  const handlePointerUp = (event) => {
    if (!dragging.current) return;

    dragging.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    clearTimeout(hideTimer.current);

    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 1100);
  };

  if (!scrollable) return null;

  return (
    <div
      aria-hidden="true"
      className={[
        // Position
        "fixed right-[3px] top-0 z-[80]",
        "h-dvh w-2",

        // Visibility
        "transition-opacity duration-300 ease-out",

        visible || dragging.current
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",

        // Mobile: preserve native touch behavior
        "max-[900px]:hidden",

        // Accessibility
        "motion-reduce:transition-none",
      ].join(" ")}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          top: `${thumb.top}px`,
          height: `${thumb.height}px`,
        }}
        className={[
          // Thumb position
          "absolute right-0",

          // Size
          "w-[6px] rounded-full",

          // Neon Green theme
          "border border-[#77FF00]/20",
          "bg-gradient-to-b",
          "from-[#77FF00]/50",
          "to-[#77FF00]/25",

          // Glow
          "shadow-[0_0_8px_rgba(119,255,0,0.10)]",

          // Interaction
          "cursor-grab touch-none",
          "hover:w-2",
          "hover:border-[#77FF00]/60",
          "hover:from-[#77FF00]/80",
          "hover:to-[#77FF00]/55",
          "hover:shadow-[0_0_14px_rgba(119,255,0,0.20)]",
          "active:cursor-grabbing",
          "active:bg-[#77FF00]",

          // Animation
          "transition-[width,background-color,box-shadow,border-color]",
          "duration-200 ease-out",
          "motion-reduce:transition-none",
        ].join(" ")}
      />
    </div>
  );
}

export default PageScrollbar;
