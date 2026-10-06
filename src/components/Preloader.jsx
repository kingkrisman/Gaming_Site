import gsap from "gsap";
import { useEffect, useRef } from "react";

const WORD = "GAMING";

// Fake-but-honest progress: eases toward 90% on its own, then only reaches
// 100% once `ready` flips (hero video can play + fonts loaded, or the cap hits).
const Preloader = ({ ready, onReveal, onExited }) => {
  const rootRef = useRef(null);
  const countRef = useRef(null);
  const barRef = useRef(null);
  const progress = useRef({ value: 0 });
  const mountedAt = useRef(performance.now());

  const render = () => {
    const v = Math.round(progress.current.value);
    if (countRef.current) countRef.current.textContent = String(v).padStart(3, "0");
    if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".preloader-letter", {
        yPercent: 120,
        rotateX: -90,
        opacity: 0,
        stagger: 0.06,
        duration: 0.9,
        ease: "expo.out",
      });
      gsap.from(".preloader-meta", { opacity: 0, y: 20, duration: 0.6, delay: 0.2, stagger: 0.1 });
      gsap.to(progress.current, {
        value: 90,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: render,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!ready) return;

    // Let the intro letters land before leaving, even on a warm cache.
    const elapsed = (performance.now() - mountedAt.current) / 1000;
    const wait = Math.max(0, 0.6 - elapsed);

    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: wait, onComplete: onExited })
        .to(progress.current, { value: 100, duration: 0.35, ease: "power2.inOut", onUpdate: render })
        .to(".preloader-letter", {
          yPercent: -120,
          opacity: 0,
          stagger: 0.025,
          duration: 0.35,
          ease: "power3.in",
        })
        .to(".preloader-meta", { opacity: 0, duration: 0.3 }, "<")
        .add(() => onReveal?.())
        .to(".preloader-main", {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.75,
          ease: "expo.inOut",
        })
        .to(
          ".preloader-accent",
          { clipPath: "inset(0 0 100% 0)", duration: 0.75, ease: "expo.inOut" },
          "<0.1"
        );
    }, rootRef);

    return () => ctx.kill();
  }, [ready, onReveal, onExited]);

  return (
    <div ref={rootRef} className="preloader" aria-busy="true" aria-label="Loading">
      <div className="preloader-layer preloader-accent bg-violet-300" />

      <div className="preloader-layer preloader-main flex-center flex-col overflow-hidden bg-black text-blue-50">
        <div className="preloader-grid absolute inset-0" />

        <p className="preloader-meta absolute left-5 top-6 font-general text-[10px] uppercase tracking-widest text-blue-50/60 sm:left-10">
          Entering the metagame layer
        </p>

        <h1
          className="special-font font-zentry text-7xl font-black uppercase leading-none sm:text-9xl md:text-[12rem]"
          style={{ perspective: "800px" }}
        >
          {WORD.split("").map((ch, i) => (
            <span
              key={i}
              data-text={ch}
              className={`preloader-letter ${i === 1 ? "preloader-glitch text-yellow-300" : ""}`}
            >
              {i === 1 ? <b>{ch}</b> : ch}
            </span>
          ))}
        </h1>

        <div className="preloader-meta absolute inset-x-5 bottom-8 flex items-end justify-between sm:inset-x-10">
          <div className="h-px w-1/2 overflow-hidden bg-blue-50/20">
            <div ref={barRef} className="h-full origin-left scale-x-0 bg-yellow-300" />
          </div>
          <span
            ref={countRef}
            className="font-zentry text-5xl font-black tabular-nums leading-none md:text-7xl"
          >
            000
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
