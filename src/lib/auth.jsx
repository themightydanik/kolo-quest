import React, { createContext, useContext, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('fq_user')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const u = localStorage.getItem('fq_user')
    if (u) try { setUser(JSON.parse(u)) } catch {}
    setLoading(false)
  }, [])

  const refreshUser = async (id) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single()
    if (!data) return
    const h = { id: data.id, login: data.login, display_name: data.display_name, role: data.role, family_id: data.family_id, avatar_emoji: data.avatar_emoji || '🦊' }
    localStorage.setItem('fq_user', JSON.stringify(h))
    setUser(h)
    return h
  }

  const login = async (loginVal, password) => {
    const { data: h2, error: f } = await supabase.rpc('verify_login', { p_login: loginVal.trim().toLowerCase(), p_password: password })
    const h = h2 && h2[0]
    if (f || !h) throw new Error('invalid_credentials')
    const m = { id: h.id, login: h.login, display_name: h.display_name, role: h.role, family_id: h.family_id, avatar_emoji: h.avatar_emoji || '🦊' }
    localStorage.setItem('fq_user', JSON.stringify(m))
    setUser(m)
    return m
  }

  const register = async ({ login: loginVal, password, displayName, familyName }) => {
    const m = loginVal.trim().toLowerCase()
    const { data: v } = await supabase.from('users').select('id').eq('login', m).maybeSingle()
    if (v) throw new Error('login_taken')
    const { data: w, error: x } = await supabase.from('families').insert({ name: familyName.trim() }).select().single()
    if (x) throw new Error('family_error')
    const { data: y, error: p } = await supabase.from('users').insert({ login: m, password_hash: password, display_name: displayName.trim(), role: 'parent', family_id: w.id, avatar_emoji: '👩', points: 0 }).select().single()
    if (p) throw new Error('account_error')
    const g = { id: y.id, login: y.login, display_name: y.display_name, role: y.role, family_id: y.family_id, avatar_emoji: y.avatar_emoji }
    localStorage.setItem('fq_user', JSON.stringify(g))
    setUser(g)
    return g
  }

  const logout = () => {
    localStorage.removeItem('fq_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
