import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { supabase } from '../lib/supabase'
import KitchenRoom from './rooms/KitchenRoom'
import LivingRoom from './rooms/LivingRoom'
import BedroomRoom from './rooms/BedroomRoom'
import BathroomRoom from './rooms/BathroomRoom'

// ── Constants ─────────────────────────────────────────────────────────────────
const ROOMS = [
  { id: 'kitchen',  label: 'Кухня',    emoji: '🍳' },
  { id: 'living',   label: 'Вітальня', emoji: '📺' },
  { id: 'bedroom',  label: 'Спальня',  emoji: '🛏️' },
  { id: 'bathroom', label: 'Ванна',    emoji: '🛁' },
]

const HUNGER_DECAY  = 5   // points per minute
const HAPPY_DECAY   = 3
const CLEAN_DECAY   = 2
const ENERGY_DECAY  = 2

const DEFAULT_PET = {
  hunger:      80,
  happiness:   80,
  cleanliness: 80,
  energy:      80,
  foodCount:   3,
  toyCount:    2,
  lastUpdated: Date.now(),
}

function clamp(v, min = 0, max = 100) { return Math.max(min, Math.min(max, v)) }

function calcDecay(pet) {
  const mins = (Date.now() - pet.lastUpdated) / 60000
  return {
    ...pet,
    hunger:      clamp(pet.hunger      - HUNGER_DECAY  * mins),
    happiness:   clamp(pet.happiness   - HAPPY_DECAY   * mins),
    cleanliness: clamp(pet.cleanliness - CLEAN_DECAY   * mins),
    energy:      clamp(pet.energy      - ENERGY_DECAY  * mins),
    lastUpdated: Date.now(),
  }
}

function petMoodFromStats(pet) {
  if (pet.energy < 20)      return 'sleepy'
  if (pet.hunger < 20)      return 'hangry'
  if (pet.cleanliness < 20) return 'crying'
  if (pet.happiness < 20)   return 'angry'
  if (pet.hunger > 80 && pet.happiness > 80) return 'idle'
  return 'idle'
}

// ── StatusBar ─────────────────────────────────────────────────────────────────
function StatusBar({ label, emoji, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-7 text-center">{emoji}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{Math.round(value)}%</span>
    </div>
  )
}

// ── PetRive ───────────────────────────────────────────────────────────────────
function PetRive({ mood, onPet }) {
  const { RiveComponent, rive } = useRive({
    src: '/cat.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    onLoad: () => { /* rive loaded */ },
  })

  // Map our mood → Rive animation name
  const moodMap = {
    idle:    'animIdle',
    hangry:  'animHangry',
    sleepy:  'animSleepy',
    crying:  'animCrying',
    angry:   'animAngry',
  }

  // Rive animations are driven by the file's own state machine;
  // we can fire triggers if the SM has named inputs
  useEffect(() => {
    if (!rive) return
    // Try to switch animation directly (fallback if SM doesn't accept triggers)
    try {
      const sm = rive.stateMachineInputs('State Machine 1')
      // The cat pomodoro file uses its own internal logic; we just let it play
    } catch (e) { /* ignore */ }
  }, [rive, mood])

  return (
    <div
      className="relative w-full h-full cursor-pointer select-none"
      onClick={onPet}
    >
      <RiveComponent className="w-full h-full" />
      {/* Touch hint */}
      <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white/60 pointer-events-none">
        торкнись, щоб погладити 🐾
      </div>
    </div>
  )
}

// ── PetRoom ───────────────────────────────────────────────────────────────────
export default function PetRoom({ user, onClose }) {
  const [room, setRoom] = useState('kitchen')
  const [pet, setPet] = useState(DEFAULT_PET)
  const [petAnim, setPetAnim]   = useState(null) // floating action animation
  const [transition, setTransition] = useState(false)
  const [justFed, setJustFed]   = useState(false)
  const [toast, setToast]       = useState(null)
  const storageKey = `pet_${user?.id || 'guest'}`

  // ── Load / save pet state ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setPet(calcDecay(parsed)) // apply offline decay
      }
    } catch { /* ignore */ }
  }, [storageKey])

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(pet)) } catch { /* ignore */ }
  }, [pet, storageKey])

  // ── Passive decay every 30s ────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setPet(p => calcDecay(p))
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const mood = petMoodFromStats(pet)

  // ── Show toast ──────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleFeed = useCallback(() => {
    if (pet.foodCount <= 0) { showToast('Їжа закінчилась! Зароби більше балів 🐾'); return }
    setPet(p => ({
      ...p,
      hunger:    clamp(p.hunger + 25),
      happiness: clamp(p.happiness + 5),
      foodCount: p.foodCount - 1,
      lastUpdated: Date.now(),
    }))
    setJustFed(true)
    setTimeout(() => setJustFed(false), 1500)
    showToast('Ням-ням! 😸 +25 ситість')
  }, [pet.foodCount])

  const handlePlay = useCallback(() => {
    if (pet.toyCount <= 0) { showToast('Іграшки закінчились! 🐾'); return }
    setPet(p => ({
      ...p,
      happiness: clamp(p.happiness + 20),
      energy:    clamp(p.energy    - 10),
      toyCount:  p.toyCount - 1,
      lastUpdated: Date.now(),
    }))
    showToast('Пограли! 🎉 +20 радість')
  }, [pet.toyCount])

  const handleSleep = useCallback(() => {
    setPet(p => ({
      ...p,
      energy:    clamp(p.energy + 30),
      lastUpdated: Date.now(),
    }))
    showToast('Солодкі сни! 💤 +30 енергія')
  }, [])

  const handleBrushTeeth = useCallback(() => {
    setPet(p => ({
      ...p,
      cleanliness: clamp(p.cleanliness + 20),
      happiness:   clamp(p.happiness   + 5),
      lastUpdated: Date.now(),
    }))
    showToast('Зуби блищать! ✨ +20 чистота')
  }, [])

  const handleBath = useCallback(() => {
    setPet(p => ({
      ...p,
      cleanliness: clamp(p.cleanliness + 35),
      happiness:   clamp(p.happiness   - 5), // cats hate water 😄
      lastUpdated: Date.now(),
    }))
    showToast('Чистий та пухнастий! 🛁')
  }, [])

  const handlePet = useCallback(() => {
    setPet(p => ({
      ...p,
      happiness: clamp(p.happiness + 3),
      lastUpdated: Date.now(),
    }))
    setPetAnim('❤️')
    setTimeout(() => setPetAnim(null), 900)
  }, [])

  // ── Room change transition ─────────────────────────────────────────────────
  const changeRoom = (id) => {
    if (id === room) return
    setTransition(true)
    setTimeout(() => {
      setRoom(id)
      setTransition(false)
    }, 180)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden"
         style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-700 safe-top">
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white text-lg active:scale-90">
          ←
        </button>
        <div className="text-white font-black text-lg tracking-wide">🐾 Мій питомець</div>
        <div className="w-9" />
      </div>

      {/* ── Status bars ── */}
      <div className="bg-gradient-to-b from-purple-700 to-purple-600 px-4 pb-3 pt-1 space-y-1.5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <StatusBar label="Ситість"  emoji="🍖" value={pet.hunger}      color="linear-gradient(90deg,#FF8C42,#FFB347)"/>
          <StatusBar label="Радість"  emoji="😸" value={pet.happiness}   color="linear-gradient(90deg,#FF6B9D,#FF8FAB)"/>
          <StatusBar label="Чистота"  emoji="🛁" value={pet.cleanliness} color="linear-gradient(90deg,#4FC3F7,#87CEEB)"/>
          <StatusBar label="Енергія"  emoji="⚡" value={pet.energy}      color="linear-gradient(90deg,#FFD700,#FFEE55)"/>
        </div>
      </div>

      {/* ── Main area: room + cat ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Room background */}
        <div className={`absolute inset-0 transition-opacity duration-180 ${transition ? 'opacity-0' : 'opacity-100'}`}>
          {room === 'kitchen'  && <KitchenRoom  onFeedPet={handleFeed}        foodCount={pet.foodCount} petState={mood}/>}
          {room === 'living'   && <LivingRoom   onPlayToy={handlePlay}         toyCount={pet.toyCount}  petMood={mood}/>}
          {room === 'bedroom'  && <BedroomRoom  onSleep={handleSleep}                                   petState={mood}/>}
          {room === 'bathroom' && <BathroomRoom onBrushTeeth={handleBrushTeeth} onBath={handleBath}     cleanlinessLevel={pet.cleanliness}/>}
        </div>

        {/* Cat character — floats in the middle-bottom of room */}
        <div className={`absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none`}
             style={{ bottom: '72px' }}>
          <div className="relative w-52 h-52 pointer-events-auto">
            <PetRive mood={mood} onPet={handlePet} />
            {/* Floating heart on pet */}
            {petAnim && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl animate-bounce pointer-events-none select-none">
                {petAnim}
              </div>
            )}
            {/* Mood bubble */}
            {mood !== 'idle' && (
              <div className="absolute -top-3 -right-3 text-2xl animate-bounce pointer-events-none">
                {mood === 'hangry'  ? '😾' :
                 mood === 'sleepy'  ? '😴' :
                 mood === 'crying'  ? '😿' :
                 mood === 'angry'   ? '😤' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Toast notification */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 text-white text-sm px-5 py-2.5 rounded-full font-bold whitespace-nowrap shadow-lg animate-fade-in z-10">
            {toast}
          </div>
        )}

        {/* Inventory indicators */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <div className="bg-black/40 backdrop-blur-sm text-white text-xs rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
            <span>🍖</span><span className="font-bold">{pet.foodCount}</span>
          </div>
          <div className="bg-black/40 backdrop-blur-sm text-white text-xs rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
            <span>🎾</span><span className="font-bold">{pet.toyCount}</span>
          </div>
        </div>
      </div>

      {/* ── Room navigation ── */}
      <div className="bg-white border-t border-gray-100 safe-bottom">
        <div className="flex">
          {ROOMS.map(r => (
            <button
              key={r.id}
              onClick={() => changeRoom(r.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all active:scale-90
                ${room === r.id
                  ? 'bg-violet-50 text-violet-600'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <span className="text-2xl leading-none">{r.emoji}</span>
              <span className={`text-[10px] font-bold ${room === r.id ? 'text-violet-600' : 'text-gray-400'}`}>
                {r.label}
              </span>
              {room === r.id && (
                <div className="w-1 h-1 rounded-full bg-violet-600 mt-0.5"/>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
