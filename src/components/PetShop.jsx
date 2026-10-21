import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORY_TABS = [
  { id: 'food',    label: 'Їжа',      emoji: '🍖' },
  { id: 'toy',     label: 'Іграшки',  emoji: '🧶' },
  { id: 'outfit',  label: 'Образи',   emoji: '👑' },
]

export default function PetShop({ user, pet, onBuy, onEquip, onClose }) {
  const [tab, setTab]       = useState('food')
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [childPoints, setChildPoints] = useState(0)
  const [buying, setBuying] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [{ data: shopItems }, { data: child }] = await Promise.all([
        supabase.from('pet_shop_items').select('*').order('sort_order'),
        supabase.from('users').select('points').eq('id', user.id).single(),
      ])
      setItems(shopItems || [])
      setChildPoints(child?.points || 0)
      setLoading(false)
    }
    load()
  }, [user?.id])

  const handleBuy = async (item) => {
    setBuying(item.id)
    const ok = await onBuy(item)
    if (ok) {
      setChildPoints(p => p - item.price)
    }
    setBuying(null)
  }

  const filtered = items.filter(i => i.category === tab)

  const isOwned = (item) => {
    if (item.category === 'outfit') {
      return (pet.ownedOutfits || ['default']).includes(item.id)
    }
    return false
  }

  const isEquipped = (item) => pet.activeOutfit === item.id

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-gradient-to-b from-violet-900 to-purple-900"
         style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white text-lg active:scale-90">
          ←
        </button>
        <div className="text-white font-black text-lg">🛍️ Магазин</div>
        <div className="bg-yellow-400 rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="text-lg">⭐</span>
          <span className="font-black text-gray-900 text-sm">{childPoints}</span>
        </div>
      </div>

      {/* Inventory summary */}
      <div className="flex gap-3 px-4 py-2 bg-black/10">
        <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
          <span className="text-sm">🍖</span>
          <span className="text-white text-xs font-bold">{pet.foodCount || 0} базова</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
          <span className="text-sm">🐟</span>
          <span className="text-white text-xs font-bold">{pet.foodPremium || 0} преміум</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
          <span className="text-sm">🧶</span>
          <span className="text-white text-xs font-bold">{pet.toyCount || 0} іграшок</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-white/10">
        {CATEGORY_TABS.map(cat => (
          <button key={cat.id}
            onClick={() => setTab(cat.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all
              ${tab === cat.id ? 'bg-white/15 border-b-2 border-yellow-400' : 'opacity-60'}`}>
            <span className="text-xl">{cat.emoji}</span>
            <span className="text-white text-[10px] font-bold">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-white/60">Завантаження...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => {
              const owned = isOwned(item)
              const equipped = isEquipped(item)
              const canAfford = childPoints >= item.price
              const isBuying = buying === item.id

              return (
                <div key={item.id}
                  className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-2
                    ${owned ? 'border border-yellow-400/50' : 'border border-white/10'}`}>
                  {/* Emoji */}
                  <div className="text-5xl leading-none">{item.emoji}</div>
                  {/* Name */}
                  <div className="text-white font-bold text-sm text-center leading-tight">{item.name}</div>
                  {/* Description */}
                  {item.description && (
                    <div className="text-white/50 text-[10px] text-center leading-tight">{item.description}</div>
                  )}
                  {/* Stat boost pills */}
                  {item.stat_boost && Object.keys(item.stat_boost).length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {Object.entries(item.stat_boost).map(([stat, val]) => (
                        <span key={stat}
                          className="bg-white/20 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold">
                          {val > 0 ? '+' : ''}{val} {stat === 'hunger' ? '🍖' : stat === 'happiness' ? '😸' : stat === 'energy' ? '⚡' : '🛁'}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Action button */}
                  {item.category === 'outfit' ? (
                    owned ? (
                      equipped ? (
                        <div className="w-full bg-yellow-400/30 text-yellow-300 text-xs font-black py-1.5 rounded-xl text-center">
                          ✓ Одягнено
                        </div>
                      ) : (
                        <button onClick={() => onEquip(item.id)}
                          className="w-full bg-violet-500 text-white text-xs font-black py-1.5 rounded-xl active:scale-95">
                          Одягнути
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => !isBuying && handleBuy(item)}
                        disabled={!canAfford || isBuying}
                        className={`w-full text-xs font-black py-1.5 rounded-xl active:scale-95 flex items-center justify-center gap-1
                          ${canAfford ? 'bg-yellow-400 text-gray-900' : 'bg-white/10 text-white/30'}`}>
                        {isBuying ? '...' : <><span>⭐</span>{item.price}</>}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => !isBuying && handleBuy(item)}
                      disabled={isBuying || (item.price === 0)}
                      className={`w-full text-xs font-black py-1.5 rounded-xl active:scale-95 flex items-center justify-center gap-1
                        ${item.price === 0
                          ? 'bg-green-500/40 text-green-200 cursor-default'
                          : canAfford
                            ? 'bg-yellow-400 text-gray-900'
                            : 'bg-white/10 text-white/30'
                        }`}>
                      {isBuying
                        ? '...'
                        : item.price === 0
                          ? 'Безкоштовно'
                          : <><span>⭐</span>{item.price}</>}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="px-4 py-3 bg-black/20 text-center text-white/40 text-xs">
        Зароби ⭐ балів виконуючи завдання від батьків
      </div>
    </div>
  )
}
