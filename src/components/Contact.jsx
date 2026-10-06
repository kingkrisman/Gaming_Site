import gsap from "gsap";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";

const ImageClipBox = ({ src, clipClass }) => (
  <div className={clipClass}>
    <img src={src} alt="" loading="lazy" decoding="async" />
  </div>
);

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef(null);

  // Images drift at different depths while the card scrolls past.
  useGSAP(
    () => {
      const scrub = { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(".contact-left", { yPercent: 25 }, { yPercent: -25, ease: "none", scrollTrigger: scrub });
      gsap.fromTo(".contact-right", { yPercent: -15, rotate: -8 }, { yPercent: 20, rotate: 4, ease: "none", scrollTrigger: scrub });
      gsap.from(".contact-card", {
        scale: 0.85,
        borderRadius: "80px",
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "top 30%", scrub: true },
      });
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef} id="contact" className="my-20 min-h-96 w-screen  px-10">
      <div className="contact-card relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
        <div className="contact-left absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96">
          <ImageClipBox
            src="/img/contact-1.webp"
            clipClass="contact-clip-path-1"
          />
          <ImageClipBox
            src="/img/contact-2.webp"
            clipClass="contact-clip-path-2 lg:translate-y-40 translate-y-60"
          />
        </div>

        <div className="contact-right absolute -top-40 left-20 w-60 sm:top-1/2 md:left-auto md:right-10 lg:top-20 lg:w-80">
          <ImageClipBox
            src="/img/swordman-partial.webp"
            clipClass="absolute md:scale-125"
          />
          <ImageClipBox
            src="/img/swordman.webp"
            clipClass="sword-man-clip-path md:scale-125"
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <p className="mb-10 font-general text-[10px] uppercase">
            Join Zentry
          </p>

          <AnimatedTitle
            title="let&#39;s b<b>u</b>ild the <br /> new era of <br /> g<b>a</b>ming t<b>o</b>gether."
            containerClass="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-black !leading-[.9]"
          />

          <Button title="contact us" containerClass="mt-10 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Contact;
