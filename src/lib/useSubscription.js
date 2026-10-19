import { useState, useEffect, useCallback } from 'react'
import { checkEntitlement, initPurchases } from './purchases'

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
