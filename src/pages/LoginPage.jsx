import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useLang, LanguageSwitcher } from '../i18n/index'

const EMOJIS = ['🦊','🐱','🐶','🐸','🦄','🐼','🐨','🦁','🐯','🐻','🦋','🐙']

export default function LoginPage() {
  const { login, register } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Login form
  const [loginVal, setLoginVal] = useState('')
  const [password, setPassword] = useState('')

  // Register form (parent only — has email)
  const [regName, setRegName] = useState('')
  const [regFamily, setRegFamily] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regPass2, setRegPass2] = useState('')

  const floats = useState(() =>
    Array.from({ length: 8 }, () => ({
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      size: Math.random() * 20 + 20,
      delay: Math.random() * 2,
    }))
  )[0]

  const getErrMsg = (code) => ({
    invalid_credentials: t.invalidCredentials || 'Невірний логін або пароль',
    login_taken: t.loginTaken || 'Логін вже зайнятий',
    email_taken: 'Цей email вже зареєстрований',
    family_error: t.familyCreateError || 'Помилка створення сім\'ї',
    account_error: t.accountCreateError || 'Помилка створення акаунту',
  })[code] || code

  // Detect if login input is email (parent) or login (child)
  const isEmailInput = loginVal.includes('@')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(loginVal, password)
      navigate(user.role === 'parent' ? '/parent' : '/child', { replace: true })
    } catch (err) {
      setError(getErrMsg(err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (regPass !== regPass2) { setError(t.passwordsNoMatch || 'Паролі не співпадають'); return }
    if (regPass.length < 6) { setError('Пароль мінімум 6 символів'); return }
    if (!regEmail.includes('@')) { setError('Введи правильний email'); return }
    setLoading(true)
    try {
      await register({ email: regEmail, password: regPass, displayName: regName, familyName: regFamily || regName })
      navigate('/parent', { replace: true })
    } catch (err) {
      setError(getErrMsg(err.message))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-2xl border-2 border-violet-200 focus:border-violet-500 focus:outline-none text-gray-700 font-semibold text-base transition-colors'

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {floats.map((f, i) => (
        <div key={i} className="absolute pointer-events-none select-none opacity-20"
          style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: `${f.size}px`, animation: `float ${3 + f.delay}s ease-in-out ${f.delay}s infinite` }}>
          {f.emoji}
        </div>
      ))}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm pop-in overflow-hidden">
        <div className="flex justify-end pt-4 pr-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center pt-2 pb-4 px-6">
          <div className="text-5xl mb-2 animate-bounce inline-block">🌟</div>
          <h1 className="text-2xl font-black text-violet-700">{t.appName}</h1>
          <p className="text-gray-400 font-semibold text-sm mt-0.5">{t.appTagline}</p>
        </div>

        <div className="flex mx-5 mb-5 bg-gray-100 rounded-2xl p-1">
          {['login', 'register'].map(v => (
            <button key={v} onClick={() => { setTab(v); setError('') }}
              className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${tab === v ? 'bg-white text-violet-700 shadow' : 'text-gray-400'}`}>
              {v === 'login' ? t.login || 'Увійти' : t.register || 'Реєстрація'}
            </button>
          ))}
        </div>

        <div className="px-6 pb-7">
          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">
                  {isEmailInput ? '📧 Email батьків' : '👤 Логін або email'}
                </label>
                <input
                  type="text"
                  value={loginVal}
                  onChange={e => setLoginVal(e.target.value)}
                  placeholder="email або логін дитини"
                  className={inputCls}
                  autoCapitalize="none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">
                  {t.passwordLabel || 'Пароль'}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" className={inputCls} required />
              </div>
              {/* Hint: parents use email */}
              <div className="bg-violet-50 rounded-xl px-3 py-2 text-xs text-violet-600 font-semibold">
                👨‍👩‍👧 Батьки входять через <strong>email</strong>. Діти — через <strong>логін</strong> без email.
              </div>
              {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold text-center">😬 {error}</div>}
              <button type="submit" disabled={loading} className="w-full gradient-purple text-white font-black text-lg py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60 mt-1">
                {loading ? '⏳ Входимо...' : t.loginButton || 'Увійти'}
              </button>
            </form>
          )}

          {/* ── REGISTER (parents only) ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="bg-violet-50 rounded-2xl px-4 py-3 text-xs text-violet-600 font-bold">
                👩‍💼 Реєстрація тільки для батьків. Акаунти дітей створюються всередині додатку.
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">Ваше ім'я</label>
                <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Наприклад: Марія" className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">Назва сім'ї <span className="text-gray-300 font-normal">(необов'язково)</span></label>
                <input value={regFamily} onChange={e => setRegFamily(e.target.value)} placeholder="Сім'я Коваленко" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">📧 Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="mama@gmail.com"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">Пароль <span className="text-gray-400 font-normal text-xs">(мін. 6 символів)</span></label>
                <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="••••••" className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">Повторити пароль</label>
                <input type="password" value={regPass2} onChange={e => setRegPass2(e.target.value)} placeholder="••••••" className={inputCls} required />
              </div>
              {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold text-center">😬 {error}</div>}
              <button type="submit" disabled={loading} className="w-full gradient-purple text-white font-black text-lg py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60">
                {loading ? '⏳ Створюємо...' : t.registerButton || 'Створити акаунт'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
