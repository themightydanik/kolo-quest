import React, { useState, useRef, useCallback } from 'react'
import CatSprite from '../CatSprite'

/**
 * BrushGame — drag toothbrush back and forth across cat's teeth
 * Counts direction changes (strokes). Need 6 strokes to complete.
 */
export default function BrushGame({ onDone, onClose }) {
  const [brushPos, setBrushPos] = useState({ x: 80, y: 260 })
  const [isDragging, setIsDragging] = useState(false)
  const [strokes, setStrokes] = useState(0)
  const [phase, setPhase] = useState('idle') // idle → brushing → done
  const [catState, setCatState] = useState('brush')
  const containerRef = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const lastDirection = useRef(null) // 'left' | 'right'
  const lastX = useRef(null)

  const REQUIRED_STROKES = 6
  // Teeth zone (horizontal band across cat's mouth area)
  const TEETH_Y_MIN = 145, TEETH_Y_MAX = 195
  const TEETH_X_MIN = 60, TEETH_X_MAX = 200

  const isOnTeeth = (x, y) =>
    x > TEETH_X_MIN && x < TEETH_X_MAX && y > TEETH_Y_MIN && y < TEETH_Y_MAX

  const getEventPos = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const handleBrushStart = useCallback((e) => {
    e.preventDefault()
    if (phase === 'done') return
    const pos = getEventPos(e)
    dragOffset.current = { x: pos.x - brushPos.x, y: pos.y - brushPos.y }
    lastX.current = pos.x
    setIsDragging(true)
    if (phase === 'idle') setPhase('brushing')
  }, [phase, brushPos])

  const handleMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    const pos = getEventPos(e)
    const newX = pos.x - dragOffset.current.x
    const newY = pos.y - dragOffset.current.y
    setBrushPos({ x: newX, y: newY })

    // Count strokes only when brush is over teeth
    if (isOnTeeth(newX, newY) && lastX.current !== null) {
      const dx = pos.x - lastX.current
      const dir = dx > 3 ? 'right' : dx < -3 ? 'left' : null
      if (dir && dir !== lastDirection.current) {
        lastDirection.current = dir
        setStrokes(s => {
          const next = s + 1
          if (next >= REQUIRED_STROKES) {
            setPhase('done')
            setCatState('happy')
            setIsDragging(false)
            setTimeout(() => onDone(20), 900)
          }
          return next
        })
      }
    }
    lastX.current = pos.x
  }, [isDragging, onDone])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    lastX.current = null
    lastDirection.current = null
  }, [])

  const progress = Math.min(strokes / REQUIRED_STROKES, 1)

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-start bg-gradient-to-b from-blue-100 to-cyan-50"
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
        <div className="font-black text-blue-700 text-lg">🪥 Чистимо зуби!</div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="w-full px-6 mb-1">
        <div className="flex justify-between text-xs font-bold text-blue-500 mb-1">
          <span>Чистота</span>
          <span>{strokes}/{REQUIRED_STROKES} рухів</span>
        </div>
        <div className="h-3 bg-blue-100 rounded-full overflow-hidden border border-blue-200">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center text-sm text-blue-600 font-semibold px-4 mb-1">
        {phase === 'idle' && 'Перетягни щіточку до рота і води туди-сюди!'}
        {phase === 'brushing' && (progress < 0.5 ? '🪥 Чисти зуби!' : progress < 1 ? '✨ Майже готово!' : '🦷 Супер!')}
        {phase === 'done' && '✅ Зуби чисті!'}
      </div>

      {/* Cat + brush area */}
      <div
        ref={containerRef}
        className="relative w-full flex-1"
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {/* Cat — always mouth open in brush mode */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 10 }}>
          <CatSprite
            state={catState}
            mouthOpen={true}
            size={170}
          />
        </div>

        {/* Teeth zone highlight when brush is near */}
        {phase === 'brushing' && isOnTeeth(brushPos.x, brushPos.y) && (
          <div
            className="absolute pointer-events-none rounded-lg"
            style={{
              left: TEETH_X_MIN,
              top: TEETH_Y_MIN,
              width: TEETH_X_MAX - TEETH_X_MIN,
              height: TEETH_Y_MAX - TEETH_Y_MIN,
              background: 'rgba(100,200,255,0.2)',
              border: '2px solid rgba(100,200,255,0.6)',
            }}
          />
        )}

        {/* Toothbrush — draggable */}
        {phase !== 'done' && (
          <div
            className="absolute select-none cursor-grab active:cursor-grabbing"
            style={{
              left: brushPos.x,
              top: brushPos.y,
              transform: 'translate(-50%, -50%) rotate(-30deg)',
              zIndex: 10,
              filter: isDragging ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' : 'none',
            }}
            onMouseDown={handleBrushStart}
            onTouchStart={handleBrushStart}
          >
            <div style={{ fontSize: 44, lineHeight: 1 }}>🪥</div>
          </div>
        )}

        {/* Sparkle effects when brushing on teeth */}
        {phase === 'brushing' && isOnTeeth(brushPos.x, brushPos.y) && (
          <div className="absolute pointer-events-none" style={{ left: brushPos.x - 20, top: brushPos.y - 20, fontSize: 18 }}>
            ✨
          </div>
        )}

        {/* Done overlay */}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 mt-48">
              <div className="text-5xl">😁</div>
              <div className="text-2xl font-black text-blue-600 bg-white rounded-2xl px-6 py-3 shadow-lg">
                +20 гігієна!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
