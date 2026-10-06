import gsap from "gsap";
import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, video, [data-cursor]";

// Blend-mode dot + trailing ring that swells over anything clickable.
// Only mounts behaviour on devices with a precise pointer.
const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const dotX = gsap.quickTo(dotRef.current, "x", { duration: 0.1, ease: "power3" });
    const dotY = gsap.quickTo(dotRef.current, "y", { duration: 0.1, ease: "power3" });
    const ringX = gsap.quickTo(ringRef.current, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ringRef.current, "y", { duration: 0.45, ease: "power3" });

    let shown = false;
    const move = (e) => {
      if (!shown) {
        shown = true;
        gsap.set([dotRef.current, ringRef.current], { x: e.clientX, y: e.clientY });
        gsap.to([dotRef.current, ringRef.current], { opacity: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const over = (e) => {
      ringRef.current?.classList.toggle("is-hovering", !!e.target.closest?.(INTERACTIVE));
    };

    const down = () => gsap.to(ringRef.current, { scale: 0.7, duration: 0.15 });
    const up = () => gsap.to(ringRef.current, { scale: 1, duration: 0.3, ease: "back.out(3)" });

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring opacity-0" />
      <div ref={dotRef} className="cursor-dot opacity-0" />
    </>
  );
};

export default Cursor;
