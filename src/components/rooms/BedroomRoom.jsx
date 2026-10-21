import React from 'react'

export default function BedroomRoom({ onSleep, petState }) {
  const isSleepy = petState === 'sleepy' || petState === 'sleeping'
  const isSleeping = petState === 'sleeping'

  return (
    <svg viewBox="0 0 390 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <pattern id="wallpaperBR" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#FFF0F5"/>
          {/* Star pattern */}
          <text x="18" y="24" fontSize="12" opacity="0.15">⭐</text>
        </pattern>
        <linearGradient id="bedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB3C6"/>
          <stop offset="100%" stopColor="#FF85A1"/>
        </linearGradient>
        <linearGradient id="pillowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF0F5"/>
          <stop offset="100%" stopColor="#FFD6E4"/>
        </linearGradient>
        <filter id="moonGlow">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="nightGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1a1a3e" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>

      {/* Wall */}
      <rect width="390" height="600" fill="url(#wallpaperBR)"/>
      {/* Night overlay when sleeping */}
      {isSleeping && <rect width="390" height="600" fill="url(#nightGrad)"/>}

      {/* Floor */}
      <rect y="435" width="390" height="165" fill="#E8D5B0"/>
      <rect y="433" width="390" height="5" fill="#C8A878" opacity="0.7"/>
      {/* Floor planks */}
      {[...Array(5)].map((_, i) => (
        <rect key={i} x="0" y={440 + i * 30} width="390" height="1" fill="#C8A878" opacity="0.3"/>
      ))}
      {[...Array(8)].map((_, i) => (
        <rect key={i} x={i * 55} y="435" width="1" height="165" fill="#C8A878" opacity="0.2"/>
      ))}

      {/* ── Window with moon/sun ── */}
      <rect x="130" y="28" width="130" height="110" rx="14" fill="#B8D4F0" stroke="#8AB0D8" strokeWidth="3"/>
      <line x1="195" y1="28" x2="195" y2="138" stroke="#8AB0D8" strokeWidth="2.5"/>
      <line x1="130" y1="83" x2="260" y2="83" stroke="#8AB0D8" strokeWidth="2.5"/>
      {/* Night sky or day sky */}
      {isSleeping ? (
        <>
          <rect x="133" y="31" width="60" height="100" rx="4" fill="#1a1a3e" opacity="0.8"/>
          <rect x="197" y="31" width="60" height="100" rx="4" fill="#1a1a3e" opacity="0.8"/>
          <text x="163" y="75" textAnchor="middle" fontSize="28" filter="url(#moonGlow)">🌙</text>
          <text x="152" y="48" fontSize="8" fill="#FFD700" opacity="0.8">✦</text>
          <text x="198" y="55" fontSize="6" fill="#FFD700" opacity="0.6">✦</text>
          <text x="220" y="42" fontSize="10" fill="#FFD700" opacity="0.8">✦</text>
        </>
      ) : (
        <>
          <rect x="133" y="31" width="60" height="100" rx="4" fill="#87CEEB" opacity="0.5"/>
          <rect x="197" y="31" width="60" height="100" rx="4" fill="#87CEEB" opacity="0.5"/>
          <text x="163" y="75" textAnchor="middle" fontSize="28">☀️</text>
          <ellipse cx="215" cy="55" rx="16" ry="10" fill="white" opacity="0.7"/>
          <ellipse cx="228" cy="50" rx="12" ry="8" fill="white" opacity="0.6"/>
        </>
      )}
      {/* Star curtains */}
      <path d="M118 26 Q130 83 118 140" fill="#C9A7E8" stroke="#B088D4" strokeWidth="1.5"/>
      <path d="M272 26 Q260 83 272 140" fill="#C9A7E8" stroke="#B088D4" strokeWidth="1.5"/>
      <circle cx="121" cy="82" r="6" fill="#A070C8"/>
      <circle cx="269" cy="82" r="6" fill="#A070C8"/>
      <text x="116" y="60" fontSize="10" fill="#FFD700">✦</text>
      <text x="265" y="100" fontSize="10" fill="#FFD700">✦</text>

      {/* ── Wardrobe ── */}
      <rect x="8" y="165" width="105" height="270" rx="10" fill="#C8A47A" stroke="#A8845A" strokeWidth="2.5"/>
      {/* Wardrobe top */}
      <rect x="8" y="155" width="105" height="18" rx="6" fill="#D4B080"/>
      {/* Wardrobe doors */}
      <rect x="14" y="172" width="46" height="255" rx="6" fill="#DBC090" stroke="#B89060" strokeWidth="1.5"/>
      <rect x="63" y="172" width="46" height="255" rx="6" fill="#DBC090" stroke="#B89060" strokeWidth="1.5"/>
      {/* Door handles */}
      <rect x="57" y="296" width="7" height="16" rx="4" fill="#A0744A"/>
      <rect x="67" y="296" width="7" height="16" rx="4" fill="#A0744A"/>
      {/* Mirror on left door */}
      <rect x="18" y="195" width="38" height="80" rx="4" fill="#B8D8F0" opacity="0.6" stroke="#90B8D8" strokeWidth="1"/>
      <path d="M22 199 L30 199 L22 210 Z" fill="white" opacity="0.3"/>
      {/* Clothes peeking from bottom */}
      <path d="M14 400 Q37 390 60 400" fill="#FF8FAB" stroke="#FF6B9D" strokeWidth="1"/>
      <path d="M63 400 Q86 390 109 400" fill="#87CEEB" stroke="#60AACC" strokeWidth="1"/>

      {/* ── Dresser / nightstand ── */}
      <rect x="278" y="300" width="104" height="140" rx="8" fill="#C8A47A" stroke="#A8845A" strokeWidth="2"/>
      <rect x="278" y="300" width="104" height="12" rx="6" fill="#D4B080"/>
      {/* Drawers */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={284} y={316 + i*40} width={92} height={34} rx="5" fill="#DBC090" stroke="#B89060" strokeWidth="1.5"/>
          <circle cx={330} cy={333 + i*40} r="5" fill="#A0744A"/>
        </g>
      ))}
      {/* Lamp on dresser */}
      <rect x="360" y="270" width="6" height="32" rx="3" fill="#D4A55A"/>
      <path d="M340 272 Q363 252 386 272" fill="#FFF3CC" stroke="#FFCC44" strokeWidth="1.5"/>
      <ellipse cx="363" cy="272" rx="24" ry="10" fill="#FFF9E0" stroke="#FFCC44" strokeWidth="1.5"/>
      {isSleeping && <ellipse cx="363" cy="272" rx="30" ry="16" fill="#FFFF99" opacity="0.2"/>}
      {/* Items on dresser */}
      <text x="285" y="298" fontSize="14">📷</text>
      <text x="305" y="297" fontSize="12">🪞</text>

      {/* ── Bed (main, interactive) ── */}
      <g onClick={onSleep} style={{ cursor: 'pointer' }}>
        {isSleepy && (
          <rect x="48" y="345" width="294" height="166" rx="20" fill="#FFD700" opacity="0.15"/>
        )}
        {/* Bed frame */}
        <rect x="52" y="355" width="286" height="158" rx="16" fill="#C8A47A" stroke="#A8845A" strokeWidth="2.5"/>
        {/* Headboard */}
        <rect x="52" y="330" width="286" height="54" rx="14" fill="#DBC090" stroke="#B89060" strokeWidth="2"/>
        {/* Headboard detail */}
        {[0,1,2].map(i => (
          <ellipse key={i} cx={120 + i*75} cy={356} rx="22" ry="16" fill="#C8A47A" stroke="#B89060" strokeWidth="1.5"/>
        ))}
        {/* Mattress */}
        <rect x="60" y="365" width="270" height="144" rx="10" fill="#F8F0E0" stroke="#E0D0B0" strokeWidth="1.5"/>
        {/* Duvet/blanket */}
        <rect x="60" y="380" width="270" height="128" rx="10" fill="url(#bedGrad)" stroke="#FF6B9D" strokeWidth="2"/>
        {/* Blanket pattern — stars */}
        {[...Array(5)].map((_, row) =>
          [...Array(5)].map((_, col) => (
            <text key={`${row}-${col}`} x={80 + col*52} y={400 + row*24} fontSize="12" opacity="0.4">⭐</text>
          ))
        )}
        {/* Pillows */}
        <rect x="68" y="355" width="108" height="46" rx="12" fill="url(#pillowGrad)" stroke="#FFD0E0" strokeWidth="1.5"/>
        <rect x="214" y="355" width="108" height="46" rx="12" fill="url(#pillowGrad)" stroke="#FFD0E0" strokeWidth="1.5"/>
        {/* Pillow frill */}
        {[...Array(8)].map((_, i) => (
          <path key={i} d={`M${72 + i*13} 401 Q${78 + i*13} 408 ${84 + i*13} 401`}
            stroke="#FFB8CC" strokeWidth="1.5" fill="none"/>
        ))}
        {/* Bed legs */}
        <rect x="64" y="500" width="14" height="20" rx="5" fill="#A0744A"/>
        <rect x="312" y="500" width="14" height="20" rx="5" fill="#A0744A"/>

        {/* Sleep ZZZ when sleepy */}
        {isSleepy && !isSleeping && (
          <>
            <text x="200" y="345" textAnchor="middle" fontSize="14" fill="#9B59B6" opacity="0.7">z</text>
            <text x="218" y="332" textAnchor="middle" fontSize="18" fill="#9B59B6" opacity="0.8">z</text>
            <text x="240" y="315" textAnchor="middle" fontSize="22" fill="#9B59B6">z</text>
          </>
        )}
        {isSleeping && (
          <>
            <text x="195" y="345" textAnchor="middle" fontSize="13" fill="#6C3483" opacity="0.6">z</text>
            <text x="215" y="330" textAnchor="middle" fontSize="18" fill="#6C3483" opacity="0.7">z</text>
            <text x="240" y="312" textAnchor="middle" fontSize="24" fill="#6C3483" opacity="0.8">z</text>
            <text x="268" y="292" textAnchor="middle" fontSize="28" fill="#6C3483">Z</text>
          </>
        )}

        {/* "Покласти спати" hint */}
        {!isSleeping && (
          <text x="195" y="520" textAnchor="middle" fontSize="10" fill="#C0A0A0">натисни щоб покласти спати</text>
        )}
      </g>

      {/* ── Rug ── */}
      <ellipse cx="195" cy="495" rx="120" ry="35" fill="#E8B4D0" stroke="#D08AB0" strokeWidth="2" opacity="0.6"/>
      {/* Rug pattern */}
      <ellipse cx="195" cy="495" rx="90" ry="25" fill="none" stroke="#D08AB0" strokeWidth="1" opacity="0.5"/>
      <ellipse cx="195" cy="495" rx="60" ry="16" fill="none" stroke="#D08AB0" strokeWidth="1" opacity="0.4"/>

      {/* ── Fairy lights on wall ── */}
      <path d="M30 148 Q100 138 170 148 Q240 158 310 148 Q350 142 380 148"
        stroke="#DDD" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
      {['#FFD700','#FF6B9D','#87CEEB','#98FB98','#DDA0DD','#FFD700','#FF6B9D','#87CEEB'].map((c, i) => (
        <g key={i}>
          <circle cx={42 + i*47} cy={148} r="5" fill={c} opacity="0.9"/>
          <circle cx={42 + i*47} cy={148} r="8" fill={c} opacity="0.25"/>
        </g>
      ))}

      {/* ── Plush toy on floor ── */}
      <text x="350" y="480" fontSize="28">🧸</text>

      {/* ── Star mobile above bed ── */}
      <line x1="195" y1="148" x2="195" y2="165" stroke="#CCC" strokeWidth="1"/>
      <line x1="195" y1="165" x2="165" y2="188" stroke="#CCC" strokeWidth="1"/>
      <line x1="195" y1="165" x2="225" y2="188" stroke="#CCC" strokeWidth="1"/>
      <line x1="195" y1="165" x2="195" y2="195" stroke="#CCC" strokeWidth="1"/>
      <text x="160" y="196" fontSize="14">🌙</text>
      <text x="220" y="196" fontSize="12">⭐</text>
      <text x="190" y="202" fontSize="14">✨</text>
    </svg>
  )
}
