import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRive } from '@rive-app/react-canvas'
import { supabase } from '../lib/supabase'
import KitchenRoom from './rooms/KitchenRoom'
import LivingRoom from './rooms/LivingRoom'
import BedroomRoom from './rooms/BedroomRoom'
import BathroomRoom from './rooms/BathroomRoom'
import PetShop from './PetShop'
import TicTacToe from './games/TicTacToe'
import Checkers from './games/Checkers'

// ── Constants ─────────────────────────────────────────────────────────────────
const ROOMS = [
  { id: 'kitchen',  label: 'Кухня',    emoji: '🍳' },
  { id: 'living',   label: 'Вітальня', emoji: '📺' },
  { id: 'bedroom',  label: 'Спальня',  emoji: '🛏️' },
  { id: 'bathroom', label: 'Ванна',    emoji: '🛁' },
]

const HUNGER_DECAY  = 5
const HAPPY_DECAY   = 3
const CLEAN_DECAY   = 2
const ENERGY_DECAY  = 2

const DEFAULT_PET = {
  hunger: 80, happiness: 80, cleanliness: 80, energy: 80,
  foodCount: 3, foodPremium: 0, toyCount: 2, toyPremium: 0,
  ownedOutfits: ['default'], activeOutfit: 'default',
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
  if (pet.energy      < 20) return 'sleepy'
  if (pet.hunger      < 20) return 'hangry'
  if (pet.cleanliness < 20) return 'crying'
  if (pet.happiness   < 20) return 'angry'
  return 'idle'
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({ emoji, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-base w-6 text-center leading-none">{emoji}</span>
      <div className="flex-1 bg-white/20 rounded-full h-2.5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] text-white/70 font-bold w-7 text-right">{Math.round(value)}</span>
    </div>
  )
}

// ── Rive cat — renders at the floor level ─────────────────────────────────────
function PetCat({ onPet, petAnim }) {
  const { RiveComponent } = useRive({
    src: '/cat.riv',
    stateMachine: 'State Machine 1',
    autoplay: true,
  })

  return (
    <div className="relative w-full h-full cursor-pointer select-none" onClick={onPet}>
      <RiveComponent className="w-full h-full" />
      {petAnim && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl pointer-events-none select-none"
          style={{ animation: 'floatUp 0.9s ease-out forwards' }}>
          {petAnim}
        </div>
      )}
    </div>
  )
}

// ── Brush teeth mini-game: swipe the toothbrush ───────────────────────────────
function BrushGame({ onDone }) {
  const [brushX, setBrushX] = useState(60)
  const [strokes, setStrokes] = useState(0)
  const [done, setDone] = useState(false)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const containerRef = useRef(null)

  const needed = 8

  const handleStart = (e) => {
    dragging.current = true
    lastX.current = e.touches ? e.touches[0].clientX : e.clientX
  }
  const handleMove = (e) => {
    if (!dragging.current) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const dx = x - lastX.current
    lastX.current = x
    setBrushX(prev => Math.max(10, Math.min(280, prev + dx)))
    if (Math.abs(dx) > 3) {
      setStrokes(s => {
        const next = s + 1
        if (next >= needed && !done) {
          setDone(true)
          setTimeout(onDone, 600)
        }
        return next
      })
    }
  }
  const handleEnd = () => { dragging.current = false }

  const progress = Math.min(strokes / needed, 1)

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60"
      style={{ zIndex: 65 }}
      onMouseMove={handleMove} onMouseUp={handleEnd}
      onTouchMove={handleMove} onTouchEnd={handleEnd}>
      <div ref={containerRef}
        className="bg-white rounded-3xl p-6 mx-4 shadow-2xl w-80 select-none">
        <div className="text-center text-2xl font-black mb-1">🦷 Чистимо зуби!</div>
        <div className="text-center text-sm text-gray-500 mb-4">Води щіткою туди-сюди</div>

        {/* Progress */}
        <div className="bg-gray-100 rounded-full h-3 mb-5 overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg,#4FC3F7,#00B8D9)' }} />
        </div>

        {/* Brush area */}
        <div className="relative h-24 bg-gradient-to-b from-blue-50 to-blue-100 rounded-2xl overflow-hidden mb-4"
          onMouseDown={handleStart} onTouchStart={handleStart}
          style={{ touchAction: 'none', cursor: 'ew-resize' }}>
          {/* Teeth */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-6 h-8 bg-white rounded-b-lg border border-gray-200" />
            ))}
          </div>
          {/* Toothbrush */}
          <div className="absolute top-4 transition-none"
            style={{ left: brushX, transform: 'translateX(-50%)' }}>
            <div className="text-3xl" style={{ transform: 'rotate(90deg)' }}>🪥</div>
          </div>
          {done && (
            <div className="absolute inset-0 flex items-center justify-center text-2xl bg-blue-200/60 rounded-2xl">
              ✨ Блищить!
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400">{Math.round(progress * 100)}%</div>
      </div>
    </div>
  )
}

// ── Feed animation overlay ────────────────────────────────────────────────────
function FeedAnimation({ onDone }) {
  const [phase, setPhase] = useState(0) // 0=show, 1=eating, 2=done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(onDone, 1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end"
      style={{ paddingBottom: '120px', zIndex: 20 }}>
      {phase === 0 && (
        <div className="text-6xl" style={{ animation: 'dropDown 0.3s ease-out' }}>🍖</div>
      )}
      {phase === 1 && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl" style={{ animation: 'shake 0.2s infinite' }}>😸</div>
          <div className="text-5xl">🍖</div>
        </div>
      )}
      {phase === 2 && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-4xl">😸</div>
          <div className="text-2xl font-black text-white bg-green-500 rounded-full px-4 py-1">+25 ситість!</div>
        </div>
      )}
    </div>
  )
}

// ── Bath animation overlay ────────────────────────────────────────────────────
function BathAnimation({ onDone }) {
  const [bubbles] = useState(() =>
    [...Array(12)].map((_, i) => ({
      x: 20 + Math.random() * 60,
      delay: Math.random() * 0.8,
      size: 16 + Math.random() * 14,
    }))
  )

  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 20 }}>
      {bubbles.map((b, i) => (
        <div key={i} className="absolute rounded-full border-2 border-blue-300 bg-blue-100/40"
          style={{
            left: `${b.x}%`, bottom: '80px',
            width: b.size, height: b.size,
            animation: `rise ${1.5 + b.delay}s ease-out ${b.delay}s forwards`,
          }} />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-3xl font-black text-white bg-cyan-500 rounded-2xl px-5 py-3 shadow-lg"
          style={{ animation: 'fadeInScale 0.4s ease-out' }}>
          🛁 Купаємося!
        </div>
      </div>
    </div>
  )
}

// ── PetRoom ───────────────────────────────────────────────────────────────────
export default function PetRoom({ user, onClose }) {
  const [room, setRoom] = useState('kitchen')
  const [pet, setPet] = useState(DEFAULT_PET)
  const [petAnim, setPetAnim]     = useState(null)
  const [transition, setTransition] = useState(false)
  const [toast, setToast]         = useState(null)
  const [showShop, setShowShop]   = useState(false)
  const [showGame, setShowGame]   = useState(null)
  const [showBrush, setShowBrush] = useState(false)
  const [showFeed, setShowFeed]   = useState(false)
  const [showBath, setShowBath]   = useState(false)
  const [dbLoaded, setDbLoaded]   = useState(false)
  const storageKey = `pet_${user?.id || 'guest'}`
  const saveTimerRef = useRef(null)

  // ── Load pet ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      try {
        const { data } = await supabase.rpc('get_or_create_pet', {
          p_child_id: user.id,
          p_family_id: user.family_id,
        })
        if (data?.length > 0) {
          const r = data[0]
          setPet(calcDecay({
            hunger: r.hunger, happiness: r.happiness,
            cleanliness: r.cleanliness, energy: r.energy,
            foodCount: r.food_basic, foodPremium: r.food_premium,
            toyCount: r.toy_basic,  toyPremium:  r.toy_premium,
            ownedOutfits: r.owned_outfits || ['default'],
            activeOutfit: r.active_outfit || 'default',
            lastUpdated: new Date(r.last_updated).getTime(),
          }))
          setDbLoaded(true)
          return
        }
      } catch { /* ignore */ }
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) setPet(calcDecay(JSON.parse(saved)))
      } catch { /* ignore */ }
    }
    load()
  }, [user?.id, user?.family_id, storageKey])

  // ── Save pet ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(pet)) } catch { /* ignore */ }
    if (!user?.id || !dbLoaded) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      supabase.rpc('update_pet_stats', {
        p_child_id: user.id,
        p_hunger: Math.round(pet.hunger), p_happiness: Math.round(pet.happiness),
        p_cleanliness: Math.round(pet.cleanliness), p_energy: Math.round(pet.energy),
        p_food_basic: pet.foodCount, p_food_premium: pet.foodPremium || 0,
        p_toy_basic: pet.toyCount, p_toy_premium: pet.toyPremium || 0,
      }).then(() => {}, () => {})
    }, 3000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [pet, storageKey, user?.id, dbLoaded])

  // ── Passive decay every 30s ───────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setPet(p => calcDecay(p)), 30_000)
    return () => clearInterval(id)
  }, [])

  const mood = petMoodFromStats(pet)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleFeed = useCallback(() => {
    if (pet.foodCount <= 0) { showToast('Їжа закінчилась! Зароби більше балів 🐾'); return }
    setShowFeed(true)
  }, [pet.foodCount])

  const confirmFed = useCallback(() => {
    setPet(p => ({
      ...p, hunger: clamp(p.hunger + 25), happiness: clamp(p.happiness + 5),
      foodCount: p.foodCount - 1, lastUpdated: Date.now(),
    }))
    setShowFeed(false)
  }, [])

  const handlePlay = useCallback(() => {
    if (pet.toyCount <= 0) { showToast('Іграшки закінчились! 🐾'); return }
    setPet(p => ({
      ...p, happiness: clamp(p.happiness + 20), energy: clamp(p.energy - 10),
      toyCount: p.toyCount - 1, lastUpdated: Date.now(),
    }))
    setPetAnim('🎉')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Пограли! 🎉 +20 радість')
  }, [pet.toyCount])

  const handleSleep = useCallback(() => {
    setPet(p => ({ ...p, energy: clamp(p.energy + 30), lastUpdated: Date.now() }))
    setPetAnim('💤')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Солодкі сни! 💤 +30 енергія')
  }, [])

  const handleBrushTeeth = useCallback(() => {
    setShowBrush(true)
  }, [])

  const confirmBrushed = useCallback(() => {
    setPet(p => ({
      ...p, cleanliness: clamp(p.cleanliness + 20), happiness: clamp(p.happiness + 5),
      lastUpdated: Date.now(),
    }))
    setShowBrush(false)
    setPetAnim('✨')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Зуби блищать! ✨ +20 чистота')
  }, [])

  const handleBath = useCallback(() => {
    setShowBath(true)
  }, [])

  const confirmBathed = useCallback(() => {
    setPet(p => ({
      ...p, cleanliness: clamp(p.cleanliness + 35), happiness: clamp(p.happiness - 5),
      lastUpdated: Date.now(),
    }))
    setShowBath(false)
    setPetAnim('🚿')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Чистий та пухнастий! 🛁 +35 чистота')
  }, [])

  const handlePet = useCallback(() => {
    setPet(p => ({ ...p, happiness: clamp(p.happiness + 3), lastUpdated: Date.now() }))
    setPetAnim('❤️')
    setTimeout(() => setPetAnim(null), 900)
  }, [])

  const handleGameWin = useCallback((bonus = 15) => {
    setPet(p => ({ ...p, happiness: clamp(p.happiness + bonus), lastUpdated: Date.now() }))
    showToast(`Перемога! 🎉 +${bonus} радість`)
    setShowGame(null)
  }, [])

  const handleBuyItem = useCallback(async (item) => {
    const { error } = await supabase.rpc('buy_pet_item', { p_child_id: user.id, p_item_id: item.id })
    if (error) {
      if (error.message?.includes('insufficient_points')) showToast('Недостатньо балів 😿')
      else showToast('Помилка покупки')
      return false
    }
    const { data: rows } = await supabase.rpc('get_or_create_pet', { p_child_id: user.id, p_family_id: user.family_id })
    if (rows?.[0]) {
      const r = rows[0]
      setPet(p => ({ ...p, foodCount: r.food_basic, foodPremium: r.food_premium, toyCount: r.toy_basic, toyPremium: r.toy_premium, ownedOutfits: r.owned_outfits || ['default'], activeOutfit: r.active_outfit || 'default' }))
    }
    showToast(`Куплено: ${item.name} ${item.emoji}`)
    return true
  }, [user?.id, user?.family_id])

  const handleEquipOutfit = useCallback(async (outfitId) => {
    await supabase.rpc('equip_pet_outfit', { p_child_id: user.id, p_outfit_id: outfitId }).then(() => {}, () => {})
    setPet(p => ({ ...p, activeOutfit: outfitId }))
    showToast('Образ змінено! ✨')
  }, [user?.id])

  const changeRoom = (id) => {
    if (id === room) return
    setTransition(true)
    setTimeout(() => { setRoom(id); setTransition(false) }, 180)
  }

  // Room floor y-position as % of the SVG viewBox (0-600)
  // All rooms use y=420 as the floor line in a 390×600 viewBox
  // The room renders at aspect ratio 390/600 ≈ 0.65 of container width
  // Cat should sit with feet touching the floor line

  // Determine which actions are available per room
  const roomActions = {
    kitchen:  [
      { icon: '🍖', label: 'Годувати', action: handleFeed, disabled: pet.foodCount <= 0, badge: pet.foodCount },
    ],
    living:   [
      { icon: '🎾', label: 'Іграшка', action: handlePlay, disabled: pet.toyCount <= 0, badge: pet.toyCount },
    ],
    bedroom:  [
      { icon: '💤', label: 'Спати',   action: handleSleep },
    ],
    bathroom: [
      { icon: '🦷', label: 'Зуби',    action: handleBrushTeeth },
      { icon: '🛁', label: 'Купатись', action: handleBath },
    ],
  }

  const moodBubble = { hangry: '😾', sleepy: '😴', crying: '😿', angry: '😤' }[mood]

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden"
      style={{ zIndex: 50, fontFamily: "'Nunito', sans-serif" }}>

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateX(-50%) translateY(0) scale(1); opacity:1 }
          100% { transform: translateX(-50%) translateY(-80px) scale(1.3); opacity:0 }
        }
        @keyframes shake {
          0%,100% { transform: rotate(-5deg) }
          50%      { transform: rotate(5deg) }
        }
        @keyframes rise {
          0%   { transform: translateY(0) scale(1); opacity:0.8 }
          100% { transform: translateY(-200px) scale(0.3); opacity:0 }
        }
        @keyframes fadeInScale {
          0%   { transform: scale(0.7); opacity:0 }
          100% { transform: scale(1); opacity:1 }
        }
        @keyframes dropDown {
          0%   { transform: translateY(-30px); opacity:0 }
          100% { transform: translateY(0); opacity:1 }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4) }
          50%      { box-shadow: 0 0 0 8px rgba(139,92,246,0) }
        }
      `}</style>

      {/* ── Overlays ── */}
      {showShop && (
        <PetShop user={user} pet={pet} onBuy={handleBuyItem} onEquip={handleEquipOutfit} onClose={() => setShowShop(false)} />
      )}
      {showGame === 'tictactoe' && (
        <TicTacToe onWin={handleGameWin} onClose={() => setShowGame(null)} />
      )}
      {showGame === 'checkers' && (
        <Checkers onWin={handleGameWin} onClose={() => setShowGame(null)} />
      )}
      {showBrush && <BrushGame onDone={confirmBrushed} />}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-700 safe-top flex-shrink-0">
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white text-lg active:scale-90">
          ←
        </button>
        <div className="text-white font-black tracking-wide">🐾 Мій котик</div>
        <button onClick={() => setShowShop(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white text-xl active:scale-90"
          title="Магазин">
          🛍️
        </button>
      </div>

      {/* ── Status bars ── */}
      <div className="bg-gradient-to-b from-purple-700 to-purple-600 px-4 pb-3 pt-1 flex-shrink-0">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <StatusBar emoji="🍖" value={pet.hunger}      color="linear-gradient(90deg,#FF8C42,#FFB347)"/>
          <StatusBar emoji="😸" value={pet.happiness}   color="linear-gradient(90deg,#FF6B9D,#FF8FAB)"/>
          <StatusBar emoji="🛁" value={pet.cleanliness} color="linear-gradient(90deg,#4FC3F7,#87CEEB)"/>
          <StatusBar emoji="⚡" value={pet.energy}      color="linear-gradient(90deg,#FFD700,#FFEE55)"/>
        </div>
        {/* Inventory row */}
        <div className="flex gap-3 mt-2.5 justify-center">
          <div className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1">
            <span className="text-sm">🍖</span>
            <span className="text-white font-black text-sm">{pet.foodCount}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1">
            <span className="text-sm">🎾</span>
            <span className="text-white font-black text-sm">{pet.toyCount}</span>
          </div>
          {pet.activeOutfit !== 'default' && (
            <div className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1">
              <span className="text-sm">👑</span>
              <span className="text-white font-black text-xs">{pet.activeOutfit.replace('outfit_','')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main room area ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Room background */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${transition ? 'opacity-0' : 'opacity-100'}`}>
          {room === 'kitchen'  && <KitchenRoom  onFeedPet={handleFeed} foodCount={pet.foodCount} petState={mood}/>}
          {room === 'living'   && <LivingRoom   onPlayToy={handlePlay} toyCount={pet.toyCount} petMood={mood}
                                                onPlayTicTacToe={() => setShowGame('tictactoe')}
                                                onPlayCheckers={() => setShowGame('checkers')}/>}
          {room === 'bedroom'  && <BedroomRoom  onSleep={handleSleep} petState={mood}/>}
          {room === 'bathroom' && <BathroomRoom onBrushTeeth={handleBrushTeeth} onBath={handleBath} cleanlinessLevel={pet.cleanliness}/>}
        </div>

        {/* Cat — positioned at floor level
            The SVG viewBox is 390×600; floor starts at y=420 = 70% height.
            The cat container's bottom should sit at 70% from top of the room area.
            Cat size: ~30% of room width, centered horizontally. */}
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none"
          style={{ bottom: '0', paddingBottom: '70%', transform: 'translateY(50%)' }}>
          {/* We want cat bottom at 70% of container height (floor line).
              Use: position bottom at 30% of room (= 100% - 70%), subtract half cat height */}
        </div>

        {/* Simpler: absolute, bottom calculated from floor line */}
        {/* Floor is at y=420 in 600px SVG = 30% from bottom of SVG.
            Room height = flex-1, which we can't know statically.
            Use bottom: 28% to approximate floor position across phone sizes. */}
        <div className="absolute left-0 right-0 flex justify-center"
          style={{ bottom: '28%' }}>
          <div className="relative pointer-events-auto"
            style={{ width: '38vw', height: '38vw', maxWidth: 170, maxHeight: 170 }}>
            <PetCat onPet={handlePet} petAnim={petAnim} />
            {/* Mood bubble */}
            {moodBubble && (
              <div className="absolute -top-2 -right-2 text-2xl pointer-events-none"
                style={{ animation: 'shake 1s infinite' }}>
                {moodBubble}
              </div>
            )}
            {/* Shadow under cat */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20"
              style={{ width: '60%', height: 8, filter: 'blur(4px)' }} />
          </div>
        </div>

        {/* Feed animation */}
        {showFeed && <FeedAnimation onDone={confirmFed} />}
        {/* Bath animation */}
        {showBath && <BathAnimation onDone={confirmBathed} />}

        {/* Toast */}
        {toast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/75 text-white text-sm px-5 py-2.5 rounded-full font-bold whitespace-nowrap shadow-lg"
            style={{ zIndex: 25, animation: 'fadeInScale 0.3s ease-out' }}>
            {toast}
          </div>
        )}
      </div>

      {/* ── Action buttons for current room ── */}
      <div className="bg-black/80 px-4 py-2.5 flex-shrink-0">
        <div className="flex gap-2 justify-center">
          {(roomActions[room] || []).map((act, i) => (
            <button key={i} onClick={act.action} disabled={act.disabled}
              className={`flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-90 relative
                ${act.disabled
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white shadow-lg'
                }`}
              style={!act.disabled ? { animation: 'pulseGlow 2s infinite' } : {}}>
              <span className="text-xl leading-none">{act.icon}</span>
              <span className="text-xs">{act.label}</span>
              {act.badge !== undefined && act.badge > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-400 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                  {act.badge}
                </div>
              )}
            </button>
          ))}
          {/* Pet button always visible */}
          <button onClick={handlePet}
            className="flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl font-black text-sm bg-pink-500 text-white shadow-lg active:scale-90">
            <span className="text-xl leading-none">🐾</span>
            <span className="text-xs">Погладити</span>
          </button>
        </div>
      </div>

      {/* ── Room navigation ── */}
      <div className="bg-white border-t border-gray-100 safe-bottom flex-shrink-0">
        <div className="flex">
          {ROOMS.map(r => (
            <button key={r.id} onClick={() => changeRoom(r.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all active:scale-90
                ${room === r.id ? 'bg-violet-50 text-violet-600' : 'text-gray-400'}`}>
              <span className="text-xl leading-none">{r.emoji}</span>
              <span className={`text-[9px] font-bold ${room === r.id ? 'text-violet-600' : 'text-gray-400'}`}>
                {r.label}
              </span>
              {room === r.id && <div className="w-1 h-1 rounded-full bg-violet-600"/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
