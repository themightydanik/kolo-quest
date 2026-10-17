import React, { useState } from 'react'
import { useLang } from '../i18n/index'

export default function TaskCard({ task, childView, parentView, onComplete, onApprove, onReject, onDelete, onEdit, onReadd }) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)

  const statusMap = {
    active: { label: t.statusActive, color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
    pending_approval: { label: t.statusPending, color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
    done: { label: t.statusDone, color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
  }
  const status = statusMap[task.status] || statusMap.active
  const childName = task.users?.display_name
  const childEmoji = task.users?.avatar_emoji || '🦊'
  const isMandatory = task.is_mandatory
  const isRecurring = task.is_recurring

  const recurringLabel = () => {
    if (!isRecurring) return null
    if (task.recurring_type === 'daily') return t.recurringEveryDay
    if (task.recurring_type === 'weekdays') return t.recurringWeekdays
    if (task.recurring_type === 'weekends') return t.recurringWeekends
    return t.recurringCustom
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${task.status === 'done' ? 'opacity-75' : 'card-bounce'}`}>
      <div className={`h-1.5 ${isMandatory ? 'bg-gradient-to-r from-red-500 to-orange-400' : task.status === 'active' ? 'gradient-purple' : task.status === 'pending_approval' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-200'}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {parentView && childName && (
              <div className="text-xs text-gray-400 font-bold mb-1">{childEmoji} {childName}</div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-gray-800 text-base leading-tight">{task.title}</h3>
              {isMandatory && <span className="text-xs font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{t.mandatoryBadge}</span>}
              {isRecurring && <span className="text-xs font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{t.recurringBadge} {recurringLabel()}</span>}
            </div>
            <div className="mt-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            {isMandatory && task.penalty_points > 0 && (
              <div className="text-xs text-red-500 font-bold mt-1">⚡ {t.penalty} {task.penalty_points}⭐</div>
            )}
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl px-3 py-2 text-white">
              <div className="text-xl font-black leading-none">{task.points}</div>
              <div className="text-xs font-bold opacity-80">⭐</div>
            </div>
          </div>
        </div>

        {(task.description || task.criteria) && (
          <button onClick={() => setExpanded(v => !v)} className="mt-2 text-xs text-violet-500 font-bold hover:text-violet-700 transition-colors">
            {expanded ? t.showLess : t.showMore}
          </button>
        )}
        {expanded && (
          <div className="mt-2 space-y-2 slide-up">
            {task.description && (
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-xs font-black text-blue-600 mb-1">{t.taskDescription}</div>
                <p className="text-sm text-gray-600 font-semibold">{task.description}</p>
              </div>
            )}
            {task.criteria && (
              <div className="bg-green-50 rounded-xl p-3">
                <div className="text-xs font-black text-green-600 mb-1">{t.taskCriteria}</div>
                <p className="text-sm text-gray-600 font-semibold">{task.criteria}</p>
              </div>
            )}
          </div>
        )}

        {childView && task.status === 'active' && onComplete && (
          <button onClick={() => onComplete(task.id)} className="mt-3 w-full gradient-green text-white font-black py-2.5 rounded-xl text-sm active:scale-95 transition-all">
            {t.iDoneIt}
          </button>
        )}
        {childView && task.status === 'pending_approval' && (
          <div className="mt-3 bg-yellow-50 rounded-xl py-2.5 text-center text-yellow-600 font-bold text-sm">{t.waitingParent}</div>
        )}
        {childView && task.status === 'done' && (
          <>
            <div className="mt-3 bg-green-50 rounded-xl py-2.5 text-center text-green-600 font-bold text-sm">{t.taskDoneKid}</div>
            {onReadd && (
              <button onClick={() => onReadd(task.id)} className="mt-2 w-full bg-violet-100 text-violet-700 font-black py-2 rounded-xl text-sm active:scale-95 transition-all hover:bg-violet-200">
                {t.reAddTask || '🔄 Повторити'}
              </button>
            )}
          </>
        )}

        {parentView && (
          <div className="mt-3 flex gap-2">
            {task.status === 'pending_approval' && (
              <>
                <button onClick={onApprove} className="flex-1 bg-green-500 text-white font-black py-2 rounded-xl text-sm active:scale-95 transition-all hover:bg-green-600">{t.approveTask}</button>
                <button onClick={onReject} className="flex-1 bg-orange-400 text-white font-black py-2 rounded-xl text-sm active:scale-95 transition-all hover:bg-orange-500">{t.rejectTask}</button>
              </>
            )}
            {task.status !== 'done' && onEdit && (
              <button onClick={onEdit} className="bg-violet-100 text-violet-600 font-black py-2 px-3 rounded-xl text-sm active:scale-95 transition-all hover:bg-violet-200">✏️</button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="bg-red-50 text-red-400 font-black py-2 px-3 rounded-xl text-sm active:scale-95 transition-all hover:bg-red-100">🗑</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
