import React, { useState, useEffect, useRef } from 'react'
import CatSprite from '../CatSprite'

/**
 * SleepGame — tap to tuck in the cat, hold progress bar to put to sleep
 * Simple: tap the bed button, progress bar fills over 3s, auto-completes
 */
export default function SleepGame({ onDone, onClose }) {
  const [phase, setPhase] = useState('idle') // idle → tucking → sleeping → done
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)

  const handleTuck = () => {
    if (phase !== 'idle') return
    setPhase('tucking')
  }

  useEffect(() => {
    if (phase === 'tucking') {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + (100 / 30) // fills in 3s at 100ms ticks
          if (next >= 100) {
            clearInterval(intervalRef.current)
            setPhase('sleeping')
            setTimeout(() => {
              setPhase('done')
              setTimeout(() => onDone(15), 1000)
            }, 1500)
            return 100
          }
          return next
        })
      }, 100)
    }
    return () => clearInterval(intervalRef.current)
  }, [phase, onDone])

  const catState = phase === 'sleeping' || phase === 'done' ? 'sleep' : phase === 'tucking' ? 'happy' : 'idle'

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-start bg-gradient-to-b from-indigo-200 to-purple-100"
      style={{ zIndex: 65 }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 text-gray-600 text-lg shadow">
          ✕
        </button>
        <div className="font-black text-indigo-700 text-lg">😴 Вкладаємо котика!</div>
        <div className="w-9" />
      </div>

      {/* Stars decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['✦','✧','★','✦','✧','✦','★'].map((s, i) => (
          <div key={i} className="absolute text-indigo-300 opacity-50" style={{
            left: `${10 + i * 13}%`,
            top: `${8 + (i % 3) * 12}%`,
            fontSize: 12 + (i % 3) * 6,
            animation: `pulse ${1.5 + i * 0.2}s ease-in-out infinite alternate`,
          }}>{s}</div>
        ))}
      </div>

      {/* Instruction */}
      <div className="text-center text-sm text-indigo-600 font-semibold px-4 mb-2 z-10">
        {phase === 'idle' && 'Натисни, щоб вкласти котика спати 🌙'}
        {phase === 'tucking' && '🛏️ Вкладаємо...'}
        {phase === 'sleeping' && '💤 Котик солодко спить!'}
        {phase === 'done' && '✅ Добраніч, котику!'}
      </div>

      {/* Cat — centered */}
      <div className="relative z-10 mt-4">
        <CatSprite state={catState} size={160} />
      </div>

      {/* Bed / sleep area */}
      <div className="relative z-10 w-full px-10 mt-4">
        {/* Progress bar */}
        {phase === 'tucking' && (
          <div className="mb-4">
            <div className="h-4 bg-indigo-100 rounded-full overflow-hidden border border-indigo-200">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-xs text-indigo-500 font-bold mt-1">
              Засинає... {Math.round(progress)}%
            </div>
          </div>
        )}

        {/* Tuck-in button */}
        {phase === 'idle' && (
          <button
            onClick={handleTuck}
            className="w-full py-4 rounded-2xl text-white text-lg font-black shadow-lg active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            🛏️ Вкласти спати
          </button>
        )}

        {/* Moon decoration */}
        {(phase === 'sleeping' || phase === 'done') && (
          <div className="flex justify-center gap-4 text-4xl mt-2">
            <span>🌙</span>
            <span>⭐</span>
            <span>🌙</span>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="mt-4 text-center">
            <div className="text-2xl font-black text-indigo-600 bg-white rounded-2xl px-6 py-3 shadow-lg inline-block">
              +15 відпочинок!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
