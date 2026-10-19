import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

// ── helpers ────────────────────────────────────────────────────────────────────
const LS_KEY = 'fq_user'

function saveLocal(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch {}
}
function clearLocal() {
  try { localStorage.removeItem(LS_KEY) } catch {}
}
function loadLocal() {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null } catch { return null }
}

function mapRow(row, extra = {}) {
  return {
    id: row.id,
    login: row.login,
    display_name: row.display_name,
    role: row.role,
    family_id: row.family_id,
    avatar_emoji: row.avatar_emoji || '🦊',
    email: row.email || null,
    auth_id: row.auth_id || null,
    points: row.points || 0,
    needs_migration: !row.auth_id && row.role === 'parent', // legacy parent flag
    ...extra,
  }
}

// ── AuthProvider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadLocal)
  const [loading, setLoading] = useState(true)

  // On mount: restore Supabase Auth session for parents
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Parent with active Supabase Auth session → refresh user row
        const { data: row } = await supabase.from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()
        if (row) {
          const m = mapRow(row)
          saveLocal(m)
          setUser(m)
        }
      } else {
        // No Supabase Auth session — could be child (localStorage only) or unauthenticated
        const local = loadLocal()
        if (local?.role === 'child') setUser(local)
        else if (local?.role === 'parent' && local?.needs_migration) setUser(local)
        else if (!local) setUser(null)
      }
      setLoading(false)
    })

    // Listen for Supabase Auth changes (parent sessions)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearLocal()
        setUser(null)
      } else if (event === 'SIGNED_IN' && session) {
        const { data: row } = await supabase.from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single()
        if (row) {
          const m = mapRow(row)
          saveLocal(m)
          setUser(m)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── refreshUser ──────────────────────────────────────────────────────────────
  const refreshUser = async (id) => {
    const { data: row } = await supabase.from('users').select('*').eq('id', id).single()
    if (!row) return
    const m = mapRow(row)
    saveLocal(m)
    setUser(m)
    return m
  }

  // ── login ────────────────────────────────────────────────────────────────────
  // Detects parent vs child by checking if input looks like an email
  const login = async (loginVal, password) => {
    const val = loginVal.trim().toLowerCase()
    const isEmail = val.includes('@')

    if (isEmail) {
      // ── Parent login via Supabase Auth ───────────────────────────────────────
      const { data, error } = await supabase.auth.signInWithPassword({ email: val, password })
      if (error) throw new Error('invalid_credentials')

      const { data: row } = await supabase.from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .single()
      if (!row) throw new Error('invalid_credentials')

      const m = mapRow(row)
      saveLocal(m)
      setUser(m)
      return m
    } else {
      // ── Child login via verify_login RPC (bcrypt) ────────────────────────────
      const { data: rows, error } = await supabase.rpc('verify_login', {
        p_login: val,
        p_password: password,
      })
      const h = rows && rows[0]
      if (error || !h) throw new Error('invalid_credentials')

      // Also check: could be a legacy parent who hasn't migrated yet
      if (h.role === 'parent') {
        // Legacy parent — let them in but flag needs_migration
        const m = mapRow(h, { needs_migration: !h.auth_id })
        saveLocal(m)
        setUser(m)
        return m
      }

      const m = mapRow(h)
      saveLocal(m)
      setUser(m)
      return m
    }
  }

  // ── register (parent only) ───────────────────────────────────────────────────
  const register = async ({ email, password, displayName, familyName }) => {
    const emailClean = email.trim().toLowerCase()

    // 1. Create Supabase Auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailClean,
      password,
    })
    if (authError) {
      if (authError.message?.includes('already registered')) throw new Error('email_taken')
      throw new Error('account_error')
    }

    // 2. Create family
    const { data: family, error: famError } = await supabase
      .from('families')
      .insert({ name: familyName?.trim() || displayName.trim() })
      .select()
      .single()
    if (famError) throw new Error('family_error')

    // 3. Create user row linked to auth
    const { data: row, error: userError } = await supabase.from('users').insert({
      login: emailClean,
      email: emailClean,
      auth_id: authData.user.id,
      password_hash: '', // not used for parents
      display_name: displayName.trim(),
      role: 'parent',
      family_id: family.id,
      avatar_emoji: '👩',
      points: 0,
    }).select().single()
    if (userError) throw new Error('account_error')

    const m = mapRow(row)
    saveLocal(m)
    setUser(m)
    return m
  }

  // ── migrateParent: link existing parent account to Supabase Auth ─────────────
  // Called once when old parent enters their email to secure their account
  const migrateParent = async (userId, email, password) => {
    const emailClean = email.trim().toLowerCase()

    // Create Supabase Auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailClean,
      password,
    })
    if (authError) {
      if (authError.message?.includes('already registered')) throw new Error('email_taken')
      throw new Error('account_error')
    }

    // Link auth_id to existing user row
    await supabase.rpc('link_parent_auth', {
      p_user_id: userId,
      p_auth_id: authData.user.id,
      p_email: emailClean,
    })

    // Refresh user
    return await refreshUser(userId)
  }

  // ── logout ───────────────────────────────────────────────────────────────────
  const logout = async () => {
    // Sign out of Supabase Auth (no-op for children)
    await supabase.auth.signOut().catch(() => {})
    clearLocal()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser, migrateParent }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
