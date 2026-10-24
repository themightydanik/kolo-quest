import React, { useState, useCallback, useEffect, useRef } from 'react'
import CatSprite from '../CatSprite'

/**
 * BathGame — tap bubbles to pop them, wash the cat!
 * 10 bubbles float up, pop them all to complete.
 */
const BUBBLE_COUNT = 10

function makeBubble(id) {
  return {
    id,
    x: 10 + Math.random() * 80, // % of container width
    startY: 85 + Math.random() * 10, // % - start near bottom
    size: 28 + Math.random() * 28, // px
    duration: 2.8 + Math.random() * 2, // seconds to float up
    delay: Math.random() * 3, // stagger
    popped: false,
    popAt: null,
  }
}

export default function BathGame({ onDone, onClose }) {
  const [bubbles, setBubbles] = useState(() => Array.from({ length: BUBBLE_COUNT }, (_, i) => makeBubble(i)))
  const [catState, setCatState] = useState('bath')
  const [phase, setPhase] = useState('playing') // playing → done
  const [poppedCount, setPoppedCount] = useState(0)

  const handlePop = useCallback((id) => {
    setBubbles(prev => {
      const next = prev.map(b => b.id === id && !b.popped ? { ...b, popped: true, popAt: Date.now() } : b)
      const newCount = next.filter(b => b.popped).length
      setPoppedCount(newCount)
      if (newCount >= BUBBLE_COUNT) {
        setCatState('happy')
        setPhase('done')
        setTimeout(() => onDone(20), 900)
      }
      return next
    })
  }, [onDone])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-start bg-gradient-to-b from-cyan-200 to-blue-100 overflow-hidden"
      style={{ zIndex: 65 }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 pt-4 pb-2 z-10">
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 text-gray-600 text-lg shadow">
          ✕
        </button>
        <div className="font-black text-cyan-800 text-lg">🛁 Купаємо котика!</div>
        <div className="w-9" />
      </div>

      {/* Progress */}
      <div className="w-full px-6 mb-1 z-10">
        <div className="flex justify-between text-xs font-bold text-cyan-600 mb-1">
          <span>Лопнуто бульбашок</span>
          <span>{poppedCount}/{BUBBLE_COUNT}</span>
        </div>
        <div className="h-3 bg-cyan-100 rounded-full overflow-hidden border border-cyan-200">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${(poppedCount / BUBBLE_COUNT) * 100}%` }}
          />
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center text-sm text-cyan-700 font-semibold px-4 mb-1 z-10">
        {phase === 'playing' && 'Лопни всі бульбашки! 💦'}
        {phase === 'done' && '✅ Котик чистий і щасливий!'}
      </div>

      {/* Cat + bubbles arena */}
      <div className="relative w-full flex-1">
        {/* Bathtub / water line */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl"
          style={{
            height: '38%',
            background: 'linear-gradient(to bottom, rgba(100,200,255,0.4), rgba(30,120,200,0.3))',
            borderTop: '3px solid rgba(100,200,255,0.6)',
          }}
        />

        {/* Cat in tub — slightly submerged effect */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '28%' }}>
          <CatSprite state={catState} size={150} />
        </div>

        {/* Bubbles */}
        {bubbles.map(bubble => (
          <BubbleItem
            key={bubble.id}
            bubble={bubble}
            onPop={handlePop}
          />
        ))}

        {/* Done overlay */}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 mt-32">
              <div className="text-5xl">🚿</div>
              <div className="text-2xl font-black text-blue-600 bg-white rounded-2xl px-6 py-3 shadow-lg">
                +20 чистота!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BubbleItem({ bubble, onPop }) {
  const [currentY, setCurrentY] = useState(bubble.startY)
  const [visible, setVisible] = useState(true)
  const animRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (bubble.popped) {
      setVisible(false)
      return
    }
    const startDelay = bubble.delay * 1000
    const timeout = setTimeout(() => {
      const duration = bubble.duration * 1000
      const start = Date.now()
      startTimeRef.current = start

      function animate() {
        const elapsed = Date.now() - start
        const progress = elapsed / duration
        if (progress >= 1) {
          // Bubble escaped — reset it
          setCurrentY(bubble.startY)
          startTimeRef.current = Date.now()
          animRef.current = requestAnimationFrame(animate)
          return
        }
        setCurrentY(bubble.startY - progress * (bubble.startY + 10))
        animRef.current = requestAnimationFrame(animate)
      }
      animRef.current = requestAnimationFrame(animate)
    }, startDelay)

    return () => {
      clearTimeout(timeout)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [bubble.popped, bubble.delay, bubble.duration, bubble.startY])

  if (!visible || bubble.popped) return null

  return (
    <div
      className="absolute cursor-pointer select-none"
      style={{
        left: `${bubble.x}%`,
        top: `${currentY}%`,
        transform: 'translate(-50%, -50%)',
        width: bubble.size,
        height: bubble.size,
        zIndex: 5,
      }}
      onClick={() => onPop(bubble.id)}
      onTouchStart={(e) => { e.preventDefault(); onPop(bubble.id) }}
    >
      <svg viewBox="0 0 60 60" width={bubble.size} height={bubble.size}>
        <circle cx="30" cy="30" r="27"
          fill="rgba(180,230,255,0.35)"
          stroke="rgba(100,200,255,0.8)"
          strokeWidth="2"
        />
        <ellipse cx="22" cy="18" rx="6" ry="4"
          fill="rgba(255,255,255,0.6)"
          transform="rotate(-30 22 18)"
        />
        <circle cx="38" cy="22" r="2.5"
          fill="rgba(255,255,255,0.5)"
        />
      </svg>
    </div>
  )
}

