import { useState, useEffect, useCallback } from 'react'
import { checkEntitlement, initPurchases } from './purchases'
import { supabase } from './supabase'

// ── Dev / tester allowlist ─────────────────────────────────────────────────────
// Accounts in this list get isPremium=true without a RevenueCat purchase.
// Add email addresses of developers and testers here.
const DEV_ALLOWLIST_EMAILS = [
  'daniilkolomoets@gmail.com',
  // Add more tester emails here:
  // 'tester@example.com',
]

async function isDevAccount(userId) {
  if (!userId) return false
  try {
    const { data } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    if (data?.email && DEV_ALLOWLIST_EMAILS.includes(data.email.toLowerCase())) {
      return true
    }
  } catch { /* ignore */ }
  return false
}

// ── useSubscription ────────────────────────────────────────────────────────────
// Hook that tracks premium status for the current user.
// Usage:
//   const { isPremium, loading, refresh } = useSubscription(user?.id)
export function useSubscription(userId) {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) { setIsPremium(false); setLoading(false); return }
    setLoading(true)
    try {
      // Check dev/tester allowlist first — bypasses RevenueCat entirely
      const isDev = await isDevAccount(userId)
      if (isDev) {
        setIsPremium(true)
        return
      }
      // Init RC with this user so their purchases are associated
      await initPurchases(userId)
      const active = await checkEntitlement(userId)
      setIsPremium(active)
    } catch {
      setIsPremium(false)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  return { isPremium, loading, refresh }
}
