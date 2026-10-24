import { useState, useEffect, useCallback } from 'react'
import { checkEntitlement, initPurchases } from './purchases'
import { supabase } from './supabase'

// ── Dev / tester allowlist ─────────────────────────────────────────────────────
const DEV_ALLOWLIST_EMAILS = [
  'daniilkolomoets@gmail.com',
  // Add more tester emails here:
  // 'tester@example.com',
]

const TRIAL_DAYS = 7

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

async function fetchTrialStatus(familyId) {
  if (!familyId) return { trialActive: false, trialExpired: true, trialDaysLeft: 0, trialStartedAt: null }
  try {
    const { data, error } = await supabase
      .from('families')
      .select('trial_started_at')
      .eq('id', familyId)
      .single()

    if (error || !data) {
      // No family record or no trial — treat as expired
      return { trialActive: false, trialExpired: true, trialDaysLeft: 0, trialStartedAt: null }
    }

    const startedAt = data.trial_started_at
    if (!startedAt) {
      // Trial not yet started — not expired yet, just not started
      return { trialActive: false, trialExpired: false, trialDaysLeft: 0, trialStartedAt: null, trialNotStarted: true }
    }

    const startMs = new Date(startedAt).getTime()
    const nowMs = Date.now()
    const elapsedDays = (nowMs - startMs) / (1000 * 60 * 60 * 24)
    const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays))
    const trialActive = daysLeft > 0
    const trialExpired = !trialActive

    return { trialActive, trialExpired, trialDaysLeft: daysLeft, trialStartedAt: startedAt }
  } catch {
    return { trialActive: false, trialExpired: true, trialDaysLeft: 0, trialStartedAt: null }
  }
}

async function getFamilyId(userId) {
  if (!userId) return null
  try {
    // parent users have family_id directly
    const { data } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', userId)
      .single()
    return data?.family_id || null
  } catch { return null }
}

// ── useSubscription ────────────────────────────────────────────────────────────
// Hook that tracks premium status and trial for the current user.
// Usage:
//   const { isPremium, trialActive, trialExpired, trialDaysLeft, needsPaywall, loading, refresh }
//     = useSubscription(user?.id)
//
// needsPaywall = true  → show hard paywall (trial expired + not premium)
// needsPaywall = false → user can use the app
export function useSubscription(userId) {
  const [isPremium, setIsPremium] = useState(false)
  const [trialActive, setTrialActive] = useState(false)
  const [trialExpired, setTrialExpired] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  const [trialNotStarted, setTrialNotStarted] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!userId) {
      setIsPremium(false)
      setTrialActive(false)
      setTrialExpired(true)
      setTrialDaysLeft(0)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // 1. Dev allowlist — full access, skip everything else
      const isDev = await isDevAccount(userId)
      if (isDev) {
        setIsPremium(true)
        setTrialActive(false)
        setTrialExpired(false)
        setTrialDaysLeft(TRIAL_DAYS)
        return
      }

      // 2. Check RevenueCat entitlement
      await initPurchases(userId)
      const active = await checkEntitlement(userId)
      setIsPremium(active)

      // 3. Check trial status from families table
      const familyId = await getFamilyId(userId)
      const trial = await fetchTrialStatus(familyId)
      setTrialActive(trial.trialActive)
      setTrialExpired(trial.trialExpired)
      setTrialDaysLeft(trial.trialDaysLeft)
      setTrialNotStarted(!!trial.trialNotStarted)

    } catch {
      setIsPremium(false)
      setTrialActive(false)
      setTrialExpired(true)
      setTrialDaysLeft(0)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  // needsPaywall: true when trial is over AND user hasn't paid
  const needsPaywall = !loading && !isPremium && trialExpired && !trialNotStarted

  return {
    isPremium,
    trialActive,
    trialExpired,
    trialDaysLeft,
    trialNotStarted,
    needsPaywall,
    loading,
    refresh,
  }
}
