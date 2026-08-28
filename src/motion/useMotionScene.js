import { useEffect } from "react";

const motionTokens = {
  duration: 520,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  stagger: 45,
};

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function play(element, keyframes, options) {
  if (typeof element.animate !== "function") {
    element.style.opacity = "1";
    element.style.transform = "none";
    return null;
  }
  return element.animate(keyframes, { fill: "forwards", ...options });
}

export function useMotionScene(scene = "directory") {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let disposed = false;
    let pointerFrame = 0;
    let scrollFrame = 0;
    let pointer = { x: 0, y: 0 };
    let scrollY = window.scrollY;
    const animations = [];
    const observers = [];
    const cleanups = [];
    const root = document.documentElement;

    const schedulePointer = () => {
      pointerFrame = 0;
      const target = document.querySelector(".vengeance-landing");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = ((pointer.x - rect.left) / Math.max(rect.width, 1)) * 100;
      const y = ((pointer.y - rect.top) / Math.max(rect.height, 1)) * 100;
      target.style.setProperty("--pointer-x", `${x}%`);
      target.style.setProperty("--pointer-y", `${y}%`);
    };

    const onPointerMove = event => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!pointerFrame) pointerFrame = requestAnimationFrame(schedulePointer);
    };

    const scheduleScroll = () => {
      scrollFrame = 0;
      const progress = scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.style.setProperty("--scroll-progress", String(progress));
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      if (!scrollFrame) scrollFrame = requestAnimationFrame(scheduleScroll);
    };

    const animateEntries = () => {
      if (disposed) return;
      const revealTargets = document.querySelectorAll("[data-motion='reveal']");
      revealTargets.forEach((element, index) => {
        // Content must remain visible before optional motion starts. This keeps
        // embedded browsers, slow devices, and missing IO implementations safe.
        element.style.opacity = "1";
        element.style.transform = "none";
        if (typeof IntersectionObserver !== "function") return;
        const observer = new IntersectionObserver(entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          observer.unobserve(element);
          const animation = play(element, [
            { opacity: 1, transform: "translate3d(0, 10px, 0)" },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
          ], { duration: motionTokens.duration, delay: Math.min(index * motionTokens.stagger, 280), easing: motionTokens.easing });
          if (animation) animations.push(animation);
        }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
        observer.observe(element);
        observers.push(observer);
      });

      const marquee = document.querySelector(".vengeance-marquee-track");
      if (marquee && scene === "landing" && typeof marquee.animate === "function") {
        const animation = marquee.animate([
          { transform: "translate3d(0, 0, 0)" },
          { transform: "translate3d(-50%, 0, 0)" },
        ], { duration: 42000, iterations: Infinity, easing: "linear" });
        animations.push(animation);
      }
    };

    if (scene === "landing") {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onPointerMove));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));
    onScroll();
    animateEntries();

    return () => {
      disposed = true;
      cleanups.forEach(cleanup => cleanup());
      observers.forEach(observer => observer.disconnect());
      animations.forEach(animation => animation.cancel?.());
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    };
  }, [scene]);
}
