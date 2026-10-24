import React, { useState, useEffect } from 'react'
import { getOfferings, purchasePackage, restorePurchases, ENTITLEMENT_FAMILY } from '../lib/purchases'
import { supabase } from '../lib/supabase'

const FEATURES = [
  { emoji: '👧', text: 'Необмежена кількість дітей' },
  { emoji: '📋', text: 'Необмежені завдання' },
  { emoji: '🔄', text: 'Необмежені регулярні завдання' },
  { emoji: '🎁', text: 'Необмежені призи' },
  { emoji: '💰', text: 'Кишенькові гроші та обміни' },
  { emoji: '🏆', text: 'Челенджі та битви' },
  { emoji: '📊', text: 'Детальна статистика' },
]

// Starts (or confirms) the 7-day trial for this family
async function startTrial(userId) {
  if (!userId) return false
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', userId)
      .single()

    const familyId = userData?.family_id
    if (!familyId) return false

    const { error } = await supabase.rpc('start_family_trial', { p_family_id: familyId })
    if (error) {
      // Fallback: direct update (if RPC not deployed yet)
      await supabase
        .from('families')
        .update({ trial_started_at: new Date().toISOString() })
        .eq('id', familyId)
        .is('trial_started_at', null)
    }
    return true
  } catch {
    return false
  }
}

export default function PaywallModal({ onClose, onSuccess, onTrialStart, userId, trialExpired, trialDaysLeft }) {
  const [offerings, setOfferings] = useState(null)
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [startingTrial, setStartingTrial] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getOfferings(userId).then(o => {
      setOfferings(o)
      const pkgs = o?.current?.availablePackages || []
      const monthly = pkgs.find(p => p.packageType === 'MONTHLY' || p.identifier === '$rc_monthly')
      const annual = pkgs.find(p => p.packageType === 'ANNUAL' || p.identifier === '$rc_annual')
      setSelectedPkg(monthly || annual || pkgs[0] || null)
      setLoading(false)
    })
  }, [userId])

  const packages = offerings?.current?.availablePackages || []

  // Fallback prices when RC not configured yet — $3.50/month
  const FALLBACK_PACKAGES = [
    { identifier: '$rc_monthly', packageType: 'MONTHLY', _isFallback: true,
      rcBillingProduct: { currentPrice: { formattedPrice: '$3.50' }, title: 'Family Plan Monthly' } },
    { identifier: '$rc_annual', packageType: 'ANNUAL', _isFallback: true,
      rcBillingProduct: { currentPrice: { formattedPrice: '$29.99' }, title: 'Family Plan Annual' } },
  ]

  const displayPackages = packages.length > 0 ? packages : FALLBACK_PACKAGES

  const handlePurchase = async () => {
    if (!selectedPkg) return
    if (selectedPkg._isFallback) {
      setError('RevenueCat ще не налаштований. Додай VITE_RC_API_KEY.')
      return
    }
    setError('')
    setPurchasing(true)
    try {
      await purchasePackage(selectedPkg)
      onSuccess?.()
      onClose()
    } catch (e) {
      if (e?.message === 'purchase_cancelled') {
        // user closed checkout — do nothing
      } else {
        setError('Помилка оплати. Спробуй ще раз.')
      }
    } finally {
      setPurchasing(false)
    }
  }

  const handleRestore = async () => {
    setRestoring(true)
    setError('')
    try {
      const result = await restorePurchases()
      const hasPlan = !!result?.entitlements?.active?.[ENTITLEMENT_FAMILY]
      if (hasPlan) {
        onSuccess?.()
        onClose()
      } else {
        setError('Активних підписок не знайдено.')
      }
    } catch {
      setError('Помилка відновлення.')
    } finally {
      setRestoring(false)
    }
  }

  const handleStartTrial = async () => {
    setStartingTrial(true)
    setError('')
    try {
      const ok = await startTrial(userId)
      if (ok) {
        onTrialStart?.()
        onClose()
      } else {
        setError('Не вдалося розпочати пробний період.')
      }
    } catch {
      setError('Помилка. Спробуй ще раз.')
    } finally {
      setStartingTrial(false)
    }
  }

  const getLabel = (pkg) => {
    if (pkg.packageType === 'ANNUAL' || pkg.identifier?.includes('annual')) return 'Річний'
    return 'Місячний'
  }

  const getSavingsLabel = (pkg) => {
    if (pkg.packageType === 'ANNUAL' || pkg.identifier?.includes('annual')) return '🔥 Знижка 29%'
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 px-6 pt-8 pb-6 text-center text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
          <div className="text-5xl mb-3">{trialExpired ? '⏰' : '👑'}</div>
          <div className="font-black text-2xl">
            {trialExpired ? 'Пробний період завершено' : 'Family Plan'}
          </div>
          <div className="text-violet-200 text-sm mt-1">
            {trialExpired
              ? 'Оформи підписку, щоб продовжити використання'
              : 'Необмежені можливості для всієї сім\'ї'}
          </div>
          {trialDaysLeft > 0 && (
            <div className="mt-2 bg-white/20 rounded-2xl px-4 py-1.5 inline-block">
              <span className="font-black">⏱ {trialDaysLeft} {trialDaysLeft === 1 ? 'день' : trialDaysLeft < 5 ? 'дні' : 'днів'} залишилось</span>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Features list */}
          <div className="space-y-2 mb-6">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-xl">{f.emoji}</span>
                <span className="font-semibold text-gray-700 text-sm">{f.text}</span>
                <span className="ml-auto text-green-500 font-black">✓</span>
              </div>
            ))}
          </div>

          {/* Package selector */}
          {loading ? (
            <div className="text-center py-4 text-gray-400 font-bold">⏳ Завантаження...</div>
          ) : (
            <div className="space-y-2 mb-5">
              {displayPackages.map(pkg => {
                const isSelected = selectedPkg?.identifier === pkg.identifier
                const price = pkg.rcBillingProduct?.currentPrice?.formattedPrice
                  || pkg.storeProduct?.priceString
                  || '—'
                const savings = getSavingsLabel(pkg)
                return (
                  <button key={pkg.identifier} onClick={() => setSelectedPkg(pkg)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${
                      isSelected ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-violet-300'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-violet-600 bg-violet-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-gray-800">{getLabel(pkg)}</div>
                      {savings && <div className="text-xs text-orange-500 font-bold">{savings}</div>}
                    </div>
                    <div className="font-black text-violet-700">{price}
                      <span className="text-xs text-gray-400 font-normal">
                        {pkg.packageType === 'ANNUAL' || pkg.identifier?.includes('annual') ? '/рік' : '/міс'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-600 text-sm font-semibold mb-3">
              {error}
            </div>
          )}

          {/* CTA — Subscribe */}
          <button onClick={handlePurchase} disabled={purchasing || !selectedPkg || loading}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-black py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50">
            {purchasing ? '⏳ Обробка...' : '🚀 Оформити підписку'}
          </button>

          {/* Trial button — only show when trial not yet expired (i.e. from onboarding) */}
          {!trialExpired && (
            <button onClick={handleStartTrial} disabled={startingTrial}
              className="w-full mt-3 bg-gray-100 text-gray-700 font-black py-4 rounded-2xl text-base active:scale-95 transition-all disabled:opacity-50 border border-gray-200">
              {startingTrial ? '⏳...' : '🎁 Спробувати 7 днів безкоштовно'}
            </button>
          )}

          <div className="flex items-center gap-2 mt-3 justify-center">
            <button onClick={handleRestore} disabled={restoring}
              className="text-violet-600 font-bold text-sm disabled:opacity-50">
              {restoring ? '⏳...' : 'Відновити покупку'}
            </button>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400 text-xs">Скасування у будь-який час</span>
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            Підписка $3.50/місяць. Поновлюється автоматично. Керування у налаштуваннях акаунту.
          </p>
        </div>
      </div>
    </div>
  )
}
