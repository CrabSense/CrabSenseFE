import { createContext, useContext, useEffect, useRef, useState } from "react";

const RevealContext = createContext(true);

// If used outside PageReveal, animation remains enabled.
export function useRevealActive() {
  return useContext(RevealContext);
}

function PageReveal({ children, delay = 0, className = "", threshold = 0.08 }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <RevealContext.Provider value={isVisible}>
      <div
        ref={elementRef}
        className={[
          "min-w-0",
          "page-scroll-reveal",
          isVisible ? "is-visible" : "",
          className,
        ].join(" ")}
        style={{
          "--reveal-delay": `${delay}ms`,
        }}
      >
        {children}
      </div>
    </RevealContext.Provider>
  );
}

export default PageReveal;
