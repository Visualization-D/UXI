import { openDB } from 'idb'
import { createInitialState, HEURISTICS } from '../data'
import { ALL_METRICS, METRIC_MODULES } from '../metrics'
import type { AuditState, DefectEntry, EvidenceEntry, MetricEntry, MetricStatus } from '../types'

const DATABASE = 'heuristic-audit-studio'
const STORE = 'workbook'
const KEY = 'current-audit'

export function isEvidenceComplete(entry: EvidenceEntry) {
  return Boolean(entry.title.trim() && entry.location.trim() && entry.observation.trim() && entry.reasoning.trim() && entry.benefit.trim() && entry.screenshot)
}

export function isDefectComplete(entry: DefectEntry) {
  return Boolean(entry.title.trim() && entry.location.trim() && entry.primary && entry.description.trim() && entry.impact.trim() && entry.severity !== null && entry.alternative.trim() && entry.screenshot && entry.redesignImage)
}

export function isMetricComplete(entry: MetricEntry) {
  return Boolean(entry.status && entry.measurement.trim() && entry.context.trim() && entry.finding.trim() && entry.recommendation.trim() && (entry.evidenceNotes.trim() || entry.screenshot))
}

export function heuristicComplete(state: AuditState, id: string) {
  return [1, 2, 3].every(index => isEvidenceComplete(state.evidence[`${id}-e${index}`]))
}

export function metricModuleComplete(state: AuditState, moduleId: string) {
  const module = METRIC_MODULES.find(item => item.id === moduleId)
  return Boolean(module && module.metrics.every(metric => isMetricComplete(state.metrics[metric.id])))
}

export function completion(state: AuditState) {
  const p = state.profile
  const evidenceCount = Object.values(state.evidence).filter(isEvidenceComplete).length
  const defectCount = Object.values(state.defects).filter(isDefectComplete).length
  const metricCount = Object.values(state.metrics).filter(isMetricComplete).length
  const heuristicCount = HEURISTICS.filter(h => heuristicComplete(state, h.id)).length
  const metricModuleCount = METRIC_MODULES.filter(module => metricModuleComplete(state, module.id)).length
  const outcomeCounts: Record<Exclude<MetricStatus, ''>, number> = { pass: 0, partial: 0, fail: 0, 'not-applicable': 0 }
  for (const entry of Object.values(state.metrics)) {
    if (entry.status) outcomeCounts[entry.status] += 1
  }
  const checks = [
    { id: 'setup', target: 'setup', label: 'Audit setup and task scope', complete: Boolean(p.studentName.trim() && p.platformName.trim() && p.category && p.url.trim() && p.device.trim() && p.auditDate && p.tasks.trim()) },
    ...HEURISTICS.map(h => ({ id: h.id, target: h.id, label: `H${String(h.number).padStart(2, '0')} · ${h.title}`, complete: heuristicComplete(state, h.id) })),
    { id: 'defects', target: 'defects', label: 'Five defect case studies', complete: defectCount === 5 },
    ...METRIC_MODULES.map(module => ({ id: `metrics-${module.id}`, target: `metrics-${module.id}`, label: `Metrics · ${module.shortTitle}`, complete: metricModuleComplete(state, module.id) })),
    { id: 'synthesis', target: 'synthesis', label: 'Cross-method synthesis and priority', complete: Boolean(state.synthesis.patterns.trim() && state.synthesis.priority.trim() && state.synthesis.reflection.trim()) }
  ]
  return { complete: checks.every(check => check.complete), checks, evidenceCount, defectCount, metricCount, heuristicCount, metricModuleCount, outcomeCounts }
}

const database = openDB(DATABASE, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
  }
})

export async function loadWorkbook(): Promise<AuditState | undefined> {
  return (await database).get(STORE, KEY)
}

export async function saveWorkbook(state: AuditState) {
  await (await database).put(STORE, state, KEY)
}

export async function clearWorkbook() {
  await (await database).delete(STORE, KEY)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function safeFilename(value: string) {
  return value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'Untitled'
}

export function hydrateState(saved: AuditState): AuditState {
  const initial = createInitialState()
  const evidence = { ...initial.evidence }
  for (const [key, entry] of Object.entries(saved.evidence || {})) {
    if (evidence[key]) evidence[key] = { ...evidence[key], ...entry }
  }
  const defects = { ...initial.defects }
  for (const [key, entry] of Object.entries(saved.defects || {})) {
    if (defects[key]) defects[key] = { ...defects[key], ...entry }
  }
  const metrics = { ...initial.metrics }
  for (const [key, entry] of Object.entries(saved.metrics || {})) {
    if (metrics[key]) metrics[key] = { ...metrics[key], ...entry }
  }
  return {
    ...initial,
    ...saved,
    version: 2,
    profile: { ...initial.profile, ...saved.profile },
    evidence,
    defects,
    metrics,
    synthesis: { ...initial.synthesis, ...saved.synthesis }
  }
}

export function normalizeImportedState(value: unknown): AuditState {
  if (!value || typeof value !== 'object') throw new Error('This file does not contain an audit workbook.')
  const candidate = value as Omit<Partial<AuditState>, 'version'> & { version?: number }
  if ((candidate.version !== 1 && candidate.version !== 2) || !candidate.profile || !candidate.evidence || !candidate.defects || !candidate.synthesis) {
    throw new Error('The workbook structure is not compatible with UX Audit Workspace V3.')
  }
  const hydrated = hydrateState(candidate as AuditState)
  return {
    ...hydrated,
    revision: Date.now(),
    exportedRevision: -1,
    updatedAt: new Date().toISOString()
  }
}

export function metricById(id: string) {
  return ALL_METRICS.find(metric => metric.id === id)
}
