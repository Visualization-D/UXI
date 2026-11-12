import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import JSZip from 'jszip'
import { ArrowDown, ArrowRight, ChevronDown, CloudOff, Download, FileCheck2, FilePlus2, FolderOpen, LoaderCircle, Save, ShieldCheck, Upload } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { HEURISTICS, createInitialState } from './data'
import { METRIC_MODULES, METRIC_COUNT } from './metrics'
import type { AuditProfile, AuditState, DefectEntry, EvidenceEntry, MetricEntry } from './types'
import { Navigation } from './components/Navigation'
import { BriefSection } from './components/BriefSection'
import { SetupSection } from './components/SetupSection'
import { HeuristicSection } from './components/HeuristicSection'
import { DefectEditor } from './components/DefectEditor'
import { MetricsOverview, MetricModuleSection } from './components/MetricsSection'
import { ExportSection } from './components/ExportSection'
import { Modal } from './components/Modal'
import { TextArea } from './components/Fields'
import { clearWorkbook, completion, downloadBlob, hydrateState, loadWorkbook, normalizeImportedState, saveWorkbook } from './lib/workbook'
import { generateReport, reportFilename } from './lib/report'

type SaveState = 'loading' | 'saving' | 'saved' | 'error'

export default function App() {
  const [state, setState] = useState<AuditState>(() => createInitialState())
  const [loaded, setLoaded] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('loading')
  const [active, setActive] = useState('overview')
  const [exportBusy, setExportBusy] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const status = useMemo(() => completion(state), [state])
  const exportCurrent = status.complete && state.revision === state.exportedRevision
  const documentedEntries = status.evidenceCount + status.defectCount + status.metricCount
  const totalEntries = 35 + METRIC_COUNT

  useEffect(() => {
    let alive = true
    loadWorkbook().then(saved => {
      if (!alive) return
      if (saved) setState(hydrateState(saved))
      setLoaded(true)
      setSaveState('saved')
    }).catch(() => {
      if (!alive) return
      setLoaded(true)
      setSaveState('error')
      toast.error('Saved work could not be loaded. Export a backup before continuing.')
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!loaded) return
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      saveWorkbook(state).then(() => setSaveState('saved')).catch(() => {
        setSaveState('error')
        toast.error('Auto-save failed. Download a workbook backup before leaving.')
      })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [state, loaded])

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (state.revision > 0 && state.revision !== state.exportedRevision) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [state.revision, state.exportedRevision])

  useEffect(() => {
    const updateActive = () => {
      const ids = ['overview', 'setup', 'brief', ...HEURISTICS.map(h => h.id), 'defects', 'metrics', ...METRIC_MODULES.map(module => `metrics-${module.id}`), 'synthesis', 'export']
      let current = 'overview'
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= 220) current = id
      }
      setActive(current)
    }
    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => { window.removeEventListener('scroll', updateActive); window.removeEventListener('resize', updateActive) }
  }, [])

  const navigate = useCallback((id: string) => {
    setActive(id)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }, [])

  function closeFileMenu() {
    document.getElementById('audit-file-menu')?.removeAttribute('open')
  }

  function revise(change: (previous: AuditState) => AuditState) {
    setState(previous => ({ ...change(previous), revision: previous.revision + 1, updatedAt: new Date().toISOString() }))
  }

  const updateProfile = (profile: AuditProfile) => revise(previous => ({ ...previous, profile }))
  const updateEvidence = (key: string, entry: EvidenceEntry) => revise(previous => ({ ...previous, evidence: { ...previous.evidence, [key]: entry } }))
  const updateDefect = (key: string, entry: DefectEntry) => revise(previous => ({ ...previous, defects: { ...previous.defects, [key]: entry } }))
  const updateMetric = (key: string, entry: MetricEntry) => revise(previous => ({ ...previous, metrics: { ...previous.metrics, [key]: entry } }))
  const updateSynthesis = (key: keyof AuditState['synthesis'], value: string) => revise(previous => ({ ...previous, synthesis: { ...previous.synthesis, [key]: value } }))

  function backup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `${reportFilename(state)}-backup.json`)
    toast.success('Editable workbook backup downloaded.')
  }

  async function importBackup(file: File) {
    if (!window.confirm('Restore this backup? It will replace the audit currently saved in this browser.')) return
    try {
      const imported = normalizeImportedState(JSON.parse(await file.text()))
      setState(imported)
      navigate('overview')
      toast.success('Backup restored and upgraded where needed. Your work is now auto-saving.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The backup could not be restored.')
    }
  }

  async function exportSubmission() {
    const latest = completion(state)
    if (!latest.complete) {
      const first = latest.checks.find(check => !check.complete)
      toast.error(`Complete “${first?.label}” before exporting the complete audit package. Draft JSON export is always available.`)
      if (first) navigate(first.target)
      return
    }
    if (saveState === 'saving') {
      toast.message('Wait for auto-save to finish, then export again.')
      return
    }
    setExportBusy(true)
    try {
      const zip = new JSZip()
      const filename = reportFilename(state)
      zip.file(`${filename}-report.html`, generateReport(state))
      zip.file(`${filename}-data.json`, JSON.stringify({ ...state, exportedRevision: state.revision }, null, 2))
      zip.file('READ-ME.txt', 'UX AUDIT WORKSPACE V3 — EVIDENCE PACKAGE\n\nOpen the HTML report in any browser to read the combined heuristic and usability-metrics audit.\nThe JSON file can be restored in UX Audit Workspace V3 for further editing. V2 JSON backups are migrated on import.\n\nThe audit was auto-saved locally in this browser; this exported package is the durable audit copy.\n')
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      downloadBlob(blob, `${filename}.zip`)
      setState(previous => ({ ...previous, exportedRevision: previous.revision }))
      toast.success('Current audit package exported. Keep this ZIP as the durable copy.')
    } catch {
      toast.error('The audit package could not be created. Download a JSON backup and try again.')
    } finally {
      setExportBusy(false)
    }
  }

  function printReport() {
    const reportWindow = window.open('', '_blank')
    if (!reportWindow) {
      toast.error('Allow pop-ups to open the printable report, or export the ZIP instead.')
      return
    }
    reportWindow.document.write(generateReport(state))
    reportWindow.document.close()
    reportWindow.focus()
    window.setTimeout(() => reportWindow.print(), 500)
  }

  async function resetAudit() {
    await clearWorkbook()
    setState(createInitialState())
    setResetOpen(false)
    setExitOpen(false)
    navigate('overview')
    toast.success('A new blank audit is ready.')
  }

  const saveLabel = saveState === 'saving' ? 'Saving changes…' : saveState === 'saved' ? 'All changes saved' : saveState === 'error' ? 'Save failed' : 'Loading workbook…'

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to audit content</a>
    <Toaster position="bottom-right" richColors closeButton />
    <header className="topbar">
      <button type="button" className="brand" onClick={() => navigate('overview')} aria-label="UX Audit Workspace V3 @ Prof. Mohammad Lataifeh - University of Sharjah overview">
        <span className="brand-mark">UX</span>
        <span className="brand-copy"><span className="brand-title">UX Audit Workspace V3</span><span className="brand-author">@ Prof. Mohammad Lataifeh - University of Sharjah</span></span>
      </button>
      <div className="topbar-actions">
        <details className="file-menu" id="audit-file-menu">
          <summary><FolderOpen size={16} /><span>Audit file</span><ChevronDown size={14} /></summary>
          <div className="file-menu-items" aria-label="Audit file actions">
            <button type="button" onClick={() => { closeFileMenu(); setResetOpen(true) }}><FilePlus2 size={18} /><span><strong>Start new audit</strong><small>Clear current work after confirmation</small></span></button>
            <button type="button" onClick={() => { closeFileMenu(); importRef.current?.click() }}><Upload size={18} /><span><strong>Continue from JSON</strong><small>Import a V2 or V3 audit file</small></span></button>
            <button type="button" onClick={() => { closeFileMenu(); backup() }}><Download size={18} /><span><strong>Export current JSON</strong><small>Save progress, even if unfinished</small></span></button>
          </div>
        </details>
        <input ref={importRef} type="file" accept="application/json,.json" className="visually-hidden" aria-label="Import a previous audit JSON file" onChange={event => { const file = event.target.files?.[0]; if (file) void importBackup(file); event.target.value = '' }} />
        <span className={`save-status ${saveState}`}>{saveState === 'saving' || saveState === 'loading' ? <LoaderCircle size={15} className="spin" /> : saveState === 'saved' ? <Save size={15} /> : <CloudOff size={15} />}{saveLabel}</span>
        <button type="button" className="review-button" onClick={() => { closeFileMenu(); navigate('export') }}>Review & export<ArrowRight size={16} /></button>
      </div>
    </header>
    <div className="workspace">
      <aside><Navigation active={active} state={state} onNavigate={navigate} /><div className="local-note"><ShieldCheck size={16} /><p>Private by default. Work stays in this browser until you export it.</p></div></aside>
      <main id="main-content">
        <section id="overview" className="hero-section">
          <div className="hero-copy">
            <p className="hero-kicker">Heuristic evaluation · usability testing · technical UX</p>
            <h1>Audit the experience.<br /><em>Prove the outcome.</em></h1>
            <p>A professional evidence workspace combining Nielsen’s ten heuristics, observed usability measures, accessibility, cross-environment resilience, components, internationalization, and localization.</p>
            <button type="button" className="primary-button hero-button" onClick={() => navigate('setup')}>Start or resume in this browser<ArrowDown size={18} /></button>
          </div>
          <div className="hero-ledger" aria-label="Audit coverage">
            <div><strong>10</strong><span>heuristics, audited one by one</span></div>
            <div><strong>{METRIC_COUNT}</strong><span>usability and technical metrics</span></div>
            <div><strong>30</strong><span>successful deployment examples</span></div>
            <div><strong>05</strong><span>defects with visual alternatives</span></div>
          </div>
          <div className="hero-progress">
            <span>Your audit</span>
            <div><i style={{ width: `${Math.round((documentedEntries / totalEntries) * 100)}%` }} /></div>
            <strong>{documentedEntries} / {totalEntries} documented entries</strong>
          </div>
        </section>
        <SetupSection profile={state.profile} onChange={updateProfile} onNext={() => navigate('h1')} />
        <BriefSection />
        {HEURISTICS.map((heuristic, index) => <HeuristicSection key={heuristic.id} heuristic={heuristic} state={state} onEvidenceChange={updateEvidence} onNext={() => navigate(index === 9 ? 'defects' : HEURISTICS[index + 1].id)} />)}
        <section id="defects" className="work-section" aria-labelledby="defects-title">
          <div className="section-topline"><span>Section 01 · Defect analysis</span><span>{status.defectCount} / 5 complete</span></div>
          <h2 id="defects-title">Move from recognition to diagnosis.</h2>
          <p className="section-intro">Document five distinct UX defects found in the same platform and task scope. Root each defect in a primary heuristic and, where useful, secondary heuristics. Pair every “before” screenshot with a feasible visual alternative.</p>
          <div className="method-note"><strong>Diagnosis before decoration</strong><p>Explain the user-task problem and its cause first. A recolored screenshot is not a redesign; the alternative must change the interaction, information, feedback, or safeguard that caused the defect.</p></div>
          {[1, 2, 3, 4, 5].map(index => {
            const key = `d${index}`
            return <DefectEditor key={key} entry={state.defects[key]} index={index} onChange={entry => updateDefect(key, entry)} />
          })}
          <div className="section-footer"><span>Five distinct defects · each with severity and an alternative</span><button type="button" className="primary-button" onClick={() => navigate('metrics')}>Continue to Usability Metrics<ArrowRight size={17} /></button></div>
        </section>
        <MetricsOverview state={state} onNavigate={navigate} />
        {METRIC_MODULES.map((module, index) => <MetricModuleSection key={module.id} module={module} moduleIndex={index} state={state} onMetricChange={updateMetric} onNavigate={navigate} />)}
        <section id="synthesis" className="work-section synthesis-section" aria-labelledby="synthesis-title">
          <div className="section-topline"><span>Section 03 · Synthesis</span><span>Decisions across methods</span></div>
          <h2 id="synthesis-title">Turn evidence into a decision.</h2>
          <p className="section-intro">Connect heuristic observations, measured task outcomes, and technical findings. Explain what the platform does well, where the experience breaks down, and which change should come first.</p>
          <label className="synthesis-field"><span>01 · Cross-method patterns *</span><p>Identify two or three recurring strengths or weaknesses. Connect heuristic examples with usability or technical metrics rather than repeating individual entries.</p><TextArea rows={6} value={state.synthesis.patterns} onChange={event => updateSynthesis('patterns', event.target.value)} placeholder="Across the heuristic and metric results, the platform consistently…" /></label>
          <label className="synthesis-field"><span>02 · Priority recommendation *</span><p>Choose the defect, metric failure, or design opportunity that should be addressed first. Justify the priority using user impact, severity, and measured evidence.</p><TextArea rows={5} value={state.synthesis.priority} onChange={event => updateSynthesis('priority', event.target.value)} placeholder="The first change should be… because…" /></label>
          <label className="synthesis-field"><span>03 · Limitations & next evaluation round *</span><p>State the limits of the sample, environments, tasks, or evidence. Propose what the team should measure after the recommended change.</p><TextArea rows={6} value={state.synthesis.reflection} onChange={event => updateSynthesis('reflection', event.target.value)} placeholder="This audit cannot establish… The next round should measure…" /></label>
          <div className="section-footer"><span>Concise, evidence-grounded synthesis expected</span><button type="button" className="primary-button" onClick={() => navigate('export')}>Review complete audit<ArrowRight size={17} /></button></div>
        </section>
        <ExportSection state={state} saveState={saveState} exportBusy={exportBusy} onNavigate={navigate} onExport={() => void exportSubmission()} onPrint={printReport} onBackup={backup} onImport={file => void importBackup(file)} onExit={() => setExitOpen(true)} onReset={() => setResetOpen(true)} />
        <footer className="page-footer"><span>UX Audit Workspace V3</span><span>10 Heuristics · Usability Metrics · Visual Evidence</span></footer>
      </main>
    </div>
    {exitOpen && <Modal title={exportCurrent ? 'Your audit is ready to leave.' : 'Your exit checklist is not complete.'} onClose={() => setExitOpen(false)}>
      {exportCurrent ? <><div className="safe-exit"><FileCheck2 size={34} /><p>All required sections are complete, changes are auto-saved, and the current audit ZIP has been exported. It is now safe to close this tab.</p></div><button type="button" className="primary-button wide" onClick={() => setExitOpen(false)}>Done — close this message</button></> : <>
        <p>You can keep working without losing data. Before leaving, resolve the following or download a draft JSON backup:</p>
        <ul className="exit-issues">
          {saveState === 'saving' && <li>Wait for automatic saving to finish.</li>}
          {!status.complete && <li>{status.checks.filter(check => !check.complete).length} checklist section(s) still need work.</li>}
          {status.complete && state.revision !== state.exportedRevision && <li>Export a new audit ZIP containing your latest edits.</li>}
        </ul>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setExitOpen(false)}>Keep editing</button><button type="button" className="primary-button" onClick={() => { setExitOpen(false); navigate('export') }}>Go to review & export<ArrowRight size={16} /></button></div>
      </>}
    </Modal>}
    {resetOpen && <Modal title="Erase this audit and start over?" onClose={() => setResetOpen(false)}><p>This removes the work auto-saved in this browser. Download a backup first if you may need it later. An exported ZIP is not affected.</p><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setResetOpen(false)}>Cancel</button><button type="button" className="danger-button" onClick={() => void resetAudit()}>Erase and start new audit</button></div></Modal>}
  </div>
}
