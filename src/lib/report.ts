import type { AuditState } from '../types'
import { HEURISTICS, SEVERITY } from '../data'
import { METRIC_MODULES, METRIC_STATUSES } from '../metrics'
import { completion, safeFilename } from './workbook'

const esc = (value: string | number | null | undefined) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character)
const text = (value: string) => esc(value).replace(/\n/g, '<br>')

export function reportFilename(state: AuditState) {
  return `UX-Audit-${safeFilename(state.profile.platformName)}-${safeFilename(state.profile.studentName)}`
}

export function generateReport(state: AuditState): string {
  const p = state.profile
  const status = completion(state)
  const heuristics = HEURISTICS.map(h => `
    <section class="heuristic">
      <p class="kicker">SECTION 01 · HEURISTIC ${String(h.number).padStart(2, '0')} · ${esc(h.group)}</p>
      <h2>${esc(h.title)}</h2>
      <p class="lens">Contemporary lens: ${esc(h.contemporary)}</p>
      <blockquote>${esc(h.canonical)}</blockquote>
      ${[1, 2, 3].map(index => {
        const entry = state.evidence[`${h.id}-e${index}`]
        return `<article class="entry">
          <h3>Strength ${index}. ${text(entry.title) || 'Untitled evidence'}</h3>
          <p class="location">${text(entry.location)}</p>
          ${entry.screenshot ? `<img src="${entry.screenshot}" alt="Evidence for ${esc(h.title)}, example ${index}">` : '<p class="missing">Screenshot not supplied.</p>'}
          <dl>
            <dt>Observed design</dt><dd>${text(entry.observation)}</dd>
            <dt>Why this demonstrates the heuristic</dt><dd>${text(entry.reasoning)}</dd>
            <dt>User benefit</dt><dd>${text(entry.benefit)}</dd>
          </dl>
        </article>`
      }).join('')}
    </section>`).join('')

  const defects = [1, 2, 3, 4, 5].map(index => {
    const d = state.defects[`d${index}`]
    const primary = HEURISTICS.find(h => h.id === d.primary)
    const secondary = d.secondary.map(id => HEURISTICS.find(h => h.id === id)?.title).filter(Boolean).join('; ')
    return `<section class="defect">
      <p class="kicker">SECTION 01 · DEFECT ${String(index).padStart(2, '0')}</p>
      <h2>${text(d.title) || 'Untitled defect'}</h2>
      <p class="location">${text(d.location)}</p>
      <dl class="summary">
        <dt>Primary heuristic</dt><dd>${esc(primary?.title || 'Not mapped')}</dd>
        <dt>Secondary heuristic(s)</dt><dd>${esc(secondary || 'None')}</dd>
        <dt>Severity</dt><dd>${esc(SEVERITY.find(s => s.value === d.severity)?.label || 'Not rated')}</dd>
      </dl>
      <div class="comparison">
        <div><h3>Observed defect</h3>${d.screenshot ? `<img src="${d.screenshot}" alt="Observed defect ${index}">` : '<p class="missing">Before screenshot not supplied.</p>'}</div>
        <div><h3>Proposed alternative</h3>${d.redesignImage ? `<img src="${d.redesignImage}" alt="Proposed alternative for defect ${index}">` : '<p class="missing">Alternative visual not supplied.</p>'}</div>
      </div>
      <dl>
        <dt>Defect and user task</dt><dd>${text(d.description)}</dd>
        <dt>User impact</dt><dd>${text(d.impact)}</dd>
        <dt>Proposed alternative and rationale</dt><dd>${text(d.alternative)}</dd>
      </dl>
    </section>`
  }).join('')

  const metricModules = METRIC_MODULES.map((module, moduleIndex) => `
    <section class="metric-module">
      <p class="kicker">SECTION 02 · METRICS MODULE ${String(moduleIndex + 1).padStart(2, '0')}</p>
      <h1>${esc(module.title)}</h1>
      <p class="subtitle">${esc(module.description)}</p>
      ${module.metrics.map(metric => {
        const entry = state.metrics[metric.id]
        const outcome = METRIC_STATUSES.find(item => item.value === entry.status)?.label || 'Not reviewed'
        return `<article class="metric">
          <p class="kicker">${esc(metric.id.toUpperCase())} · ${esc(outcome)}</p>
          <h2>${esc(metric.title)}</h2>
          <dl class="summary"><dt>Testing criteria</dt><dd>${text(metric.criteria)}</dd><dt>Benchmark / decision rule</dt><dd>${text(metric.benchmark)}</dd></dl>
          ${entry.screenshot ? `<img src="${entry.screenshot}" alt="Visual proof for ${esc(metric.title)}">` : '<p class="missing">No screenshot supplied; see written evidence.</p>'}
          <dl>
            <dt>Observed result / measurement</dt><dd>${text(entry.measurement)}</dd>
            <dt>Test context, participants & tools</dt><dd>${text(entry.context)}</dd>
            <dt>Finding and interpretation</dt><dd>${text(entry.finding)}</dd>
            <dt>Recommendation / next action</dt><dd>${text(entry.recommendation)}</dd>
            <dt>Evidence notes / reference</dt><dd>${text(entry.evidenceNotes) || 'See embedded screenshot.'}</dd>
          </dl>
        </article>`
      }).join('')}
    </section>`).join('')

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UX Audit V3 · ${esc(p.platformName)}</title><style>
    :root{--ink:#172729;--blue:#292456;--mint:#ddedf0;--line:#a8c3c7;--paper:#f7faf8}
    *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.6 Arial,sans-serif}
    main{max-width:980px;margin:auto;padding:48px}h1,h2,h3,p{margin-top:0}h1,h2,h3{font-family:Arial,sans-serif;font-weight:700;line-height:1.12}
    h1{font-size:48px;max-width:780px;margin-bottom:20px}h2{font-size:30px;margin-bottom:8px}h3{font-size:17px;line-height:1.3;margin-bottom:10px}
    .kicker{font-size:11px;font-weight:700;letter-spacing:.14em;color:var(--blue);margin-bottom:12px}.lens{font-weight:700}.subtitle{font-size:18px;max-width:760px}
    .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;margin:30px 0 50px}.meta p{margin:0}
    .meta b,.label{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
    .totals{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid var(--line);margin:28px 0}.totals div{padding:16px;border-right:1px solid var(--line)}.totals div:last-child{border:0}.totals b{display:block;font-size:25px}.totals span{font-size:11px;text-transform:uppercase}
    .heuristic,.defect,.final,.metric-module{page-break-before:always;padding-top:16px}blockquote{border-left:2px solid var(--blue);margin:20px 0 30px;padding:8px 18px;font-family:Georgia,serif;font-size:18px}
    .entry,.metric{border-top:1px solid var(--line);padding:28px 0;page-break-inside:avoid}.location{font-size:13px;font-weight:700}
    img{display:block;width:100%;max-height:560px;object-fit:contain;background:#fff;border:1px solid var(--line);margin:14px 0 18px;page-break-inside:avoid}
    dl{display:grid;grid-template-columns:200px 1fr;gap:8px 18px;margin:0}dt{font-weight:700}dd{margin:0}.summary{background:var(--mint);padding:16px;margin:16px 0}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:18px}.comparison img{max-height:360px}.missing{padding:14px;border:1px dashed var(--line);font-size:12px}.final dl{margin-bottom:28px}.footer{font-size:12px;border-top:1px solid var(--line);margin-top:50px;padding-top:16px}
    @media(max-width:640px){main{padding:24px}h1{font-size:36px}.meta,.comparison,.totals{grid-template-columns:1fr}dl{grid-template-columns:1fr}dd{margin-bottom:12px}.totals div{border-right:0;border-bottom:1px solid var(--line)}}
    @media print{body{background:#fff}main{max-width:none;padding:0}.entry,.metric{page-break-inside:auto}.metric h2,.metric h3{page-break-after:avoid}}
  </style></head><body><main>
    <p class="kicker">UX AUDIT WORKSPACE V3 · COMBINED EVIDENCE REPORT</p>
    <h1>${esc(p.platformName || 'Platform audit')}</h1>
    <p class="subtitle">Heuristic inspection, usability measurement, technical verification, diagnosed defects, and evidence-led recommendations.</p>
    <div class="meta">
      <p><b>Auditor / evaluator</b>${esc(p.studentName)}${p.studentId ? ` · ${esc(p.studentId)}` : ''}</p>
      <p><b>Organization / course</b>${esc(p.course || 'Not supplied')}</p>
      <p><b>Platform category</b>${esc(p.category)}</p>
      <p><b>Platform URL</b>${esc(p.url)}</p>
      <p><b>Primary audit context</b>${esc(p.device)} · ${esc(p.auditDate)}</p>
      <p><b>Tasks & participants in scope</b>${text(p.tasks)}</p>
    </div>
    <div class="totals"><div><b>${status.evidenceCount}/30</b><span>Strengths</span></div><div><b>${status.defectCount}/5</b><span>Defects</span></div><div><b>${status.outcomeCounts.pass}</b><span>Metric passes</span></div><div><b>${status.outcomeCounts.partial}</b><span>Partial</span></div><div><b>${status.outcomeCounts.fail}</b><span>Failures</span></div></div>
    ${heuristics}
    <section class="heuristic"><p class="kicker">SECTION 01 · DEFECT ANALYSIS</p><h1>Defect analysis & alternatives</h1><p class="subtitle">Each defect is rooted in one or more heuristics and paired with a visual, plausible alternative.</p></section>
    ${defects}
    <section class="metric-module"><p class="kicker">SECTION 02 · USABILITY METRICS</p><h1>Measured usability & technical quality</h1><p class="subtitle">Outcomes remain disaggregated so that averages cannot conceal critical task, accessibility, or regional failures. Not-applicable outcomes: ${status.outcomeCounts['not-applicable']}.</p></section>
    ${metricModules}
    <section class="final"><p class="kicker">SECTION 03 · SYNTHESIS</p><h1>Patterns, priorities & next round</h1>
      <dl><dt>Cross-method patterns</dt><dd>${text(state.synthesis.patterns)}</dd></dl>
      <dl><dt>Priority recommendation</dt><dd>${text(state.synthesis.priority)}</dd></dl>
      <dl><dt>Limitations & next evaluation round</dt><dd>${text(state.synthesis.reflection)}</dd></dl>
      <p class="footer">Generated ${esc(new Date().toLocaleString())} · Workbook revision ${state.revision}. Screenshots remain the intellectual property of their respective platform and are included for UX evaluation.</p>
    </section>
  </main></body></html>`
}
