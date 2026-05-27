"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = mx + "px";
        cursorRef.current.style.top = my + "px";
      }
    };
    const animate = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = rx + "px";
        cursorRingRef.current.style.top = ry + "px";
      }
      requestAnimationFrame(animate);
    };
    document.addEventListener("mousemove", onMove);
    animate();
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // Hover targets — runs on every render so newly added DOM elements get listeners
  useEffect(() => {
    const targets = document.querySelectorAll("a, button, .swatch, .product-card, .style-btn, .filter-btn, .edu-card, input");
    const enter = () => document.body.classList.add("cur-hover");
    const leave = () => document.body.classList.remove("cur-hover");
    targets.forEach(el => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => {
      targets.forEach(el => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  });

  return (
    <>
      <div ref={cursorRef} id="cur" aria-hidden="true"></div>
      <div ref={cursorRingRef} id="cur-r" aria-hidden="true"></div>
    </>
  );
}