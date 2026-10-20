import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const REACTION_EMOJIS = ['❤️', '⭐', '👏', '🔥', '😍']

// ── helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60) return 'щойно'
  if (diff < 3600) return `${Math.floor(diff / 60)} хв тому`
  if (diff < 86400) return `${Math.floor(diff / 3600)} год тому`
  return `${Math.floor(diff / 86400)} д тому`
}

function totalReactions(reactions) {
  if (!reactions) return 0
  return Object.values(reactions).reduce((s, arr) => s + (arr?.length || 0), 0)
}

// ── AvatarDisplay — emoji or photo ───────────────────────────────────────────
export function AvatarDisplay({ user, size = 'md' }) {
  const cls = {
    sm: 'w-8 h-8 text-xl rounded-xl',
    md: 'w-10 h-10 text-2xl rounded-xl',
    lg: 'w-14 h-14 text-3xl rounded-2xl',
  }[size] || 'w-10 h-10 text-2xl rounded-xl'

  const hasPhoto = user?.avatar_url?.startsWith('http')
  return (
    <div className={`${cls} flex items-center justify-center bg-violet-50 overflow-hidden flex-shrink-0`}>
      {hasPhoto
        ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
        : <span>{user?.avatar_emoji || '🌟'}</span>
      }
    </div>
  )
}

// ── FeedItem ──────────────────────────────────────────────────────────────────
// Props:
//   item          — activity_feed row (with `.users` join)
//   currentUserId — UUID of the logged-in user
//   canReact      — bool: true for parents, false for children
//   onReacted     — (updatedReactions) => void  called after optimistic update
export default function FeedItem({ item, currentUserId, canReact = false, onReacted }) {
  const [reactions, setReactions] = useState(item.reactions || {})
  const [bursting, setBursting] = useState(null)   // emoji currently animating
  const [loading, setLoading] = useState(false)

  // ── event label map ────────────────────────────────────────────────────────
  const p = item.payload || {}
  const evtMap = {
    task_submitted:      { emoji: '📋', text: `Відправив на перевірку "${p.task_title || ''}"` },
    task_approved:       { emoji: '✅', text: `Виконав "${p.task_title || ''}" (+${p.points || 0} ⭐)` },
    reward_purchased:    { emoji: '🎁', text: `Купив "${p.reward_title || ''}" (${p.points_spent || 0} ⭐)` },
    points_exchanged:    { emoji: '💰', text: `Обміняв ${p.points_spent || 0} ⭐ на ${p.money_amount || 0} ${p.currency || ''}` },
    challenge_completed: { emoji: '🏆', text: `Завершив челендж "${p.challenge_title || ''}"` },
  }
  const evt = evtMap[item.event_type] || { emoji: '🌟', text: item.event_type }

  // ── toggle reaction ────────────────────────────────────────────────────────
  const toggle = async (emoji) => {
    if (!canReact || loading) return
    setLoading(true)

    // Optimistic update
    const prev = reactions
    const users = reactions[emoji] || []
    const alreadyReacted = users.includes(currentUserId)
    let next
    if (alreadyReacted) {
      const filtered = users.filter(u => u !== currentUserId)
      next = { ...reactions }
      if (filtered.length === 0) delete next[emoji]
      else next[emoji] = filtered
    } else {
      next = { ...reactions, [emoji]: [...users, currentUserId] }
    }
    setReactions(next)
    if (!alreadyReacted) {
      setBursting(emoji)
      setTimeout(() => setBursting(null), 600)
    }

    try {
      const { data, error } = await supabase.rpc('toggle_reaction', {
        p_feed_id: item.id,
        p_user_id: currentUserId,
        p_emoji: emoji,
      })
      if (error) throw error
      setReactions(data || next)
      onReacted?.(data || next)
    } catch {
      setReactions(prev) // rollback
    } finally {
      setLoading(false)
    }
  }

  const total = totalReactions(reactions)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Top row: avatar + name + time */}
      <div className="flex items-start gap-3">
        <AvatarDisplay user={item.users} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="font-black text-gray-800 text-sm">{item.users?.display_name || 'Дитина'}</span>
            <span className="text-lg">{evt.emoji}</span>
          </div>
          <div className="text-sm text-gray-600 leading-snug">{evt.text}</div>
          <div className="text-xs text-gray-400 mt-0.5">{timeAgo(item.created_at)}</div>
        </div>
      </div>

      {/* Existing reactions summary (visible to everyone) */}
      {total > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 ml-13">
          {Object.entries(reactions).map(([emoji, users]) =>
            users?.length > 0 ? (
              <div key={emoji}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold transition-all
                  ${users.includes(currentUserId)
                    ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                    : 'bg-gray-100 text-gray-600'
                  } ${bursting === emoji ? 'scale-125' : 'scale-100'}`}>
                <span>{emoji}</span>
                <span className="text-xs">{users.length}</span>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Reaction buttons (parents only) */}
      {canReact && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          {REACTION_EMOJIS.map(emoji => {
            const users = reactions[emoji] || []
            const active = users.includes(currentUserId)
            return (
              <button key={emoji} type="button" onClick={() => toggle(emoji)}
                disabled={loading}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-lg transition-all active:scale-90
                  ${active
                    ? 'bg-violet-100 ring-2 ring-violet-400 scale-110'
                    : 'bg-gray-50 hover:bg-gray-100'
                  } ${bursting === emoji ? 'animate-bounce' : ''}`}>
                {emoji}
                {users.length > 0 && (
                  <span className={`text-xs font-bold ${active ? 'text-violet-600' : 'text-gray-500'}`}>
                    {users.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
