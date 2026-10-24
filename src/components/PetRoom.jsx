import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import CatSprite from './CatSprite'
import KitchenRoom from './rooms/KitchenRoom'
import LivingRoom from './rooms/LivingRoom'
import BedroomRoom from './rooms/BedroomRoom'
import BathroomRoom from './rooms/BathroomRoom'
import PetShop from './PetShop'
import TicTacToe from './games/TicTacToe'
import Checkers from './games/Checkers'
import FeedGame from './games/FeedGame'
import BrushGame from './games/BrushGame'
import BathGame from './games/BathGame'
import SleepGame from './games/SleepGame'

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

// Derive cat animation state from pet stats
function catStateFromStats(pet) {
  if (pet.energy      < 20) return 'sleep'
  if (pet.hunger      < 20) return 'hangry'
  if (pet.cleanliness < 20) return 'sad'
  if (pet.happiness   < 30) return 'sad'
  if (pet.happiness   > 80 && pet.hunger > 70) return 'happy'
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

// ── PetRoom ───────────────────────────────────────────────────────────────────
export default function PetRoom({ user, onClose }) {
  const [room, setRoom] = useState('kitchen')
  const [pet, setPet] = useState(DEFAULT_PET)
  const [petAnim, setPetAnim]       = useState(null)   // floating emoji
  const [catState, setCatState]     = useState('idle') // CatSprite state
  const [catAction, setCatAction]   = useState(null)   // one-shot action
  const [transition, setTransition] = useState(false)
  const [toast, setToast]           = useState(null)
  const [showShop, setShowShop]     = useState(false)
  const [showGame, setShowGame]     = useState(null)   // 'tictactoe'|'checkers'
  const [activeGame, setActiveGame] = useState(null)   // 'feed'|'brush'|'bath'|'sleep'
  const [dbLoaded, setDbLoaded]     = useState(false)
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
          const loaded = calcDecay({
            hunger: r.hunger, happiness: r.happiness,
            cleanliness: r.cleanliness, energy: r.energy,
            foodCount: r.food_basic, foodPremium: r.food_premium,
            toyCount: r.toy_basic,  toyPremium:  r.toy_premium,
            ownedOutfits: r.owned_outfits || ['default'],
            activeOutfit: r.active_outfit || 'default',
            lastUpdated: new Date(r.last_updated).getTime(),
          })
          setPet(loaded)
          setCatState(catStateFromStats(loaded))
          setDbLoaded(true)
          return
        }
      } catch { /* ignore */ }
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const p = calcDecay(JSON.parse(saved))
          setPet(p)
          setCatState(catStateFromStats(p))
        }
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
    const id = setInterval(() => {
      setPet(p => {
        const next = calcDecay(p)
        setCatState(catStateFromStats(next))
        return next
      })
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const triggerCatReact = (state, duration = 1800) => {
    setCatState(state)
    setTimeout(() => setCatState(catStateFromStats(pet)), duration)
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleFeed = useCallback(() => {
    if (pet.foodCount <= 0) { showToast('Їжа закінчилась! Зароби більше балів 🐾'); return }
    setActiveGame('feed')
  }, [pet.foodCount])

  const confirmFed = useCallback((points = 25) => {
    setPet(p => ({
      ...p, hunger: clamp(p.hunger + 25), happiness: clamp(p.happiness + 5),
      foodCount: p.foodCount - 1, lastUpdated: Date.now(),
    }))
    setActiveGame(null)
    triggerCatReact('happy', 2000)
    setPetAnim('🍖')
    setTimeout(() => setPetAnim(null), 900)
    showToast(`+25 ситість! 😋`)
  }, [pet])

  const handlePlay = useCallback(() => {
    if (pet.toyCount <= 0) { showToast('Іграшки закінчились! 🐾'); return }
    setPet(p => ({
      ...p, happiness: clamp(p.happiness + 20), energy: clamp(p.energy - 10),
      toyCount: p.toyCount - 1, lastUpdated: Date.now(),
    }))
    triggerCatReact('excited', 1800)
    setPetAnim('🎉')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Пограли! 🎉 +20 радість')
  }, [pet.toyCount])

  const handleSleep = useCallback(() => {
    setActiveGame('sleep')
  }, [])

  const confirmSlept = useCallback((points = 15) => {
    setPet(p => ({ ...p, energy: clamp(p.energy + 30), lastUpdated: Date.now() }))
    setActiveGame(null)
    triggerCatReact('happy', 2000)
    setPetAnim('💤')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Солодкі сни! 💤 +30 енергія')
  }, [])

  const handleBrushTeeth = useCallback(() => {
    setActiveGame('brush')
  }, [])

  const confirmBrushed = useCallback((points = 20) => {
    setPet(p => ({
      ...p, cleanliness: clamp(p.cleanliness + 20), happiness: clamp(p.happiness + 5),
      lastUpdated: Date.now(),
    }))
    setActiveGame(null)
    triggerCatReact('happy', 2000)
    setPetAnim('✨')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Зуби блищать! ✨ +20 чистота')
  }, [])

  const handleBath = useCallback(() => {
    setActiveGame('bath')
  }, [])

  const confirmBathed = useCallback((points = 20) => {
    setPet(p => ({
      ...p, cleanliness: clamp(p.cleanliness + 35), happiness: clamp(p.happiness - 5),
      lastUpdated: Date.now(),
    }))
    setActiveGame(null)
    triggerCatReact('happy', 2500)
    setPetAnim('🚿')
    setTimeout(() => setPetAnim(null), 900)
    showToast('Чистий та пухнастий! 🛁 +35 чистота')
  }, [])

  const handlePet = useCallback(() => {
    setPet(p => ({ ...p, happiness: clamp(p.happiness + 3), lastUpdated: Date.now() }))
    triggerCatReact('pet', 1200)
    setPetAnim('❤️')
    setTimeout(() => setPetAnim(null), 900)
  }, [])

  const handleGameWin = useCallback((bonus = 15) => {
    setPet(p => ({ ...p, happiness: clamp(p.happiness + bonus), lastUpdated: Date.now() }))
    triggerCatReact('excited', 2000)
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

  // Room actions
  const roomActions = {
    kitchen:  [
      { icon: '🍖', label: 'Годувати',  action: handleFeed,        disabled: pet.foodCount <= 0, badge: pet.foodCount },
    ],
    living:   [
      { icon: '🎾', label: 'Іграшка',   action: handlePlay,        disabled: pet.toyCount <= 0,  badge: pet.toyCount },
    ],
    bedroom:  [
      { icon: '💤', label: 'Спати',     action: handleSleep },
    ],
    bathroom: [
      { icon: '🦷', label: 'Зуби',      action: handleBrushTeeth },
      { icon: '🛁', label: 'Купатись',  action: handleBath },
    ],
  }

  // Games accessible from living room only via room prop
  const livingGames = room === 'living' ? [
    { icon: '❌⭕', label: 'Хрестики',  action: () => setShowGame('tictactoe') },
    { icon: '♟️',   label: 'Шашки',    action: () => setShowGame('checkers') },
  ] : []

  const allActions = [...(roomActions[room] || []), ...livingGames]

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden"
      style={{ zIndex: 50, fontFamily: "'Nunito', sans-serif" }}>

      {/* ── CSS ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateX(-50%) translateY(0) scale(1); opacity:1 }
          100% { transform: translateX(-50%) translateY(-80px) scale(1.3); opacity:0 }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.4) }
          50%      { box-shadow: 0 0 0 8px rgba(139,92,246,0) }
        }
        @keyframes fadeInScale {
          0%   { transform: scale(0.7); opacity:0 }
          100% { transform: scale(1); opacity:1 }
        }
      `}</style>

      {/* ── Game overlays (full screen) ── */}
      {showShop && (
        <PetShop user={user} pet={pet} onBuy={handleBuyItem} onEquip={handleEquipOutfit} onClose={() => setShowShop(false)} />
      )}
      {showGame === 'tictactoe' && (
        <TicTacToe onWin={handleGameWin} onClose={() => setShowGame(null)} />
      )}
      {showGame === 'checkers' && (
        <Checkers onWin={handleGameWin} onClose={() => setShowGame(null)} />
      )}
      {activeGame === 'feed' && (
        <FeedGame onDone={confirmFed} onClose={() => setActiveGame(null)} foodCount={pet.foodCount} />
      )}
      {activeGame === 'brush' && (
        <BrushGame onDone={confirmBrushed} onClose={() => setActiveGame(null)} />
      )}
      {activeGame === 'bath' && (
        <BathGame onDone={confirmBathed} onClose={() => setActiveGame(null)} />
      )}
      {activeGame === 'sleep' && (
        <SleepGame onDone={confirmSlept} onClose={() => setActiveGame(null)} />
      )}

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
          {room === 'kitchen'  && <KitchenRoom  onFeedPet={handleFeed} foodCount={pet.foodCount} petState={catState}/>}
          {room === 'living'   && <LivingRoom   onPlayToy={handlePlay} toyCount={pet.toyCount} petMood={catState}
                                                onPlayTicTacToe={() => setShowGame('tictactoe')}
                                                onPlayCheckers={() => setShowGame('checkers')}/>}
          {room === 'bedroom'  && <BedroomRoom  onSleep={handleSleep} petState={catState}/>}
          {room === 'bathroom' && <BathroomRoom onBrushTeeth={handleBrushTeeth} onBath={handleBath} cleanlinessLevel={pet.cleanliness}/>}
        </div>

        {/* ── SVG Cat — sits at floor line (≈28% from bottom) ── */}
        <div
          className="absolute left-0 right-0 flex justify-center pointer-events-auto"
          style={{ bottom: '28%' }}
        >
          <div className="relative" style={{ width: 140, height: 140 }}>
            {/* Shadow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20"
              style={{ width: '65%', height: 10, filter: 'blur(5px)' }} />

            {/* Cat */}
            <CatSprite
              state={catState}
              action={catAction}
              size={140}
              onPet={handlePet}
            />

            {/* Floating anim emoji */}
            {petAnim && (
              <div
                className="absolute top-0 left-1/2 text-3xl pointer-events-none select-none"
                style={{ animation: 'floatUp 0.9s ease-out forwards' }}
              >
                {petAnim}
              </div>
            )}
          </div>
        </div>

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
        <div className="flex gap-2 justify-center flex-wrap">
          {allActions.map((act, i) => (
            <button key={i} onClick={act.action} disabled={act.disabled}
              className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-90 relative
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
            className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl font-black text-sm bg-pink-500 text-white shadow-lg active:scale-90">
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
