import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from '../lib/auth'
import { useLang, LanguageSwitcher } from '../i18n/index'
import { supabase } from '../lib/supabase'
import TaskCard from '../components/TaskCard'
import FeedItem, { AvatarDisplay } from '../components/FeedItem'
import AvatarPicker from '../components/AvatarPicker'
import PetRoom from '../components/PetRoom'

// ─── Level system ────────────────────────────────────────────────────────────
const LEVELS = [
  { name: 'Початківець', min: 0, max: 99, emoji: '🌱' },
  { name: 'Зірка', min: 100, max: 299, emoji: '⭐' },
  { name: 'Герой', min: 300, max: 699, emoji: '🚀' },
  { name: 'Чемпіон', min: 700, max: 1499, emoji: '🏆' },
  { name: 'Легенда', min: 1500, max: Infinity, emoji: '👑' },
]

function getLevel(totalEarned) {
  return LEVELS.find(l => totalEarned >= l.min && totalEarned <= l.max) || LEVELS[0]
}

function getLevelProgress(totalEarned) {
  const lvl = getLevel(totalEarned)
  if (lvl.max === Infinity) return 100
  const range = lvl.max - lvl.min + 1
  const progress = totalEarned - lvl.min
  return Math.min(100, Math.round((progress / range) * 100))
}

// ─── Achievements ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first_step', emoji: '🎯', name: 'Перший крок', desc: 'Виконай перше завдання' },
  { id: '7_days', emoji: '🔥', name: '7 днів поспіль', desc: 'Виконуй завдання 7 днів підряд' },
  { id: 'star_collector', emoji: '⭐', name: 'Збирач зірок', desc: 'Набери 100 зірок' },
  { id: 'treasure', emoji: '💎', name: 'Скарбник', desc: 'Набери 500 зірок' },
  { id: 'first_challenge', emoji: '🏆', name: 'Перший челендж', desc: 'Виконай перший челендж' },
  { id: 'first_purchase', emoji: '📦', name: 'Перша покупка', desc: 'Купи перший приз' },
  { id: 'first_exchange', emoji: '💵', name: 'Перший обмін', desc: 'Обміняй зірки на гроші' },
  { id: 'hardworker', emoji: '📋', name: 'Працьовитий', desc: 'Виконай 10 завдань' },
  { id: 'champion', emoji: '🥊', name: 'Чемпіон батлу', desc: 'Перемогти у батлі' },
  { id: 'legend', emoji: '👑', name: 'Легенда', desc: 'Досягни рівня Легенда' },
]

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🐙', '🦋', '🐬', '🦄', '🐉', '🦅', '🐺', '🐨', '🦊', '🐻', '🦝']

// ─── Countdown overlay ────────────────────────────────────────────────────────
function CountdownOverlay({ task, onConfirm, onCancel }) {
  const [count, setCount] = useState(3)
  useEffect(() => {
    if (count <= 0) { onConfirm(); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, onConfirm])
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-5xl mb-3">🎉</div>
        <div className="font-black text-lg text-gray-800 mb-1">{task.title}</div>
        <div className="font-black text-violet-600 mb-4">+{task.points} ⭐</div>
        <div className="bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-1000"
            style={{ width: `${(count / 3) * 100}%` }} />
        </div>
        <p className="text-sm text-gray-500 mb-4">Підтвердження через {count}...</p>
        <button onClick={onCancel}
          className="w-full bg-gray-100 text-gray-600 font-black py-3 rounded-2xl">
          ❌ Скасувати
        </button>
      </div>
    </div>
  )
}

// ─── Purchase modal ───────────────────────────────────────────────────────────
function PurchaseModal({ reward, points, onConfirm, onCancel }) {
  const canAfford = points >= reward.points_cost
  const remaining = points - reward.points_cost
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl">
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 text-center text-white">
          <div className="text-5xl mb-2">{reward.emoji || '🎁'}</div>
          <div className="font-black text-xl">{reward.title}</div>
          {reward.description && <p className="text-sm text-orange-100 mt-1">{reward.description}</p>}
        </div>
        <div className="p-5">
          <div className="bg-gray-50 rounded-2xl overflow-hidden mb-4">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-gray-500 font-semibold">Твої бали</span>
              <span className="font-black text-gray-800">⭐{points}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <span className="text-gray-500 font-semibold">Вартість</span>
              <span className="font-black text-orange-500">−⭐{reward.points_cost}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-gray-500 font-semibold">Залишиться</span>
              <span className={`font-black ${canAfford ? 'text-green-600' : 'text-red-500'}`}>⭐{remaining}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 font-black py-3 rounded-2xl">Назад</button>
            <button onClick={onConfirm} disabled={!canAfford}
              className={`flex-1 font-black py-3 rounded-2xl ${canAfford ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {canAfford ? '🛒 Купити!' : 'Мало ⭐'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Receipt modal ────────────────────────────────────────────────────────────
function ReceiptModal({ purchase, childName, childEmoji, pointsAfter, onClose }) {
  const d = new Date(purchase.purchased_at)
  const dateStr = d.toLocaleDateString('uk-UA')
  const timeStr = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
  const receiptText = `🧾 ЧЕК НА ПРИЗ\n📅 Дата: ${dateStr}\n⏰ Час: ${timeStr}\n👤 Хто: ${childEmoji || ''} ${childName || ''}\n${purchase.rewards?.emoji || '🎁'} ${purchase.rewards?.title}\nВитрачено: −⭐${purchase.points_spent}\nЗалишок: ⭐${pointsAfter ?? ''}`

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-400 to-green-500 p-6 text-center text-white">
          <div className="text-5xl mb-2">🎉</div>
          <div className="font-black text-xl">Ура! Куплено!</div>
          <div className="text-teal-100 text-sm font-semibold">Покажи чек батькам</div>
        </div>
        {/* Receipt body */}
        <div className="p-5">
          <div className="bg-gray-50 rounded-2xl overflow-hidden mb-4">
            <div className="text-center py-3 border-b border-dashed border-gray-200">
              <span className="font-black text-gray-700 text-sm tracking-wider">📅 ЧЕК НА ПРИЗ</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">📅 Дата:</span>
                <span className="font-bold">{dateStr}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">⏰ Час:</span>
                <span className="font-bold">{timeStr}</span>
              </div>
              {(childName || childEmoji) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">👤 Хто:</span>
                  <span className="font-bold">{childEmoji} {childName}</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 pt-2 mt-2">
                <div className="font-black text-gray-800 text-center">{purchase.rewards?.emoji || '🎁'} {purchase.rewards?.title}</div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Витрачено:</span>
                <span className="font-black text-orange-500">−⭐{purchase.points_spent}</span>
              </div>
              {pointsAfter !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Залишок:</span>
                  <span className="font-black text-green-600">⭐{pointsAfter}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 font-semibold mb-3 text-center">Надіслати батькам:</div>
          <div className="space-y-2">
            <button onClick={() => { navigator.share ? navigator.share({ text: receiptText }) : navigator.clipboard?.writeText(receiptText) }}
              className="w-full bg-violet-600 text-white font-black py-3 rounded-2xl active:scale-95">
              📤 Поділитися
            </button>
            <button onClick={() => navigator.clipboard?.writeText(receiptText).then(() => alert('Скопійовано!'))}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 font-black py-3 rounded-2xl active:scale-95">
              📋 Скопіювати чек
            </button>
            <button onClick={onClose}
              className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-black py-3 rounded-2xl active:scale-95">
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChildDashboard() {
  const { user, logout } = useAuth()
  const { t, lang } = useLang()
  const [tab, setTab] = useState('tasks')
  const [taskSubTab, setTaskSubTab] = useState('active')

  // Data
  const [tasks, setTasks] = useState([])
  const [rewards, setRewards] = useState([])
  const [challenges, setChallenges] = useState([])
  const [purchases, setPurchases] = useState([])
  const [feedItems, setFeedItems] = useState([])
  const [achievements, setAchievements] = useState([])
  const [familyConfig, setFamilyConfig] = useState(null)
  const [battle, setBattle] = useState(null)
  const [points, setPoints] = useState(user.points || 0)
  const [totalPointsEarned, setTotalPointsEarned] = useState(user.total_points_earned || 0)
  const [loading, setLoading] = useState(true)

  // UI state
  const [countdownTask, setCountdownTask] = useState(null)
  const [purchaseTarget, setPurchaseTarget] = useState(null)
  const [receiptPurchase, setReceiptPurchase] = useState(null)
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false)
  const [showPetRoom, setShowPetRoom] = useState(false)
  const [pointsDelta, setPointsDelta] = useState(null)
  const deltaTimer = useRef(null)

  // Profile edit
  const [profileEmoji, setProfileEmoji] = useState(user.avatar_url || user.avatar_emoji || '🦊')
  const [profileName, setProfileName] = useState(user.display_name || '')
  const [profileLogin, setProfileLogin] = useState(user.login || '')
  const [profilePassword, setProfilePassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  // Battle
  const [battleCode, setBattleCode] = useState('')
  const [battleJoinCode, setBattleJoinCode] = useState('')
  const [battleLoading, setBattleLoading] = useState(false)
  const [battleSubTab, setBattleSubTab] = useState('new')

  // Money exchange
  const [exchangeAmount, setExchangeAmount] = useState(null)
  const [exchangeCustom, setExchangeCustom] = useState('')
  const [exchangeLoading, setExchangeLoading] = useState(false)

  const showDelta = (delta) => {
    setPointsDelta(delta)
    if (deltaTimer.current) clearTimeout(deltaTimer.current)
    deltaTimer.current = setTimeout(() => setPointsDelta(null), 2000)
  }

  const loadData = useCallback(async () => {
    // Reset recurring tasks completed on previous days (safe to call repeatedly)
    supabase.rpc('reset_recurring_tasks').then(({ data, error }) => {
      if (!error && data > 0) {
        // Some tasks were reset — reload tasks list after brief delay
        setTimeout(() => {
          supabase.from('tasks').select('*').eq('family_id', user.family_id).eq('assigned_to', user.id)
            .order('is_mandatory', { ascending: false }).order('created_at', { ascending: false })
            .then(({ data: t }) => { if (t) setTasks(t) })
        }, 300)
      }
    })

    const [tasksRes, rewardsRes, userRes, challengesRes, purchasesRes, feedRes, achRes, configRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('family_id', user.family_id).eq('assigned_to', user.id)
        .order('is_mandatory', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('rewards').select('*').eq('family_id', user.family_id).eq('active', true)
        .order('points_cost', { ascending: true }),
      supabase.from('users').select('points, total_points_earned').eq('id', user.id).single(),
      supabase.from('challenges').select('*, challenge_tasks(*)').eq('family_id', user.family_id).eq('assigned_to', user.id).eq('status', 'active'),
      supabase.from('reward_purchases').select('*, rewards(title, emoji, points_cost)').eq('child_id', user.id).order('purchased_at', { ascending: false }),
      supabase.from('activity_feed').select('*, reactions, users!activity_feed_child_id_fkey(display_name, avatar_emoji, avatar_url)').eq('family_id', user.family_id).order('created_at', { ascending: false }).limit(50),
      supabase.from('user_achievements').select('*').eq('user_id', user.id),
      supabase.from('family_configs').select('*').eq('family_id', user.family_id).single(),
    ])
    setTasks(tasksRes.data || [])
    setRewards(rewardsRes.data || [])
    if (userRes.data) {
      setPoints(userRes.data.points || 0)
      setTotalPointsEarned(userRes.data.total_points_earned || 0)
    }
    setChallenges(challengesRes.data || [])
    setPurchases(purchasesRes.data || [])
    setFeedItems(feedRes.data || [])
    setAchievements(achRes.data || [])
    setFamilyConfig(configRes.data || null)
    setLoading(false)
  }, [user.id, user.family_id])

  // Load battle
  const loadBattle = useCallback(async () => {
    const { data } = await supabase.from('quest_battles')
      .select('*')
      .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .in('status', ['waiting', 'active'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setBattle(data || null)
  }, [user.id])

  useEffect(() => { loadData(); loadBattle() }, [loadData, loadBattle])

  // ── Task complete ──────────────────────────────────────────────────────────
  const handleCompleteClick = (task) => {
    setCountdownTask(task)
  }

  const handleCountdownConfirm = async () => {
    const task = countdownTask
    setCountdownTask(null)
    await supabase.from('tasks').update({
      status: 'pending_approval',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', task.id)
    // Log to feed
    await supabase.from('activity_feed').insert({
      family_id: user.family_id,
      child_id: user.id,
      event_type: 'task_submitted',
      payload: { task_id: task.id, task_title: task.title, points: task.points },
    })
    loadData()
  }

  // ── Buy reward ─────────────────────────────────────────────────────────────
  const handleBuyConfirm = async () => {
    const reward = purchaseTarget
    setPurchaseTarget(null)
    if (points < reward.points_cost) return
    const newPoints = points - reward.points_cost
    await supabase.from('users').update({ points: newPoints }).eq('id', user.id)
    const { data: purch } = await supabase.from('reward_purchases').insert({
      reward_id: reward.id, child_id: user.id,
      points_spent: reward.points_cost, status: 'active',
    }).select('*, rewards(title, emoji, points_cost)').single()
    showDelta(-reward.points_cost)
    setPoints(newPoints)
    // Log feed
    await supabase.from('activity_feed').insert({
      family_id: user.family_id,
      child_id: user.id,
      event_type: 'reward_purchased',
      payload: { reward_id: reward.id, reward_title: reward.title, points_spent: reward.points_cost },
    })
    if (purch) setReceiptPurchase(purch)
    loadData()
  }

  // ── Profile save ───────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    setProfileSaving(true)
    await supabase.rpc('update_child_credentials', {
      p_child_id: user.id,
      p_display_name: profileName || null,
      p_login: profileLogin || null,
      p_password: profilePassword || null,
    })
    const isPhotoUrl = profileEmoji?.startsWith('http')
    await supabase.from('users').update({
      ...(isPhotoUrl ? { avatar_url: profileEmoji } : { avatar_emoji: profileEmoji, avatar_url: null }),
    }).eq('id', user.id)
    setProfileSaving(false)
    setProfilePassword('')
  }

  // ── Battle ─────────────────────────────────────────────────────────────────
  const handleCreateBattle = async () => {
    setBattleLoading(true)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const now = new Date()
    const ends = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const { data } = await supabase.from('quest_battles').insert({
      invite_code: code,
      challenger_id: user.id,
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
      status: 'waiting',
      bonus_points: 50,
    }).select().single()
    setBattle(data)
    setBattleCode(code)
    setBattleLoading(false)
  }

  const handleJoinBattle = async () => {
    if (!battleJoinCode.trim()) return
    setBattleLoading(true)
    const { data: b } = await supabase.from('quest_battles')
      .select('*').eq('invite_code', battleJoinCode.trim().toUpperCase()).eq('status', 'waiting').single()
    if (b && b.challenger_id !== user.id) {
      await supabase.from('quest_battles').update({ opponent_id: user.id, status: 'active' }).eq('id', b.id)
      setBattle({ ...b, opponent_id: user.id, status: 'active' })
    }
    setBattleLoading(false)
    setBattleJoinCode('')
  }

  // ── Money exchange ─────────────────────────────────────────────────────────
  const handleExchange = async () => {
    const starAmount = exchangeAmount === 'custom' ? parseInt(exchangeCustom) : exchangeAmount
    if (!starAmount || starAmount <= 0 || starAmount > points) return
    if (!familyConfig?.pocket_money_enabled) return
    const rate = familyConfig.exchange_rate || 4
    const moneyAmount = starAmount / rate
    setExchangeLoading(true)
    await supabase.from('point_exchanges').insert({
      child_id: user.id,
      family_id: user.family_id,
      points_spent: starAmount,
      money_amount: moneyAmount,
      currency: familyConfig.currency || 'UAH',
      status: 'pending',
    })
    const newPoints = points - starAmount
    await supabase.from('users').update({ points: newPoints }).eq('id', user.id)
    showDelta(-starAmount)
    setPoints(newPoints)
    await supabase.from('activity_feed').insert({
      family_id: user.family_id,
      child_id: user.id,
      event_type: 'points_exchanged',
      payload: { points_spent: starAmount, money_amount: moneyAmount, currency: familyConfig.currency || 'UAH' },
    })
    setExchangeLoading(false)
    setExchangeAmount(null)
    setExchangeCustom('')
    loadData()
  }

  // ─────────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'tasks', label: 'Завдання', emoji: '📋' },
    { id: 'challenges', label: 'Челенджі', emoji: '🏅' },
    { id: 'rewards', label: 'Призи', emoji: '🎁' },
    { id: 'money', label: 'Гроші', emoji: '💰' },
    { id: 'battle', label: 'Батл', emoji: '⚔️' },
    { id: 'levels', label: 'Рівні', emoji: '🌟' },
    { id: 'feed', label: 'Стрічка', emoji: '📺' },
    { id: 'profile', label: 'Профіль', emoji: '👤' },
  ]

  const activeTasks = tasks.filter(t => t.status === 'active')
  const pendingTasks = tasks.filter(t => t.status === 'pending_approval')
  const doneTasks = tasks.filter(t => t.status === 'done')
  const recurringTasks = tasks.filter(t => t.is_recurring && t.status === 'active')
  const mandatoryTasks = tasks.filter(t => t.is_mandatory && t.status === 'active')

  const level = getLevel(totalPointsEarned)
  const levelProgress = getLevelProgress(totalPointsEarned)

  const currencySymbol = { UAH: '₴', USD: '$', EUR: '€', PLN: 'zł' }[familyConfig?.currency || 'UAH'] || '₴'

  const today = new Date().getDay() // 0=Sun, 1=Mon...
  const dayLabels = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100">
      <div className="text-5xl animate-bounce">⭐</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-pink-50">
      {/* Overlays */}
      {countdownTask && (
        <CountdownOverlay
          task={countdownTask}
          onConfirm={handleCountdownConfirm}
          onCancel={() => setCountdownTask(null)}
        />
      )}
      {purchaseTarget && (
        <PurchaseModal
          reward={purchaseTarget}
          points={points}
          onConfirm={handleBuyConfirm}
          onCancel={() => setPurchaseTarget(null)}
        />
      )}
      {receiptPurchase && (
        <ReceiptModal
          purchase={receiptPurchase}
          childName={user.display_name}
          childEmoji={user.avatar_emoji}
          pointsAfter={points}
          onClose={() => setReceiptPurchase(null)}
        />
      )}

      {/* Pet Room overlay */}
      {showPetRoom && <PetRoom user={user} onClose={() => setShowPetRoom(false)} />}

      {/* Header */}
      <div className="gradient-purple text-white px-4 pt-5 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-violet-200 font-semibold text-sm">{t.hello || 'Привіт,'}</p>
            <h1 className="text-2xl font-black flex items-center gap-2">
              {user.avatar_url?.startsWith('http')
                ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-xl object-cover inline-block" />
                : user.avatar_emoji
              }
              {user.display_name}!
            </h1>
            <p className="text-violet-200 text-sm font-semibold">{level.emoji} {level.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPetRoom(true)}
              className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-white/20 active:scale-90 transition-all">
              <span className="text-xl leading-none">🐾</span>
              <span className="text-[9px] text-violet-200 font-bold mt-0.5">Пет</span>
            </button>
            <LanguageSwitcher light />
            <button onClick={logout}
              className="text-violet-200 hover:text-white text-sm font-bold bg-white/10 px-3 py-1.5 rounded-full transition-colors">
              {t.logout || 'Вийти'}
            </button>
          </div>
        </div>
        <div className="relative mt-3 inline-flex items-center gap-3 bg-white/20 backdrop-blur rounded-2xl px-5 py-3">
          <div className="text-3xl">⭐</div>
          <div>
            <div className="text-3xl font-black leading-none flex items-center gap-2">
              {points}
              {pointsDelta !== null && (
                <span className={`text-base font-black ${pointsDelta > 0 ? 'text-green-300' : 'text-red-300'} animate-pulse`}>
                  {pointsDelta > 0 ? `▲+${pointsDelta}` : `▼${pointsDelta}`}
                </span>
              )}
            </div>
            <div className="text-violet-200 text-xs font-semibold">{t.starPoints || 'зірок'}</div>
          </div>
        </div>
        <div className="relative flex gap-2 mt-3 flex-wrap">
          {[
            { val: activeTasks.length + mandatoryTasks.length, label: t.activeCount || 'активних' },
            { val: pendingTasks.length, label: t.pendingCount || 'на перевірці' },
            { val: doneTasks.length, label: t.doneCount || 'виконано' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
              <div className="font-black text-lg leading-none">{s.val}</div>
              <div className="text-xs text-violet-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.filter(tb => tb.id !== 'money' || familyConfig?.pocket_money_enabled).map(tb => (
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

        {/* ── TASKS TAB ─────────────────────────────────────────────────── */}
        {tab === 'tasks' && (
          <>
            {/* Sub-tabs */}
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button onClick={() => setTaskSubTab('active')}
                className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${taskSubTab === 'active' ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
                📋 Активні
              </button>
              <button onClick={() => setTaskSubTab('recurring')}
                className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${taskSubTab === 'recurring' ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
                🔄 Регулярні
              </button>
            </div>

            {taskSubTab === 'active' && (
              <>
                {tasks.filter(t => !t.is_recurring).length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🌈</div>
                    <p className="text-xl font-bold text-gray-400">{t.noTasksTitle || 'Завдань поки нема'}</p>
                    <p className="text-gray-300 font-semibold">{t.noTasksSubtitle || 'Відпочивай!'}</p>
                  </div>
                )}

                {mandatoryTasks.length > 0 && (
                  <div>
                    <h2 className="text-base font-black text-red-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
                      {t.mandatoryTasks || 'Обов\'язкові завдання'}
                    </h2>
                    <div className="space-y-3">
                      {mandatoryTasks.map(task => (
                        <TaskCard key={task.id} task={task} childView onComplete={handleCompleteClick} />
                      ))}
                    </div>
                  </div>
                )}

                {activeTasks.length > 0 && (
                  <div>
                    <h2 className="text-base font-black text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                      {t.activeTasks || 'Активні завдання'}
                    </h2>
                    <div className="space-y-3">
                      {activeTasks.map(task => (
                        <TaskCard key={task.id} task={task} childView onComplete={handleCompleteClick} />
                      ))}
                    </div>
                  </div>
                )}

                {pendingTasks.length > 0 && (
                  <div>
                    <h2 className="text-base font-black text-yellow-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block animate-pulse" />
                      🕐 На перевірці у батьків
                    </h2>
                    <div className="space-y-3">
                      {pendingTasks.map(task => (
                        <div key={task.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                          <div className="font-black text-gray-800">{task.title}</div>
                          <div className="text-yellow-600 text-sm font-semibold mt-1">⏳ Очікує підтвердження</div>
                          <div className="text-orange-500 font-black text-sm mt-1">+{task.points} ⭐</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {doneTasks.length > 0 && (
                  <div>
                    <h2 className="text-base font-black text-gray-500 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                      {t.doneTasks || 'Виконані'}
                    </h2>
                    <div className="space-y-3 opacity-70">
                      {doneTasks.map(task => {
                        const doneAt = task.updated_at ? new Date(task.updated_at) : null
                        return (
                          <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-gray-800">{task.title}</div>
                                {doneAt && (
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {doneAt.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })} · {doneAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                              <span className="text-green-600 font-black text-sm ml-2">✅ +{task.points} ⭐</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {taskSubTab === 'recurring' && (
              <>
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 text-violet-700 text-sm font-semibold flex items-start gap-2">
                  <span className="text-xl">🔄</span>
                  <span>Регулярні завдання автоматично відновлюються за розкладом кожен день</span>
                </div>

                {recurringTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🔄</div>
                    <p className="font-bold text-gray-400">Регулярних завдань ще немає</p>
                  </div>
                )}

                <div className="space-y-3">
                  {recurringTasks.map(task => {
                    // completions count from title/metadata if available
                    const completions = task.completions_count || 0
                    return (
                      <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔄</span>
                            <div className="font-black text-gray-800">{task.title}</div>
                          </div>
                          <div className="text-right">
                            {completions > 0 && (
                              <div className="text-xs text-gray-400 font-semibold">{completions} виконань</div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 font-semibold mb-2">
                          {task.recurrence_type === 'daily' ? 'щодня' : task.recurrence_type === 'weekdays' ? 'будні' : task.recurrence_type === 'weekends' ? 'вихідні' : 'щодня'} · ⭐{task.points}
                        </div>
                        {/* Day chips */}
                        <div className="flex gap-1 mb-3">
                          {dayLabels.map((d, i) => {
                            const isToday = i === today
                            return (
                              <div key={i}
                                className={`flex-1 py-1.5 rounded-lg text-center font-black text-xs transition-all ${isToday ? 'gradient-purple text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {d}
                              </div>
                            )
                          })}
                        </div>
                        {task.status === 'done' && (
                          <div className="text-green-500 font-black text-sm">✅ Виконано сьогодні</div>
                        )}
                        {task.status === 'pending_approval' && (
                          <div className="text-yellow-500 font-black text-sm">⏳ На перевірці у батьків</div>
                        )}
                        {task.status === 'active' && (
                          <button onClick={() => handleCompleteClick(task)}
                            className="mt-1 w-full gradient-purple text-white font-black py-2.5 rounded-xl text-sm active:scale-95 transition-all">
                            🐾 Я виконав!
                          </button>
                        )}
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
            {challenges.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏅</div>
                <p className="text-xl font-bold text-gray-400">Челенджів поки немає</p>
                <p className="text-gray-300 font-semibold">Попроси батьків додати!</p>
              </div>
            )}
            <div className="space-y-4">
              {challenges.map(ch => {
                const subTasks = ch.challenge_tasks || []
                const done = subTasks.filter(st => st.done_reps >= st.total_reps).length
                const total = subTasks.length
                const progress = total > 0 ? Math.round((done / total) * 100) : 0
                return (
                  <div key={ch.id} className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{ch.emoji || '🏆'}</div>
                      <div>
                        <div className="font-black text-gray-800">{ch.title}</div>
                        {ch.description && <div className="text-gray-500 text-sm">{ch.description}</div>}
                      </div>
                    </div>
                    {ch.deadline && (
                      <div className="text-sm text-orange-500 font-semibold mb-2">
                        📅 До {new Date(ch.deadline).toLocaleDateString('uk-UA')}
                      </div>
                    )}
                    <div className="bg-gray-100 rounded-full h-2 mb-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                        style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-3">
                      <span>{done}/{total} завдань</span>
                      <span className="font-black text-violet-600">+{ch.bonus_points} ⭐ бонус</span>
                    </div>
                    {subTasks.length > 0 && (
                      <div className="space-y-2">
                        {subTasks.map(st => (
                          <div key={st.id} className={`flex items-center gap-3 p-3 rounded-xl ${st.done_reps >= st.total_reps ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${st.done_reps >= st.total_reps ? 'bg-green-400 border-green-400' : 'border-gray-300'}`}>
                              {st.done_reps >= st.total_reps && <span className="text-white text-xs">✓</span>}
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold text-sm ${st.done_reps >= st.total_reps ? 'text-green-700 line-through' : 'text-gray-800'}`}>{st.title}</div>
                              <div className="text-xs text-gray-400">{st.done_reps}/{st.total_reps} разів</div>
                            </div>
                            <div className="text-violet-600 font-black text-xs">+{st.points} ⭐</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── REWARDS TAB ─────────────────────────────────────────────────── */}
        {tab === 'rewards' && (
          <>
            {showPurchaseHistory ? (
              <>
                <button onClick={() => setShowPurchaseHistory(false)}
                  className="flex items-center gap-2 text-violet-600 font-black text-sm mb-2">
                  ← Назад до магазину
                </button>
                <h2 className="font-black text-gray-800 text-lg mb-3">🛒 Мої покупки</h2>
                {purchases.filter(p => p.status !== 'refunded').length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="font-bold text-gray-400">Покупок ще немає</p>
                  </div>
                )}
                <div className="space-y-3">
                  {purchases.filter(p => p.status !== 'refunded').map(p => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{p.rewards?.emoji || '🎁'}</div>
                        <div className="flex-1">
                          <div className="font-black text-gray-800">{p.rewards?.title}</div>
                          <div className="text-sm text-orange-500 font-semibold">
                            −⭐{p.points_spent} · {new Date(p.purchased_at).toLocaleDateString('uk-UA')}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setReceiptPurchase(p)}
                        className="w-full bg-violet-50 text-violet-700 font-black text-sm py-2 rounded-xl active:scale-95">
                        🧾 Чек
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center gap-3 text-white">
                    <span className="text-3xl">⭐</span>
                    <div>
                      <div className="font-black text-xl">{points}</div>
                      <div className="text-yellow-100 text-sm font-semibold">{t.yourPoints || 'твоїх зірок'}</div>
                    </div>
                  </div>
                  <button onClick={() => setShowPurchaseHistory(true)}
                    className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center gap-1 text-violet-600">
                    <span className="text-xl">🛒</span>
                    <span className="text-xs font-black">Покупки</span>
                  </button>
                </div>

                {rewards.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎁</div>
                    <p className="text-xl font-bold text-gray-400">{t.noRewardsTitle || 'Призів ще немає'}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {rewards.map(reward => (
                    <div key={reward.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 card-bounce">
                      <div className="text-4xl">{reward.emoji || '🎁'}</div>
                      <div className="font-black text-gray-800 text-sm text-center">{reward.title}</div>
                      <div className="flex items-center gap-1 text-orange-500 font-black text-sm">⭐ {reward.points_cost}</div>
                      <button
                        onClick={() => setPurchaseTarget(reward)}
                        className={`w-full font-black py-2 rounded-xl text-xs active:scale-95 transition-all ${points >= reward.points_cost ? 'gradient-purple text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {points >= reward.points_cost ? '🛒 Купити' : t.notEnoughPoints || 'Мало зірок'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── MONEY TAB ───────────────────────────────────────────────────── */}
        {tab === 'money' && familyConfig?.pocket_money_enabled && (
          <>
            {/* Dual-section green card */}
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl p-5 text-white">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs font-black tracking-wider text-green-100 mb-1">твої зіркові бали</div>
                  <div className="text-4xl font-black">⭐{points}</div>
                </div>
                <div className="w-px bg-white/30" />
                <div className="flex-1">
                  <div className="text-xs font-black tracking-wider text-green-100 mb-1">Курс обміну</div>
                  <div className="font-black text-lg">100⭐ = {(100 / (familyConfig.exchange_rate || 4)).toFixed(0)}{currencySymbol}</div>
                </div>
              </div>
            </div>

            {/* Preset tiles */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-black text-gray-800 mb-3">Оберіть суму для обміну</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[20, 50, 100, 200].map(amt => {
                  const money = (amt / (familyConfig.exchange_rate || 4)).toFixed(0)
                  const canAfford = points >= amt
                  return (
                    <button key={amt} onClick={() => { setExchangeAmount(amt); setExchangeCustom('') }}
                      disabled={!canAfford}
                      className={`py-4 rounded-2xl font-black text-sm transition-all flex flex-col items-center gap-1 ${exchangeAmount === amt ? 'gradient-purple text-white' : canAfford ? 'bg-gray-100 text-gray-700 hover:bg-green-50' : 'bg-gray-50 text-gray-300'}`}>
                      <span className="text-base">⭐{amt}</span>
                      <span className="text-xs opacity-80">= {money}{currencySymbol}</span>
                    </button>
                  )
                })}
              </div>

              {/* Custom input */}
              <div className="mb-3">
                <div className="text-sm font-black text-gray-700 mb-2">Своя сума</div>
                <input
                  type="number"
                  value={exchangeCustom}
                  onChange={e => { setExchangeCustom(e.target.value); setExchangeAmount('custom') }}
                  placeholder="Введи кількість ⭐"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm focus:outline-none focus:border-green-400"
                />
                {exchangeAmount === 'custom' && exchangeCustom && (
                  <div className="text-center text-sm text-green-600 font-black mt-1">
                    = {(parseInt(exchangeCustom) / (familyConfig.exchange_rate || 4)).toFixed(2)}{currencySymbol}
                  </div>
                )}
              </div>

              {familyConfig.mono_send_jar_id && (
                <div className="bg-green-50 rounded-xl p-3 mb-3 text-sm text-green-700 font-semibold">
                  💳 Mono Jar: {familyConfig.mono_send_jar_id}
                </div>
              )}
              <button
                onClick={handleExchange}
                disabled={exchangeLoading || (!exchangeAmount && !exchangeCustom)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black py-3 rounded-xl disabled:opacity-50 active:scale-95">
                {exchangeLoading ? '⏳ Обробка...' : '💰 Обміняти зірки'}
              </button>
            </div>
          </>
        )}

        {/* ── BATTLE TAB ──────────────────────────────────────────────────── */}
        {tab === 'battle' && (
          <>
            {battle ? (
              <div className="space-y-4">
                {battle.status === 'waiting' && (
                  <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-5 text-white text-center">
                      <div className="text-4xl mb-2">⚔️</div>
                      <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="font-black text-sm">🎯 Очікує суперника</span>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-green-400 text-white rounded-full px-3 py-1 font-black text-sm ml-2">
                        +50⭐
                      </div>
                    </div>
                    <div className="p-5 text-center">
                      <div className="text-sm text-gray-500 font-semibold mb-3">Поділись кодом з другом:</div>
                      <div className="bg-violet-50 rounded-2xl py-5 px-6 mb-4">
                        <div className="font-black text-4xl tracking-[0.3em] text-violet-700">{battle.invite_code}</div>
                      </div>
                      <button onClick={() => navigator.clipboard?.writeText(battle.invite_code).then(() => alert('Скопійовано!'))}
                        className="w-full bg-violet-100 text-violet-700 font-black py-3 rounded-xl active:scale-95">
                        📋 Скопіювати код
                      </button>
                      <div className="text-xs text-gray-400 mt-3">До {new Date(battle.ends_at).toLocaleDateString('uk-UA')} · +{battle.bonus_points} ⭐ переможцю</div>
                    </div>
                  </div>
                )}
                {battle.status === 'active' && (
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-5 text-white">
                    <div className="text-sm font-semibold opacity-80 mb-1">⚔️ Батл активний</div>
                    <div className="font-black text-lg mb-3">🔥 Хто більше виконає завдань?</div>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
                        <div className="text-xs opacity-70">Ти</div>
                        <div className="font-black text-3xl">{battle.challenger_id === user.id ? (battle.challenger_score || 0) : (battle.opponent_score || 0)}</div>
                      </div>
                      <div className="text-2xl font-black self-center">VS</div>
                      <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
                        <div className="text-xs opacity-70">Суперник</div>
                        <div className="font-black text-3xl">{battle.challenger_id === user.id ? (battle.opponent_score || 0) : (battle.challenger_score || 0)}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs opacity-70 text-center">
                      До {new Date(battle.ends_at).toLocaleDateString('uk-UA')} · +{battle.bonus_points} ⭐ переможцю
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Sub-tabs */}
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button onClick={() => setBattleSubTab('new')}
                    className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${battleSubTab === 'new' ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
                    🗡 Новий бій
                  </button>
                  <button onClick={() => setBattleSubTab('join')}
                    className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${battleSubTab === 'join' ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
                    🔗 Приєднатись
                  </button>
                </div>

                {battleSubTab === 'new' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <div className="text-5xl mb-3">⚔️</div>
                    <h2 className="font-black text-gray-800 text-lg mb-2">Батл із другом</h2>
                    <p className="text-gray-500 text-sm mb-5">7-денне змагання — хто більше виконає завдань! Переможець отримує +50⭐</p>
                    <button onClick={handleCreateBattle} disabled={battleLoading}
                      className="w-full gradient-purple text-white font-black py-3 rounded-xl mb-3 disabled:opacity-50 active:scale-95">
                      {battleLoading ? '⏳...' : '🚀 Створити батл'}
                    </button>
                    {battleCode && (
                      <div className="bg-violet-50 rounded-2xl py-4 px-5">
                        <div className="text-xs text-gray-500 mb-2">Поділись кодом з другом:</div>
                        <div className="font-black text-3xl text-violet-700 tracking-[0.3em]">{battleCode}</div>
                      </div>
                    )}
                  </div>
                )}

                {battleSubTab === 'join' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="text-center mb-5">
                      <div className="text-5xl mb-2">🔗</div>
                      <h3 className="font-black text-gray-800 text-lg">Приєднатись до батлу</h3>
                      <p className="text-gray-500 text-sm mt-1">Введи код від друга</p>
                    </div>
                    <input
                      value={battleJoinCode}
                      onChange={e => setBattleJoinCode(e.target.value.toUpperCase())}
                      placeholder="XXXXXX"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 font-black text-center tracking-[0.3em] text-xl focus:outline-none focus:border-violet-400 uppercase mb-3"
                      maxLength={6}
                    />
                    <button onClick={handleJoinBattle} disabled={battleLoading || !battleJoinCode.trim()}
                      className="w-full gradient-purple text-white font-black py-3 rounded-xl disabled:opacity-50 active:scale-95">
                      {battleLoading ? '⏳...' : '⚔️ Вступити в батл!'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── LEVELS TAB ──────────────────────────────────────────────────── */}
        {tab === 'levels' && (
          <>
            {/* Current level card */}
            {(() => {
              const nextLevel = LEVELS.find(l => l.min > totalPointsEarned)
              const toNext = nextLevel ? nextLevel.min - totalPointsEarned : 0
              return (
                <div className="gradient-purple text-white rounded-3xl p-6">
                  <div className="text-xs font-black tracking-widest text-violet-200 mb-3">ПОТОЧНИЙ РІВЕНЬ</div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl">{level.emoji}</div>
                    <div>
                      <div className="font-black text-2xl">{level.name}</div>
                      <div className="text-violet-200 font-semibold">⭐{totalPointsEarned} зірок</div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${levelProgress}%` }} />
                  </div>
                  {nextLevel ? (
                    <>
                      <div className="flex justify-between text-xs text-violet-200 font-semibold mb-1">
                        <span>До рівня {nextLevel.emoji} {nextLevel.name}</span>
                        <span>{levelProgress}%</span>
                      </div>
                      <div className="text-xs text-violet-200">Залишилось: {toNext}⭐</div>
                    </>
                  ) : (
                    <div className="text-xs text-violet-200 font-black">👑 Максимальний рівень!</div>
                  )}
                </div>
              )
            })()}

            {/* Achievements 2×5 grid */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-black text-gray-800 mb-3">🏅 Досягнення</h3>
              <div className="grid grid-cols-2 gap-3">
                {ACHIEVEMENTS.map(ach => {
                  const unlocked = achievements.some(a => a.achievement_id === ach.id)
                  return (
                    <div key={ach.id}
                      className={`rounded-2xl p-3 flex items-center gap-3 transition-all ${unlocked ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50 opacity-50'}`}>
                      <div className={`text-3xl ${unlocked ? '' : 'grayscale'}`}>{ach.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs text-gray-800 leading-tight">{ach.name}</div>
                        <div className="text-xs text-gray-400 leading-tight mt-0.5">{ach.desc}</div>
                        {unlocked && <div className="text-xs text-yellow-600 font-black mt-1">✨ Відкрито!</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
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
              {feedItems.map(item => (
                <FeedItem
                  key={item.id}
                  item={item}
                  currentUserId={user.id}
                  canReact={false}
                />
              ))}
            </div>
          </>
        )}

        {/* ── PROFILE TAB ─────────────────────────────────────────────────── */}
        {tab === 'profile' && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-gray-800 mb-4 text-lg">👤 Аватар</h3>
              <div className="flex justify-center">
                <AvatarPicker value={profileEmoji} onChange={setProfileEmoji} userId={user.id} size="lg" allowPhoto={true} />
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">Натисни щоб змінити</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-black text-gray-800 text-lg">✏️ Редагування</h3>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Ім'я</label>
                <input value={profileName} onChange={e => setProfileName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Логін</label>
                <input value={profileLogin} onChange={e => setProfileLogin(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Новий пароль (залиш порожнім)</label>
                <input type="password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:border-violet-400" />
              </div>
              <button onClick={handleProfileSave} disabled={profileSaving}
                className="w-full gradient-purple text-white font-black py-3 rounded-xl disabled:opacity-50">
                {profileSaving ? '⏳ Зберігаємо...' : '💾 Зберегти'}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⭐</div>
                <div>
                  <div className="font-black text-gray-800">Поточний баланс: {points}</div>
                  <div className="text-gray-500 text-sm">Всього зароблено: {totalPointsEarned} ⭐</div>
                  <div className="text-gray-500 text-sm">{level.emoji} Рівень: {level.name}</div>
                </div>
              </div>
            </div>

            <button onClick={logout}
              className="w-full bg-red-50 text-red-500 font-black py-3 rounded-2xl">
              🚪 Вийти з акаунту
            </button>
          </>
        )}

      </div>
    </div>
  )
}
