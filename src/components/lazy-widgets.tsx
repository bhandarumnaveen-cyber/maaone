"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

/** Renders `children` only once the placeholder scrolls near the viewport, keeping page load light. */
function WhenVisible({ minHeight, children }: { minHeight: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return setShow(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}

const AiDemoImpl = dynamic(() => import("./ai-demo").then((m) => m.AiDemo), { ssr: false });
const ProductFilmImpl = dynamic(() => import("./product-film").then((m) => m.ProductFilm), { ssr: false });
const LossCalculatorImpl = dynamic(() => import("./loss-calculator").then((m) => m.LossCalculator), { ssr: false });

export function LazyAiDemo(props: ComponentProps<typeof AiDemoImpl>) {
  return (
    <WhenVisible minHeight={560}>
      <AiDemoImpl {...props} />
    </WhenVisible>
  );
}

export function LazyLossCalculator(props: ComponentProps<typeof LossCalculatorImpl>) {
  return (
    <WhenVisible minHeight={420}>
      <LossCalculatorImpl {...props} />
    </WhenVisible>
  );
}

export function LazyProductFilm(props: ComponentProps<typeof ProductFilmImpl>) {
  return (
    <WhenVisible minHeight={640}>
      <ProductFilmImpl {...props} />
    </WhenVisible>
  );
}
