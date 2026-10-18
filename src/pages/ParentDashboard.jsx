import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { useLang, LanguageSwitcher } from '../i18n/index'
import { supabase } from '../lib/supabase'
import TaskCard from '../components/TaskCard'

// ── Add Task Modal ─────────────────────────────────────────────────────────────
function AddTaskModal({ children, familyId, onClose, onSaved, editTask }) {
  const { t } = useLang()
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
          <h2 className="text-lg font-black">{editTask ? t.editTask : t.addTask}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskTitle}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" placeholder={t.taskTitlePlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.assignTo}</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 bg-white">
              {children.map(c => <option key={c.id} value={c.id}>{c.avatar_emoji} {c.display_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskPoints}</label>
            <div className="flex items-center gap-3">
              <input type="range" min="1" max="100" value={points} onChange={e => setPoints(e.target.value)} className="flex-1 accent-violet-600" />
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-xl rounded-2xl px-4 py-2 min-w-[72px] text-center">{points}⭐</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskDescription} <span className="text-gray-300 font-semibold">{t.optional}</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskCriteria} <span className="text-gray-300 font-semibold">{t.optional}</span></label>
            <textarea value={criteria} onChange={e => setCriteria(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 resize-none" />
          </div>
          <div className="bg-red-50 rounded-2xl p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isMandatory} onChange={e => setIsMandatory(e.target.checked)} className="w-5 h-5 accent-red-500 rounded" />
              <span className="font-black text-gray-700">{t.mandatoryTask}</span>
            </label>
            {isMandatory && (
              <div>
                <label className="block text-sm font-black text-red-500 mb-1">{t.penaltyPoints}</label>
                <input type="number" min="0" max="100" value={penaltyPoints} onChange={e => setPenaltyPoints(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-red-200 focus:border-red-400 focus:outline-none font-semibold text-gray-700" />
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-5 h-5 accent-blue-500 rounded" />
              <span className="font-black text-gray-700">{t.recurringTask}</span>
            </label>
            {isRecurring && (
              <div className="flex gap-2">
                {['daily', 'weekdays', 'weekends'].map(v => (
                  <button key={v} type="button" onClick={() => setRecurringType(v)}
                    className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${recurringType === v ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border-2 border-blue-200'}`}>
                    {v === 'daily' ? t.daily : v === 'weekdays' ? t.weekdays : t.weekends}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading || !title.trim() || !assignedTo}
            className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50 text-lg">
            {loading ? '...' : (editTask ? t.saveChanges : t.createTask)}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Add Reward Modal ───────────────────────────────────────────────────────────
function AddRewardModal({ familyId, onClose, onSaved, editReward }) {
  const { t } = useLang()
  const EMOJIS = ['🎁','🎮','🍕','🍦','🎬','🎪','🚀','🧸','🎨','📚','🎭','🏆','🎯','🎸']
  const [title, setTitle] = useState(editReward?.title || '')
  const [emoji, setEmoji] = useState(editReward?.emoji || '🎁')
  const [points, setPoints] = useState(editReward?.points_cost ?? 50)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { title: title.trim(), emoji, points_cost: Number(points), family_id: familyId, active: true }
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">{editReward ? t.editReward : t.addReward}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.rewardTitle}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">{t.rewardEmoji}</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === em ? 'bg-orange-100 ring-2 ring-orange-400 scale-110' : 'hover:bg-gray-100'}`}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.rewardCost}</label>
            <div className="flex items-center gap-3">
              <input type="range" min="5" max="500" step="5" value={points} onChange={e => setPoints(e.target.value)} className="flex-1 accent-orange-500" />
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-xl rounded-2xl px-4 py-2 min-w-[80px] text-center">{points}⭐</div>
            </div>
          </div>
          <button type="submit" disabled={loading || !title.trim()}
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50 text-lg">
            {loading ? '...' : (editReward ? t.saveChanges : t.addReward)}
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
    const m = login.trim().toLowerCase()
    const { data: existing } = await supabase.from('users').select('id').eq('login', m).maybeSingle()
    if (existing) { setError(t.loginTaken); setLoading(false); return }
    const { error: err } = await supabase.from('users').insert({
      login: m, password_hash: password, display_name: name.trim(),
      role: 'child', family_id: familyId, avatar_emoji: emoji, points: 0,
    })
    if (err) { setError(t.accountCreateError || 'Помилка'); setLoading(false); return }
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
  const EMOJIS = ['🏆','🌟','⭐','🎯','🚀','💪','🧩','🎪','🌈','🦁','🔥','💡']

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

// ── Main ParentDashboard ───────────────────────────────────────────────────────
export default function ParentDashboard() {
  const { user, logout } = useAuth()
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
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-violet-200 font-semibold text-sm">{t.parentPanel || 'Панель батьків'}</p>
            <h1 className="text-2xl font-black">{user.avatar_emoji} {user.display_name}</h1>
            {pendingTasks.length > 0 && (
              <div className="mt-1 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full inline-block animate-pulse">
                ⏳ {pendingTasks.length} на перевірці
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher light />
            <button onClick={logout} className="text-violet-200 hover:text-white text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full">
              {t.logout || 'Вийти'}
            </button>
          </div>
        </div>
      </div>

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

            {/* Sub-tabs */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              {['active', 'recurring', 'pending', 'done'].map(st => (
                <button key={st} onClick={() => setTaskSubTab(st)}
                  className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${taskSubTab === st ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
                  {st === 'active' ? '📋 Активні' : st === 'recurring' ? '🔄 Регулярні' : st === 'pending' ? `⏳ (${pendingTasks.length})` : '✅ Виконані'}
                </button>
              ))}
            </div>

            {/* Pending — needs approval */}
            {taskSubTab === 'pending' && (
              <>
                {pendingTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">✅</div>
                    <p className="font-bold text-gray-400">Немає завдань на перевірці</p>
                  </div>
                )}
                <div className="space-y-3">
                  {pendingTasks.map(task => {
                    const child = children.find(c => c.id === task.assigned_to)
                    return (
                      <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-yellow-400">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-black text-gray-800">{task.title}</div>
                            <div className="text-sm text-gray-500">{child?.avatar_emoji} {child?.display_name}</div>
                            <div className="text-violet-600 font-black text-sm mt-1">+{task.points} ⭐</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleApproveTask(task.id, task.assigned_to, task.points)}
                            className="flex-1 bg-green-500 text-white font-black py-2.5 rounded-xl text-sm">
                            ✅ Підтвердити
                          </button>
                          <button onClick={() => handleRejectTask(task.id)}
                            className="flex-1 bg-red-100 text-red-500 font-black py-2.5 rounded-xl text-sm">
                            ❌ Відхилити
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Active tasks */}
            {taskSubTab === 'active' && (
              <>
                {activeTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="font-bold text-gray-400">Активних завдань немає</p>
                  </div>
                )}
                <div className="space-y-3">
                  {activeTasks.map(task => {
                    const child = children.find(c => c.id === task.assigned_to)
                    return (
                      <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-black text-gray-800">{task.title}</div>
                            {task.is_mandatory && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">Обов'язкове</span>}
                            <div className="text-sm text-gray-500 mt-1">{child?.avatar_emoji} {child?.display_name} · {task.points} ⭐</div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button onClick={() => setEditTask(task)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-xl text-sm">✏️</button>
                            <button onClick={() => handleDeleteTask(task.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-xl text-sm text-red-400">🗑️</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
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
                            <div className="font-black text-gray-800">{task.title}</div>
                            <div className="text-sm text-gray-500">{child?.avatar_emoji} {child?.display_name} · {task.points} ⭐</div>
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

            {/* Done tasks */}
            {taskSubTab === 'done' && (
              <>
                {doneTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="font-bold text-gray-400">Виконаних завдань ще немає</p>
                  </div>
                )}
                <div className="space-y-3 opacity-80">
                  {doneTasks.slice(0, 30).map(task => {
                    const child = children.find(c => c.id === task.assigned_to)
                    return (
                      <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-black text-gray-700">{task.title}</div>
                            <div className="text-sm text-gray-400">{child?.avatar_emoji} {child?.display_name}</div>
                          </div>
                          <span className="text-green-500 font-black text-sm">✅ +{task.points} ⭐</span>
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
            <button onClick={() => setShowAddChild(true)}
              className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95">
              + {t.addChild || 'Додати дитину'}
            </button>
            {children.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👧</div>
                <p className="text-xl font-bold text-gray-400">Дітей ще немає</p>
              </div>
            )}
            <div className="space-y-3">
              {children.map(child => {
                const childTasks = tasks.filter(t => t.assigned_to === child.id)
                const childDone = childTasks.filter(t => t.status === 'done').length
                const childActive = childTasks.filter(t => t.status === 'active').length
                return (
                  <div key={child.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{child.avatar_emoji}</div>
                      <div className="flex-1">
                        <div className="font-black text-gray-800 text-lg">{child.display_name}</div>
                        <div className="text-gray-500 text-sm">@{child.login}</div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span>⭐ {child.points || 0} балів</span>
                          <span>📋 {childActive} активних</span>
                          <span>✅ {childDone} виконано</span>
                        </div>
                      </div>
                      <button onClick={() => setEditChild(child)} className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-500">✏️</button>
                    </div>
                  </div>
                )
              })}
            </div>
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
                      <div className="text-orange-500 font-black text-sm">⭐ {p.points_spent}</div>
                    </div>
                    {p.status !== 'refunded' && (
                      <button onClick={() => handleRefundPurchase(p)}
                        className="bg-red-50 text-red-400 font-black text-xs px-3 py-2 rounded-xl">
                        Повернути ⭐
                      </button>
                    )}
                    {p.status === 'refunded' && (
                      <span className="text-gray-400 text-xs font-bold">Повернуто</span>
                    )}
                  </div>
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
