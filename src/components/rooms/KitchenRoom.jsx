import React from 'react'

// Kitchen SVG Room — kawaii flat style
// Interactive: fridge, food bowl, sink counter
export default function KitchenRoom({ onFeedPet, foodCount, petState }) {
  const fridgeGlow = petState === 'hangry' || petState === 'crying'

  return (
    <svg viewBox="0 0 390 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* ── Background ── */}
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF5E6"/>
          <stop offset="100%" stopColor="#FFE8CC"/>
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5CBA7"/>
          <stop offset="100%" stopColor="#E8A87C"/>
        </linearGradient>
        <linearGradient id="counterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8E1C4"/>
          <stop offset="100%" stopColor="#ECC99A"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Tile pattern */}
        <pattern id="tiles" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#FFF5E6"/>
          <rect width="39" height="39" fill="none" stroke="#F5D5B0" strokeWidth="0.5"/>
        </pattern>
        <pattern id="floor" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#F5CBA7"/>
          <rect width="58" height="58" x="1" y="1" fill="#F0C090" rx="2"/>
        </pattern>
      </defs>

      {/* Wall */}
      <rect width="390" height="600" fill="url(#tiles)"/>

      {/* Floor */}
      <rect y="420" width="390" height="180" fill="url(#floor)"/>
      {/* Floor edge shadow */}
      <rect y="418" width="390" height="6" fill="#D4A57A" opacity="0.6"/>

      {/* ── Window ── */}
      <rect x="140" y="30" width="110" height="90" rx="12" fill="#B8E4F9" stroke="#8CC9E8" strokeWidth="3"/>
      {/* Window frame cross */}
      <line x1="195" y1="30" x2="195" y2="120" stroke="#8CC9E8" strokeWidth="2.5"/>
      <line x1="140" y1="75" x2="250" y2="75" stroke="#8CC9E8" strokeWidth="2.5"/>
      {/* Window shine */}
      <rect x="148" y="38" width="20" height="30" rx="4" fill="white" opacity="0.4"/>
      {/* Curtains */}
      <path d="M130 28 Q140 75 130 122" fill="#FFB3B3" stroke="#FF9090" strokeWidth="1.5"/>
      <path d="M260 28 Q250 75 260 122" fill="#FFB3B3" stroke="#FF9090" strokeWidth="1.5"/>
      {/* Curtain ties */}
      <circle cx="133" cy="72" r="5" fill="#FF7070"/>
      <circle cx="257" cy="72" r="5" fill="#FF7070"/>
      {/* Sky outside */}
      <rect x="143" y="33" width="47" height="84" rx="4" fill="#87CEEB" opacity="0.5"/>
      <rect x="200" y="33" width="47" height="84" rx="4" fill="#87CEEB" opacity="0.5"/>
      {/* Clouds */}
      <ellipse cx="160" cy="55" rx="14" ry="9" fill="white" opacity="0.8"/>
      <ellipse cx="172" cy="50" rx="10" ry="7" fill="white" opacity="0.8"/>
      <ellipse cx="220" cy="62" rx="12" ry="8" fill="white" opacity="0.7"/>

      {/* ── Wall shelf ── */}
      <rect x="20" y="155" width="120" height="12" rx="4" fill="#DEB887" stroke="#C8A06E" strokeWidth="1.5"/>
      {/* Shelf bracket */}
      <path d="M30 167 L30 180 L22 180" stroke="#C8A06E" strokeWidth="2" fill="none"/>
      <path d="M130 167 L130 180 L138 180" stroke="#C8A06E" strokeWidth="2" fill="none"/>

      {/* Plants on shelf */}
      {/* Pot 1 */}
      <path d="M38 155 L48 155 L46 168 L40 168 Z" fill="#D4845A"/>
      <ellipse cx="43" cy="155" rx="7" ry="4" fill="#B86A42"/>
      <path d="M43 148 Q36 138 32 130" stroke="#5CAB40" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="30" cy="128" rx="8" ry="6" fill="#6DC94A" transform="rotate(-20 30 128)"/>
      <path d="M43 148 Q50 138 53 130" stroke="#5CAB40" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="55" cy="128" rx="7" ry="5" fill="#6DC94A" transform="rotate(20 55 128)"/>
      <path d="M43 145 Q43 135 43 125" stroke="#5CAB40" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="43" cy="123" rx="6" ry="5" fill="#7ADB56"/>

      {/* Pot 2 — cactus */}
      <path d="M98 155 L112 155 L110 168 L100 168 Z" fill="#E8A87C"/>
      <ellipse cx="105" cy="155" rx="8" ry="5" fill="#D4845A"/>
      <rect x="101" y="128" width="8" height="28" rx="4" fill="#5CAB40"/>
      <path d="M101 138 Q90 136 88 128" stroke="#5CAB40" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <circle cx="88" cy="126" r="4" fill="#6DC94A"/>
      <path d="M109 142 Q120 140 122 132" stroke="#5CAB40" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <circle cx="122" cy="130" r="4" fill="#6DC94A"/>
      {/* Cactus flower */}
      <circle cx="105" cy="126" r="5" fill="#FF6B9D"/>
      <circle cx="105" cy="126" r="3" fill="#FFD700"/>

      {/* ── Right wall shelf ── */}
      <rect x="250" y="155" width="120" height="12" rx="4" fill="#DEB887" stroke="#C8A06E" strokeWidth="1.5"/>
      {/* Jars */}
      <rect x="258" y="125" width="22" height="31" rx="6" fill="#B8E4F9" stroke="#8CC9E8" strokeWidth="1.5"/>
      <rect x="258" y="121" width="22" height="8" rx="3" fill="#8CC9E8"/>
      <ellipse cx="269" cy="140" rx="6" ry="4" fill="#FFB347" opacity="0.6"/>

      <rect x="290" y="128" width="20" height="28" rx="6" fill="#FFB3DE" stroke="#FF8EC7" strokeWidth="1.5"/>
      <rect x="290" y="124" width="20" height="8" rx="3" fill="#FF8EC7"/>

      <rect x="320" y="120" width="24" height="36" rx="6" fill="#C8F7C5" stroke="#82E0AA" strokeWidth="1.5"/>
      <rect x="320" y="116" width="24" height="8" rx="3" fill="#82E0AA"/>
      <text x="332" y="142" textAnchor="middle" fontSize="12">🍬</text>

      {/* ── Counter / Cabinet base ── */}
      <rect x="0" y="310" width="390" height="130" rx="0" fill="#DEB887" stroke="#C8A06E" strokeWidth="2"/>
      {/* Counter top */}
      <rect x="0" y="308" width="390" height="16" rx="4" fill="#F0D4A0" stroke="#C8A06E" strokeWidth="1.5"/>
      {/* Cabinet doors */}
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x={i*78+4} y={328} width={70} height={106} rx="6" fill="#F5CBA7" stroke="#DEB887" strokeWidth="1.5"/>
          {/* Door handle */}
          <circle cx={i*78+39} cy={385} r="5" fill="#C8A06E"/>
        </g>
      ))}
      {/* Under-counter shadow */}
      <rect x="0" y="435" width="390" height="5" fill="#8B6914" opacity="0.3"/>

      {/* ── Stove ── */}
      <rect x="20" y="232" width="120" height="78" rx="8" fill="#E8E8E8" stroke="#CCCCCC" strokeWidth="2"/>
      {/* Stove top */}
      <rect x="20" y="232" width="120" height="20" rx="8" fill="#F5F5F5" stroke="#CCCCCC" strokeWidth="1.5"/>
      {/* Burners */}
      <circle cx="60" cy="268" r="18" fill="#D0D0D0" stroke="#BBBBBB" strokeWidth="2"/>
      <circle cx="60" cy="268" r="10" fill="#C0C0C0"/>
      <circle cx="60" cy="268" r="4" fill="#A0A0A0"/>
      <circle cx="110" cy="268" r="18" fill="#D0D0D0" stroke="#BBBBBB" strokeWidth="2"/>
      <circle cx="110" cy="268" r="10" fill="#C0C0C0"/>
      <circle cx="110" cy="268" r="4" fill="#A0A0A0"/>
      {/* Control knobs */}
      <circle cx="50" cy="242" r="6" fill="#888"/>
      <circle cx="80" cy="242" r="6" fill="#888"/>
      <circle cx="110" cy="242" r="6" fill="#888"/>
      <circle cx="50" cy="242" r="3" fill="#666"/>
      <circle cx="80" cy="242" r="3" fill="#666"/>
      <circle cx="110" cy="242" r="3" fill="#666"/>

      {/* Pot on stove */}
      <ellipse cx="60" cy="260" rx="20" ry="8" fill="#888" stroke="#666" strokeWidth="1.5"/>
      <rect x="40" y="246" width="40" height="18" rx="3" fill="#999" stroke="#777" strokeWidth="1.5"/>
      <ellipse cx="60" cy="246" rx="20" ry="6" fill="#AAA" stroke="#888" strokeWidth="1.5"/>
      {/* Steam */}
      <path d="M52 240 Q50 232 52 224" stroke="#DDD" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M60 238 Q58 229 60 220" stroke="#DDD" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M68 240 Q70 232 68 224" stroke="#DDD" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>

      {/* ── Fridge ── */}
      {fridgeGlow && (
        <rect x="258" y="195" width="116" height="115" rx="14" fill="#FFD700" opacity="0.3" filter="url(#glow)"/>
      )}
      <rect x="262" y="198" width="108" height="112" rx="12" fill="#F0F0F0" stroke="#DDDDDD" strokeWidth="2.5"/>
      {/* Fridge top (freezer) */}
      <rect x="262" y="198" width="108" height="38" rx="12" fill="#E8E8E8" stroke="#DDDDDD" strokeWidth="2"/>
      {/* Fridge divider */}
      <rect x="262" y="232" width="108" height="4" fill="#CCCCCC"/>
      {/* Handles */}
      <rect x="346" y="213" width="8" height="14" rx="4" fill="#BBBBBB"/>
      <rect x="346" y="250" width="8" height="22" rx="4" fill="#BBBBBB"/>
      {/* Fridge emoji hint when pet is hungry */}
      {fridgeGlow && (
        <text x="316" y="228" textAnchor="middle" fontSize="20">🍖</text>
      )}
      {/* Magnets */}
      <rect x="275" y="248" width="18" height="14" rx="3" fill="#FF6B9D"/>
      <text x="284" y="259" textAnchor="middle" fontSize="9" fill="white">😺</text>
      <rect x="298" y="260" width="16" height="12" rx="3" fill="#6BB8FF"/>
      <text x="306" y="270" textAnchor="middle" fontSize="8" fill="white">★</text>

      {/* ── Sink area ── */}
      <rect x="158" y="252" width="88" height="58" rx="8" fill="#DEDEDF" stroke="#BBBBBB" strokeWidth="2"/>
      {/* Sink basin */}
      <rect x="168" y="262" width="68" height="40" rx="6" fill="#C8C8CC" stroke="#AAAAAA" strokeWidth="1.5"/>
      <rect x="172" y="266" width="60" height="32" rx="5" fill="#B0C8E0" opacity="0.6"/>
      {/* Faucet */}
      <rect x="196" y="243" width="8" height="20" rx="4" fill="#BBBBBB" stroke="#999" strokeWidth="1"/>
      <rect x="190" y="243" width="20" height="5" rx="3" fill="#CCCCCC" stroke="#AAAAAA" strokeWidth="1"/>
      {/* Water drop */}
      <ellipse cx="200" cy="266" rx="3" ry="4" fill="#87CEEB" opacity="0.8"/>

      {/* ── Pet food bowl (interactive) ── */}
      <g
        onClick={foodCount > 0 ? onFeedPet : undefined}
        style={{ cursor: foodCount > 0 ? 'pointer' : 'default' }}
        className="pet-bowl"
      >
        {/* Bowl glow when food available */}
        {foodCount > 0 && (
          <ellipse cx="195" cy="468" rx="38" ry="12" fill="#FFD700" opacity="0.25" filter="url(#glow)"/>
        )}
        {/* Bowl */}
        <ellipse cx="195" cy="470" rx="32" ry="10" fill="#E8E8E8" stroke="#CCCCCC" strokeWidth="2"/>
        <ellipse cx="195" cy="466" rx="32" ry="10" fill={foodCount > 0 ? '#FFF3CD' : '#F5F5F5'} stroke={foodCount > 0 ? '#FFD700' : '#DDDDDD'} strokeWidth="2"/>
        {/* Food in bowl */}
        {foodCount > 0 ? (
          <>
            <ellipse cx="195" cy="464" rx="22" ry="6" fill="#FF8C42" opacity="0.8"/>
            <ellipse cx="188" cy="462" rx="5" ry="4" fill="#FF6B1A"/>
            <ellipse cx="200" cy="461" rx="4" ry="3" fill="#FF7B2A"/>
            <ellipse cx="193" cy="464" rx="3" ry="2.5" fill="#FF9955"/>
            <text x="195" y="480" textAnchor="middle" fontSize="10" fill="#999">кликни щоб годувати</text>
          </>
        ) : (
          <text x="195" y="478" textAnchor="middle" fontSize="10" fill="#BBB">миска порожня</text>
        )}
        {/* Food count badge */}
        {foodCount > 0 && (
          <g>
            <circle cx="220" cy="452" r="12" fill="#FF6B9D"/>
            <text x="220" y="457" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">{foodCount}</text>
          </g>
        )}
      </g>

      {/* ── Decorative details ── */}
      {/* Clock on wall */}
      <circle cx="200" cy="160" r="22" fill="white" stroke="#DDDDDD" strokeWidth="2"/>
      <circle cx="200" cy="160" r="18" fill="#FFFEF0" stroke="#EEEEEE" strokeWidth="1"/>
      <circle cx="200" cy="160" r="2" fill="#555"/>
      {/* Clock hands */}
      <line x1="200" y1="160" x2="200" y2="146" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      <line x1="200" y1="160" x2="210" y2="165" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Clock numbers */}
      <text x="200" y="148" textAnchor="middle" fontSize="6" fill="#888">12</text>
      <text x="216" y="163" textAnchor="middle" fontSize="6" fill="#888">3</text>
      <text x="200" y="178" textAnchor="middle" fontSize="6" fill="#888">6</text>
      <text x="184" y="163" textAnchor="middle" fontSize="6" fill="#888">9</text>

      {/* Small cat paw print on floor */}
      <g opacity="0.25" transform="translate(280, 460)">
        <circle cx="0" cy="0" r="5" fill="#8B4513"/>
        <circle cx="-8" cy="-7" r="3" fill="#8B4513"/>
        <circle cx="0" cy="-9" r="3" fill="#8B4513"/>
        <circle cx="8" cy="-7" r="3" fill="#8B4513"/>
      </g>
    </svg>
  )
}
