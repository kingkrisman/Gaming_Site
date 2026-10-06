import gsap from "gsap";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROWS = [
  { text: "Play • Earn • Conquer • ", dir: -1, outline: false },
  { text: "Metagame • Radiant • Nexus • ", dir: 1, outline: true },
];

// Two endless rows of giant type that speed up, reverse and skew
// with scroll velocity.
const VelocityMarquee = () => {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tweens = rowRefs.current.map((row, i) =>
        gsap.fromTo(
          row,
          { xPercent: ROWS[i].dir < 0 ? 0 : -50 },
          { xPercent: ROWS[i].dir < 0 ? -50 : 0, duration: 22, ease: "none", repeat: -1 }
        )
      );

      const skewTo = gsap.quickTo(rowRefs.current, "skewX", { duration: 0.6, ease: "power3" });
      let direction = 1;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          if (self.direction !== direction) direction = self.direction;
          const boost = 1 + Math.min(Math.abs(v) / 300, 6);
          tweens.forEach((t) => {
            gsap.to(t, { timeScale: boost * direction, duration: 0.2, overwrite: true });
            gsap.to(t, { timeScale: direction, duration: 1.2, delay: 0.2, ease: "power2.out" });
          });
          skewTo(gsap.utils.clamp(-14, 14, v / -250));
        },
        onLeave: () => skewTo(0),
        onLeaveBack: () => skewTo(0),
      });

      gsap.from(sectionRef.current, {
        rotate: -4,
        scale: 1.1,
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "top center", scrub: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-black py-16" aria-hidden="true">
      {ROWS.map((row, i) => (
        <div key={i} className="flex overflow-hidden">
          <div ref={(el) => (rowRefs.current[i] = el)} className="flex w-max">
            {[0, 1, 2, 3].map((n) => (
              <span
                key={n}
                className={`marquee-text pr-8 ${row.outline ? "text-outline" : "text-yellow-300"}`}
              >
                {row.text}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default VelocityMarquee;
