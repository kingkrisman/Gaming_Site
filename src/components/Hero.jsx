import { useRef, useState, useEffect } from "react";
import Button from "./Button";
import { TiLocationArrow } from "react-icons/ti";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const totalVideos = 4;
const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

// "redefi<b>n</b>e" -> per-character spans, keeping the <b> glyph swap.
const SplitChars = ({ text }) =>
  [...text.matchAll(/<b>(.*?)<\/b>|(.)/g)].map(([, bold, plain], i) => (
    <span key={i} className="hero-char">
      {bold ? <b>{bold}</b> : plain}
    </span>
  ));

const Hero = ({ onReady, revealed }) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [bgIndex, setBgIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);

  const heroRef = useRef(null);
  const nextVideoRef = useRef(null);
  const miniVideoRef = useRef(null);
  const readyFired = useRef(false);

  const upcomingVideoIndex = (currentIndex % totalVideos) + 1;

  // Only the background video gates the loader, and only until it can start playing
  // (a few hundred KB), not until the whole 8 MB file is downloaded.
  const handleReady = () => {
    if (readyFired.current) return;
    readyFired.current = true;
    onReady?.();
  };

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setBgIndex(currentIndex);
    setCurrentIndex(upcomingVideoIndex);
  };

  // Warm the next clip once the page is visible, so the click transition is instant.
  useEffect(() => {
    if (!revealed) return;
    const id = setTimeout(() => {
      if (miniVideoRef.current) miniVideoRef.current.preload = "auto";
    }, 1500);
    return () => clearTimeout(id);
  }, [revealed, currentIndex]);

  useGSAP(
    () => {
      if (!hasClicked) return;

      gsap.set("#next-video", { visibility: "visible" });
      gsap.to("#next-video", {
        transformOrigin: "center center",
        scale: 1,
        width: "100%",
        height: "100%",
        duration: 1,
        ease: "power1.inOut",
        onStart: () => nextVideoRef.current?.play().catch(() => {}),
      });
      gsap.from("#current-video", {
        transformOrigin: "center center",
        scale: 0,
        duration: 1.5,
        ease: "power1.inOut",
      });
    },
    { dependencies: [currentIndex], revertOnUpdate: true }
  );

  // Scroll: frame morphs into a slanted shard, headings drift apart.
  useGSAP(
    () => {
      gsap.set("#video-frame", {
        clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
        borderRadius: "0% 0% 40% 10%",
      });
      gsap.from("#video-frame", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        borderRadius: "0% 0% 0% 0%",
        ease: "power1.inOut",
        scrollTrigger: { trigger: "#video-frame", start: "center center", end: "bottom center", scrub: true },
      });
      gsap.to(".hero-top-heading", {
        yPercent: -60,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: heroRef }
  );

  // Hidden until the preloader starts its wipe, then letters flip in.
  useGSAP(
    () => {
      if (!revealed) {
        gsap.set(".hero-char", { yPercent: 110, rotateX: -80, opacity: 0 });
        gsap.set(".hero-fade", { y: 30, opacity: 0 });
        gsap.set("#video-frame", { scale: 1.25 });
        return;
      }

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to("#video-frame", { scale: 1, duration: 1.6 }, 0)
        .to(".hero-char", { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.2, stagger: 0.04 }, 0.2)
        .to(".hero-fade", { y: 0, opacity: 1, duration: 1, stagger: 0.1 }, 0.6);
    },
    { scope: heroRef, dependencies: [revealed] }
  );

  // Mouse parallax: headings and frame float against the pointer.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = heroRef.current;
    const layers = [
      { sel: ".hero-top-heading", depth: 30 },
      { sel: ".hero-bottom-heading", depth: -40 },
    ].map(({ sel, depth }) => ({
      depth,
      x: gsap.quickTo(el.querySelectorAll(sel), "x", { duration: 0.8, ease: "power3" }),
      y: gsap.quickTo(el.querySelectorAll(sel), "y", { duration: 0.8, ease: "power3" }),
    }));

    const move = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => {
        l.x(nx * l.depth);
        l.y(ny * l.depth);
      });
    };

    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, []);

  return (
    <div ref={heroRef} className="relative h-dvh w-screen overflow-x-hidden">
      <div id="video-frame" className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75">
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <div
              onClick={handleMiniVdClick}
              onMouseEnter={() => miniVideoRef.current?.play().catch(() => {})}
              onMouseLeave={() => miniVideoRef.current?.pause()}
              className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
            >
              <video
                ref={miniVideoRef}
                src={getVideoSrc(upcomingVideoIndex)}
                loop
                muted
                playsInline
                preload="metadata"
                id="current-video"
                className="size-64 origin-center scale-150 object-cover object-center"
              />
            </div>
          </div>

          <video
            ref={nextVideoRef}
            src={hasClicked ? getVideoSrc(currentIndex) : undefined}
            loop
            muted
            playsInline
            preload="none"
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
          />
          <video
            src={getVideoSrc(bgIndex)}
            loop
            autoPlay
            muted
            playsInline
            preload="auto"
            className="absolute left-0 top-0 size-full object-cover object-center"
            onCanPlay={handleReady}
            onError={handleReady}
          />
        </div>

        <h1 className="special-font hero-heading hero-bottom-heading absolute bottom-5 right-5 z-40 text-blue-75">
          <SplitChars text="G<b>a</b>ming" />
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading hero-top-heading text-blue-100" style={{ perspective: "600px" }}>
              <SplitChars text="redefi<b>n</b>e" />
            </h1>

            <p className="hero-fade mb-5 max-w-64 font-robert-regular text-blue-100">
              Enter the Metagame Layer <br />
              Unleash the Play Economy
            </p>
            <div className="hero-fade w-fit">
              <Button
                id="watch-trailer"
                title="Watch Trailer"
                leftIcon={<TiLocationArrow />}
                containerClass="bg-yellow-300 flex-center gap-1"
              />
            </div>
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading hero-bottom-heading absolute bottom-5 right-5 text-black">
        <SplitChars text="G<b>a</b>ming" />
      </h1>
    </div>
  );
};

export default Hero;
