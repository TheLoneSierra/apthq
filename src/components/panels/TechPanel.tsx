import { useMemo, useState } from 'react'
import { SERVERS, TOKENS } from '../../lib/constants'
import type { ServerFilter, TechTab } from '../../types/dashboard'
import { Badge, Pill, SectionHeader } from '../ui/Shared'

export function TechPanel() {
  const [techTab, setTechTab] = useState<TechTab>('tokens')
  const [tokens, setTokens] = useState(TOKENS)
  const [search, setSearch] = useState('')
  const [svFilter, setSvFilter] = useState<ServerFilter>('all')
  const [checkedAll, setCheckedAll] = useState(false)
  const [deploying, setDeploying] = useState<Record<string, boolean>>({})

  const summary = useMemo(() => ({
    total: SERVERS.length,
    fresh: SERVERS.filter((s) => s.status === 'fresh').length,
    stale: SERVERS.filter((s) => s.status === 'stale').length,
    drift: SERVERS.filter((s) => s.status === 'drift').length,
    nonmain: SERVERS.filter((s) => s.branch !== 'main').length,
  }), [])

  const filteredServers = SERVERS.filter((s) => {
    const match =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase())
    if (svFilter === 'stale') return match && s.status === 'stale'
    if (svFilter === 'drift') return match && s.status === 'drift'
    return match
  })

  const deployService = (name: string) => {
    setDeploying((d) => ({ ...d, [name]: true }))
    setTimeout(() => setDeploying((d) => ({ ...d, [name]: false })), 2000)
  }

  return (
    <>
      <div className="mb-[22px] flex gap-1 border-b border-[var(--border)]">
        {(['tokens', 'servers'] as TechTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setTechTab(tab)}
            className={`-mb-px h-[34px] cursor-pointer border-b-2 border-transparent bg-transparent px-4 text-[13px] font-medium transition-all duration-150 ${
              techTab === tab
                ? 'border-[var(--purple)] text-[var(--purple)]'
                : 'text-[var(--text2)] hover:text-[var(--text)]'
            }`}
          >
            {tab === 'tokens' ? 'Access Tokens' : 'Servers'}
          </button>
        ))}
      </div>

      {techTab === 'tokens' && (
        <>
          <SectionHeader
            title="Token Login Status"
            titleColor="var(--purple)"
            badge={<Badge variant="strat">Access Tokens</Badge>}
            lineColor="var(--pur-bd)"
            actions={
              <button type="button" className="btn-csv w-full justify-center sm:ml-2 sm:w-auto" onClick={() => setTokens([...TOKENS])}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Refresh
              </button>
            }
          />
          <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)]">
            <div className="table-scroll">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Login Status</th>
                  <th>Session Started</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id}>
                    <td><span className="font-mono-dm text-xs">{t.id}</span></td>
                    <td>
                      <Pill variant={t.status === 'in' ? 'green' : 'red'}>
                        {t.status === 'in' ? '● Logged In' : '○ Logged Out'}
                      </Pill>
                    </td>
                    <td className="text-xs text-[var(--text2)]">{t.session}</td>
                    <td>
                      {t.status === 'out' ? (
                        <button type="button" className="act-btn act-btn-primary">Re-auth</button>
                      ) : (
                        <button type="button" className="act-btn">Revoke</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {techTab === 'servers' && (
        <>
          <div className="grid-kpi-6 mb-5 overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[rgba(139,92,246,0.04)]">
            {[
              { label: 'Total Services', value: summary.total, color: 'var(--purple)' },
              { label: 'Fresh', value: summary.fresh, color: 'var(--live)' },
              { label: 'Stale', value: summary.stale, color: 'var(--amber)' },
              { label: 'Drift', value: summary.drift, color: 'var(--red)' },
              { label: 'Non-main', value: summary.nonmain, color: 'var(--purple)' },
              { label: 'Deploying', value: '—', color: 'var(--prac)' },
            ].map((item) => (
              <div key={item.label} className="border-b border-[rgba(139,92,246,0.1)] px-4 py-3.5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-[18px] sm:last:border-r-0 lg:border-r lg:last:border-r-0">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-70">{item.label}</div>
                <div className="font-mono-dm text-[22px] font-semibold" style={{ color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 min-w-[200px] flex-1 rounded-lg border border-[var(--border2)] bg-[var(--s2)] px-3 text-xs text-[var(--text)] outline-none"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            {(['all', 'stale', 'drift'] as ServerFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`dp ${svFilter === f ? 'active' : ''}`}
                onClick={() => setSvFilter(f)}
              >
                {f === 'all' ? 'All' : `${f.charAt(0).toUpperCase()}${f.slice(1)} only`}
              </button>
            ))}
            <button
              type="button"
              className="btn-csv"
              onClick={() => {
                setSvFilter('stale')
                alert('Deploy triggered for all stale services.')
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Deploy all stale
            </button>
          </div>

          <div className="overflow-hidden rounded-[var(--rlg)] border border-[var(--pur-bd)] bg-[var(--s1)]">
            <div className="table-scroll">
            <table className="dtable">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={checkedAll}
                      onChange={(e) => setCheckedAll(e.target.checked)}
                      className="cursor-pointer"
                    />
                  </th>
                  <th>Service</th>
                  <th>Branch</th>
                  <th>Commit</th>
                  <th>Deployed At</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServers.map((s) => (
                  <tr key={s.name}>
                    <td className="w-8">
                      <input type="checkbox" defaultChecked={checkedAll} className="cursor-pointer" />
                    </td>
                    <td className="font-mono-dm text-xs font-medium text-[var(--text)]">{s.name}</td>
                    <td>
                      <Pill variant={s.branch === 'main' ? 'green' : 'amber'} mono>
                        {s.branch}
                      </Pill>
                    </td>
                    <td>
                      <span className="cursor-pointer rounded bg-[var(--s3)] px-[7px] py-0.5 font-mono-dm text-[11px] text-[var(--text2)] hover:bg-[var(--s4)] hover:text-[var(--text)]">
                        {s.commit}
                      </span>
                    </td>
                    <td className="text-xs text-[var(--text2)]">{s.deployed}</td>
                    <td className="font-mono-dm text-xs text-[var(--text3)]">{s.age}</td>
                    <td>
                      <Pill
                        variant={
                          s.status === 'fresh'
                            ? 'green'
                            : s.status === 'stale'
                              ? 'amber'
                              : s.status === 'drift'
                                ? 'red'
                                : 'blue'
                        }
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </Pill>
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          className="act-btn act-btn-primary"
                          disabled={deploying[s.name]}
                          style={{ opacity: deploying[s.name] ? 0.5 : 1 }}
                          onClick={() => deployService(s.name)}
                        >
                          {deploying[s.name] ? 'Deploying…' : 'Deploy'}
                        </button>
                        <button type="button" className="act-btn">{s.broker}</button>
                        <button type="button" className="act-btn">Logs ↗</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
