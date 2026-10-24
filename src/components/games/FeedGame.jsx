import React, { useState, useRef, useCallback } from 'react'
import CatSprite from '../CatSprite'

/**
 * FeedGame — drag food item into the cat's open mouth
 * Props: onDone(points) — called when feeding complete
 *        onClose — called on cancel
 *        foodCount — current food supply
 */
export default function FeedGame({ onDone, onClose, foodCount }) {
  const [phase, setPhase] = useState('idle') // idle → dragging → eating → done
  const [foodPos, setFoodPos] = useState({ x: 60, y: 220 })
  const [isDragging, setIsDragging] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(false)
  const [catState, setCatState] = useState('idle')
  const containerRef = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Cat mouth center in overlay coordinates (cat is 160px wide at center)
  const MOUTH_X_MIN = 90, MOUTH_X_MAX = 170
  const MOUTH_Y_MIN = 130, MOUTH_Y_MAX = 170

  const isNearMouth = (x, y) =>
    x > MOUTH_X_MIN && x < MOUTH_X_MAX && y > MOUTH_Y_MIN && y < MOUTH_Y_MAX

  const getEventPos = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const handleFoodStart = useCallback((e) => {
    e.preventDefault()
    if (foodCount <= 0 || phase !== 'idle') return
    const pos = getEventPos(e)
    dragOffset.current = { x: pos.x - foodPos.x, y: pos.y - foodPos.y }
    setIsDragging(true)
    setPhase('dragging')
  }, [foodCount, phase, foodPos])

  const handleMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    const pos = getEventPos(e)
    const newX = pos.x - dragOffset.current.x
    const newY = pos.y - dragOffset.current.y
    setFoodPos({ x: newX, y: newY })
    setMouthOpen(isNearMouth(newX, newY))
  }, [isDragging])

  const handleEnd = useCallback((e) => {
    if (!isDragging) return
    setIsDragging(false)
    const pos = getEventPos(e.changedTouches ? { ...e, clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY } : e)
    const dropped = isNearMouth(foodPos.x, foodPos.y)
    if (dropped) {
      setPhase('eating')
      setCatState('eat')
      setMouthOpen(false)
      setTimeout(() => {
        setCatState('happy')
        setPhase('done')
        setTimeout(() => onDone(25), 800)
      }, 1200)
    } else {
      setMouthOpen(false)
      setFoodPos({ x: 60, y: 220 })
      setPhase('idle')
    }
  }, [isDragging, foodPos, onDone])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-start bg-gradient-to-b from-orange-100 to-yellow-50"
      style={{ zIndex: 65 }}
      onMouseMove={handleMove} onMouseUp={handleEnd}
      onTouchMove={handleMove} onTouchEnd={handleEnd}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 text-gray-600 text-lg shadow">
          ✕
        </button>
        <div className="font-black text-orange-700 text-lg">🍖 Годуємо котика!</div>
        <div className="w-9" />
      </div>

      {/* Instruction */}
      <div className="text-center text-sm text-orange-600 font-semibold px-4 mb-1">
        {phase === 'idle' && 'Перетягни їжу в рот котику'}
        {phase === 'dragging' && (mouthOpen ? '😸 Кидай!' : 'Веди до рота...')}
        {phase === 'eating' && 'Ням-ням! 😋'}
        {phase === 'done' && '✅ Котик наївся!'}
      </div>

      {/* Cat + food area */}
      <div ref={containerRef} className="relative w-full flex-1"
        style={{ touchAction: 'none', userSelect: 'none' }}>

        {/* Cat — centered */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 20 }}>
          <CatSprite
            state={catState}
            mouthOpen={mouthOpen || phase === 'eating'}
            size={160}
          />
        </div>

        {/* Mouth target indicator */}
        {phase === 'dragging' && (
          <div
            className={`absolute rounded-full pointer-events-none transition-all ${mouthOpen ? 'opacity-80' : 'opacity-30'}`}
            style={{
              left: MOUTH_X_MIN + (MOUTH_X_MAX - MOUTH_X_MIN) / 2,
              top: MOUTH_Y_MIN + (MOUTH_Y_MAX - MOUTH_Y_MIN) / 2,
              width: MOUTH_X_MAX - MOUTH_X_MIN,
              height: MOUTH_Y_MAX - MOUTH_Y_MIN,
              transform: 'translate(-50%,-50%)',
              background: mouthOpen ? 'rgba(255,100,100,0.25)' : 'rgba(255,200,100,0.15)',
              border: `2px dashed ${mouthOpen ? '#ff6464' : '#ffaa40'}`,
            }}
          />
        )}

        {/* Food item — draggable */}
        {phase !== 'eating' && phase !== 'done' && (
          <div
            className="absolute flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none"
            style={{
              left: foodPos.x,
              top: foodPos.y,
              transform: 'translate(-50%,-50%)',
              zIndex: 10,
              filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none',
              transition: isDragging ? 'none' : 'all 0.3s ease',
            }}
            onMouseDown={handleFoodStart}
            onTouchStart={handleFoodStart}
          >
            <div style={{ fontSize: 48, lineHeight: 1 }}>🍖</div>
            {!isDragging && (
              <div className="text-xs text-orange-500 font-bold bg-white/80 rounded-full px-2 py-0.5 shadow">
                ×{foodCount} тягни!
              </div>
            )}
          </div>
        )}

        {/* Done overlay */}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 mt-44">
              <div className="text-5xl">😻</div>
              <div className="text-2xl font-black text-green-600 bg-white rounded-2xl px-6 py-3 shadow-lg">
                +25 ситість!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
