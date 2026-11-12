import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, CircleGauge, FlaskConical } from 'lucide-react'
import { METRIC_MODULES, METRIC_STATUSES, type MetricDefinition, type MetricModule } from '../metrics'
import type { AuditState, MetricEntry, MetricStatus } from '../types'
import { isMetricComplete, completion, metricModuleComplete } from '../lib/workbook'
import { Field, SelectInput, TextArea } from './Fields'
import { ImageField } from './ImageField'

interface MetricProps {
  state: AuditState
  onMetricChange: (key: string, entry: MetricEntry) => void
  onNavigate: (id: string) => void
}

export function MetricsOverview({ state, onNavigate }: Omit<MetricProps, 'onMetricChange'>) {
  const status = completion(state)
  const total = Object.keys(state.metrics).length
  return <section id="metrics" className="work-section metrics-overview" aria-labelledby="metrics-title">
    <div className="section-topline"><span>Section 02 · Usability metrics</span><span>{status.metricCount} / {total} reviewed</span></div>
    <h2 id="metrics-title">Measure the experience.<br />Preserve the evidence.</h2>
    <p className="section-intro">Move from expert inspection into observed task performance and technical verification. Each metric records an outcome, an observed result, its test conditions, a finding, a recommendation, and visual or written proof.</p>
    <div className="metric-principles">
      <div><FlaskConical size={22} /><h3>Measure before interpreting</h3><p>Record the numerator, denominator, sample, environment, tool, or threshold used. A number without its test context is not a reliable result.</p></div>
      <div><CircleGauge size={22} /><h3>No blended “UX score”</h3><p>Keep pass, partial, fail, and not-applicable outcomes visible. A strong average must never hide a task-blocking or accessibility failure.</p></div>
    </div>
    <div className="metric-outcomes" aria-label="Metric outcome summary">
      <div><span>Reviewed</span><strong>{status.metricCount}<small> / {total}</small></strong></div>
      <div><span>Pass</span><strong>{status.outcomeCounts.pass}</strong></div>
      <div><span>Partial</span><strong>{status.outcomeCounts.partial}</strong></div>
      <div><span>Fail</span><strong>{status.outcomeCounts.fail}</strong></div>
      <div><span>Not applicable</span><strong>{status.outcomeCounts['not-applicable']}</strong></div>
    </div>
    <div className="metric-module-index">
      {METRIC_MODULES.map((module, index) => {
        const complete = module.metrics.filter(metric => isMetricComplete(state.metrics[metric.id])).length
        return <button type="button" key={module.id} onClick={() => onNavigate(`metrics-${module.id}`)}>
          <span>{String(index + 1).padStart(2, '0')}</span><strong>{module.title}</strong><small>{complete} / {module.metrics.length} reviewed</small><ArrowRight size={17} />
        </button>
      })}
    </div>
    <div className="method-note"><strong>Completion standard</strong><p>For every metric, select an outcome and provide the observed result, test context, finding, recommendation, and either evidence notes or a screenshot. “Not applicable” also requires a scope justification. Draft JSON export remains available at any time.</p></div>
    <div className="section-footer"><span>8 usability measures + 28 technical audit vectors</span><button type="button" className="primary-button" onClick={() => onNavigate('metrics-core')}>Begin usability measurement<ArrowRight size={17} /></button></div>
  </section>
}

export function MetricModuleSection({ module, moduleIndex, state, onMetricChange, onNavigate }: MetricProps & { module: MetricModule; moduleIndex: number }) {
  const completeCount = module.metrics.filter(metric => isMetricComplete(state.metrics[metric.id])).length
  const complete = metricModuleComplete(state, module.id)
  const next = METRIC_MODULES[moduleIndex + 1]
  return <section id={`metrics-${module.id}`} className="work-section metric-module-section" aria-labelledby={`metrics-${module.id}-title`}>
    <div className="section-topline"><span>Metrics module {String(moduleIndex + 1).padStart(2, '0')} / {String(METRIC_MODULES.length).padStart(2, '0')}</span><span>{module.source}</span>{complete && <span className="complete-badge"><Check size={14} /> Module reviewed</span>}</div>
    <h2 id={`metrics-${module.id}-title`}>{module.title}</h2>
    <p className="section-intro">{module.description}</p>
    <div className="module-progress"><span>{completeCount} / {module.metrics.length} metrics reviewed</span><div><i style={{ width: `${(completeCount / module.metrics.length) * 100}%` }} /></div></div>
    <div className="metric-list">
      {module.metrics.map((metric, index) => <MetricEditor key={metric.id} metric={metric} index={index} entry={state.metrics[metric.id]} onChange={entry => onMetricChange(metric.id, entry)} />)}
    </div>
    <div className="section-footer"><span>Observed result + context + finding + recommendation + proof</span><button type="button" className="primary-button" onClick={() => onNavigate(next ? `metrics-${next.id}` : 'synthesis')}>{next ? 'Save & next metrics module' : 'Continue to final synthesis'}<ArrowRight size={17} /></button></div>
  </section>
}

function MetricEditor({ metric, index, entry, onChange }: { metric: MetricDefinition; index: number; entry: MetricEntry; onChange: (entry: MetricEntry) => void }) {
  const [open, setOpen] = useState(index === 0)
  const update = <K extends keyof MetricEntry>(key: K, value: MetricEntry[K]) => onChange({ ...entry, [key]: value })
  const complete = isMetricComplete(entry)
  const statusLabel = METRIC_STATUSES.find(status => status.value === entry.status)?.label || 'Not reviewed'
  return <details className={`metric-editor ${complete ? 'complete' : ''}`} open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>
      <span className="metric-number">{metric.id.toUpperCase()}</span>
      <span className="metric-summary-title"><strong>{metric.title}</strong><small>{metric.criteria}</small></span>
      <span className={`metric-status ${entry.status || 'empty'}`}>{complete && <Check size={13} />}{statusLabel}</span>
      <ChevronDown size={18} className="metric-chevron" />
    </summary>
    <div className="metric-body">
      <div className="metric-benchmark"><span>Testing criteria</span><p>{metric.criteria}</p><span>Benchmark / decision rule</span><p>{metric.benchmark}</p></div>
      <div className="metric-entry-grid">
        <div>
          <Field label="Audit outcome" required>
            <SelectInput value={entry.status} onChange={event => update('status', event.target.value as MetricStatus)}>
              <option value="">Select an outcome</option>
              {METRIC_STATUSES.map(status => <option key={status.value} value={status.value}>{status.label} — {status.description}</option>)}
            </SelectInput>
          </Field>
          <Field label="Observed result / measurement" hint={metric.measureHint} required><TextArea rows={3} value={entry.measurement} onChange={event => update('measurement', event.target.value)} placeholder={metric.measureHint} /></Field>
          <Field label="Test context, participants & tools" hint="Task, sample size, device/browser/locale, assistive technology, dataset, or measurement tool." required><TextArea rows={3} value={entry.context} onChange={event => update('context', event.target.value)} placeholder="Task and participant group · environment · tool · test date" /></Field>
          <Field label="Finding and interpretation" hint="Explain what the result means and identify the affected task, component, or user group." required><TextArea rows={4} value={entry.finding} onChange={event => update('finding', event.target.value)} placeholder="The result shows… This affects…" /></Field>
          <Field label="Recommendation / next action" hint="For a pass, state what to preserve or monitor. For N/A, justify the exclusion here as well." required><TextArea rows={3} value={entry.recommendation} onChange={event => update('recommendation', event.target.value)} placeholder="Recommend… because…" /></Field>
        </div>
        <div className="metric-proof">
          <ImageField compact value={entry.screenshot} onChange={value => update('screenshot', value)} label={`Visual proof for ${metric.title}`} />
          <Field label="Evidence notes / tool output reference" hint="Required when no screenshot is supplied. Cite a saved report, test log, session timestamp, measurement table, or precise observed state." required={!entry.screenshot}><TextArea rows={5} value={entry.evidenceNotes} onChange={event => update('evidenceNotes', event.target.value)} placeholder="Evidence source, tool output, session/log reference, or documented observation…" /></Field>
        </div>
      </div>
    </div>
  </details>
}
