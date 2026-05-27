"use client";

import { useState, useEffect } from "react";

export function useClockHands(centerX = 210, centerY = 210) {
  const [hands, setHands] = useState({
    hr: { x: centerX, y: centerY - 60 },
    min: { x: centerX + 50, y: centerY - 38 },
    sec: { x: centerX - 30, y: centerY + 55 },
  });

  useEffect(() => {
    const update = () => {
      const n = new Date();
      const s = n.getSeconds(), m = n.getMinutes(), h = n.getHours() % 12;
      const pt = (deg: number, len: number) => {
        const r = (deg - 90) * Math.PI / 180;
        return { x: centerX + len * Math.cos(r), y: centerY + len * Math.sin(r) };
      };
      setHands({
        hr: pt(h * 30 + m * 0.5, 60),
        min: pt(m * 6 + s * 0.1, 82),
        sec: pt(s * 6, 90),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [centerX, centerY]);

  return hands;
}