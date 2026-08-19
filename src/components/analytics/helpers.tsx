import type { ReactNode } from 'react'
import type { SegmentRow } from '../../types/dashboard'
import { fmt, fmtTurnover } from '../../lib/format'

export function buildSegmentRows(
  segments: SegmentRow[] | undefined,
  color: string,
) {
  const rows = (segments || []).filter((r) => r.segment !== 'Total')
  if (!rows.length) return []

  const totalOrders = rows.reduce((sum, r) => sum + (r.orders_count || 0), 0)
  const totalTurn = rows.reduce((sum, r) => sum + (r.turnover_cr || 0), 0)

  const dataRows = rows.map((r) => ({
    segment: r.segment,
    orders: fmt(r.orders_count),
    turnover: fmtTurnover(r.turnover_cr),
    share: totalOrders ? `${Math.round(((r.orders_count || 0) / totalOrders) * 100)}%` : '0%',
    isTotal: false,
    color,
  }))

  return [
    ...dataRows,
    {
      segment: 'Total',
      orders: fmt(totalOrders),
      turnover: fmtTurnover(totalTurn),
      share: '100%',
      isTotal: true,
      color,
    },
  ]
}

export const UserIcons = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  live: (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--live)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  paper: (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prac)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
}

function iconWrap(children: ReactNode, bg: string) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: bg }}>
      {children}
    </div>
  )
}

export const icon = {
  user: (bg = 'var(--amb-dim)') => iconWrap(UserIcons.users, bg),
  userLive: () => iconWrap(UserIcons.live, 'var(--live-dim)'),
  userPrac: () => iconWrap(UserIcons.paper, 'var(--prac-dim)'),
  userClock: (bg = 'var(--amb-dim)') => iconWrap(UserIcons.clock, bg),
  livePulse: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--live)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>,
    'var(--live-dim)',
  ),
  liveUser: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--live)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>,
    'var(--live-dim)',
  ),
  liveBars: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--live)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>,
    'var(--live-dim)',
  ),
  liveBolt: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--live)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>,
    'var(--live-dim)',
  ),
  liveGrid: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--live)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>,
    'var(--live-dim)',
  ),
  pracPulse: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prac)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>,
    'var(--prac-dim)',
  ),
  pracUser: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prac)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>,
    'var(--prac-dim)',
  ),
  pracBars: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prac)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>,
    'var(--prac-dim)',
  ),
  pracBolt: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prac)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>,
    'var(--prac-dim)',
  ),
  pracGrid: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--prac)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>,
    'var(--prac-dim)',
  ),
  purpleEdit: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleUsers: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleSpark: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M22 2 11 13" />
      <path d="M22 2h-6" />
      <path d="M22 2v6" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleDoc: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleGrid: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleTv: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleClock: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleTrash: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleCopy: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleHeart: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleHeartOff: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>,
    'var(--pur-dim)',
  ),
  purpleBacktest: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-5" />
    </svg>,
    'var(--pur-dim)',
  ),
  redAlert: () => iconWrap(
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>,
    'var(--red-dim)',
  ),
}
