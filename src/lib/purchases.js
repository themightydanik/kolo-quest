import { Purchases } from '@revenuecat/purchases-js'

// ── RevenueCat config ──────────────────────────────────────────────────────────
// Replace with your real RC Web API key from dashboard.revenuecat.com
// Project → API Keys → Public app-specific keys → Web
const RC_API_KEY = import.meta.env.VITE_RC_API_KEY || 'rcb_REPLACE_WITH_YOUR_KEY'

// Entitlement identifier — set in RevenueCat dashboard
export const ENTITLEMENT_FAMILY = 'family_plan'

// Package/offering identifiers — set in RevenueCat dashboard
export const OFFERING_DEFAULT = '$rc_default'

let _purchases = null

// ── init ───────────────────────────────────────────────────────────────────────
// Call once after user logs in, passing their unique ID
export async function initPurchases(userId) {
  if (_purchases) return _purchases
  try {
    _purchases = await Purchases.configure(RC_API_KEY, String(userId))
    // Debug logging in dev — setLogLevel may not exist in all RC web SDK versions
    if (import.meta.env.DEV && typeof Purchases.setLogLevel === 'function') {
      Purchases.setLogLevel('DEBUG')
    }
  } catch (e) {
    console.warn('[RC] configure failed:', e?.message)
  }
  return _purchases
}

// ── checkEntitlement ───────────────────────────────────────────────────────────
// Returns true if user has active family_plan entitlement
export async function checkEntitlement(userId) {
  if (!userId) return false
  try {
    const rc = await initPurchases(userId)
    if (!rc) return false
    const ci = await rc.getCustomerInfo()
    return !!ci?.entitlements?.active?.[ENTITLEMENT_FAMILY]
  } catch (e) {
    console.warn('[RC] checkEntitlement failed:', e?.message)
    return false
  }
}

// ── getOfferings ───────────────────────────────────────────────────────────────
// Returns RC offerings object or null
export async function getOfferings(userId) {
  try {
    const rc = await initPurchases(userId)
    if (!rc) return null
    return await rc.getOfferings()
  } catch (e) {
    console.warn('[RC] getOfferings failed:', e?.message)
    return null
  }
}

// ── purchasePackage ────────────────────────────────────────────────────────────
// Triggers RC checkout for a specific package
// Returns { success: true } or throws
export async function purchasePackage(rcPackage) {
  if (!_purchases) throw new Error('RC not initialized')
  const result = await _purchases.purchase({ rcPackage })
  const hasPlan = !!result?.customerInfo?.entitlements?.active?.[ENTITLEMENT_FAMILY]
  if (!hasPlan) throw new Error('purchase_not_activated')
  return { success: true, customerInfo: result.customerInfo }
}

// ── restorePurchases ───────────────────────────────────────────────────────────
export async function restorePurchases() {
  if (!_purchases) return null
  try {
    return await _purchases.restorePurchases()
  } catch (e) {
    console.warn('[RC] restore failed:', e?.message)
    return null
  }
}

// ── reset (on logout) ─────────────────────────────────────────────────────────
export function resetPurchases() {
  _purchases = null
}
