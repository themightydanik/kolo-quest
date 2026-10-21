import React from 'react'

export default function BathroomRoom({ onBrushTeeth, onBath, cleanlinessLevel }) {
  const needsCleaning = cleanlinessLevel < 50

  return (
    <svg viewBox="0 0 390 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <pattern id="wallTile" width="44" height="44" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" fill="#E8F8FF"/>
          <rect x="1" y="1" width="42" height="42" rx="4" fill="#F0FBFF" stroke="#C8EAF8" strokeWidth="0.7"/>
          {/* Small flower in tile */}
          <circle cx="22" cy="22" r="2" fill="#B8DFFF" opacity="0.4"/>
        </pattern>
        <pattern id="floorTileBath" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="#D0F0FF"/>
          <rect x="1" y="1" width="34" height="34" rx="3" fill="#E0F8FF" stroke="#A8D8F0" strokeWidth="0.8"/>
        </pattern>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#4FA8CC" stopOpacity="0.9"/>
        </linearGradient>
        <linearGradient id="tubGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8FFFE"/>
          <stop offset="100%" stopColor="#E0F8FF"/>
        </linearGradient>
        <filter id="bubbleBlur">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs>

      {/* Wall tiles */}
      <rect width="390" height="600" fill="url(#wallTile)"/>
      {/* Floor tiles */}
      <rect y="430" width="390" height="170" fill="url(#floorTileBath)"/>
      <rect y="428" width="390" height="5" fill="#88C8E0" opacity="0.8"/>

      {/* ── Window ── */}
      <rect x="145" y="28" width="100" height="85" rx="10" fill="#C8ECFF" stroke="#88C8E0" strokeWidth="3"/>
      <line x1="195" y1="28" x2="195" y2="113" stroke="#88C8E0" strokeWidth="2"/>
      <line x1="145" y1="70" x2="245" y2="70" stroke="#88C8E0" strokeWidth="2"/>
      <rect x="148" y="31" width="44" height="78" rx="3" fill="#87CEEB" opacity="0.4"/>
      <rect x="198" y="31" width="44" height="78" rx="3" fill="#87CEEB" opacity="0.4"/>
      {/* Frosted glass effect */}
      {[...Array(5)].map((_, i) => (
        <line key={i} x1="148" y1={40 + i*14} x2="192" y2={40 + i*14}
          stroke="white" strokeWidth="1.5" opacity="0.4"/>
      ))}
      {/* Curtain (short, bathroom style) */}
      <path d="M132 28 Q145 58 132 88" fill="#B8E4FF" stroke="#88C8E0" strokeWidth="1.5"/>
      <path d="M258 28 Q245 58 258 88" fill="#B8E4FF" stroke="#88C8E0" strokeWidth="1.5"/>
      <line x1="128" y1="26" x2="262" y2="26" stroke="#88C8E0" strokeWidth="2"/>

      {/* ── Mirror ── */}
      <rect x="22" y="38" width="108" height="130" rx="10" fill="#B8E8FF" stroke="#88C8E0" strokeWidth="3"/>
      <rect x="27" y="43" width="98" height="120" rx="7" fill="#D8F4FF" opacity="0.7"/>
      {/* Mirror shine */}
      <path d="M32 48 L55 48 L32 75 Z" fill="white" opacity="0.35"/>
      <path d="M38 100 L50 90 L55 110 Z" fill="white" opacity="0.2"/>
      {/* Reflection of cat in mirror when needed */}
      <text x="76" y="100" textAnchor="middle" fontSize="22" opacity="0.5">🐱</text>
      {/* Mirror frame decorations */}
      <text x="22" y="40" fontSize="12">🌊</text>
      <text x="116" y="40" fontSize="12">🌊</text>
      <text x="22" y="170" fontSize="12">🐚</text>
      <text x="116" y="170" fontSize="12">🐚</text>

      {/* ── Shelf under mirror ── */}
      <rect x="22" y="168" width="108" height="10" rx="4" fill="#88C8E0" stroke="#60A8C8" strokeWidth="1.5"/>
      {/* Toiletries */}
      {/* Toothbrush cup */}
      <rect x="30" y="140" width="22" height="30" rx="6" fill="#7DD8F8" stroke="#5AB8E0" strokeWidth="1.5"/>
      <rect x="35" y="120" width="5" height="22" rx="3" fill="#FF6B9D"/>
      <rect x="43" y="118" width="5" height="24" rx="3" fill="#4CAF50"/>
      {/* Soap dispenser */}
      <rect x="60" y="136" width="20" height="32" rx="6" fill="#FF8FAB" stroke="#FF6090" strokeWidth="1.5"/>
      <rect x="65" y="130" width="10" height="8" rx="3" fill="#FF6090"/>
      <ellipse cx="70" cy="130" rx="5" ry="3" fill="#FF4070"/>
      {/* Cream bottle */}
      <rect x="88" y="142" width="16" height="26" rx="6" fill="#FFF9C4" stroke="#F0D070" strokeWidth="1.5"/>
      <rect x="91" y="137" width="10" height="7" rx="3" fill="#F0D070"/>
      <text x="96" y="157" textAnchor="middle" fontSize="6" fill="#C8A020">✿</text>

      {/* ── Toilet ── */}
      <g>
        {/* Toilet tank */}
        <rect x="262" y="200" width="112" height="72" rx="12" fill="#F0FBFF" stroke="#C0E8F8" strokeWidth="2"/>
        {/* Tank lid */}
        <rect x="258" y="194" width="120" height="12" rx="6" fill="#E0F8FF" stroke="#B8E0F0" strokeWidth="1.5"/>
        {/* Flush button */}
        <ellipse cx="318" cy="198" rx="10" ry="6" fill="#D0F0FF" stroke="#A8D8F0" strokeWidth="1.5"/>
        {/* Handle on tank */}
        <rect x="358" y="218" width="8" height="16" rx="4" fill="#B8D8F0"/>
        {/* Toilet bowl outer */}
        <ellipse cx="318" cy="330" rx="60" ry="68" fill="#F0FBFF" stroke="#C0E8F8" strokeWidth="2"/>
        {/* Toilet bowl seat */}
        <ellipse cx="318" cy="316" rx="56" ry="52" fill="#E8F8FF" stroke="#B8E0F0" strokeWidth="2"/>
        <ellipse cx="318" cy="316" rx="48" ry="44" fill="white" stroke="#D0F0FF" strokeWidth="1.5"/>
        {/* Water */}
        <ellipse cx="318" cy="326" rx="36" ry="28" fill="url(#waterGrad)" opacity="0.5"/>
        {/* Seat hinge */}
        <circle cx="298" cy="268" r="5" fill="#D0E8F8"/>
        <circle cx="338" cy="268" r="5" fill="#D0E8F8"/>
        {/* Roll of paper */}
        <circle cx="264" cy="348" r="16" fill="#FAFAFA" stroke="#EEE" strokeWidth="1.5"/>
        <circle cx="264" cy="348" r="6" fill="#DDD"/>
        <rect x="264" y="330" width="4" height="36" rx="2" fill="#DDD"/>
        {/* Paper holder */}
        <rect x="247" y="344" width="8" height="8" rx="3" fill="#C0D8E8"/>
        <line x1="256" y1="348" x2="262" y2="348" stroke="#B0C8D8" strokeWidth="2"/>
      </g>

      {/* ── Bathtub (interactive) ── */}
      <g onClick={onBath} style={{ cursor: 'pointer' }}>
        {needsCleaning && (
          <ellipse cx="122" cy="400" rx="108" ry="30" fill="#FFD700" opacity="0.2"/>
        )}
        {/* Tub body */}
        <path d="M20 345 Q15 420 20 460 L224 460 Q229 420 224 345 Z"
          fill="url(#tubGrad)" stroke="#B0D8F0" strokeWidth="3"/>
        {/* Tub interior */}
        <path d="M28 350 Q24 418 28 455 L216 455 Q220 418 216 350 Z"
          fill="#E8F8FF"/>

        {/* Water in tub */}
        <path d="M28 415 Q28 455 28 455 L216 455 Q216 455 216 415 Q175 428 122 422 Q70 416 28 415 Z"
          fill="url(#waterGrad)" opacity="0.7"/>
        {/* Water surface shimmer */}
        <path d="M35 418 Q80 412 122 416 Q165 420 210 416"
          stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>

        {/* Bubbles when dirty → need bath */}
        {needsCleaning && (
          <>
            {[{cx:60,cy:400,r:8},{cx:100,cy:390,r:12},{cx:140,cy:405,r:7},{cx:170,cy:395,r:10},{cx:195,cy:408,r:6}].map((b,i) => (
              <g key={i}>
                <circle cx={b.cx} cy={b.cy} r={b.r} fill="white" opacity="0.5" stroke="#87CEEB" strokeWidth="1"/>
                <circle cx={b.cx - b.r*0.3} cy={b.cy - b.r*0.3} r={b.r*0.3} fill="white" opacity="0.6"/>
              </g>
            ))}
          </>
        )}

        {/* Tub feet */}
        <ellipse cx="45" cy="462" rx="14" ry="7" fill="#C8E8F8" stroke="#A0C8E0" strokeWidth="1.5"/>
        <ellipse cx="199" cy="462" rx="14" ry="7" fill="#C8E8F8" stroke="#A0C8E0" strokeWidth="1.5"/>
        {/* Faucet */}
        <rect x="103" y="330" width="38" height="18" rx="6" fill="#C8E8F8" stroke="#A0C8E0" strokeWidth="1.5"/>
        <circle cx="110" cy="339" r="6" fill="#B0D8F0" stroke="#88B8D0" strokeWidth="1"/>
        <circle cx="134" cy="339" r="6" fill="#FFB3B3" stroke="#FF9090" strokeWidth="1"/>
        <rect x="119" y="325" width="6" height="18" rx="3" fill="#B0C8D8"/>
        <path d="M119 327 Q122 315 122 308" stroke="#B0C8D8" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="122" cy="306" r="4" fill="#88AABF"/>

        {/* Rubber duck */}
        <text x="175" y="420" fontSize="24">🦆</text>

        {/* Action hint */}
        {!needsCleaning && (
          <text x="122" y="478" textAnchor="middle" fontSize="10" fill="#88C8E0">натисни щоб скупати</text>
        )}
        {needsCleaning && (
          <text x="122" y="478" textAnchor="middle" fontSize="11" fill="#FF8C42" fontWeight="bold">час купатись!</text>
        )}
      </g>

      {/* ── Sink (interactive) ── */}
      <g onClick={onBrushTeeth} style={{ cursor: 'pointer' }}>
        {/* Pedestal */}
        <path d="M20 260 Q22 280 20 310 L104 310 Q102 280 104 260 Z"
          fill="#E0F4FF" stroke="#B0D8F0" strokeWidth="2"/>
        {/* Sink basin */}
        <path d="M8 240 Q8 270 14 280 L110 280 Q116 270 116 240 Z"
          fill="#F0FBFF" stroke="#B0D8F0" strokeWidth="2"/>
        <path d="M14 244 Q14 268 18 276 L106 276 Q110 268 110 244 Z"
          fill="#E8F8FF"/>
        {/* Water in sink */}
        <path d="M16 270 Q14 278 18 276 L106 276 Q110 270 108 268 Q80 274 62 272 Q40 270 16 270 Z"
          fill="url(#waterGrad)" opacity="0.5"/>
        {/* Faucet */}
        <rect x="52" y="228" width="20" height="14" rx="5" fill="#C8E8F8" stroke="#A0C8E0" strokeWidth="1.5"/>
        <rect x="59" y="222" width="6" height="8" rx="3" fill="#B0C8D8"/>
        {/* Drain */}
        <circle cx="62" cy="274" r="5" fill="#B0C8D8"/>
        {/* Tooth/brush hint */}
        <text x="62" y="253" textAnchor="middle" fontSize="16">🦷</text>
        <text x="62" y="300" textAnchor="middle" fontSize="9" fill="#88C8E0">чисти зубки!</text>
      </g>

      {/* ── Towels ── */}
      {/* Towel bar */}
      <rect x="260" y="152" width="122" height="8" rx="4" fill="#88C8E0" stroke="#60A8C8" strokeWidth="1.5"/>
      <circle cx="265" cy="156" r="5" fill="#60A8C8"/>
      <circle cx="377" cy="156" r="5" fill="#60A8C8"/>
      {/* Hanging towels */}
      <path d="M280 160 Q282 200 280 220 L310 220 Q308 200 310 160 Z" fill="#FF8FAB"/>
      <path d="M280 160 L310 160" stroke="#FF6090" strokeWidth="2"/>
      <rect x="291" y="186" width="8" height="30" rx="2" fill="#FF6090" opacity="0.4"/>
      <path d="M324 160 Q326 200 324 220 L360 220 Q358 200 360 160 Z" fill="#87CEEB"/>
      <path d="M324 160 L360 160" stroke="#60AACC" strokeWidth="2"/>
      <rect x="338" y="186" width="8" height="30" rx="2" fill="#60AACC" opacity="0.4"/>

      {/* ── Scented candle ── */}
      <rect x="348" y="418" width="20" height="28" rx="4" fill="#FFF3CC" stroke="#FFCC44" strokeWidth="1.5"/>
      <path d="M358 416 Q356 408 358 402 Q362 408 360 416" fill="#FF8C42"/>
      {/* Flame */}
      <ellipse cx="358" cy="402" rx="3" ry="5" fill="#FF8C42" opacity="0.8"/>
      <ellipse cx="358" cy="401" rx="1.5" ry="3" fill="#FFEE00"/>
      {/* Candle glow */}
      <ellipse cx="358" cy="402" rx="12" ry="10" fill="#FFFF99" opacity="0.2"/>
      {/* Scent swirls */}
      <path d="M353 396 Q349 388 352 380" stroke="#DDD" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M363 394 Q367 386 364 378" stroke="#DDD" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* ── Potted plant ── */}
      <rect x="340" y="284" width="30" height="24" rx="6" fill="#E8A87C"/>
      <ellipse cx="355" cy="284" rx="16" ry="8" fill="#D4845A"/>
      <path d="M355 276 Q345 262 340 252" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="338" cy="250" rx="10" ry="7" fill="#66BB6A" transform="rotate(-20 338 250)"/>
      <path d="M355 276 Q365 262 370 252" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="372" cy="250" rx="10" ry="7" fill="#66BB6A" transform="rotate(20 372 250)"/>
      <path d="M355 273 L355 255" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="355" cy="253" rx="8" ry="6" fill="#81C784"/>

      {/* ── Bath mat ── */}
      <rect x="30" y="480" width="170" height="45" rx="12" fill="#87CEEB" stroke="#60AACC" strokeWidth="2" opacity="0.7"/>
      {/* Mat texture */}
      {[...Array(6)].map((_, i) => (
        <rect key={i} x={40 + i*26} y="485" width="16" height="30" rx="4" fill="#60AACC" opacity="0.3"/>
      ))}

      {/* Soap bubbles floating (decorative) */}
      {[{x:290,y:160,r:12},{x:330,y:140,r:8},{x:310,y:125,r:15},{x:360,y:155,r:10}].map((b,i) => (
        <g key={i} opacity="0.4">
          <circle cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#87CEEB" strokeWidth="1.5"/>
          <circle cx={b.x - b.r*0.3} cy={b.y - b.r*0.3} r={b.r*0.25} fill="white" opacity="0.5"/>
        </g>
      ))}
    </svg>
  )
}
