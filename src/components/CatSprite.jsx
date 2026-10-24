import React, { useEffect, useRef } from 'react'

/**
 * CatSprite — kawaii SVG cat, My Talking Tom style
 *
 * Props:
 *   state:  'idle' | 'happy' | 'eat' | 'sleep' | 'hangry' | 'sad' | 'excited' | 'brush' | 'bath' | 'pet'
 *   action: one-shot trigger — 'chew' | 'headTilt' | 'bounce1'
 *   size:   number (default 120) — width in px; height = size * (160/120)
 *   onPet:  click handler
 *   mouthOpen: bool — force mouth open (for FeedGame hover)
 */
export default function CatSprite({ state = 'idle', action, size = 120, onPet, mouthOpen = false }) {
  const svgRef = useRef(null)

  // Apply one-shot action class, remove on animationend
  useEffect(() => {
    if (!action || !svgRef.current) return
    svgRef.current.setAttribute('data-action', action)
    const el = svgRef.current
    const remove = () => el.removeAttribute('data-action')
    el.addEventListener('animationend', remove, { once: true })
    return () => el.removeEventListener('animationend', remove)
  }, [action])

  const h = Math.round(size * (160 / 120))
  const isOpen = mouthOpen || state === 'eat' || state === 'brush' || state === 'bath'
  const eyesClosed = state === 'sleep' || state === 'bath'
  const eyesHalf = state === 'sad'
  const showBlush = state === 'happy' || state === 'excited' || state === 'pet'
  const showTears = state === 'sad'
  const showZzz = state === 'sleep'

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 160"
      width={size}
      height={h}
      data-state={state}
      onClick={onPet}
      style={{ cursor: onPet ? 'pointer' : 'default', overflow: 'visible', display: 'block' }}
    >
      <style>{`
        /* ── transform defaults ─────────────────────────────── */
        .cat-part { transform-box: fill-box; transform-origin: center; }

        /* ── IDLE: gentle breathing + tail sway ─────────────── */
        @keyframes breathe {
          0%,100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.03); }
        }
        @keyframes tailSway {
          0%,100% { transform: rotate(-8deg); }
          50%      { transform: rotate(8deg); }
        }
        @keyframes earTwitch {
          0%,90%,100% { transform: rotate(0deg); }
          92%          { transform: rotate(-6deg); }
          96%          { transform: rotate(4deg); }
        }
        [data-state="idle"] #body-group { animation: breathe 3s ease-in-out infinite; }
        [data-state="idle"] #tail { animation: tailSway 2.5s ease-in-out infinite; }
        [data-state="idle"] #left-ear { animation: earTwitch 5s ease-in-out infinite; }
        [data-state="idle"] #right-ear { animation: earTwitch 5s ease-in-out 0.3s infinite; }

        /* ── HAPPY: bounce + blush + fast tail ──────────────── */
        @keyframes catBounce {
          0%,100% { transform: translateY(0px); }
          20%      { transform: translateY(-14px); }
          40%      { transform: translateY(-4px); }
          60%      { transform: translateY(-10px); }
          80%      { transform: translateY(-2px); }
        }
        @keyframes tailWagFast {
          0%,100% { transform: rotate(-25deg); }
          50%      { transform: rotate(25deg); }
        }
        [data-state="happy"] #whole-cat { animation: catBounce 0.6s ease-in-out 2; }
        [data-state="happy"] #tail { animation: tailWagFast 0.4s ease-in-out infinite; }
        [data-state="happy"] #body-group { animation: breathe 3s ease-in-out infinite; }

        /* ── EXCITED ─────────────────────────────────────────── */
        @keyframes excitedBounce {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          25%      { transform: translateY(-18px) rotate(-3deg); }
          75%      { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes earFlap {
          0%,100% { transform: rotate(0deg); }
          25%      { transform: rotate(-18deg); }
          75%      { transform: rotate(18deg); }
        }
        @keyframes tailExcited {
          0%,100% { transform: rotate(-40deg); }
          50%      { transform: rotate(40deg); }
        }
        [data-state="excited"] #whole-cat { animation: excitedBounce 0.35s ease-in-out infinite; }
        [data-state="excited"] #left-ear  { animation: earFlap 0.35s ease-in-out infinite; }
        [data-state="excited"] #right-ear { animation: earFlap 0.35s ease-in-out 0.17s infinite; }
        [data-state="excited"] #tail      { animation: tailExcited 0.3s ease-in-out infinite; }

        /* ── EAT: head nod + chew ────────────────────────────── */
        @keyframes headNod {
          0%,100% { transform: rotate(0deg); }
          30%      { transform: rotate(-6deg); }
          60%      { transform: rotate(4deg); }
        }
        @keyframes chewScale {
          0%,100% { transform: scaleY(1); }
          40%      { transform: scaleY(0.85); }
        }
        [data-state="eat"] #head-group { animation: headNod 0.5s ease-in-out infinite; }
        [data-state="eat"] #mouth-open { animation: chewScale 0.3s ease-in-out infinite; }
        [data-state="eat"] #body-group { animation: breathe 3s ease-in-out infinite; }

        /* ── SLEEP: slow breathing + zzz float ──────────────── */
        @keyframes sleepBreath {
          0%,100% { transform: scaleY(1); }
          50%      { transform: scaleY(1.05); }
        }
        @keyframes tailDrop {
          0%,100% { transform: rotate(5deg); }
          50%      { transform: rotate(-5deg); }
        }
        @keyframes zzzFloat {
          0%   { transform: translateY(0px) scale(0.7); opacity:0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(-30px) scale(1.1); opacity:0; }
        }
        [data-state="sleep"] #body-group { animation: sleepBreath 5s ease-in-out infinite; }
        [data-state="sleep"] #tail        { animation: tailDrop 4s ease-in-out infinite; }
        [data-state="sleep"] #zzz1 { animation: zzzFloat 2.5s ease-in-out 0.0s infinite; }
        [data-state="sleep"] #zzz2 { animation: zzzFloat 2.5s ease-in-out 0.8s infinite; }
        [data-state="sleep"] #zzz3 { animation: zzzFloat 2.5s ease-in-out 1.6s infinite; }

        /* ── HANGRY: tremble + angry brows ──────────────────── */
        @keyframes tremble {
          0%,100% { transform: translateX(0px); }
          25%      { transform: translateX(-3px); }
          75%      { transform: translateX(3px); }
        }
        @keyframes tailAngry {
          0%,100% { transform: rotate(-15deg); }
          50%      { transform: rotate(15deg); }
        }
        [data-state="hangry"] #whole-cat { animation: tremble 0.12s ease-in-out infinite; }
        [data-state="hangry"] #tail { animation: tailAngry 0.6s ease-in-out infinite; }

        /* ── SAD: tears drop ─────────────────────────────────── */
        @keyframes tearFall {
          0%   { transform: translateY(0px); opacity:1; }
          100% { transform: translateY(18px); opacity:0; }
        }
        @keyframes tailDroop {
          0%,100% { transform: rotate(12deg); }
          50%      { transform: rotate(8deg); }
        }
        [data-state="sad"] #left-tear  { animation: tearFall 1.2s ease-in 0s infinite; }
        [data-state="sad"] #right-tear { animation: tearFall 1.2s ease-in 0.6s infinite; }
        [data-state="sad"] #tail { animation: tailDroop 3s ease-in-out infinite; }

        /* ── BRUSH: head sway ────────────────────────────────── */
        @keyframes headSway {
          0%,100% { transform: rotate(-5deg); }
          50%      { transform: rotate(5deg); }
        }
        [data-state="brush"] #head-group { animation: headSway 0.4s ease-in-out infinite; }
        [data-state="brush"] #body-group { animation: breathe 3s ease-in-out infinite; }

        /* ── BATH: shiver ────────────────────────────────────── */
        @keyframes bathShiver {
          0%,100% { transform: rotate(0deg); }
          20%      { transform: rotate(-4deg); }
          40%      { transform: rotate(4deg); }
          60%      { transform: rotate(-3deg); }
          80%      { transform: rotate(3deg); }
        }
        [data-state="bath"] #whole-cat { animation: bathShiver 0.3s ease-in-out infinite; }

        /* ── PET: head tilt once ─────────────────────────────── */
        @keyframes petTilt {
          0%,100% { transform: rotate(0deg); }
          30%      { transform: rotate(-12deg); }
          70%      { transform: rotate(8deg); }
        }
        [data-state="pet"] #head-group { animation: petTilt 0.6s ease-in-out 1; }
        [data-state="pet"] #body-group { animation: breathe 3s ease-in-out infinite; }
        [data-state="pet"] #tail { animation: tailWagFast 0.4s ease-in-out 3; }

        /* ── ONE-SHOT ACTIONS ────────────────────────────────── */
        @keyframes bounce1 {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-20px); }
        }
        [data-action="bounce1"] #whole-cat { animation: bounce1 0.4s ease-out 1; }
      `}</style>

      <g id="whole-cat" className="cat-part">

        {/* ── Shadow ──────────────────────────────────────────── */}
        <ellipse cx="60" cy="157" rx="30" ry="5" fill="rgba(0,0,0,0.15)"
          style={{ filter: 'blur(3px)' }} />

        {/* ── Body ─────────────────────────────────────────────── */}
        <g id="body-group" className="cat-part">
          {/* Main torso */}
          <rect x="28" y="72" width="64" height="72" rx="28"
            fill="#FFF0DC" stroke="#E8C49A" strokeWidth="2" />
          {/* Tummy stripe — lighter oval */}
          <ellipse cx="60" cy="104" rx="20" ry="28" fill="#FFF8EF" opacity="0.7" />
          {/* Back legs */}
          <rect x="22" y="118" width="22" height="30" rx="11"
            fill="#FFF0DC" stroke="#E8C49A" strokeWidth="2" />
          <rect x="76" y="118" width="22" height="30" rx="11"
            fill="#FFF0DC" stroke="#E8C49A" strokeWidth="2" />
          {/* Back paws */}
          <ellipse cx="33" cy="150" rx="13" ry="7"
            fill="#FFDDC0" stroke="#E8C49A" strokeWidth="1.5" />
          <ellipse cx="87" cy="150" rx="13" ry="7"
            fill="#FFDDC0" stroke="#E8C49A" strokeWidth="1.5" />
          {/* Toe lines on paws */}
          <line x1="27" y1="152" x2="27" y2="148" stroke="#E8B080" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="33" y1="153" x2="33" y2="149" stroke="#E8B080" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="39" y1="152" x2="39" y2="148" stroke="#E8B080" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="81" y1="152" x2="81" y2="148" stroke="#E8B080" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="87" y1="153" x2="87" y2="149" stroke="#E8B080" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="93" y1="152" x2="93" y2="148" stroke="#E8B080" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Front paws */}
          <ellipse cx="42" cy="138" rx="11" ry="8"
            fill="#FFDDC0" stroke="#E8C49A" strokeWidth="1.5" />
          <ellipse cx="78" cy="138" rx="11" ry="8"
            fill="#FFDDC0" stroke="#E8C49A" strokeWidth="1.5" />
        </g>

        {/* ── Tail ─────────────────────────────────────────────── */}
        <g id="tail" className="cat-part"
          style={{ transformOrigin: '88px 115px' }}>
          <path d="M 88 115 Q 118 90 108 62 Q 100 44 82 52"
            fill="none" stroke="#E8C49A" strokeWidth="13"
            strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 88 115 Q 118 90 108 62 Q 100 44 82 52"
            fill="none" stroke="#FFF0DC" strokeWidth="8"
            strokeLinecap="round" strokeLinejoin="round" />
          {/* Tail tip */}
          <circle cx="81" cy="52" r="8" fill="#FFD4A0" stroke="#E8B880" strokeWidth="1.5"/>
        </g>

        {/* ── Head ─────────────────────────────────────────────── */}
        <g id="head-group" className="cat-part"
          style={{ transformOrigin: '60px 52px' }}>

          {/* Ears (behind head) */}
          <g id="left-ear" className="cat-part"
            style={{ transformOrigin: '32px 32px' }}>
            <path d="M 20 45 L 14 14 L 46 30 Z"
              fill="#FFF0DC" stroke="#E8C49A" strokeWidth="1.8" />
            <path d="M 23 40 L 18 20 L 40 32 Z"
              fill="#FFBFD0" />
          </g>
          <g id="right-ear" className="cat-part"
            style={{ transformOrigin: '88px 32px' }}>
            <path d="M 100 45 L 106 14 L 74 30 Z"
              fill="#FFF0DC" stroke="#E8C49A" strokeWidth="1.8" />
            <path d="M 97 40 L 102 20 L 80 32 Z"
              fill="#FFBFD0" />
          </g>

          {/* Head circle */}
          <circle cx="60" cy="52" r="33"
            fill="#FFF0DC" stroke="#E8C49A" strokeWidth="2" />

          {/* ── Face ─────────────────────────────────────────────── */}

          {/* Eyes */}
          {!eyesClosed && !eyesHalf && (
            <>
              {/* Left eye */}
              <ellipse id="left-eye-white" cx="45" cy="49" rx="10" ry="12"
                fill="white" stroke="#E0C090" strokeWidth="1"/>
              <circle cx="46" cy="50" r="7" fill="#5BC8C8"/>
              <circle cx="46" cy="50" r="4" fill="#1A1A2E"/>
              <circle cx="49" cy="47" r="2.2" fill="white"/>
              {/* Right eye */}
              <ellipse cx="75" cy="49" rx="10" ry="12"
                fill="white" stroke="#E0C090" strokeWidth="1"/>
              <circle cx="74" cy="50" r="7" fill="#5BC8C8"/>
              <circle cx="74" cy="50" r="4" fill="#1A1A2E"/>
              <circle cx="77" cy="47" r="2.2" fill="white"/>
            </>
          )}

          {/* Closed eyes (sleep/bath) */}
          {eyesClosed && (
            <>
              <path d="M 36 50 Q 45 44 54 50" fill="none" stroke="#C89060" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M 66 50 Q 75 44 84 50" fill="none" stroke="#C89060" strokeWidth="2.5" strokeLinecap="round"/>
            </>
          )}

          {/* Half eyes (sad) */}
          {eyesHalf && !eyesClosed && (
            <>
              <ellipse cx="45" cy="49" rx="10" ry="12" fill="white" stroke="#E0C090" strokeWidth="1"/>
              <circle cx="46" cy="50" r="7" fill="#5BC8C8"/>
              <circle cx="46" cy="50" r="4" fill="#1A1A2E"/>
              {/* Half-close overlay */}
              <rect x="35" y="37" width="20" height="10" fill="#FFF0DC"/>
              <path d="M 35 47 Q 45 42 55 47" fill="#FFF0DC" stroke="none"/>
              <ellipse cx="75" cy="49" rx="10" ry="12" fill="white" stroke="#E0C090" strokeWidth="1"/>
              <circle cx="74" cy="50" r="7" fill="#5BC8C8"/>
              <circle cx="74" cy="50" r="4" fill="#1A1A2E"/>
              <rect x="65" y="37" width="20" height="10" fill="#FFF0DC"/>
              <path d="M 65 47 Q 75 42 85 47" fill="#FFF0DC" stroke="none"/>
            </>
          )}

          {/* Angry brows (hangry) */}
          {state === 'hangry' && (
            <>
              <path d="M 35 40 Q 45 36 54 39" fill="none" stroke="#8B3A00" strokeWidth="3" strokeLinecap="round"/>
              <path d="M 66 39 Q 75 36 85 40" fill="none" stroke="#8B3A00" strokeWidth="3" strokeLinecap="round"/>
            </>
          )}

          {/* Nose */}
          <path d="M 57 60 L 60 64 L 63 60 Z" fill="#FF8FAB" />
          <line x1="60" y1="64" x2="60" y2="68" stroke="#FF8FAB" strokeWidth="1.5"/>

          {/* Closed mouth */}
          {!isOpen && (
            <path d="M 52 70 Q 60 76 68 70"
              fill="none" stroke="#D08060" strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Open mouth */}
          {isOpen && (
            <g id="mouth-open" className="cat-part">
              {/* Mouth cavity */}
              <path d="M 48 68 Q 60 84 72 68"
                fill="#CC3333" stroke="#AA2222" strokeWidth="1.5" strokeLinecap="round" />
              {/* Tongue */}
              <ellipse cx="60" cy="78" rx="10" ry="7" fill="#FF7090" />
              <line x1="60" y1="72" x2="60" y2="84" stroke="#E05070" strokeWidth="1.5"/>
              {/* Teeth */}
              <rect x="50" y="68" width="9" height="8" rx="2" fill="white" stroke="#DDD" strokeWidth="0.5"/>
              <rect x="61" y="68" width="9" height="8" rx="2" fill="white" stroke="#DDD" strokeWidth="0.5"/>
            </g>
          )}

          {/* Whiskers */}
          <g id="left-whiskers" stroke="#C8A070" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
            <line x1="27" y1="60" x2="50" y2="63"/>
            <line x1="25" y1="65" x2="50" y2="66"/>
            <line x1="27" y1="70" x2="50" y2="68"/>
          </g>
          <g id="right-whiskers" stroke="#C8A070" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
            <line x1="93" y1="60" x2="70" y2="63"/>
            <line x1="95" y1="65" x2="70" y2="66"/>
            <line x1="93" y1="70" x2="70" y2="68"/>
          </g>

          {/* Blush */}
          {showBlush && (
            <>
              <ellipse id="left-blush" cx="36" cy="60" rx="9" ry="6"
                fill="#FFB3C6" opacity="0.55" />
              <ellipse id="right-blush" cx="84" cy="60" rx="9" ry="6"
                fill="#FFB3C6" opacity="0.55" />
            </>
          )}

          {/* Tears */}
          {showTears && (
            <>
              <g id="left-tear" className="cat-part" style={{ transformOrigin: '40px 55px' }}>
                <path d="M 40 55 Q 37 62 40 67" fill="#87CEEB" opacity="0.9"/>
              </g>
              <g id="right-tear" className="cat-part" style={{ transformOrigin: '80px 55px' }}>
                <path d="M 80 55 Q 83 62 80 67" fill="#87CEEB" opacity="0.9"/>
              </g>
            </>
          )}

          {/* Zzz (sleep) */}
          {showZzz && (
            <>
              <text id="zzz1" x="88" y="40" fontSize="9" fill="#8B9DC3" fontWeight="bold"
                className="cat-part" style={{ transformOrigin: '88px 40px' }}>z</text>
              <text id="zzz2" x="96" y="28" fontSize="12" fill="#8B9DC3" fontWeight="bold"
                className="cat-part" style={{ transformOrigin: '96px 28px' }}>z</text>
              <text id="zzz3" x="104" y="14" fontSize="15" fill="#8B9DC3" fontWeight="bold"
                className="cat-part" style={{ transformOrigin: '104px 14px' }}>Z</text>
            </>
          )}

          {/* Exclamation hearts (excited) */}
          {state === 'excited' && (
            <>
              <text x="8" y="25" fontSize="16">💜</text>
              <text x="96" y="20" fontSize="13">💜</text>
            </>
          )}
        </g>
      </g>
    </svg>
  )
}
