"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.in = "true";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function RevealGroup({ children }: { children: ReactNode }) {
  return <div className="reveal-group">{children}</div>;
}
