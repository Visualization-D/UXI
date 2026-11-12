import { Camera, FileOutput, Gauge, Search } from 'lucide-react'

export function BriefSection() {
  return <section id="brief" className="work-section brief-section" aria-labelledby="brief-title">
    <div className="section-topline"><span>Audit method</span><span>Expert inspection + measured evaluation</span></div>
    <h2 id="brief-title">Read the platform like a UX evaluator.</h2>
    <p className="section-intro">Use one coherent task scope across two complementary methods: systematic heuristic inspection and evidence-led usability measurement. A screenshot is proof of an observed state—not a substitute for a result, explanation, or recommendation.</p>
    <div className="brief-flow">
      <div><Search size={21} /><span>01</span><h3>Prepare & calibrate</h3><p>Choose realistic task flows, intended users, environments, and decision rules. Rehearse tasks before formal testing.</p></div>
      <div><Camera size={21} /><span>02</span><h3>Audit 10 Heuristics</h3><p>Document three strengths per heuristic, then diagnose five defects with severity and plausible visual alternatives.</p></div>
      <div><Gauge size={21} /><span>03</span><h3>Measure usability</h3><p>Record task performance, satisfaction, accessibility, resilience, components, internationalization, and localization.</p></div>
      <div><FileOutput size={21} /><span>04</span><h3>Synthesize & export</h3><p>Connect patterns across methods, prioritize changes, wait for auto-save, and export the current evidence package.</p></div>
    </div>
    <div className="brief-columns">
      <div>
        <h3>10 Heuristics evidence rules</h3>
        <ul className="check-list">
          <li>Give every strength a specific title, screen/task/location, readable screenshot, observation, heuristic reasoning, and user benefit.</li>
          <li>Make each example meaningfully different; three screenshots of the same component are not three distinct examples.</li>
          <li>Every defect needs a primary heuristic, optional secondary mappings, severity, user impact, and a visual alternative.</li>
          <li>Use the contemporary AI lens only where such a feature exists; otherwise audit the canonical rule.</li>
        </ul>
        <h3>Metric evidence rules</h3>
        <ul className="check-list">
          <li>Define success, errors, targets, and measurement conditions before comparing results.</li>
          <li>Record sample sizes, denominators, tools, environments, and instrument names. Never invent participants or measurements.</li>
          <li>Use “Not applicable” only with a scope justification. Automated accessibility scans do not replace manual testing.</li>
        </ul>
      </div>
      <div>
        <h3>Screenshot & annotation workflow</h3>
        <p>Drag and drop, browse, or paste screenshots with Ctrl/Cmd+V. Use <strong>Win+Shift+S</strong> on Windows or <strong>Control+Cmd+Shift+4</strong> on macOS, then paste directly into the selected field. Choose <strong>Annotate</strong> to add colored-pen emphasis.</p>
        <h3>Hosted workspace & saving</h3>
        <p>The <a href="https://visualization-d.github.io/UXH/" target="_blank" rel="noreferrer">hosted UXH application</a> auto-saves only in the current browser. Export editable JSON at any time, and keep the latest complete ZIP as the durable audit copy. Browser-local work does not synchronize across devices.</p>
        <h3>Defect severity</h3>
        <p><strong>0</strong> no problem · <strong>1</strong> cosmetic · <strong>2</strong> minor · <strong>3</strong> major · <strong>4</strong> catastrophic. Justify ratings using frequency, persistence, and impact.</p>
        <h3>Ethics, privacy & access</h3>
        <p>Do not include passwords, private messages, payment details, or other people’s personal data. Use test accounts and non-destructive tasks where possible. Do not fabricate platform behavior, participants, measurements, or examples.</p>
      </div>
    </div>
  </section>
}
