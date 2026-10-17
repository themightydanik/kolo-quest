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
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-xl rounded-2xl px-4 py-2 min-w-[72px] text-center">
                {points}⭐
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskDescription} <span className="text-gray-300 font-semibold">{t.optional}</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 resize-none" placeholder={t.taskDescPlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.taskCriteria} <span className="text-gray-300 font-semibold">{t.optional}</span></label>
            <textarea value={criteria} onChange={e => setCriteria(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700 resize-none" placeholder={t.taskCriteriaPlaceholder} />
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
        <div className="gradient-purple text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">{editReward ? t.editReward : t.addReward}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.rewardTitle}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" placeholder={t.rewardTitlePlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">{t.rewardEmoji}</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === em ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'hover:bg-gray-100'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.rewardCost}</label>
            <div className="flex items-center gap-3">
              <input type="range" min="5" max="500" step="5" value={points} onChange={e => setPoints(e.target.value)} className="flex-1 accent-violet-600" />
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-black text-xl rounded-2xl px-4 py-2 min-w-[80px] text-center">
                {points}⭐
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading || !title.trim()}
            className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50 text-lg">
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
      role: 'child', family_id: familyId, avatar_emoji: emoji, points: 0, created_at: new Date().toISOString()
    })
    if (err) { setError(t.accountCreateError); setLoading(false); return }
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
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === em ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'hover:bg-gray-100'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.childName}</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" placeholder={t.childNamePlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.loginLabel}</label>
            <input value={login} onChange={e => setLogin(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" placeholder="login" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.passwordLabel}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" placeholder="****" />
          </div>
          {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold text-center">😬 {error}</div>}
          <button type="submit" disabled={loading || !name.trim() || !login.trim() || !password}
            className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50 text-lg">
            {loading ? '...' : t.addChild}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Edit Child Modal ───────────────────────────────────────────────────────────
function EditChildModal({ child, onClose, onSaved }) {
  const { t } = useLang()
  const EMOJIS = ['🦊','🐱','🐶','🐸','🦄','🐼','🐨','🦁','🐯','🐻','🦋','🐙']
  const [name, setName] = useState(child.display_name || '')
  const [login, setLogin] = useState(child.login || '')
  const [password, setPassword] = useState('')
  const [emoji, setEmoji] = useState(child.avatar_emoji || '🦊')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (password) {
        const { error: rpcErr } = await supabase.rpc('update_child_credentials', {
          p_child_id: child.id,
          p_display_name: name.trim(),
          p_login: login.trim().toLowerCase(),
          p_password: password
        })
        if (rpcErr) throw rpcErr
      } else {
        const { error: updateErr } = await supabase.from('users').update({
          display_name: name.trim(),
          login: login.trim().toLowerCase(),
          avatar_emoji: emoji
        }).eq('id', child.id)
        if (updateErr) throw updateErr
      }
      onSaved()
    } catch (err) {
      setError(err.message || t.accountCreateError)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="gradient-purple text-white px-6 pt-6 pb-4 flex justify-between items-center">
          <h2 className="text-lg font-black">{t.editChild || 'Редагувати дитину'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-2">{t.childEmoji}</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === em ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'hover:bg-gray-100'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.childName}</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.loginLabel}</label>
            <input value={login} onChange={e => setLogin(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">{t.newPassword || 'Новий пароль'} <span className="text-gray-300 font-semibold">{t.optional}</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none font-semibold text-gray-700" placeholder={t.leaveBlankToKeep || 'Залишіть пустим щоб не змінювати'} />
          </div>
          {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold text-center">😬 {error}</div>}
          <button type="submit" disabled={loading || !name.trim() || !login.trim()}
            className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow active:scale-95 transition-all disabled:opacity-50 text-lg">
            {loading ? '...' : t.saveChanges}
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
  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddReward, setShowAddReward] = useState(false)
  const [showAddChild, setShowAddChild] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [editReward, setEditReward] = useState(null)
  const [editChild, setEditChild] = useState(null)
  const [childFilter, setChildFilter] = useState('all')
  const [taskFilter, setTaskFilter] = useState('all')

  const loadData = useCallback(async () => {
    const [tasksRes, rewardsRes, childrenRes] = await Promise.all([
      supabase.from('tasks').select('*, users(display_name, avatar_emoji)').eq('family_id', user.family_id)
        .order('is_mandatory', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('rewards').select('*').eq('family_id', user.family_id).eq('active', true).order('points_cost'),
      supabase.from('users').select('*').eq('family_id', user.family_id).eq('role', 'child').order('created_at'),
    ])
    setTasks(tasksRes.data || [])
    setRewards(rewardsRes.data || [])
    setChildren(childrenRes.data || [])
    setLoading(false)
  }, [user.family_id])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = async (task) => {
    const childId = task.assigned_to
    await supabase.from('tasks').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', task.id)
    const { data: childData } = await supabase.from('users').select('points').eq('id', childId).single()
    if (childData) {
      await supabase.from('users').update({ points: (childData.points || 0) + task.points }).eq('id', childId)
    }
    loadData()
  }

  const handleReject = async (taskId) => {
    await supabase.from('tasks').update({ status: 'active', completed_at: null, updated_at: new Date().toISOString() }).eq('id', taskId)
    loadData()
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm(t.confirmDelete || 'Видалити завдання?')) return
    await supabase.from('tasks').delete().eq('id', taskId)
    loadData()
  }

  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm(t.confirmDelete || 'Видалити нагороду?')) return
    await supabase.from('rewards').update({ active: false }).eq('id', rewardId)
    loadData()
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending_approval')
  const filteredTasks = tasks.filter(task => {
    const childMatch = childFilter === 'all' || task.assigned_to === childFilter
    const statusMatch = taskFilter === 'all' || task.status === taskFilter
    return childMatch && statusMatch
  })

  const tabs = [
    { id: 'tasks', label: t.tabTasks, emoji: '📋', badge: pendingTasks.length },
    { id: 'children', label: t.tabChildren || 'Діти', emoji: '👨‍👧‍👦' },
    { id: 'rewards', label: t.tabRewards, emoji: '🎁' },
    { id: 'stats', label: t.tabStats || 'Статистика', emoji: '📊' },
  ]

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100"><div className="text-5xl animate-bounce">⭐</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="gradient-purple text-white px-4 pt-5 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-violet-200 font-semibold text-sm">{t.parentPanel}</p>
            <h1 className="text-2xl font-black">{user.avatar_emoji || '👩'} {user.display_name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher light />
            <button onClick={logout} className="text-violet-200 hover:text-white text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full transition-colors">{t.logout}</button>
          </div>
        </div>
        <div className="relative flex gap-3 mt-3">
          {[
            { val: children.length, label: t.childrenCount || 'Дітей' },
            { val: tasks.filter(t => t.status === 'active').length, label: t.activeCount },
            { val: pendingTasks.length, label: t.pendingCount, highlight: pendingTasks.length > 0 },
          ].map(s => (
            <div key={s.label} className={`rounded-xl px-3 py-1.5 text-center ${s.highlight ? 'bg-yellow-400/80' : 'bg-white/15'}`}>
              <div className="font-black text-lg leading-none">{s.val}</div>
              <div className={`text-xs ${s.highlight ? 'text-yellow-900' : 'text-violet-200'}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur shadow-sm overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex-shrink-0 py-3 px-3 font-black text-xs transition-all whitespace-nowrap relative ${tab === tb.id ? 'text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}
              style={{ borderBottom: tab === tb.id ? '3px solid #7C3AED' : '3px solid transparent' }}>
              {tb.emoji} {tb.label}
              {tb.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{tb.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <>
            <button onClick={() => setShowAddTask(true)}
              className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-base">
              ✨ {t.addTask}
            </button>

            {pendingTasks.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                <h3 className="text-base font-black text-yellow-700 mb-3 flex items-center gap-2">
                  <span className="animate-pulse">⚠️</span> {t.needsReview} ({pendingTasks.length})
                </h3>
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <TaskCard key={task.id} task={task} parentView
                      onApprove={() => handleApprove(task)}
                      onReject={() => handleReject(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onEdit={() => setEditTask(task)} />
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setChildFilter('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full font-black text-xs transition-all ${childFilter === 'all' ? 'gradient-purple text-white shadow' : 'bg-white text-gray-500 border'}`}>
                {t.allChildren || 'Усі діти'}
              </button>
              {children.map(c => (
                <button key={c.id} onClick={() => setChildFilter(c.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full font-black text-xs transition-all ${childFilter === c.id ? 'gradient-purple text-white shadow' : 'bg-white text-gray-500 border'}`}>
                  {c.avatar_emoji} {c.display_name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'done'].map(f => (
                <button key={f} onClick={() => setTaskFilter(f)}
                  className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${taskFilter === f ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 border'}`}>
                  {f === 'all' ? t.allTasks || 'Всі' : f === 'active' ? t.showActive || 'Активні' : t.doneTasks || 'Виконані'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredTasks.filter(task => task.status !== 'pending_approval').map(task => (
                <TaskCard key={task.id} task={task} parentView
                  onApprove={() => handleApprove(task)}
                  onReject={() => handleReject(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onEdit={() => setEditTask(task)} />
              ))}
              {filteredTasks.filter(t => t.status !== 'pending_approval').length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="text-gray-400 font-bold">{t.noTasksTitle}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* CHILDREN TAB */}
        {tab === 'children' && (
          <>
            <button onClick={() => setShowAddChild(true)}
              className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-base">
              👶 {t.addChild}
            </button>
            <div className="space-y-3">
              {children.map(child => {
                const childTasks = tasks.filter(tk => tk.assigned_to === child.id)
                const donePct = childTasks.length ? Math.round(childTasks.filter(tk => tk.status === 'done').length / childTasks.length * 100) : 0
                return (
                  <div key={child.id} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{child.avatar_emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-gray-800 text-lg">{child.display_name}</div>
                        <div className="text-gray-400 text-sm font-semibold">@{child.login}</div>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs font-black text-yellow-600">⭐ {child.points || 0}</span>
                          <span className="text-xs font-black text-violet-600">{childTasks.length} {t.tasksCount || 'завдань'}</span>
                        </div>
                        {childTasks.length > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                              <span>{t.progressLabel || 'Прогрес'}</span>
                              <span>{donePct}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full gradient-purple rounded-full transition-all" style={{ width: donePct + '%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <button onClick={() => setEditChild(child)}
                        className="bg-violet-100 text-violet-600 font-black py-2 px-3 rounded-xl text-sm active:scale-95 transition-all hover:bg-violet-200">
                        ✏️
                      </button>
                    </div>
                  </div>
                )
              })}
              {children.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">👨‍👧</div>
                  <p className="text-gray-400 font-bold">{t.noChildrenYet || 'Немає доданих дітей'}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* REWARDS TAB */}
        {tab === 'rewards' && (
          <>
            <button onClick={() => setShowAddReward(true)}
              className="w-full gradient-purple text-white font-black py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all text-base">
              🎁 {t.addReward}
            </button>
            <div className="grid grid-cols-2 gap-3">
              {rewards.map(reward => (
                <div key={reward.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2">
                  <div className="text-4xl">{reward.emoji || '🎁'}</div>
                  <div className="font-black text-gray-800 text-sm text-center">{reward.title}</div>
                  <div className="flex items-center gap-1 text-orange-500 font-black text-sm">⭐ {reward.points_cost}</div>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => setEditReward(reward)} className="flex-1 bg-violet-100 text-violet-600 font-black py-1.5 rounded-xl text-xs hover:bg-violet-200 transition-all">✏️</button>
                    <button onClick={() => handleDeleteReward(reward.id)} className="flex-1 bg-red-50 text-red-400 font-black py-1.5 rounded-xl text-xs hover:bg-red-100 transition-all">🗑</button>
                  </div>
                </div>
              ))}
              {rewards.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <div className="text-5xl mb-3">🎁</div>
                  <p className="text-gray-400 font-bold">{t.noRewardsYet || 'Немає нагород'}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-800">{t.familyStats || 'Статистика сім\'ї'}</h2>
            {children.map(child => {
              const childTasks = tasks.filter(tk => tk.assigned_to === child.id)
              const done = childTasks.filter(tk => tk.status === 'done').length
              const active = childTasks.filter(tk => tk.status === 'active').length
              const pending = childTasks.filter(tk => tk.status === 'pending_approval').length
              return (
                <div key={child.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{child.avatar_emoji}</div>
                    <div>
                      <div className="font-black text-gray-800">{child.display_name}</div>
                      <div className="text-yellow-500 font-black text-sm">⭐ {child.points || 0} {t.starPoints}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: active, label: t.activeCount, color: 'bg-green-100 text-green-700' },
                      { val: pending, label: t.pendingCount, color: 'bg-yellow-100 text-yellow-700' },
                      { val: done, label: t.doneCount, color: 'bg-violet-100 text-violet-700' },
                    ].map(s => (
                      <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                        <div className="font-black text-2xl">{s.val}</div>
                        <div className="text-xs font-bold">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {childTasks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                        <span>{t.completionRate || 'Виконано'}</span>
                        <span>{Math.round(done / childTasks.length * 100)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full gradient-purple rounded-full transition-all"
                          style={{ width: Math.round(done / childTasks.length * 100) + '%' }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddTask || editTask) && (
        <AddTaskModal
          children={children}
          familyId={user.family_id}
          editTask={editTask}
          onClose={() => { setShowAddTask(false); setEditTask(null) }}
          onSaved={() => { setShowAddTask(false); setEditTask(null); loadData() }} />
      )}
      {(showAddReward || editReward) && (
        <AddRewardModal
          familyId={user.family_id}
          editReward={editReward}
          onClose={() => { setShowAddReward(false); setEditReward(null) }}
          onSaved={() => { setShowAddReward(false); setEditReward(null); loadData() }} />
      )}
      {showAddChild && (
        <AddChildModal
          familyId={user.family_id}
          onClose={() => setShowAddChild(false)}
          onSaved={() => { setShowAddChild(false); loadData() }} />
      )}
      {editChild && (
        <EditChildModal
          child={editChild}
          onClose={() => setEditChild(null)}
          onSaved={() => { setEditChild(null); loadData() }} />
      )}
    </div>
  )
}
