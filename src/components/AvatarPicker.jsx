import React, { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Emoji catalogue ────────────────────────────────────────────────────────────
export const EMOJI_CATS = {
  '🐾 Тваринки': [
    '🦊','🐱','🐶','🐸','🦄','🐼','🐨','🦁','🐯','🐻','🦋','🐙',
    '🐬','🦝','🐺','🦅','🐉','🦖','🐧','🦆','🐢','🐠','🦈','🐝',
    '🦊','🐮','🐷','🐸','🦒','🦓','🐘','🦏','🦛','🐑','🐐','🦌',
  ],
  '👤 Людини': [
    '👨','👩','🧑','👦','👧','🧒','👴','👵','🧓',
    '👨‍💼','👩‍💼','👨‍🎓','👩‍🎓','👨‍🍳','👩‍🍳','👨‍🚀','👩‍🚀',
    '🧑‍🎨','🧑‍💻','🧑‍🚒','🧑‍⚕️','🦸','🦹','🧙','🧜','🧝',
  ],
  '😀 Смайли': [
    '😀','😄','😎','🤩','🥳','😇','🤓','😍','🥰','😜',
    '🤗','😏','🧐','🤠','👻','🤖','👽','🐵','🙈','🎃',
  ],
  '🎯 Ігри': [
    '⭐','🌟','💫','✨','🏆','🥇','🎯','🎮','🎲','🎸',
    '🚀','🛸','⚡','🔥','💎','👑','🎪','🎨','🎭','🎬',
  ],
}

export const ALL_EMOJIS = Object.values(EMOJI_CATS).flat()

// ── AvatarPicker ──────────────────────────────────────────────────────────────
// Props:
//   value: string (current emoji or photo URL starting with http)
//   onChange: (newValue: string) => void  — emoji string OR photo URL
//   userId: string (Supabase user id, for photo upload path)
//   size?: 'sm' | 'md' | 'lg'   default 'md'
//   allowPhoto?: bool   default true
export default function AvatarPicker({ value, onChange, userId, size = 'md', allowPhoto = true }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(Object.keys(EMOJI_CATS)[0])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef(null)

  const isPhoto = value?.startsWith('http') || value?.startsWith('blob')

  const sizeMap = {
    sm: { outer: 'text-2xl w-10 h-10', preview: 'text-4xl', btn: 'text-xl p-1.5' },
    md: { outer: 'text-4xl w-16 h-16', preview: 'text-6xl', btn: 'text-2xl p-2' },
    lg: { outer: 'text-5xl w-20 h-20', preview: 'text-7xl', btn: 'text-3xl p-2.5' },
  }
  const sz = sizeMap[size] || sizeMap.md

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    // Validate
    if (!file.type.startsWith('image/')) { setUploadError('Тільки зображення'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Максимум 5 МБ'); return }

    setUploading(true)
    try {
      // Path: avatars/{userId}/avatar.jpg (overwrites on update)
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/avatar.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (upErr) throw upErr

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = data.publicUrl + '?t=' + Date.now() // cache-bust
      onChange(url)
      setOpen(false)
    } catch (err) {
      setUploadError(err.message?.includes('bucket') ? 'Bucket "avatars" не створено у Supabase' : 'Помилка завантаження')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="relative">
      {/* Current avatar — click to open picker */}
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`${sz.outer} rounded-2xl flex items-center justify-center bg-violet-50 border-2 border-violet-200 hover:border-violet-500 transition-all overflow-hidden relative group`}>
        {isPhoto
          ? <img src={value} alt="avatar" className="w-full h-full object-cover" />
          : <span>{value || '🦊'}</span>
        }
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs font-black">✏️</span>
        </div>
      </button>

      {/* Dropdown picker */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-500 px-5 pt-5 pb-4 flex justify-between items-center">
              <div>
                <div className="text-white font-black text-lg">Вибір аватару</div>
                <div className="text-violet-200 text-xs">Обери емодзі або завантаж фото</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-2xl">✕</button>
            </div>

            {/* Preview */}
            <div className="flex justify-center py-4 bg-gray-50 border-b border-gray-100">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-violet-200">
                {isPhoto
                  ? <img src={value} alt="preview" className="w-full h-full object-cover" />
                  : <span className={sz.preview}>{value || '🦊'}</span>
                }
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex overflow-x-auto gap-1 px-3 pt-3 pb-1 border-b border-gray-100 scrollbar-hide">
              {Object.keys(EMOJI_CATS).map(cat => (
                <button key={cat} type="button" onClick={() => setActiveTab(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-black transition-all flex-shrink-0 ${
                    activeTab === cat ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="p-3 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
              {EMOJI_CATS[activeTab]?.map((em, i) => (
                <button key={em + i} type="button" onClick={() => { onChange(em); setOpen(false) }}
                  className={`${sz.btn} rounded-xl transition-all text-center ${
                    value === em ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'hover:bg-gray-100'
                  }`}>
                  {em}
                </button>
              ))}
            </div>

            {/* Photo upload */}
            {allowPhoto && userId && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-dashed border-violet-300 text-violet-600 font-bold text-sm hover:border-violet-500 hover:bg-violet-50 transition-all disabled:opacity-50">
                  {uploading ? '⏳ Завантаження...' : '📷 Завантажити своє фото'}
                </button>
                {uploadError && <p className="text-red-500 text-xs font-semibold mt-1.5 text-center">{uploadError}</p>}
                <p className="text-gray-400 text-xs text-center mt-1">JPG, PNG, до 5 МБ</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
