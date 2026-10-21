import React from 'react'

// Living Room SVG — kawaii flat style
// Interactive: TV, toys, bookshelf
export default function LivingRoom({ onPlayToy, toyCount, petMood }) {
  return (
    <svg viewBox="0 0 390 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="wallLR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F4FF"/>
          <stop offset="100%" stopColor="#DDE6FF"/>
        </linearGradient>
        <pattern id="wallpaperLR" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="#EEF2FF"/>
          {/* Small diamond pattern */}
          <path d="M25 5 L45 25 L25 45 L5 25 Z" fill="none" stroke="#D8E0FF" strokeWidth="0.8"/>
        </pattern>
        <pattern id="carpetLR" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#C8B8FF"/>
          <rect x="2" y="2" width="16" height="16" rx="2" fill="#B8A8F0"/>
        </pattern>
        <filter id="tvGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="tvScreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a1a2e"/>
          <stop offset="40%" stopColor="#16213e"/>
          <stop offset="100%" stopColor="#0f3460"/>
        </linearGradient>
        <linearGradient id="sofaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B388FF"/>
          <stop offset="100%" stopColor="#9C6FE4"/>
        </linearGradient>
      </defs>

      {/* Wall */}
      <rect width="390" height="600" fill="url(#wallpaperLR)"/>
      {/* Floor */}
      <rect y="430" width="390" height="170" fill="#D4C5A9"/>
      <rect y="428" width="390" height="5" fill="#B8A07A" opacity="0.7"/>
      {/* Carpet */}
      <ellipse cx="195" cy="495" rx="160" ry="55" fill="url(#carpetLR)" stroke="#A090E0" strokeWidth="2"/>
      {/* Carpet fringe */}
      {[...Array(12)].map((_, i) => (
        <line key={i}
          x1={195 - 155 + i * 28} y1="540"
          x2={195 - 155 + i * 28 + 4} y2="550"
          stroke="#8070C8" strokeWidth="1.5"/>
      ))}
      {[...Array(12)].map((_, i) => (
        <line key={i}
          x1={195 - 155 + i * 28} y1="450"
          x2={195 - 155 + i * 28 + 4} y2="440"
          stroke="#8070C8" strokeWidth="1.5"/>
      ))}

      {/* ── TV Unit / Entertainment center ── */}
      {/* TV stand */}
      <rect x="85" y="330" width="220" height="100" rx="10" fill="#5D3A1A" stroke="#4A2F15" strokeWidth="2"/>
      <rect x="85" y="330" width="220" height="14" rx="10" fill="#7D5A3A"/>
      {/* Stand doors */}
      <rect x="93" y="348" width="95" height="76" rx="6" fill="#6D4828" stroke="#5A3A1A" strokeWidth="1.5"/>
      <rect x="202" y="348" width="95" height="76" rx="6" fill="#6D4828" stroke="#5A3A1A" strokeWidth="1.5"/>
      <circle cx="143" cy="389" r="5" fill="#9D7A5A"/>
      <circle cx="249" cy="389" r="5" fill="#9D7A5A"/>
      {/* Decoratives on stand */}
      <text x="110" y="345" fontSize="16">🎮</text>
      <text x="262" y="345" fontSize="14">📀</text>

      {/* ── TV ── */}
      {/* TV back/body */}
      <rect x="78" y="175" width="234" height="160" rx="12" fill="#222222" stroke="#111" strokeWidth="3"/>
      {/* TV screen with glow */}
      <rect x="84" y="181" width="222" height="148" rx="8" fill="url(#tvScreen)" filter="url(#tvGlow)"/>
      {/* Screen content — cute cartoon */}
      <rect x="84" y="181" width="222" height="148" rx="8" fill="#0a0a1a"/>
      {/* "Show" on screen */}
      <ellipse cx="195" cy="250" rx="60" ry="50" fill="#1a3a6a" opacity="0.8"/>
      <text x="195" y="238" textAnchor="middle" fontSize="32">🐱</text>
      <text x="195" y="272" textAnchor="middle" fontSize="11" fill="#88AAFF">Кото-ТБ</text>
      {/* Screen scanlines */}
      {[...Array(8)].map((_, i) => (
        <line key={i} x1="84" y1={181 + i * 19} x2="306" y2={181 + i * 19}
          stroke="white" strokeWidth="0.4" opacity="0.06"/>
      ))}
      {/* Screen reflection */}
      <path d="M90 188 L140 188 L120 220 L90 220 Z" fill="white" opacity="0.04"/>
      {/* TV stand legs */}
      <rect x="165" y="335" width="12" height="10" rx="2" fill="#333"/>
      <rect x="213" y="335" width="12" height="10" rx="2" fill="#333"/>

      {/* ── Sofa ── */}
      {/* Sofa base */}
      <rect x="18" y="360" width="354" height="95" rx="18" fill="url(#sofaGrad)" stroke="#7B5BC4" strokeWidth="2"/>
      {/* Sofa back */}
      <rect x="18" y="330" width="354" height="48" rx="14" fill="#C5A8FF" stroke="#9C6FE4" strokeWidth="2"/>
      {/* Sofa cushions */}
      <rect x="28" y="364" width="110" height="78" rx="12" fill="#D4BAFF" stroke="#B39DDB" strokeWidth="1.5"/>
      <rect x="143" y="364" width="104" height="78" rx="12" fill="#D4BAFF" stroke="#B39DDB" strokeWidth="1.5"/>
      <rect x="252" y="364" width="110" height="78" rx="12" fill="#D4BAFF" stroke="#B39DDB" strokeWidth="1.5"/>
      {/* Sofa armrests */}
      <rect x="8" y="342" width="28" height="118" rx="14" fill="#B388FF" stroke="#9C6FE4" strokeWidth="2"/>
      <rect x="354" y="342" width="28" height="118" rx="14" fill="#B388FF" stroke="#9C6FE4" strokeWidth="2"/>
      {/* Cushion buttons */}
      <circle cx="83" cy="404" r="4" fill="#9C6FE4"/>
      <circle cx="195" cy="404" r="4" fill="#9C6FE4"/>
      <circle cx="307" cy="404" r="4" fill="#9C6FE4"/>
      {/* Sofa legs */}
      <rect x="30" y="452" width="16" height="20" rx="5" fill="#7D5A3A"/>
      <rect x="344" y="452" width="16" height="20" rx="5" fill="#7D5A3A"/>

      {/* ── Throw pillows ── */}
      <ellipse cx="80" cy="360" rx="28" ry="22" fill="#FF8FAB" stroke="#FF6B9D" strokeWidth="1.5" transform="rotate(-15 80 360)"/>
      <text x="80" y="365" textAnchor="middle" fontSize="14">🌸</text>
      <ellipse cx="310" cy="358" rx="25" ry="20" fill="#FFD966" stroke="#FFBC00" strokeWidth="1.5" transform="rotate(10 310 358)"/>
      <text x="310" y="363" textAnchor="middle" fontSize="14">⭐</text>

      {/* ── Bookshelf ── */}
      <rect x="300" y="45" width="82" height="195" rx="8" fill="#8B5A2B" stroke="#6B4020" strokeWidth="2"/>
      {/* Shelf boards */}
      <rect x="300" y="45" width="82" height="10" rx="4" fill="#A0722A"/>
      <rect x="300" y="105" width="82" height="8" fill="#A0722A"/>
      <rect x="300" y="165" width="82" height="8" fill="#A0722A"/>
      <rect x="300" y="230" width="82" height="10" rx="4" fill="#A0722A"/>
      {/* Books row 1 */}
      {[
        {x:306, w:12, h:52, color:'#E74C3C'}, {x:320, w:10, h:48, color:'#3498DB'},
        {x:332, w:14, h:55, color:'#2ECC71'}, {x:348, w:10, h:50, color:'#F39C12'},
        {x:360, w:12, h:52, color:'#9B59B6'}, {x:374, w:8, h:45, color:'#1ABC9C'},
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={112-b.h} width={b.w} height={b.h} rx="1" fill={b.color}/>
          <rect x={b.x} y={112-b.h} width={b.w} height={4} rx="1" fill="rgba(255,255,255,0.2)"/>
        </g>
      ))}
      {/* Books row 2 */}
      {[
        {x:306, w:14, h:48, color:'#E91E63'}, {x:322, w:10, h:52, color:'#00BCD4'},
        {x:334, w:12, h:45, color:'#FF5722'}, {x:348, w:10, h:50, color:'#8BC34A'},
        {x:360, w:16, h:48, color:'#673AB7'},
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={172-b.h} width={b.w} height={b.h} rx="1" fill={b.color}/>
          <rect x={b.x} y={172-b.h} width={b.w} height={4} rx="1" fill="rgba(255,255,255,0.2)"/>
        </g>
      ))}
      {/* Small decorative on shelf 2 */}
      <text x="376" y="168" fontSize="16">🪴</text>

      {/* ── Left wall art ── */}
      {/* Picture frame */}
      <rect x="18" y="50" width="95" height="115" rx="6" fill="#5D3A1A" stroke="#4A2F15" strokeWidth="3"/>
      <rect x="24" y="56" width="83" height="103" rx="4" fill="#FFF9F0"/>
      {/* Drawing inside */}
      <ellipse cx="65" cy="95" rx="22" ry="20" fill="#87CEEB" opacity="0.5"/>
      <text x="65" y="100" textAnchor="middle" fontSize="28">🏡</text>
      <text x="65" y="135" textAnchor="middle" fontSize="8" fill="#888">Наш дім</text>

      {/* ── Toys on floor (interactive) ── */}
      <g onClick={toyCount > 0 ? onPlayToy : undefined}
         style={{ cursor: toyCount > 0 ? 'pointer' : 'default' }}>
        {toyCount > 0 && (
          <ellipse cx="195" cy="478" rx="45" ry="14" fill="#FFD700" opacity="0.2"/>
        )}
        <text x="155" y="482" fontSize="26">🧶</text>
        <text x="190" y="480" fontSize="22">🐟</text>
        <text x="222" y="483" fontSize="20">🎾</text>
        {toyCount > 0 && (
          <>
            <circle cx="225" cy="458" r="12" fill="#FF6B9D"/>
            <text x="225" y="463" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">{toyCount}</text>
          </>
        )}
        {toyCount === 0 && (
          <text x="195" y="498" textAnchor="middle" fontSize="10" fill="#AAA">іграшки закінчились</text>
        )}
      </g>

      {/* ── Floor lamp ── */}
      <rect x="352" y="290" width="8" height="150" rx="4" fill="#D4A55A"/>
      <ellipse cx="356" cy="295" rx="28" ry="12" fill="#FFF9E0" stroke="#FFCC44" strokeWidth="2"/>
      <path d="M330 295 Q356 270 382 295" fill="#FFF3CC" stroke="#FFCC44" strokeWidth="1.5"/>
      {/* Lamp glow */}
      <ellipse cx="356" cy="295" rx="35" ry="20" fill="#FFFF99" opacity="0.15"/>
      {/* Base */}
      <ellipse cx="356" cy="440" rx="20" ry="8" fill="#B8854A"/>
      <ellipse cx="356" cy="435" rx="10" ry="14" fill="#D4A55A"/>

      {/* ── Remote control on sofa ── */}
      <rect x="185" y="370" width="20" height="38" rx="6" fill="#333" transform="rotate(-8 185 370)"/>
      <circle cx="191" cy="376" r="4" fill="#FF4444" transform="rotate(-8 185 370)"/>
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx={188 + (i%2)*9} cy={385 + Math.floor(i/2)*7} r="2.5"
          fill="#555" transform="rotate(-8 185 370)"/>
      ))}
    </svg>
  )
}
