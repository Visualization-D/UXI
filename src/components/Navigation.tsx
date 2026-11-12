import { Check, Circle } from 'lucide-react'
import { HEURISTICS } from '../data'
import { METRIC_MODULES, METRIC_COUNT } from '../metrics'
import type { AuditState } from '../types'
import { completion } from '../lib/workbook'

export function Navigation({ active, state, onNavigate }: { active: string; state: AuditState; onNavigate: (id: string) => void }) {
  const status = completion(state)
  const check = (id: string) => status.checks.find(item => item.id === id)?.complete
  const items = [
    { id: 'overview', label: 'Overview', meta: 'Start' },
    { id: 'setup', label: 'Audit setup', meta: 'Scope', complete: check('setup') },
    { id: 'brief', label: 'Audit method', meta: 'Guide' },
    ...HEURISTICS.map(h => ({ id: h.id, label: h.title, meta: `H${String(h.number).padStart(2, '0')}`, complete: check(h.id), group: h.number === 1 ? '01 · 10 Heuristics' : undefined })),
    { id: 'defects', label: 'Defect analysis', meta: `${status.defectCount}/5`, complete: check('defects') },
    { id: 'metrics', label: 'Usability metrics', meta: `${status.metricCount}/${METRIC_COUNT}`, group: '02 · Usability Metrics' },
    ...METRIC_MODULES.map((module, index) => ({ id: `metrics-${module.id}`, label: module.shortTitle, meta: `M${index + 1}`, complete: check(`metrics-${module.id}`) })),
    { id: 'synthesis', label: 'Synthesis', meta: 'Decide', complete: check('synthesis'), group: '03 · Reporting' },
    { id: 'export', label: 'Review & export', meta: 'Finish' }
  ]
  return <>
    <nav className="side-nav" aria-label="Audit sections">
      <div className="nav-progress"><span>{status.heuristicCount} / 10 heuristics · {status.metricCount} / {METRIC_COUNT} metrics</span><div><i style={{ width: `${((status.heuristicCount + status.metricCount) / (10 + METRIC_COUNT)) * 100}%` }} /></div></div>
      <ul>{items.map(item => <li key={item.id}>{item.group && <span className="nav-group">{item.group}</span>}<button type="button" className={active === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)} aria-current={active === item.id ? 'location' : undefined}><span className="nav-meta">{item.meta}</span><span>{item.label}</span>{'complete' in item && (item.complete ? <Check size={14} /> : <Circle size={10} />)}</button></li>)}</ul>
    </nav>
    <div className="mobile-jump"><label htmlFor="section-jump">Jump to audit section</label><select id="section-jump" value={active} onChange={event => onNavigate(event.target.value)}>{items.map(item => <option key={item.id} value={item.id}>{item.meta} · {item.label}</option>)}</select></div>
  </>
}
