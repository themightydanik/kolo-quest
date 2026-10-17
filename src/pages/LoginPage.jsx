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

  // Register form
  const [regName, setRegName] = useState('')
  const [regFamily, setRegFamily] = useState('')
  const [regLogin, setRegLogin] = useState('')
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
    invalid_credentials: t.invalidCredentials,
    login_taken: t.loginTaken,
    family_error: t.familyCreateError,
    account_error: t.accountCreateError,
  })[code] || code

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
    if (regPass !== regPass2) { setError(t.passwordsNoMatch); return }
    if (regPass.length < 4) { setError(t.passwordTooShort); return }
    setLoading(true)
    try {
      await register({ login: regLogin, password: regPass, displayName: regName, familyName: regFamily || regName })
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
              {v === 'login' ? t.login : t.register}
            </button>
          ))}
        </div>

        <div className="px-6 pb-7">
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">{t.loginLabel}</label>
                <input type="text" value={loginVal} onChange={e => setLoginVal(e.target.value)} placeholder={t.loginPlaceholder} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">{t.passwordLabel}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} className={inputCls} required />
              </div>
              {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold text-center">😬 {error}</div>}
              <button type="submit" disabled={loading} className="w-full gradient-purple text-white font-black text-lg py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60 mt-1">
                {loading ? t.loginLoading : t.loginButton}
              </button>
              <p className="text-center text-xs text-gray-400 font-semibold pt-1">{t.loginHint}</p>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="bg-violet-50 rounded-2xl px-4 py-3 text-xs text-violet-600 font-bold">{t.registerHint}</div>
              {[
                { label: t.yourName, val: regName, set: setRegName, ph: t.yourNamePlaceholder },
                { label: t.familyName, val: regFamily, set: setRegFamily, ph: t.familyNamePlaceholder, req: false },
                { label: t.loginFieldLabel, val: regLogin, set: setRegLogin, ph: 'login' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-black text-gray-600 mb-1.5">{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className={inputCls} required={f.req !== false} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">{t.passwordLabel}</label>
                <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder={t.passwordMin} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1.5">{t.repeatPassword}</label>
                <input type="password" value={regPass2} onChange={e => setRegPass2(e.target.value)} placeholder={t.repeatPasswordPlaceholder} className={inputCls} required />
              </div>
              {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-bold text-center">😬 {error}</div>}
              <button type="submit" disabled={loading} className="w-full gradient-purple text-white font-black text-lg py-3.5 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60">
                {loading ? t.registerLoading : t.registerButton}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
