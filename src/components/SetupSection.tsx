import { ArrowRight } from 'lucide-react'
import type { AuditProfile, PlatformCategory } from '../types'
import { Field, SelectInput, TextArea, TextInput } from './Fields'

export function SetupSection({ profile, onChange, onNext }: { profile: AuditProfile; onChange: (profile: AuditProfile) => void; onNext: () => void }) {
  const update = <K extends keyof AuditProfile>(key: K, value: AuditProfile[K]) => onChange({ ...profile, [key]: value })
  return <section id="setup" className="work-section" aria-labelledby="setup-title">
    <div className="section-topline"><span>Before you begin</span><span>Audit protocol</span></div>
    <h2 id="setup-title">Bound the audit before judging the interface.</h2>
    <p className="section-intro">Choose one product, service, or platform and two or three tasks that real users attempt. Establish the audience, environment, and workflow before collecting heuristic evidence or usability measurements.</p>
    <div className="form-grid two">
      <Field label="Auditor / evaluator name" required><TextInput value={profile.studentName} onChange={e => update('studentName', e.target.value)} placeholder="Your name or evaluation team" autoComplete="name" /></Field>
      <Field label="Role, team, or reference ID (optional)"><TextInput value={profile.studentId} onChange={e => update('studentId', e.target.value)} placeholder="UX researcher · project code · student ID" /></Field>
      <Field label="Organization / course (optional)"><TextInput value={profile.course} onChange={e => update('course', e.target.value)} placeholder="Organization, client, team, or course" /></Field>
      <Field label="Audit date" required><TextInput type="date" value={profile.auditDate} onChange={e => update('auditDate', e.target.value)} /></Field>
      <Field label="Platform / product name" required><TextInput value={profile.platformName} onChange={e => update('platformName', e.target.value)} placeholder="Selected platform or service" /></Field>
      <Field label="Platform category" required><SelectInput value={profile.category} onChange={e => update('category', e.target.value as PlatformCategory)}><option value="">Select a category</option><option>Government service</option><option>E-commerce</option><option>University website</option><option>Food delivery</option><option>Social media</option><option>SaaS / productivity</option><option>Financial service</option><option>Healthcare service</option><option>Media / entertainment</option><option>Other digital platform</option></SelectInput></Field>
      <Field label="Platform URL" required><TextInput type="url" value={profile.url} onChange={e => update('url', e.target.value)} placeholder="https://…" /></Field>
      <Field label="Primary device, browser, and viewport" hint="e.g., iPhone 16 / Safari, or Windows 11 / Chrome at 1440 px. Add other environments in metric entries." required><TextInput value={profile.device} onChange={e => update('device', e.target.value)} placeholder="Device · browser · viewport" /></Field>
    </div>
    <Field label="Task flows and participants in scope" hint="List two or three tasks and their starting points. For usability testing, identify the intended participant group and recruitment context; do not record personal participant data." required><TextArea rows={5} value={profile.tasks} onChange={e => update('tasks', e.target.value)} placeholder={'1. Start on the home page and…\n2. From search results…\nParticipant group: new customers…'} /></Field>
    <div className="privacy-note"><strong>Privacy and safe conduct</strong><p>Use test accounts and non-destructive tasks where possible. Redact personal information before adding screenshots. Do not include passwords, private messages, payment details, or other people’s personal data, and never enter real payment details for an audit.</p></div>
    <div className="section-footer"><span>Setup establishes the audit trail for every later result.</span><button type="button" className="primary-button" onClick={onNext}>Begin 10 Heuristics<ArrowRight size={17} /></button></div>
  </section>
}
