"use client";
import { useFadeIn } from "./useFadeIn";

export default function FadeSection({ children, className = "", id }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} id={id} className={`fade-section ${className}`}>
      {children}
    </div>
  );
}
