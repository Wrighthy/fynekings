"use client";

import { useClockHands } from "@/lib/useClockHands";

type LuxuryWatchProps = {
  strapColor?: string;
  caseStroke?: string;
  showBezelGradient?: boolean;
};

export default function LuxuryWatch({
  strapColor = "#141414",
  caseStroke = "#C4A962",
  showBezelGradient = true,
}: LuxuryWatchProps) {
  const hands = useClockHands(210, 210);

  return (
    <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="hfg" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#222"/>
          <stop offset="60%" stopColor="#0d0d0d"/>
          <stop offset="100%" stopColor="#040404"/>
        </radialGradient>
        <linearGradient id="hbezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E5CD8E"/>
          <stop offset="50%" stopColor="#C4A962"/>
          <stop offset="100%" stopColor="#7A6535"/>
        </linearGradient>
        <linearGradient id="hstrap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1a"/>
          <stop offset="50%" stopColor="#0e0e0e"/>
          <stop offset="100%" stopColor="#1a1a1a"/>
        </linearGradient>
      </defs>

      {/* Top strap */}
      <rect x="170" y="20" width="80" height="100" rx="12" fill={strapColor} stroke="#2a2a2a" strokeWidth="1"/>
      <line x1="186" y1="40" x2="234" y2="40" stroke="#1f1f1f" strokeWidth="1"/>
      <line x1="186" y1="56" x2="234" y2="56" stroke="#1f1f1f" strokeWidth="1"/>
      <line x1="186" y1="72" x2="234" y2="72" stroke="#1f1f1f" strokeWidth="1"/>
      <line x1="186" y1="88" x2="234" y2="88" stroke="#1f1f1f" strokeWidth="1"/>
      <path d="M 178 30 L 178 110" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6"/>
      <path d="M 242 30 L 242 110" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6"/>

      {/* Bottom strap */}
      <rect x="170" y="300" width="80" height="100" rx="12" fill={strapColor} stroke="#2a2a2a" strokeWidth="1"/>
      <line x1="186" y1="318" x2="234" y2="318" stroke="#1f1f1f" strokeWidth="1"/>
      <line x1="186" y1="334" x2="234" y2="334" stroke="#1f1f1f" strokeWidth="1"/>
      <line x1="186" y1="350" x2="234" y2="350" stroke="#1f1f1f" strokeWidth="1"/>
      <line x1="186" y1="366" x2="234" y2="366" stroke="#1f1f1f" strokeWidth="1"/>
      <path d="M 178 310 L 178 388" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6"/>
      <path d="M 242 310 L 242 388" stroke="#C4A962" strokeWidth=".5" strokeDasharray="2 3" opacity=".6"/>

      {/* Crown */}
      <rect x="320" y="200" width="22" height="20" rx="4" fill="#1a1a1a" stroke="#C4A962" strokeWidth="1"/>
      <line x1="324" y1="204" x2="324" y2="216" stroke="#C4A962" strokeWidth=".4"/>
      <line x1="328" y1="204" x2="328" y2="216" stroke="#C4A962" strokeWidth=".4"/>
      <line x1="332" y1="204" x2="332" y2="216" stroke="#C4A962" strokeWidth=".4"/>
      <line x1="336" y1="204" x2="336" y2="216" stroke="#C4A962" strokeWidth=".4"/>

      {/* Outer case */}
      {showBezelGradient ? (
        <circle cx="210" cy="210" r="125" fill="url(#hbezel)" stroke="#5A4010" strokeWidth="1"/>
      ) : (
        <circle cx="210" cy="210" r="125" fill="#1a1a1a" stroke={caseStroke} strokeWidth="2.5"/>
      )}
      <circle cx="210" cy="210" r="118" fill={showBezelGradient ? "#0a0a0a" : "url(#hfg)"} stroke="#1e1e1e" strokeWidth=".5"/>

      {/* Hour markers */}
      {showBezelGradient ? (
        <>
          <text x="210" y="135" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="14">XII</text>
          <text x="285" y="216" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="13">III</text>
          <text x="210" y="295" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="14">VI</text>
          <text x="135" y="216" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize="13">IX</text>
        </>
      ) : (
        <g stroke={caseStroke} strokeWidth="2.5" strokeLinecap="round">
          <line x1="210" y1="98" x2="210" y2="112"/>
          <line x1="210" y1="308" x2="210" y2="322"/>
          <line x1="98" y1="210" x2="112" y2="210"/>
          <line x1="308" y1="210" x2="322" y2="210"/>
        </g>
      )}

      {/* Brand */}
      <text x="210" y="170" textAnchor="middle" fill="#C4A962" fontFamily="Playfair Display,serif" fontSize={showBezelGradient ? "11" : "13"} letterSpacing="4" fontStyle="italic">Fynekings</text>
      <text x="210" y={showBezelGradient ? "184" : "185"} textAnchor="middle" fill="#5A5550" fontFamily="Raleway,sans-serif" fontSize={showBezelGradient ? "5" : "6"} letterSpacing="3">INTERNATIONAL · LAGOS</text>

      {/* Subdial */}
      <circle cx="210" cy={showBezelGradient ? "248" : "252"} r="22" fill="none" stroke="#3a3a3a" strokeWidth=".8"/>
      <text x="210" y={showBezelGradient ? "246" : "251"} textAnchor="middle" fill="#5A5550" fontFamily="Raleway,sans-serif" fontSize={showBezelGradient ? "4.5" : "5"} letterSpacing={showBezelGradient ? "1.5" : "2"}>AUTOMATIC</text>
      <text x="210" y={showBezelGradient ? "256" : "261"} textAnchor="middle" fill="#7A6535" fontFamily="Raleway,sans-serif" fontSize={showBezelGradient ? "3.5" : "4"} letterSpacing={showBezelGradient ? "1.5" : "2"}>25 JEWELS</text>

      {/* Hands */}
      <line x1="210" y1="210" x2={hands.hr.x} y2={hands.hr.y} stroke="#F4EFE4" strokeWidth={showBezelGradient ? "3.5" : "4.5"} strokeLinecap="round"/>
      <line x1="210" y1="210" x2={hands.min.x} y2={hands.min.y} stroke="#F4EFE4" strokeWidth={showBezelGradient ? "2.5" : "3.5"} strokeLinecap="round"/>
      <line x1="210" y1="210" x2={hands.sec.x} y2={hands.sec.y} stroke="#C4A962" strokeWidth={showBezelGradient ? "1.2" : "1.5"} strokeLinecap="round"/>

      {/* Center cap */}
      <circle cx="210" cy="210" r={showBezelGradient ? "5" : "6.5"} fill="#C4A962"/>
      <circle cx="210" cy="210" r={showBezelGradient ? "2.2" : "2.5"} fill="#080808"/>
    </svg>
  );
}