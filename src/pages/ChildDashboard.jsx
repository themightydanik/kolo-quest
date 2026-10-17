import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { useLang, LanguageSwitcher } from '../i18n/index'
import { supabase } from '../lib/supabase'
import TaskCard from '../components/TaskCard'

export default function ChildDashboard() {
  const { user, logout } = useAuth()
  const { t, lang } = useLang()
  const [tab, setTab] = useState('tasks')
  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('active')

  const loadData = useCallback(async () => {
    const [tasksRes, rewardsRes, userRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('family_id', user.family_id).eq('assigned_to', user.id)
        .order('is_mandatory', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('rewards').select('*').eq('family_id', user.family_id).eq('active', true)
        .order('points_cost', { ascending: true }),
      supabase.from('users').select('points').eq('id', user.id).single(),
    ])
    setTasks(tasksRes.data || [])
    setRewards(rewardsRes.data || [])
    if (userRes.data) setPoints(userRes.data.points || 0)
    setLoading(false)
  }, [user.id, user.family_id])

  useEffect(() => { loadData() }, [loadData])

  const handleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    // Countdown overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;font-family:inherit'
    const box = document.createElement('div')
    box.style.cssText = 'background:#fff;border-radius:24px;padding:32px 24px;text-align:center;max-width:320px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3)'
    let count = 5, cancelled = false
    box.innerHTML = `
      <div style="font-size:3rem;margin-bottom:8px">🎉</div>
      <div style="font-size:1.2rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">${task?.title || ''}</div>
      <div style="font-size:1rem;font-weight:700;color:#7c3aed;margin-bottom:16px">+${task?.points || 0} балів</div>
      <div id="cd-bar-wrap" style="background:#f3f4f6;border-radius:99px;height:8px;margin-bottom:16px;overflow:hidden"><div id="cd-bar" style="height:100%;border-radius:99px;background:linear-gradient(90deg,#7c3aed,#a78bfa);transition:width 0.9s linear;width:100%"></div></div>
      <div id="cd-text" style="font-size:0.85rem;color:#6b7280;margin-bottom:16px">Підтвердження через ${count}...</div>
      <button id="cd-cancel" style="background:#f3f4f6;border:none;border-radius:12px;padding:10px 24px;font-weight:700;font-size:0.9rem;cursor:pointer;color:#374151;width:100%">❌ Скасувати</button>
    `
    overlay.appendChild(box)
    document.body.appendChild(overlay)
    document.getElementById('cd-cancel').onclick = () => { cancelled = true; clearInterval(timer); document.body.removeChild(overlay) }
    const timer = setInterval(async () => {
      count--
      const cdText = document.getElementById('cd-text')
      const cdBar = document.getElementById('cd-bar')
      if (cdText) cdText.textContent = `Підтвердження через ${count}...`
      if (cdBar) cdBar.style.width = (count / 5 * 100) + '%'
      if (count <= 0) {
        clearInterval(timer)
        document.body.removeChild(overlay)
        if (!cancelled) {
          await supabase.from('tasks').update({ status: 'pending_approval', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', taskId)
          loadData()
        }
      }
    }, 1000)
  }

  const handleBuyReward = async (reward) => {
    if (points < reward.points_cost) return
    const newPoints = points - reward.points_cost
    await supabase.from('users').update({ points: newPoints }).eq('id', user.id)
    await supabase.from('reward_purchases').insert({ reward_id: reward.id, child_id: user.id, points_spent: reward.points_cost, status: 'active' })
    setPoints(newPoints)
  }

  const tabs = [
    { id: 'tasks', label: t.tabTasks, emoji: '📋' },
    { id: 'rewards', label: t.tabRewards, emoji: '🎁' },
    { id: 'profile', label: t.tabProfile || 'Профіль', emoji: '👤' },
  ]

  const mandatory = tasks.filter(t => t.is_mandatory && t.status === 'active')
  const active = tasks.filter(t => !t.is_mandatory && t.status === 'active')
  const pending = tasks.filter(t => t.status === 'pending_approval')
  const done = tasks.filter(t => t.status === 'done')

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100"><div className="text-5xl animate-bounce">⭐</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="gradient-purple text-white px-4 pt-5 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-violet-200 font-semibold text-sm">{t.hello}</p>
            <h1 className="text-2xl font-black">{user.avatar_emoji} {user.display_name}!</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher light />
            <button onClick={logout} className="text-violet-200 hover:text-white text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full transition-colors">{t.logout}</button>
          </div>
        </div>
        <div className="relative mt-3 inline-flex items-center gap-3 bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
          <div className="text-3xl">⭐</div>
          <div>
            <div className="text-3xl font-black leading-none">{points}</div>
            <div className="text-violet-200 text-xs font-semibold">{t.starPoints}</div>
          </div>
        </div>
        <div className="relative flex gap-3 mt-3">
          {[{ val: mandatory.length + active.length, label: t.activeCount }, { val: pending.length, label: t.pendingCount }, { val: done.length, label: t.doneCount }].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
              <div className="font-black text-lg leading-none">{s.val}</div>
              <div className="text-xs text-violet-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur shadow-sm overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex-shrink-0 py-3 px-3 font-black text-xs transition-all whitespace-nowrap ${tab === tb.id ? 'text-violet-700' : 'text-gray-400 hover:text-gray-600'}`}
              style={{ borderBottom: tab === tb.id ? '3px solid #7C3AED' : '3px solid transparent' }}>
              {tb.emoji} {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {tab === 'tasks' && (
          <>
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button onClick={() => setActiveFilter('active')}
                className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${activeFilter === 'active' ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
                📋 {t.showActive || 'Активні'}
              </button>
            </div>

            {tasks.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🌈</div>
                <p className="text-xl font-bold text-gray-400">{t.noTasksTitle}</p>
                <p className="text-gray-300 font-semibold">{t.noTasksSubtitle}</p>
              </div>
            )}

            {mandatory.length > 0 && (
              <div>
                <h2 className="text-base font-black text-red-600 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
                  {t.mandatoryTasks}
                </h2>
                <div className="space-y-3">
                  {mandatory.map(task => <TaskCard key={task.id} task={task} childView onComplete={handleComplete} />)}
                </div>
              </div>
            )}

            {active.length > 0 && (
              <div>
                <h2 className="text-base font-black text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  {t.activeTasks}
                </h2>
                <div className="space-y-3">
                  {active.map(task => <TaskCard key={task.id} task={task} childView onComplete={handleComplete} />)}
                </div>
              </div>
            )}

            {pending.length > 0 && (
              <div>
                <h2 className="text-base font-black text-yellow-600 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                  {t.pendingTasks}
                </h2>
                <div className="space-y-3">
                  {pending.map(task => <TaskCard key={task.id} task={task} childView />)}
                </div>
              </div>
            )}

            {done.length > 0 && (
              <div>
                <h2 className="text-base font-black text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                  {t.doneTasks}
                </h2>
                <div className="space-y-3 opacity-70">
                  {done.map(task => <TaskCard key={task.id} task={task} childView />)}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'rewards' && (
          <>
            <div className="flex gap-3">
              <div className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center gap-3 text-white">
                <span className="text-3xl">⭐</span>
                <div>
                  <div className="font-black text-xl">{points}</div>
                  <div className="text-yellow-100 text-sm font-semibold">{t.yourPoints}</div>
                </div>
              </div>
            </div>

            {rewards.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-xl font-bold text-gray-400">{t.noRewardsTitle}</p>
                <p className="text-gray-300 font-semibold">{t.noRewardsSubtitle}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {rewards.map(reward => (
                <div key={reward.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 card-bounce">
                  <div className="text-4xl">{reward.emoji || '🎁'}</div>
                  <div className="font-black text-gray-800 text-sm text-center">{reward.title}</div>
                  <div className="flex items-center gap-1 text-orange-500 font-black text-sm">⭐ {reward.points_cost}</div>
                  <button
                    onClick={() => handleBuyReward(reward)}
                    disabled={points < reward.points_cost}
                    className={`w-full font-black py-2 rounded-xl text-xs active:scale-95 transition-all ${points >= reward.points_cost ? 'gradient-purple text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {points >= reward.points_cost ? t.buyButton : t.notEnoughPoints}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-6xl mb-3">{user.avatar_emoji}</div>
            <h2 className="text-xl font-black text-gray-800">{user.display_name}</h2>
            <p className="text-gray-400 font-semibold text-sm">@{user.login}</p>
            <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-white">
              <div className="text-3xl font-black">{points}</div>
              <div className="text-yellow-100 text-sm">{t.starPoints}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
