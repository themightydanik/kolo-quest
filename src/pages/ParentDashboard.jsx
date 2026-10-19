import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '../lib/auth'
import { useLang, LanguageSwitcher } from '../i18n/index'
import { supabase } from '../lib/supabase'
import TaskCard from '../components/TaskCard'

// ── Add Task Modal ─────────────────────────────────────────────────────────────
function AddTaskModal({ children, familyId, onClose, onSaved, editTask }) {
  const { t } = useLang()
  const QUICK_POINTS = [5, 10, 20, 50]
  const [title, setTitle] = useState(editTask?.title || '')
  const [description, setDescription] = useState(editTask?.description || '')
  const [criteria, setCriteria] = useState(editTask?.criteria || '')
  const [points, setPoints] = useState(editTask?.points ?? 10)
  const [assignedTo, setAssignedTo] = useState(editTask?.assigned_to || (children[0]?.id || ''))
  const [isMandatory, setIsMandatory] = useState(editTask?.is_mandatory || false)
  const [penaltyPoints, setPenaltyPoints] = useState(editTask?.penalty_points || 0)
  const [isRecurring, setIsRecurring] = useState(editTask?.is_recurring || false)
  const [recurringType, setRecurringType] = useState(editTask?.recurring_type || 'daily')
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      criteria: criteria.trim() || null,
      points: Number(points),
      assigned_to: assignedTo,
      family_id: familyId,
      is_mandatory: isMandatory,
      penalty_points: isMandatory ? Number(penaltyPoints) : 0,
      is_recurring: isRecurring,
      recurring_type: isRecurring ? recurringType : null,
      status: 'active',
      updated_at: new Date().toISOString(),
    }
    if (editTask) {
      await supabase.from('tasks').update(payload).eq('id', editTask.id)
    } else {
      await supabase.from('tasks').insert({ ...payload, created_at: new Date().toISOString() })
    }
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="gradient-purple text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">{editTask ? t.editTask : '📋 Нове завдання'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskTitle}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" placeholder={t.taskTitlePlaceholder || 'Назва завдання'} />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">Для кого</label>
            <div className="flex flex-wrap gap-2">
              {children.map(c => (
                <button key={c.id} type="button" onClick={() => setAssignedTo(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${assignedTo === c.id ? 'gradient-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {c.avatar_emoji} {c.display_name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">Балів ⭐</label>
            <div className="flex gap-2 mb-2">
              {QUICK_POINTS.map(qp => (
                <button key={qp} type="button" onClick={() => setPoints(qp)}
                  className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${Number(points) === qp ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{qp}</button>
              ))}
            </div>
            <input type="number" min="1" max="500" value={points} onChange={e => setPoints(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskDescription || 'Опис'} <span className="text-gray-300 font-semibold">(необов'язково)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskCriteria || 'Критерії виконання'} <span className="text-gray-300 font-semibold">(необов'язково)</span></label>
            <textarea value={criteria} onChange={e => setCriteria(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 resize-none" />
          </div>
          {/* Mandatory toggle */}
          <div className="bg-red-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-gray-700">🔴 Обов'язкове завдання</span>
              <div onClick={() => setIsMandatory(!isMandatory)}
                className={`w-12 h-6 rounded-full transition-all cursor-pointer ${isMandatory ? 'bg-red-500' : 'bg-gray-200'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${isMandatory ? 'translate-x-6' : ''}`} />
              </div>
            </div>
            {isMandatory && (
              <div>
                <label className="block text-sm font-black text-red-500 mb-1">{t.penaltyPoints || 'Штраф балів'}</label>
                <input type="number" min="0" max="100" value={penaltyPoints} onChange={e => setPenaltyPoints(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-red-200 focus:border-red-400 focus:outline-none font-semibold text-gray-700" />
              </div>
            )}
          </div>
          {/* Recurring toggle */}
          <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-gray-700">📅 Повторюване завдання</span>
              <div onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-6 rounded-full transition-all cursor-pointer ${isRecurring ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${isRecurring ? 'translate-x-6' : ''}`} />
              </div>
            </div>
            {isRecurring && (
              <div className="flex gap-2">
                {[['daily','Щодня'],['weekdays','Будні (Пн–Пт)'],['weekends','Вихідні (Сб–Нд)']].map(([v, label]) => (
                  <button key={v} type="button" onClick={() => setRecurringType(v)}
                    className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${recurringType === v ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-2 border-blue-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Reminders */}
          <div className="bg-yellow-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-black text-gray-700">🔔 Нагадування</span>
            </div>
            <button type="button"
              className="w-full py-2.5 rounded-xl font-black text-sm bg-white border-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50">
              Увімкнути сповіщення
            </button>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl font-black border-2 border-gray-200 text-gray-500 hover:bg-gray-50">
              Скасувати
            </button>
            <button type="submit" disabled={loading || !title.trim() || !assignedTo}
              className="flex-1 gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50">
              {loading ? '...' : '🚀 Створити!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add Reward Modal ───────────────────────────────────────────────────────────
function AddRewardModal({ familyId, onClose, onSaved, editReward }) {
  const { t } = useLang()
  const EMOJIS = ['🎮','🍕','🎬','🎡','🎪','🍦','🎯','🎨','📚','🛍️','🎠','🌟','🍔','🎂','🏀','⚽','🎵','🧸','🦄','🚀','🎁']
  const CATEGORIES = ['Розваги','Їжа','Враження','Екрани','Творчість','Спорт','Читання','Інше']
  const QUICK_COSTS = [20, 50, 100, 200]
  const [title, setTitle] = useState(editReward?.title || '')
  const [emoji, setEmoji] = useState(editReward?.emoji || '🎁')
  const [points, setPoints] = useState(editReward?.points_cost ?? 50)
  const [category, setCategory] = useState(editReward?.category || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { title: title.trim(), emoji, points_cost: Number(points), family_id: familyId, active: true, category }
    if (editReward) {
      await supabase.from('rewards').update(payload).eq('id', editReward.id)
    } else {
      await supabase.from('rewards').insert({ ...payload, created_at: new Date().toISOString() })
    }
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">{editReward ? t.editReward : '🎁 Додати приз'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Назва призу</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">Категорія</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-sm transition-all ${category === cat ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">Емодзі</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === em ? 'bg-orange-100 ring-2 ring-orange-400 scale-110' : 'hover:bg-gray-100'}`}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">Вартість ⭐</label>
            <div className="flex gap-2 mb-2">
              {QUICK_COSTS.map(qp => (
                <button key={qp} type="button" onClick={() => setPoints(qp)}
                  className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${Number(points) === qp ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{qp}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="number" min="5" max="1000" value={points} onChange={e => setPoints(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none font-bold text-gray-700" />
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black rounded-2xl px-4 py-2 min-w-[80px] text-center">{points}⭐</div>
            </div>
          </div>
          <button type="submit" disabled={loading || !title.trim()}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50 text-lg">
            {loading ? '...' : (editReward ? t.saveChanges : '🎁 Додати!')}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Add Child Modal ────────────────────────────────────────────────────────────
function AddChildModal({ familyId, onClose, onSaved }) {
  const { t } = useLang()
  const EMOJIS = ['🦊','🐱','🐶','🐸','🦄','🐼','🐨','🦁','🐯','🐻','🦋','🐙']
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [emoji, setEmoji] = useState('🦊')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.rpc('create_child_account', {
      p_family_id: familyId,
      p_display_name: name.trim(),
      p_login: login.trim().toLowerCase(),
      p_password: password,
      p_avatar_emoji: emoji,
    })
    if (err) {
      setError(err.message?.includes('login_taken') ? (t.loginTaken || 'Логін вже зайнятий') : (t.accountCreateError || 'Помилка'))
      setLoading(false)
      return
    }
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="gradient-purple text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">{t.addChild}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">{t.childEmoji}</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === em ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'hover:bg-gray-100'}`}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.childName}</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.childLogin}</label>
            <input value={login} onChange={e => setLogin(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.childPassword}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          {error && <p className="text-red-500 font-semibold text-sm">{error}</p>}
          <button type="submit" disabled={loading || !name.trim() || !login.trim() || !password}
            className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50 text-lg">
            {loading ? '...' : t.addChild}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Add Challenge Modal ────────────────────────────────────────────────────────
function AddChallengeModal({ children, familyId, onClose, onSaved }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [emoji, setEmoji] = useState('🏆')
  const [bonusPoints, setBonusPoints] = useState(50)
  const [deadline, setDeadline] = useState('')
  const [assignedTo, setAssignedTo] = useState(children[0]?.id || '')
  const [subTasks, setSubTasks] = useState([{ title: '', points: 10 }])
  const [loading, setLoading] = useState(false)
  const EMOJIS = ['🏆','🎯','💪','🐱','⚽','✏️','📚','🎸','🎵','🚴','🏊','🤸','🌟','🦁','🚀','🎮']

  const addSubTask = () => setSubTasks(prev => [...prev, { title: '', points: 10 }])
  const updateSubTask = (i, field, val) => setSubTasks(prev => prev.map((st, idx) => idx === i ? { ...st, [field]: val } : st))
  const removeSubTask = (i) => setSubTasks(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: ch } = await supabase.from('challenges').insert({
      title: title.trim(),
      description: description.trim() || null,
      emoji,
      bonus_points: Number(bonusPoints),
      deadline: deadline || null,
      assigned_to: assignedTo,
      family_id: familyId,
      status: 'active',
    }).select().single()
    if (ch && subTasks.filter(st => st.title.trim()).length > 0) {
      await supabase.from('challenge_tasks').insert(
        subTasks.filter(st => st.title.trim()).map(st => ({
          challenge_id: ch.id,
          title: st.title.trim(),
          points: Number(st.points),
          total_reps: 1,
          done_reps: 0,
        }))
      )
    }
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">🏅 Додати челендж</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">Емодзі</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === em ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'hover:bg-gray-100'}`}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Назва</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Для кого</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 bg-white">
              {children.map(c => <option key={c.id} value={c.id}>{c.avatar_emoji} {c.display_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Бонус за виконання</label>
            <div className="flex items-center gap-3">
              <input type="range" min="10" max="500" step="10" value={bonusPoints} onChange={e => setBonusPoints(e.target.value)} className="flex-1 accent-violet-600" />
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black rounded-2xl px-4 py-2 min-w-[72px] text-center">{bonusPoints}⭐</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Дедлайн (необов'язково)</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">Завдання всередині</label>
            <div className="space-y-2">
              {subTasks.map((st, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={st.title} onChange={e => updateSubTask(i, 'title', e.target.value)}
                    placeholder={`Завдання ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:outline-none font-semibold text-sm" />
                  <input type="number" value={st.points} onChange={e => updateSubTask(i, 'points', e.target.value)} min="1" max="100"
                    className="w-16 px-2 py-2 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:outline-none font-bold text-sm text-center" />
                  {subTasks.length > 1 && (
                    <button type="button" onClick={() => removeSubTask(i)} className="text-red-400 hover:text-red-600 font-black">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addSubTask}
                className="w-full py-2 border-2 border-dashed border-violet-200 rounded-xl text-violet-400 font-black text-sm hover:border-violet-400 hover:text-violet-600">
                + Додати завдання
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading || !title.trim()}
            className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50">
            {loading ? '...' : '🏅 Створити челендж'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Edit Child Modal ───────────────────────────────────────────────────────────
function EditChildModal({ child, onClose, onSaved }) {
  const [name, setName] = useState(child.display_name || '')
  const [login, setLogin] = useState(child.login || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.rpc('update_child_credentials', {
      p_child_id: child.id,
      p_display_name: name || null,
      p_login: login || null,
      p_password: password || null,
    })
    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="gradient-purple text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">✏️ Редагувати дитину</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Ім'я</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Логін</label>
            <input value={login} onChange={e => setLogin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Новий пароль (залиш порожнім)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 disabled:opacity-50">
            {loading ? '...' : '💾 Зберегти'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── ChildProfile (in-tab view when clicking a child card) ─────────────────────
function ChildProfile({ child, tasks, feedItems, onBack, onEdit }) {
  const [subTab, setSubTab] = useState('tasks')
  const [statRange, setStatRange] = useState(7)

  const childTasks = tasks.filter(t => t.assigned_to === child.id)
  const childFeed = feedItems.filter(f => f.child_id === child.id)

  // Stats: completed tasks per day for last N days
  const statsData = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = statRange - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const label = d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'numeric' })
      const count = childFeed.filter(f => {
        if (f.event_type !== 'task_done') return false
        const fd = new Date(f.created_at)
        return fd.toDateString() === d.toDateString()
      }).length
      days.push({ label, count })
    }
    return days
  }, [childFeed, statRange])

  const maxCount = Math.max(...statsData.map(d => d.count), 1)

  const LEVEL_CONFIG = [
    { min: 0,    max: 99,   emoji: '🌱', name: 'Початківець' },
    { min: 100,  max: 299,  emoji: '⭐', name: 'Зірка' },
    { min: 300,  max: 699,  emoji: '🚀', name: 'Герой' },
    { min: 700,  max: 1499, emoji: '🏆', name: 'Чемпіон' },
    { min: 1500, max: Infinity, emoji: '👑', name: 'Легенда' },
  ]
  const totalPts = child.total_points_earned || 0
  const lvl = LEVEL_CONFIG.find(l => totalPts >= l.min && totalPts <= l.max) || LEVEL_CONFIG[0]
  const nextLvl = LEVEL_CONFIG[LEVEL_CONFIG.indexOf(lvl) + 1]
  const lvlProgress = nextLvl ? Math.round(((totalPts - lvl.min) / (nextLvl.min - lvl.min)) * 100) : 100

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-violet-600 font-black text-sm mb-4 active:opacity-70">
        ← Назад
      </button>

      {/* Child header card */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
        <div className="gradient-purple p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{child.avatar_emoji}</div>
            <div className="flex-1">
              <div className="font-black text-xl">{child.display_name}</div>
              <div className="text-violet-200 text-sm">@{child.login}</div>
              <div className="text-violet-100 text-xs mt-1">{lvl.emoji} {lvl.name}</div>
            </div>
            <button onClick={onEdit} className="bg-white/20 rounded-xl px-3 py-2 font-black text-sm">✏️</button>
          </div>
          {/* Level progress */}
          <div className="mt-3">
            <div className="bg-white/20 rounded-full h-2">
              <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${lvlProgress}%` }} />
            </div>
            {nextLvl && <div className="text-xs text-violet-200 mt-1">До {nextLvl.emoji} {nextLvl.name}: {nextLvl.min - totalPts}⭐</div>}
          </div>
        </div>
        {/* 3 stat tiles */}
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="py-4 text-center">
            <div className="font-black text-xl text-violet-700">⭐{child.points || 0}</div>
            <div className="text-xs text-gray-400 font-semibold">балів</div>
          </div>
          <div className="py-4 text-center">
            <div className="font-black text-xl text-green-600">{childTasks.filter(t => t.status === 'active').length}</div>
            <div className="text-xs text-gray-400 font-semibold">активних</div>
          </div>
          <div className="py-4 text-center">
            <div className="font-black text-xl text-blue-600">{childTasks.filter(t => t.status === 'done').length}</div>
            <div className="text-xs text-gray-400 font-semibold">виконано</div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
        {[{ id: 'tasks', label: '📋 Завдання' }, { id: 'stats', label: '📊 Статистика' }, { id: 'feed', label: '📰 Стрічка' }].map(st => (
          <button key={st.id} onClick={() => setSubTab(st.id)}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all ${subTab === st.id ? 'bg-white shadow text-violet-700' : 'text-gray-500'}`}>
            {st.label}
          </button>
        ))}
      </div>

      {/* Tasks sub-tab */}
      {subTab === 'tasks' && (
        <div className="space-y-3">
          {childTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p className="font-bold">Завдань ще немає</p>
            </div>
          )}
          {childTasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{task.emoji || '📌'}</span>
                <div className="flex-1">
                  <div className="font-black text-gray-800">{task.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">+{task.points_reward}⭐</div>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  task.status === 'done' ? 'bg-green-100 text-green-700' :
                  task.status === 'pending_approval' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'}`}>
                  {task.status === 'done' ? '✅ Готово' : task.status === 'pending_approval' ? '⏳ Перевірка' : '▶ Активне'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats sub-tab */}
      {subTab === 'stats' && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="font-black text-gray-800">Виконані завдання</div>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button onClick={() => setStatRange(7)} className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${statRange === 7 ? 'bg-white shadow text-violet-700' : 'text-gray-400'}`}>7д</button>
              <button onClick={() => setStatRange(30)} className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${statRange === 30 ? 'bg-white shadow text-violet-700' : 'text-gray-400'}`}>30д</button>
            </div>
          </div>
          {/* Bar chart */}
          <div className="flex items-end gap-1 h-32">
            {statsData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-black text-violet-700" style={{ opacity: d.count > 0 ? 1 : 0 }}>{d.count || ''}</div>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-500 to-pink-400 transition-all"
                  style={{ height: `${(d.count / maxCount) * 80 + (d.count > 0 ? 8 : 2)}px`, minHeight: '2px' }} />
                {statRange <= 7 && <div className="text-xs text-gray-400 font-semibold whitespace-nowrap" style={{ fontSize: '9px' }}>{d.label}</div>}
              </div>
            ))}
          </div>
          {statRange > 7 && (
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">{statsData[0]?.label}</span>
              <span className="text-xs text-gray-400">{statsData[statsData.length - 1]?.label}</span>
            </div>
          )}
          <div className="mt-4 bg-violet-50 rounded-xl p-3 text-center">
            <div className="font-black text-violet-700 text-lg">{statsData.reduce((a, d) => a + d.count, 0)}</div>
            <div className="text-xs text-gray-500">завдань за {statRange} днів</div>
          </div>
        </div>
      )}

      {/* Feed sub-tab */}
      {subTab === 'feed' && (
        <div className="space-y-2">
          {childFeed.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📰</div>
              <p className="font-bold">Активності ще немає</p>
            </div>
          )}
          {childFeed.map(f => (
            <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{f.event_type === 'task_done' ? '✅' : f.event_type === 'reward_purchased' ? '🎁' : f.event_type === 'points_added' ? '⭐' : '📝'}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-sm">{f.description || f.event_type}</div>
                  <div className="text-xs text-gray-400">{new Date(f.created_at).toLocaleDateString('uk-UA')} · {new Date(f.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {f.points_delta !== 0 && f.points_delta != null && (
                  <span className={`font-black text-sm ${f.points_delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {f.points_delta > 0 ? '+' : ''}{f.points_delta}⭐
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Onboarding (4 steps, shown when parent has 0 children) ────────────────────
function OnboardingFlow({ familyId, user, onComplete }) {
  const [step, setStep] = useState(0)
  // Step 0: Add child (reuse AddChildModal inline)
  const CHILD_EMOJIS = ['🦊','🐱','🐶','🐸','🦄','🐼','🐨','🦁','🐯','🐻','🦋','🐙']
  const [childName, setChildName] = useState('')
  const [childLogin, setChildLogin] = useState('')
  const [childPassword, setChildPassword] = useState('')
  const [childEmoji, setChildEmoji] = useState('🦊')
  const [childError, setChildError] = useState('')
  const [childLoading, setChildLoading] = useState(false)

  // Step 2: pocket money
  const [pocketEnabled, setPocketEnabled] = useState(false)
  const [currency, setCurrency] = useState('UAH')
  const [exchangeRate, setExchangeRate] = useState(4)
  const [monoJarId, setMonoJarId] = useState('')
  const [configSaving, setConfigSaving] = useState(false)

  const STEPS = [
    { emoji: '👶', title: 'Додай дитину', desc: 'Створи перший акаунт для дитини' },
    { emoji: '📋', title: 'Бібліотека завдань', desc: 'Ознайомся зі стандартними завданнями' },
    { emoji: '💰', title: 'Кишенькові гроші', desc: 'Налаштуй обмін зірок на гроші' },
    { emoji: '🎉', title: 'Все готово!', desc: 'Починайте квест разом!' },
  ]

  const handleAddChild = async () => {
    setChildError('')
    setChildLoading(true)
    const { data, error: err } = await supabase.rpc('create_child_account', {
      p_family_id: familyId,
      p_display_name: childName.trim(),
      p_login: childLogin.trim().toLowerCase(),
      p_password: childPassword,
      p_avatar_emoji: childEmoji,
    })
    if (err) {
      setChildError(err.message?.includes('login_taken') ? 'Логін вже зайнятий' : 'Помилка створення')
      setChildLoading(false)
      return
    }
    setChildLoading(false)
    setStep(1)
  }

  const handleSaveConfig = async () => {
    setConfigSaving(true)
    const payload = { family_id: familyId, pocket_money_enabled: pocketEnabled, currency, exchange_rate: Number(exchangeRate), mono_send_jar_id: monoJarId }
    const { data: existing } = await supabase.from('family_configs').select('id').eq('family_id', familyId).maybeSingle()
    if (existing) {
      await supabase.from('family_configs').update(payload).eq('family_id', familyId)
    } else {
      await supabase.from('family_configs').insert(payload)
    }
    setConfigSaving(false)
    setStep(3)
  }

  const currSym = { UAH: '₴', USD: '$', EUR: '€', PLN: 'zł' }[currency] || '₴'

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {STEPS.map((_, i) => (
          <div key={i} className={`rounded-full transition-all ${i === step ? 'w-8 h-3 bg-violet-600' : i < step ? 'w-3 h-3 bg-violet-300' : 'w-3 h-3 bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">

          {/* Step header */}
          <div className="gradient-purple text-white p-6 text-center">
            <div className="text-5xl mb-2">{STEPS[step].emoji}</div>
            <div className="font-black text-xl">{STEPS[step].title}</div>
            <div className="text-violet-200 text-sm mt-1">{STEPS[step].desc}</div>
          </div>

          <div className="p-6">

            {/* STEP 0 — Add child */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-gray-600 mb-2">Аватар</label>
                  <div className="flex flex-wrap gap-2">
                    {CHILD_EMOJIS.map(em => (
                      <button key={em} type="button" onClick={() => setChildEmoji(em)}
                        className={`text-2xl p-2 rounded-xl transition-all ${childEmoji === em ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'hover:bg-gray-100'}`}>{em}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-600 mb-1">Ім'я дитини</label>
                  <input value={childName} onChange={e => setChildName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold"
                    placeholder="Наприклад: Микита" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-600 mb-1">Логін</label>
                  <input value={childLogin} onChange={e => setChildLogin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold"
                    placeholder="mykyta123" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-600 mb-1">Пароль</label>
                  <input type="password" value={childPassword} onChange={e => setChildPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold" />
                </div>
                {childError && <p className="text-red-500 font-semibold text-sm">{childError}</p>}
                <button onClick={handleAddChild} disabled={childLoading || !childName.trim() || !childLogin.trim() || !childPassword}
                  className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl disabled:opacity-50 active:scale-95">
                  {childLoading ? '⏳...' : '➡️ Далі'}
                </button>
              </div>
            )}

            {/* STEP 1 — Task library info */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-gray-600 font-semibold text-sm">Ось кілька ідей завдань для початку:</p>
                {[
                  { emoji: '🛏️', title: 'Застелити ліжко', pts: 5 },
                  { emoji: '🍽️', title: 'Помити посуд', pts: 10 },
                  { emoji: '📚', title: 'Прочитати книгу 20 хв', pts: 15 },
                  { emoji: '🦷', title: 'Почистити зуби', pts: 5 },
                  { emoji: '🐕', title: 'Вигуляти собаку', pts: 10 },
                ].map(item => (
                  <div key={item.title} className="flex items-center gap-3 bg-violet-50 rounded-2xl px-4 py-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="flex-1 font-bold text-gray-800">{item.title}</span>
                    <span className="text-orange-500 font-black text-sm">+{item.pts}⭐</span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 font-semibold text-center pt-1">Завдання можна додати у вкладці «Завдання»</p>
                <button onClick={() => setStep(2)}
                  className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl active:scale-95">
                  ➡️ Далі
                </button>
              </div>
            )}

            {/* STEP 2 — Pocket money */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setPocketEnabled(!pocketEnabled)}
                    className={`w-12 h-6 rounded-full transition-all cursor-pointer ${pocketEnabled ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${pocketEnabled ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="font-black text-gray-700">Увімкнути обмін зірок на гроші</span>
                </label>
                {pocketEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-black text-gray-600 mb-1">Валюта</label>
                      <div className="flex gap-2">
                        {['UAH', 'USD', 'EUR', 'PLN'].map(c => (
                          <button key={c} type="button" onClick={() => setCurrency(c)}
                            className={`flex-1 py-2 rounded-xl font-black text-sm ${currency === c ? 'gradient-purple text-white' : 'bg-gray-100 text-gray-600'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-600 mb-1">Скільки ⭐ за 1 {currSym}</label>
                      <div className="flex items-center gap-3">
                        <input type="range" min="1" max="20" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="flex-1 accent-violet-600" />
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black rounded-xl px-4 py-2 min-w-[60px] text-center">{exchangeRate}</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-600 mb-1">Mono Jar ID (необов'язково)</label>
                      <input value={monoJarId} onChange={e => setMonoJarId(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-violet-400"
                        placeholder="jar/..." />
                    </div>
                  </>
                )}
                <button onClick={handleSaveConfig} disabled={configSaving}
                  className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl disabled:opacity-50 active:scale-95">
                  {configSaving ? '⏳...' : '➡️ Далі'}
                </button>
                <button onClick={() => setStep(3)} className="w-full text-gray-400 font-bold text-sm py-2">
                  Пропустити
                </button>
              </div>
            )}

            {/* STEP 3 — Done */}
            {step === 3 && (
              <div className="text-center space-y-4 py-4">
                <div className="text-6xl">🎉</div>
                <p className="font-black text-gray-800 text-xl">Все налаштовано!</p>
                <p className="text-gray-500 font-semibold text-sm">Тепер додавай завдання, призи та починайте грати разом.</p>
                <button onClick={onComplete}
                  className="w-full gradient-purple text-white font-black py-4 rounded-2xl text-lg active:scale-95 shadow-lg">
                  🚀 Почати!
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

// ── MigrationBanner: shown to legacy parents without Supabase Auth ─────────────
function MigrationBanner({ user, onDone }) {
  const { migrateParent } = useAuth()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  if (!show) return (
    <div className="mx-4 mt-3 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
      <div className="text-2xl">🔐</div>
      <div className="flex-1">
        <div className="font-black text-amber-800 text-sm">Захистіть свій акаунт</div>
        <div className="text-xs text-amber-700 mt-0.5">Додайте email і пароль для безпечного входу. Займе 30 секунд.</div>
      </div>
      <button onClick={() => setShow(true)} className="bg-amber-500 text-white font-black text-xs px-3 py-2 rounded-xl whitespace-nowrap">
        Захистити →
      </button>
    </div>
  )

  const handleMigrate = async (e) => {
    e.preventDefault()
    setErr('')
    if (pass !== pass2) { setErr('Паролі не співпадають'); return }
    if (pass.length < 6) { setErr('Мінімум 6 символів'); return }
    setLoading(true)
    try {
      await migrateParent(user.id, email, pass)
      onDone()
    } catch (error) {
      setErr(error.message === 'email_taken' ? 'Цей email вже використовується' : 'Помилка. Спробуйте ще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-4 mt-3 bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
      <div className="font-black text-amber-800 mb-3">🔐 Захист акаунту</div>
      <form onSubmit={handleMigrate} className="space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Ваш email" required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none font-semibold text-sm" />
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          placeholder="Новий пароль (мін. 6 символів)" required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none font-semibold text-sm" />
        <input type="password" value={pass2} onChange={e => setPass2(e.target.value)}
          placeholder="Повторити пароль" required
          className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none font-semibold text-sm" />
        {err && <p className="text-red-500 text-sm font-semibold">{err}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => setShow(false)} className="flex-1 bg-gray-100 text-gray-600 font-black py-2.5 rounded-xl text-sm">Пізніше</button>
          <button type="submit" disabled={loading} className="flex-1 bg-amber-500 text-white font-black py-2.5 rounded-xl text-sm disabled:opacity-50">
            {loading ? '⏳...' : '🔐 Захистити'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Main ParentDashboard ───────────────────────────────────────────────────────
export default function ParentDashboard() {
  const { user, logout, refreshUser } = useAuth()
  const { t } = useLang()
  const [tab, setTab] = useState('tasks')
  const [taskSubTab, setTaskSubTab] = useState('active')

  // Data
  const [children, setChildren] = useState([])
  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [challenges, setChallenges] = useState([])
  const [purchases, setPurchases] = useState([])
  const [feedItems, setFeedItems] = useState([])
  const [exchanges, setExchanges] = useState([])
  const [familyConfig, setFamilyConfig] = useState(null)
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modals
  const [showAddTask, setShowAddTask] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [showAddReward, setShowAddReward] = useState(false)
  const [editReward, setEditReward] = useState(null)
  const [showAddChild, setShowAddChild] = useState(false)
  const [editChild, setEditChild] = useState(null)
  const [showAddChallenge, setShowAddChallenge] = useState(false)

  // Profile
  const PARENT_EMOJIS = ['👨', '👩', '🧑', '👴', '👵', '🧔', '👨‍💼', '👩‍💼']
  const [profileEmoji, setProfileEmoji] = useState(user.avatar_emoji || '👨')
  const [profileName, setProfileName] = useState(user.display_name || '')
  const [profileSaving, setProfileSaving] = useState(false)

  // Family config edit
  const [pocketEnabled, setPocketEnabled] = useState(false)
  const [currency, setCurrency] = useState('UAH')
  const [exchangeRate, setExchangeRate] = useState(4)
  const [monoJarId, setMonoJarId] = useState('')
  const [configSaving, setConfigSaving] = useState(false)

  const loadData = useCallback(async () => {
    const [childrenRes, tasksRes, rewardsRes, challengesRes, purchasesRes, feedRes, exchangesRes, configRes] = await Promise.all([
      supabase.from('users').select('*').eq('family_id', user.family_id).eq('role', 'child'),
      supabase.from('tasks').select('*').eq('family_id', user.family_id).order('created_at', { ascending: false }),
      supabase.from('rewards').select('*').eq('family_id', user.family_id).order('points_cost', { ascending: true }),
      supabase.from('challenges').select('*, challenge_tasks(*)').eq('family_id', user.family_id).order('created_at', { ascending: false }),
      supabase.from('reward_purchases').select('*, rewards(title, emoji, points_cost), users!reward_purchases_child_id_fkey(display_name, avatar_emoji)')
        .eq('rewards.family_id', user.family_id).order('purchased_at', { ascending: false }),
      supabase.from('activity_feed').select('*, users!activity_feed_child_id_fkey(display_name, avatar_emoji)')
        .eq('family_id', user.family_id).order('created_at', { ascending: false }).limit(100),
      supabase.from('point_exchanges').select('*, users!point_exchanges_child_id_fkey(display_name, avatar_emoji)')
        .eq('family_id', user.family_id).order('created_at', { ascending: false }),
      supabase.from('family_configs').select('*').eq('family_id', user.family_id).single(),
    ])
    setChildren(childrenRes.data || [])
    setTasks(tasksRes.data || [])
    setRewards(rewardsRes.data || [])
    setChallenges(challengesRes.data || [])

    // Purchases need to match family
    const allPurchases = purchasesRes.data || []
    const familyChildIds = (childrenRes.data || []).map(c => c.id)
    setPurchases(allPurchases.filter(p => familyChildIds.includes(p.child_id)))

    setFeedItems(feedRes.data || [])
    setExchanges(exchangesRes.data || [])

    const cfg = configRes.data
    setFamilyConfig(cfg)
    if (cfg) {
      setPocketEnabled(cfg.pocket_money_enabled || false)
      setCurrency(cfg.currency || 'UAH')
      setExchangeRate(cfg.exchange_rate || 4)
      setMonoJarId(cfg.mono_send_jar_id || '')
    }
    setLoading(false)
  }, [user.family_id])

  useEffect(() => { loadData() }, [loadData])

  // ── Task approve / reject ─────────────────────────────────────────────────
  const handleApproveTask = async (taskId, childId, taskPoints) => {
    await supabase.from('tasks').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', taskId)
    const { data: child } = await supabase.from('users').select('points, total_points_earned').eq('id', childId).single()
    if (child) {
      await supabase.from('users').update({
        points: (child.points || 0) + taskPoints,
        total_points_earned: (child.total_points_earned || 0) + taskPoints,
      }).eq('id', childId)
    }
    const task = tasks.find(t => t.id === taskId)
    await supabase.from('activity_feed').insert({
      family_id: user.family_id, child_id: childId,
      event_type: 'task_approved',
      payload: { task_id: taskId, task_title: task?.title || '', points: taskPoints },
    })
    loadData()
  }

  const handleRejectTask = async (taskId) => {
    await supabase.from('tasks').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', taskId)
    loadData()
  }

  const handleDeleteTask = async (taskId) => {
    await supabase.from('tasks').delete().eq('id', taskId)
    loadData()
  }

  // ── Reward delete ─────────────────────────────────────────────────────────
  const handleDeleteReward = async (rewardId) => {
    await supabase.from('rewards').update({ active: false }).eq('id', rewardId)
    loadData()
  }

  // ── Purchase refund ───────────────────────────────────────────────────────
  const handleRefundPurchase = async (purchase) => {
    await supabase.from('reward_purchases').update({ status: 'refunded' }).eq('id', purchase.id)
    const { data: child } = await supabase.from('users').select('points').eq('id', purchase.child_id).single()
    if (child) {
      await supabase.from('users').update({ points: (child.points || 0) + purchase.points_spent }).eq('id', purchase.child_id)
    }
    loadData()
  }

  // ── Exchange approve ──────────────────────────────────────────────────────
  const handleApproveExchange = async (ex) => {
    await supabase.from('point_exchanges').update({ status: 'paid' }).eq('id', ex.id)
    loadData()
  }

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    setProfileSaving(true)
    await supabase.from('users').update({ display_name: profileName, avatar_emoji: profileEmoji }).eq('id', user.id)

    // Upsert family config
    const configPayload = {
      family_id: user.family_id,
      pocket_money_enabled: pocketEnabled,
      currency,
      exchange_rate: Number(exchangeRate),
      mono_send_jar_id: monoJarId,
    }
    if (familyConfig) {
      await supabase.from('family_configs').update(configPayload).eq('family_id', user.family_id)
    } else {
      await supabase.from('family_configs').insert(configPayload)
    }
    setProfileSaving(false)
    loadData()
  }

  // ─────────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'tasks', label: 'Завдання', emoji: '📋' },
    { id: 'challenges', label: 'Челенджі', emoji: '🏅' },
    { id: 'rewards', label: 'Призи', emoji: '🎁' },
    { id: 'children', label: 'Діти', emoji: '👧' },
    { id: 'purchases', label: 'Покупки', emoji: '🛒' },
    { id: 'money', label: 'Гроші', emoji: '💰' },
    { id: 'feed', label: 'Стрічка', emoji: '📺' },
    { id: 'profile', label: 'Профіль', emoji: '👤' },
  ]

  const pendingTasks = tasks.filter(t => t.status === 'pending_approval')
  const activeTasks = tasks.filter(t => t.status === 'active' && !t.is_recurring)
  const recurringTasks = tasks.filter(t => t.is_recurring)
  const doneTasks = tasks.filter(t => t.status === 'done')

  const currencySymbol = { UAH: '₴', USD: '$', EUR: '€', PLN: 'zł' }[currency] || '₴'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100">
      <div className="text-5xl animate-bounce">⭐</div>
    </div>
  )

  // Show onboarding when parent has no children yet
  if (children.length === 0) return (
    <OnboardingFlow
      familyId={user.family_id}
      user={user}
      onComplete={() => loadData()}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {(showAddTask || editTask) && (
        <AddTaskModal
          children={children} familyId={user.family_id}
          editTask={editTask}
          onClose={() => { setShowAddTask(false); setEditTask(null) }}
          onSaved={() => { setShowAddTask(false); setEditTask(null); loadData() }}
        />
      )}
      {(showAddReward || editReward) && (
        <AddRewardModal
          familyId={user.family_id}
          editReward={editReward}
          onClose={() => { setShowAddReward(false); setEditReward(null) }}
          onSaved={() => { setShowAddReward(false); setEditReward(null); loadData() }}
        />
      )}
      {showAddChild && (
        <AddChildModal
          familyId={user.family_id}
          onClose={() => setShowAddChild(false)}
          onSaved={() => { setShowAddChild(false); loadData() }}
        />
      )}
      {editChild && (
        <EditChildModal
          child={editChild}
          onClose={() => setEditChild(null)}
          onSaved={() => { setEditChild(null); loadData() }}
        />
      )}
      {showAddChallenge && (
        <AddChallengeModal
          children={children} familyId={user.family_id}
          onClose={() => setShowAddChallenge(false)}
          onSaved={() => { setShowAddChallenge(false); loadData() }}
        />
      )}

      {/* Header */}
      <div className="gradient-purple text-white px-4 pt-5 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex justify-between items-start mb-4">
          <div>
            <p className="text-violet-200 font-semibold text-sm">{t.parentPanel || 'Панель батьків'}</p>
            <h1 className="text-2xl font-black">{user.avatar_emoji} {user.display_name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher light />
            <button onClick={logout} className="text-violet-200 hover:text-white text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full">
              {t.logout || 'Вийти'}
            </button>
          </div>
        </div>
        {/* Stat tiles */}
        <div className="relative grid grid-cols-3 gap-2">
          <div className="bg-white/20 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{pendingTasks.length}</div>
            <div className="text-xs text-violet-100 font-semibold">на перевірці</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{activeTasks.length}</div>
            <div className="text-xs text-violet-100 font-semibold">активних</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-3 text-center">
            <div className="text-2xl font-black">{doneTasks.length}</div>
            <div className="text-xs text-violet-100 font-semibold">готово</div>
          </div>
        </div>
      </div>

      {/* Migration banner for legacy parents */}
      {user.needs_migration && (
        <MigrationBanner user={user} onDone={() => refreshUser(user.id)} />
      )}

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex-shrink-0 py-3 px-3 font-black text-xs transition-all whitespace-nowrap relative ${tab === tb.id ? 'text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}
              style={{ borderBottom: tab === tb.id ? '3px solid #7C3AED' : '3px solid transparent' }}>
              {tb.emoji} {tb.label}
              {tb.id === 'tasks' && pendingTasks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {pendingTasks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ── TASKS TAB ─────────────────────────────────────────────────── */}
        {tab === 'tasks' && (
          <>
            <button onClick={() => setShowAddTask(true)}
              className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all">
              + {t.addTask || 'Додати завдання'}
            </button>

            {/* Sub-tabs — only 2 */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              {['active', 'recurring'].map(st => (
                <button key={st} onClick={() => setTaskSubTab(st)}
                  className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${taskSubTab === st ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
                  {st === 'active' ? `📋 Активні${pendingTasks.length > 0 ? ` (${pendingTasks.length})` : ''}` : `🔄 Регулярні${recurringTasks.length > 0 ? ` (${recurringTasks.length})` : ''}`}
                </button>
              ))}
            </div>

            {/* Active tab — contains pending + active + done sections */}
            {taskSubTab === 'active' && (
              <>
                {/* Pending approval section */}
                {pendingTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 mt-1">
                      <span className="font-black text-orange-600 text-sm">⏳ Чекають перевірки ({pendingTasks.length})</span>
                    </div>
                    <div className="space-y-3">
                      {pendingTasks.map(task => {
                        const child = children.find(c => c.id === task.assigned_to)
                        return (
                          <div key={task.id} className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-400 overflow-hidden">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-violet-100 text-violet-700 font-black text-xs px-2 py-0.5 rounded-full">{child?.avatar_emoji} {child?.display_name}</span>
                                    {task.is_recurring && <span className="bg-blue-100 text-blue-600 font-bold text-xs px-2 py-0.5 rounded-full">щодня</span>}
                                  </div>
                                  <div className="font-black text-gray-800">{task.title}</div>
                                </div>
                                <div className="bg-orange-400 text-white font-black text-xs w-10 h-10 rounded-full flex items-center justify-center ml-2 shrink-0">
                                  +{task.points}
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button onClick={() => handleApproveTask(task.id, task.assigned_to, task.points)}
                                  className="flex-1 bg-green-500 text-white font-black py-2 rounded-xl text-sm active:scale-95">
                                  ✅ Прийняти
                                </button>
                                <button onClick={() => handleRejectTask(task.id)}
                                  className="flex-1 bg-orange-100 text-orange-600 font-black py-2 rounded-xl text-sm active:scale-95">
                                  ↩️ Повернути
                                </button>
                                <button onClick={() => setEditTask(task)} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl text-sm shrink-0">✏️</button>
                                <button onClick={() => handleDeleteTask(task.id)} className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-xl text-sm text-red-400 shrink-0">🗑️</button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Active tasks section */}
                <div>
                  {pendingTasks.length > 0 && (
                    <div className="flex items-center gap-2 mb-2 mt-2">
                      <span className="font-black text-gray-600 text-sm">● Активні завдання ({activeTasks.length})</span>
                    </div>
                  )}
                  {activeTasks.length === 0 && pendingTasks.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">📋</div>
                      <p className="font-bold text-gray-400">Завдань поки немає</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {activeTasks.map(task => {
                      const child = children.find(c => c.id === task.assigned_to)
                      return (
                        <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-violet-100 text-violet-700 font-black text-xs px-2 py-0.5 rounded-full">{child?.avatar_emoji} {child?.display_name}</span>
                                {task.is_mandatory && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Обов'язкове</span>}
                              </div>
                              <div className="font-black text-gray-800">{task.title}</div>
                              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">● Активно</span>
                            </div>
                            <div className="flex items-start gap-1 ml-2">
                              <div className="bg-orange-400 text-white font-black text-xs w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                +{task.points}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <button onClick={() => setEditTask(task)} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-xl text-sm">✏️</button>
                            <button onClick={() => handleDeleteTask(task.id)} className="w-9 h-9 flex items-center justify-center bg-red-50 rounded-xl text-sm text-red-400">🗑️</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Done section */}
                {doneTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 mt-2">
                      <span className="font-black text-green-600 text-sm">✅ Виконані ({doneTasks.length})</span>
                    </div>
                    <div className="space-y-2 opacity-80">
                      {doneTasks.slice(0, 20).map(task => {
                        const child = children.find(c => c.id === task.assigned_to)
                        return (
                          <div key={task.id} className="bg-white rounded-2xl p-3 shadow-sm">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-black text-gray-700 text-sm">{task.title}</div>
                                <div className="text-xs text-gray-400">{child?.avatar_emoji} {child?.display_name}</div>
                              </div>
                              <span className="text-green-500 font-black text-sm">✅ +{task.points}⭐</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Recurring tasks */}
            {taskSubTab === 'recurring' && (
              <>
                {recurringTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🔄</div>
                    <p className="font-bold text-gray-400">Регулярних завдань немає</p>
                  </div>
                )}
                <div className="space-y-3">
                  {recurringTasks.map(task => {
                    const child = children.find(c => c.id === task.assigned_to)
                    const dayLabels = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
                    const activeDays = task.recurring_days || [1,2,3,4,5]
                    return (
                      <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-blue-400">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-violet-100 text-violet-700 font-black text-xs px-2 py-0.5 rounded-full">{child?.avatar_emoji} {child?.display_name}</span>
                            </div>
                            <div className="font-black text-gray-800">{task.title}</div>
                            <div className="text-sm text-orange-500 font-bold mt-0.5">⭐ {task.points}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setEditTask(task)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-xl text-sm">✏️</button>
                            <button onClick={() => handleDeleteTask(task.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-xl text-sm text-red-400">🗑️</button>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {dayLabels.map((d, i) => (
                            <div key={i}
                              className={`flex-1 py-1 rounded-lg text-center font-black text-xs ${activeDays.includes(i) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── CHALLENGES TAB ─────────────────────────────────────────────── */}
        {tab === 'challenges' && (
          <>
            <button onClick={() => setShowAddChallenge(true)}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black py-3.5 rounded-2xl shadow active:scale-95">
              + Додати челендж
            </button>
            {challenges.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏅</div>
                <p className="text-xl font-bold text-gray-400">Челенджів ще немає</p>
              </div>
            )}
            <div className="space-y-4">
              {challenges.map(ch => {
                const child = children.find(c => c.id === ch.assigned_to)
                const subTasks = ch.challenge_tasks || []
                const done = subTasks.filter(st => st.done_reps >= st.total_reps).length
                const total = subTasks.length
                const progress = total > 0 ? Math.round((done / total) * 100) : 0
                return (
                  <div key={ch.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">{ch.emoji || '🏆'}</div>
                      <div className="flex-1">
                        <div className="font-black text-gray-800">{ch.title}</div>
                        <div className="text-sm text-gray-500">{child?.avatar_emoji} {child?.display_name} · +{ch.bonus_points} ⭐</div>
                      </div>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${ch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ch.status === 'active' ? 'Активний' : ch.status}
                      </span>
                    </div>
                    {total > 0 && (
                      <>
                        <div className="bg-gray-100 rounded-full h-2 mb-1">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs text-gray-500">{done}/{total} завдань · {progress}%</div>
                      </>
                    )}
                    {ch.deadline && <div className="text-xs text-orange-500 mt-1">📅 До {new Date(ch.deadline).toLocaleDateString('uk-UA')}</div>}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── REWARDS TAB ─────────────────────────────────────────────────── */}
        {tab === 'rewards' && (
          <>
            <button onClick={() => setShowAddReward(true)}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black py-3.5 rounded-2xl shadow active:scale-95">
              + {t.addReward || 'Додати приз'}
            </button>
            {rewards.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-xl font-bold text-gray-400">Призів ще немає</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {rewards.map(reward => (
                <div key={reward.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2">
                  <div className="text-4xl">{reward.emoji || '🎁'}</div>
                  <div className="font-black text-gray-800 text-sm text-center">{reward.title}</div>
                  <div className="text-orange-500 font-black text-sm">⭐ {reward.points_cost}</div>
                  <div className="flex gap-1 w-full">
                    <button onClick={() => setEditReward(reward)} className="flex-1 bg-gray-100 text-gray-600 font-black py-1.5 rounded-xl text-xs">✏️</button>
                    <button onClick={() => handleDeleteReward(reward.id)} className="flex-1 bg-red-50 text-red-400 font-black py-1.5 rounded-xl text-xs">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CHILDREN TAB ────────────────────────────────────────────────── */}
        {tab === 'children' && (
          <>
            {selectedChild ? (
              <ChildProfile
                child={selectedChild}
                tasks={tasks}
                feedItems={feedItems}
                onBack={() => setSelectedChild(null)}
                onEdit={() => setEditChild(selectedChild)}
              />
            ) : (
              <>
                <button onClick={() => setShowAddChild(true)}
                  className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95">
                  + {t.addChild || 'Додати дитину'}
                </button>
                <div className="space-y-3">
                  {children.map(child => {
                    const childTasks = tasks.filter(tk => tk.assigned_to === child.id)
                    const childDone = childTasks.filter(tk => tk.status === 'done').length
                    const childActive = childTasks.filter(tk => tk.status === 'active').length
                    const childPending = childTasks.filter(tk => tk.status === 'pending_approval').length
                    return (
                      <div key={child.id} onClick={() => setSelectedChild(child)}
                        className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer active:scale-95 transition-all hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{child.avatar_emoji}</div>
                          <div className="flex-1">
                            <div className="font-black text-gray-800 text-lg">{child.display_name}</div>
                            <div className="text-gray-500 text-sm">@{child.login}</div>
                            <div className="flex gap-3 mt-1 text-xs text-gray-500">
                              <span>⭐ {child.points || 0} балів</span>
                              <span>📋 {childActive} активних</span>
                              <span>✅ {childDone} виконано</span>
                              {childPending > 0 && <span className="text-orange-500 font-bold">⏳ {childPending}</span>}
                            </div>
                          </div>
                          <div className="text-gray-300 font-black text-xl">›</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── PURCHASES TAB ───────────────────────────────────────────────── */}
        {tab === 'purchases' && (
          <>
            {purchases.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-xl font-bold text-gray-400">Покупок ще немає</p>
              </div>
            )}
            <div className="space-y-3">
              {purchases.map(p => (
                <div key={p.id} className={`bg-white rounded-2xl p-4 shadow-sm ${p.status === 'refunded' ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{p.rewards?.emoji || '🎁'}</div>
                    <div className="flex-1">
                      <div className="font-black text-gray-800">{p.rewards?.title}</div>
                      <div className="text-sm text-gray-500">
                        {p.users?.avatar_emoji} {p.users?.display_name} · {new Date(p.purchased_at).toLocaleDateString('uk-UA')}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-orange-500 font-black text-sm">⭐ {p.points_spent}</div>
                        {p.status !== 'refunded' && (
                          <span className="bg-green-100 text-green-700 font-bold text-xs px-2 py-0.5 rounded-full">Активно</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {p.status !== 'refunded' ? (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => {
                        const d = new Date(p.purchased_at)
                        const text = `🧾 ЧЕК НА ПРИЗ\n📅 Дата: ${d.toLocaleDateString('uk-UA')}\n⏰ Час: ${d.toLocaleTimeString('uk-UA', { hour:'2-digit', minute:'2-digit' })}\n👤 Хто: ${p.users?.avatar_emoji} ${p.users?.display_name}\n🎁 ${p.rewards?.title}\nВитрачено: −⭐${p.points_spent}`
                        navigator.clipboard?.writeText(text).catch(() => {})
                        alert(text)
                      }} className="flex-1 bg-violet-50 text-violet-700 font-black text-sm py-2 rounded-xl active:scale-95">
                        🧾 Чек
                      </button>
                      <button onClick={() => handleRefundPurchase(p)}
                        className="flex-1 bg-orange-50 text-orange-600 font-black text-sm py-2 rounded-xl active:scale-95">
                        ↩️ Повернути бали
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 text-gray-400 text-xs font-bold text-center">↩️ Повернуто</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── MONEY TAB ───────────────────────────────────────────────────── */}
        {tab === 'money' && (
          <>
            {familyConfig?.pocket_money_enabled && (
              <div className="bg-green-50 rounded-2xl p-4 text-green-700 font-semibold text-sm">
                💱 Курс: {familyConfig.exchange_rate || 4} ⭐ = 1 {currencySymbol}
              </div>
            )}
            {exchanges.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">💰</div>
                <p className="font-bold text-gray-400">Запитів на обмін немає</p>
              </div>
            )}
            <div className="space-y-3">
              {exchanges.map(ex => (
                <div key={ex.id} className={`bg-white rounded-2xl p-4 shadow-sm ${ex.status === 'refunded' ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💰</div>
                    <div className="flex-1">
                      <div className="font-black text-gray-800">
                        {ex.users?.avatar_emoji} {ex.users?.display_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ⭐ {ex.points_spent} → {ex.money_amount} {ex.currency}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(ex.created_at).toLocaleDateString('uk-UA')}</div>
                    </div>
                    <div className="text-right">
                      {ex.status === 'pending' && (
                        <button onClick={() => handleApproveExchange(ex)}
                          className="bg-green-500 text-white font-black text-xs px-3 py-2 rounded-xl">
                          ✅ Оплачено
                        </button>
                      )}
                      {ex.status === 'paid' && <span className="text-green-600 font-black text-xs">Оплачено ✅</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── FEED TAB ────────────────────────────────────────────────────── */}
        {tab === 'feed' && (
          <>
            {feedItems.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-xl font-bold text-gray-400">Стрічка порожня</p>
              </div>
            )}
            <div className="space-y-3">
              {feedItems.map(item => {
                const p = item.payload || {}
                const evtMap = {
                  task_submitted: { emoji: '📋', text: `Відправив на перевірку "${p.task_title || ''}"` },
                  task_approved: { emoji: '✅', text: `Виконав "${p.task_title || ''}" (+${p.points || 0} ⭐)` },
                  reward_purchased: { emoji: '🎁', text: `Купив "${p.reward_title || ''}" (${p.points_spent || 0} ⭐)` },
                  points_exchanged: { emoji: '💰', text: `Обміняв ${p.points_spent || 0} ⭐ на ${p.money_amount || 0} ${p.currency || ''}` },
                  challenge_completed: { emoji: '🏆', text: `Завершив челендж "${p.challenge_title || ''}"` },
                }
                const evt = evtMap[item.event_type] || { emoji: '🌟', text: item.event_type }
                return (
                  <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
                    <div className="text-2xl">{item.users?.avatar_emoji || evt.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-sm">
                        <span className="font-black">{item.users?.display_name}</span>: {evt.text}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <>
            {/* Avatar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-3">👤 Аватар</h3>
              <div className="text-center mb-3">
                <div className="text-5xl">{profileEmoji}</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {PARENT_EMOJIS.map(em => (
                  <button key={em} onClick={() => setProfileEmoji(em)}
                    className={`text-2xl p-2 rounded-xl ${profileEmoji === em ? 'bg-violet-100 ring-2 ring-violet-500' : 'hover:bg-gray-100'}`}>{em}</button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-3">✏️ Ім'я</h3>
              <input value={profileName} onChange={e => setProfileName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-violet-400" />
            </div>

            {/* Pocket money settings */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-3">💰 Кишенькові гроші</h3>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <div
                  onClick={() => setPocketEnabled(!pocketEnabled)}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer ${pocketEnabled ? 'bg-green-500' : 'bg-gray-200'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow transition-all ${pocketEnabled ? 'translate-x-6' : ''}`} />
                </div>
                <span className="font-black text-gray-700">Увімкнути обмін зірок на гроші</span>
              </label>
              {pocketEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-black text-gray-600 mb-1">Валюта</label>
                    <div className="flex gap-2">
                      {['UAH', 'USD', 'EUR', 'PLN'].map(c => (
                        <button key={c} type="button" onClick={() => setCurrency(c)}
                          className={`flex-1 py-2 rounded-xl font-black text-sm ${currency === c ? 'gradient-purple text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-600 mb-1">
                      Скільки ⭐ за 1 {currencySymbol}
                    </label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="1" max="20" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} className="flex-1 accent-violet-600" />
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black rounded-xl px-4 py-2 min-w-[60px] text-center">{exchangeRate}</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-600 mb-1">Mono Send Jar ID (необов'язково)</label>
                    <input value={monoJarId} onChange={e => setMonoJarId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-violet-400"
                      placeholder="jar/..." />
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleProfileSave} disabled={profileSaving}
              className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow disabled:opacity-50">
              {profileSaving ? '⏳ Зберігаємо...' : '💾 Зберегти всі налаштування'}
            </button>

            <button onClick={logout}
              className="w-full bg-red-50 text-red-500 font-black py-3 rounded-2xl">
              🚪 Вийти
            </button>
          </>
        )}

      </div>
    </div>
  )
}
