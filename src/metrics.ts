export interface MetricDefinition {
  id: string
  title: string
  criteria: string
  benchmark: string
  measureHint: string
}

export interface MetricModule {
  id: string
  title: string
  shortTitle: string
  description: string
  source: string
  metrics: MetricDefinition[]
}

export const METRIC_MODULES: MetricModule[] = [
  {
    id: 'core',
    title: 'Core usability performance',
    shortTitle: 'Usability',
    source: 'Effectiveness · efficiency · satisfaction',
    description: 'Measure what people actually achieve, the effort required, and their reported experience. Use moderated or unmoderated task tests; do not replace observed behavior with opinion alone.',
    metrics: [
      { id: 'm01', title: 'Task success rate', criteria: 'Define success and partial credit before testing. Calculate completed tasks ÷ attempted tasks × 100, by task and participant group.', benchmark: 'Set a task-specific target before testing; critical tasks normally need a higher target than exploratory ones.', measureHint: 'e.g., 8/10 completed = 80%; 2 partial; n=10' },
      { id: 'm02', title: 'Time on task', criteria: 'Record elapsed time from a defined start to a defined stop. Report median and range, separating successful and unsuccessful attempts.', benchmark: 'Compare with a predefined target, previous release, or comparable workflow—not an arbitrary universal number.', measureHint: 'e.g., Checkout median 84 s; range 52–173 s; n=10' },
      { id: 'm03', title: 'Error rate & error-free completion', criteria: 'Count slips and mistakes using a written error taxonomy. Report errors per task and the percentage of completions with no errors.', benchmark: 'Zero unrecovered critical errors; establish acceptable rates for non-critical errors by task.', measureHint: 'e.g., 14 errors / 30 attempts; 47% error-free; 1 critical' },
      { id: 'm04', title: 'Task efficiency', criteria: 'Measure effort among successful attempts: time per success, steps versus an optimal path, or completed goals per unit time.', benchmark: 'Meet the study’s efficiency target or improve against the baseline without increasing errors.', measureHint: 'e.g., 96 s/success; 11 steps vs. 7 optimal; baseline 128 s' },
      { id: 'm05', title: 'Learnability across repeated trials', criteria: 'Repeat comparable tasks and track changes in success, time, errors, and assistance. Keep task order and difficulty comparable.', benchmark: 'Performance improves across trials without increased facilitator assistance.', measureHint: 'e.g., Trial 1→3: success 50%→90%; median 132→71 s' },
      { id: 'm06', title: 'Assistance & error recovery', criteria: 'Record help requests, documentation use, recovery success, and time to recover after a defined error or blocker.', benchmark: 'Users recover without facilitator rescue; critical recovery paths are discoverable and successful.', measureHint: 'e.g., 7/9 recovered unaided; median recovery 23 s; 3 help uses' },
      { id: 'm07', title: 'Single-task satisfaction', criteria: 'Use a consistent post-task scale such as the Single Ease Question (SEQ), including the exact scale anchors and task context.', benchmark: 'Predefine the target and compare like-for-like tasks or releases; report distribution as well as average.', measureHint: 'e.g., SEQ mean 5.2/7; median 5; range 2–7; n=12' },
      { id: 'm08', title: 'Perceived usability', criteria: 'Administer a named validated instrument such as SUS or UMUX-Lite after the study. Preserve its scoring rules and report sample size.', benchmark: 'Use published benchmarks cautiously: SUS 68 is a reference average, not a universal pass mark. State the instrument used.', measureHint: 'e.g., SUS mean 64.6/100; 95% CI 57.1–72.1; n=16' }
    ]
  },
  {
    id: 'accessibility',
    title: 'Accessibility, WCAG 2.2 & ARIA',
    shortTitle: 'Accessibility',
    source: 'Technical accessibility · assistive technology',
    description: 'Test semantic and operable access with keyboard-only use, assistive technology, contrast tooling, and inspection of dynamic states. Automated scans support—but do not replace—manual verification.',
    metrics: [
      { id: 'a01', title: 'Color & contrast', criteria: 'Check text, images of text, large text, UI components, meaningful graphics, and dynamic hover/focus states with recorded color pairs.', benchmark: 'AA: normal text 4.5:1; large text and UI graphics 3:1. AAA: 7:1 and 4.5:1 respectively. Record the conformance target used.', measureHint: 'e.g., Body #36454F / #FFFFFF = 9.1:1 Pass; muted text 2.8:1 Fail' },
      { id: 'a02', title: 'Focus appearance, order & trapping', criteria: 'Traverse every actionable element by keyboard. Verify visible focus, logical DOM-aligned order, focus restoration, and no keyboard traps.', benchmark: '100% of actionable nodes receive visible focus; WCAG 2.2 Focus Appearance target stated; zero keyboard traps.', measureHint: 'e.g., 42/44 controls visible; 2 failures in modal; no trap' },
      { id: 'a03', title: 'Target dimensions & spacing', criteria: 'Measure pointer targets and spacing, including inline and exception cases, on desktop and touch viewports.', benchmark: 'WCAG 2.2 AA minimum 24×24 CSS px or qualifying spacing exception; 44×44 CSS px is the enhanced target.', measureHint: 'e.g., 36/41 meet 24 px; 5 icon buttons 20×20 without exception' },
      { id: 'a04', title: 'Accessible authentication', criteria: 'Test login and verification for cognitive-function barriers, paste/password-manager support, and an alternative authentication path.', benchmark: 'No cognitive function test is required unless an allowed alternative or mechanism is present.', measureHint: 'e.g., Paste and password manager work; puzzle has accessible alternative' },
      { id: 'a05', title: 'Redundant entry', criteria: 'Follow multi-step flows and identify information previously entered or provided that must be entered again.', benchmark: 'Zero mandatory re-entry of previously provided information unless a WCAG exception applies; auto-populate or offer selection.', measureHint: 'e.g., 0 redundant fields in checkout; address reusable in step 3' },
      { id: 'a06', title: 'ARIA semantic mapping', criteria: 'Inspect roles, names, states, aria-hidden, and aria-live behavior for tabs, accordions, dialogs, alerts, and other dynamic widgets.', benchmark: 'Zero invalid ARIA syntax; accessible names/states match visible behavior; dynamic updates are announced appropriately.', measureHint: 'e.g., 0 validator errors; live region announces status; tab state incorrect once' },
      { id: 'a07', title: 'Dragging alternatives & motion', criteria: 'Test every dragging action for a single-pointer alternative. Trigger interaction animation with reduced-motion enabled and check pause controls.', benchmark: 'All dragging actions have single-pointer alternatives; non-essential interaction motion respects prefers-reduced-motion or can be paused.', measureHint: 'e.g., 3/3 drag actions have buttons; carousel pauses; reduced motion Pass' }
    ]
  },
  {
    id: 'environment',
    title: 'Cross-environment resilience',
    shortTitle: 'Environments',
    source: 'Browsers · devices · preferences · performance',
    description: 'Verify layout and interaction across rendering engines, input modes, system preferences, zoom levels, and loading conditions. Record the actual environment and tools used.',
    metrics: [
      { id: 'e01', title: 'Rendering engine parity', criteria: 'Repeat critical flows in Blink, WebKit, and Gecko. Compare layout, typography, clipping, controls, and unhandled overflow.', benchmark: 'Zero task-blocking differences, unhandled overflow, or unexpected layout shifts across tested engines.', measureHint: 'e.g., Chrome 131 / Safari 18 / Firefox 133: 3 flows each; 1 Safari defect' },
      { id: 'e02', title: 'OS preference adaptability', criteria: 'Test dark/light scheme, reduced motion, and increased contrast preferences. Recheck contrast and content meaning after adaptation.', benchmark: 'Preferences are respected where supported; color inversion preserves target contrast and motion stops or becomes non-essential.', measureHint: 'e.g., 3 OS flags tested; reduced motion Pass; dark-mode muted text Fail' },
      { id: 'e03', title: 'Fluid typography, zoom & reflow', criteria: 'Test 200% text zoom and 400% browser zoom/reflow at an equivalent 320 CSS px width. Inspect every critical task and dialog.', benchmark: 'No two-dimensional scrolling for standard content, clipped text, lost controls, or obscured information at the target zoom.', measureHint: 'e.g., 200% text Pass; 400% at 1280→320 CSS px: 2 clipped dialogs' },
      { id: 'e04', title: 'Input modality switching', criteria: 'Switch among touch, stylus, trackpad/mouse, and hardware keyboard on relevant hybrid devices, including hover-dependent controls.', benchmark: 'No task is blocked after modality switching; hover functionality has persistent touch/keyboard alternatives.', measureHint: 'e.g., 4 modalities on Surface/iPad; 1 hover-only menu blocked on touch' },
      { id: 'e05', title: 'Core Web Vitals', criteria: 'Measure LCP, CLS, and INP using field data where available and clearly labeled lab data otherwise. Record device/network conditions.', benchmark: 'Good thresholds: LCP ≤2.5 s, CLS ≤0.1, INP ≤200 ms at the 75th percentile for field data.', measureHint: 'e.g., CrUX p75 mobile: LCP 2.2 s; CLS 0.06; INP 188 ms' }
    ]
  },
  {
    id: 'components',
    title: 'UI components & interaction states',
    shortTitle: 'Components',
    source: 'Typography · forms · state machines · media',
    description: 'Inspect reusable interface elements across their full state and content range. Sample components from critical flows rather than judging a static style guide alone.',
    metrics: [
      { id: 'c01', title: 'Typographic hierarchy & spacing', criteria: 'Inspect H1–H6 nesting and resize text/line height/spacing. Test long headings and paragraphs in actual content containers.', benchmark: 'No skipped heading levels without documented rationale; text remains readable and unclipped under WCAG text-spacing settings.', measureHint: 'e.g., 18 templates; 2 skipped levels; text-spacing test 17/18 Pass' },
      { id: 'c02', title: 'Visual style resiliency', criteria: 'Test essential boundaries and controls under low brightness and low contrast. Check reliance on shadow, texture, or color alone.', benchmark: 'All critical controls and boundaries remain perceivable at 50% screen brightness without relying solely on subtle shadows.', measureHint: 'e.g., 24 critical elements; 22 visible at 50%; 2 input borders unclear' },
      { id: 'c03', title: 'Form architecture & safe actions', criteria: 'Inspect persistent labels, instructions, required fields, validation, and placement/visual weight of destructive versus safe actions.', benchmark: '100% of form controls have persistent programmatic labels; destructive actions are separated and appropriately safeguarded.', measureHint: 'e.g., 31/33 labels persistent; delete and cancel adjacent in 2 dialogs' },
      { id: 'c04', title: 'Interaction state consistency', criteria: 'Map default, hover, focus, active, disabled, loading, error, and success states across representative interactive components.', benchmark: 'No dead or misleading states; equivalent components behave consistently and all essential states meet the contrast target.', measureHint: 'e.g., 12 components × 8 states; 3 missing loading; 2 low-contrast focus' },
      { id: 'c05', title: 'Media alternatives & asset loading', criteria: 'Check informative alt text, decorative-image handling, responsive sources, lazy loading, and layout stability while assets load.', benchmark: 'All informative images have appropriate alternatives; decorative images are ignored; asset loading causes no unexpected layout shift.', measureHint: 'e.g., 46 images: 42 correct alt, 3 missing, 1 verbose; CLS during load 0.03' }
    ]
  },
  {
    id: 'internationalization',
    title: 'Internationalization & bidirectional UI',
    shortTitle: 'i18n / BiDi',
    source: 'Language semantics · RTL · expansion · scripts',
    description: 'Test the interface under language, direction, script, and content-length changes. Include Arabic or another relevant RTL language where supported, plus pseudolocalization when real translations are unavailable.',
    metrics: [
      { id: 'i01', title: 'Semantic language tagging', criteria: 'Inspect the root lang attribute and inline language changes. Confirm that language switching updates the DOM semantics.', benchmark: 'Valid language tags on the root and every language change; zero missing or stale lang attributes in tested views.', measureHint: 'e.g., 6 views; html lang updates en→ar; 2 inline English phrases untagged' },
      { id: 'i02', title: 'Bidirectional layout mirroring', criteria: 'Apply RTL and inspect grids, alignment, margins, padding, floats, and mixed-direction content. Review CSS physical properties.', benchmark: 'Layout mirrors without overlap or misplaced controls; logical properties are used where direction-dependent alignment is intended.', measureHint: 'e.g., 12 RTL views; 10 mirror correctly; 2 hardcoded left offsets' },
      { id: 'i03', title: 'Directional iconography', criteria: 'Review back/forward arrows, progress indicators, media controls, and other directional icons in LTR and RTL contexts.', benchmark: 'All direction-dependent icons mirror correctly; symmetric and culturally non-directional icons remain unchanged.', measureHint: 'e.g., 17 directional icons; 15 mirrored; carousel arrows incorrect' },
      { id: 'i04', title: 'Text expansion & contraction', criteria: 'Test long translations or pseudolocalized strings with approximately 40% expansion, short scripts, and 320 CSS px reflow.', benchmark: 'No clipping, overlap, lost actions, or unintended truncation in critical controls and content.', measureHint: 'e.g., +40% pseudolocale: 28/31 components Pass; 3 tabs clipped' },
      { id: 'i05', title: 'Script-specific typography', criteria: 'Inspect fallback fonts, diacritics, ascenders/descenders, baseline alignment, and line height for each supported script.', benchmark: 'No clipped marks or glyphs; fallback fonts preserve legibility and layout across supported scripts.', measureHint: 'e.g., Arabic/English/Hindi: 15 views; 1 Arabic diacritic clipped' },
      { id: 'i06', title: 'Input directionality', criteria: 'Type LTR and RTL text into search, forms, and multiline inputs under both page directions. Inspect caret and alignment.', benchmark: 'Inputs support appropriate direction, including dir="auto" or an equivalent deliberate behavior, without cursor/alignment defects.', measureHint: 'e.g., 9 inputs × Arabic/English; 8 adapt; phone field intentionally LTR' }
    ]
  },
  {
    id: 'localization',
    title: 'Localization & regional formats',
    shortTitle: 'Localization',
    source: 'Dates · numbers · forms · culture · encoding',
    description: 'Validate region-specific presentation and validation with real locale settings and international test data. Check both rendering and round-trip data handling.',
    metrics: [
      { id: 'l01', title: 'Date, time & calendar formats', criteria: 'Change locale and timezone; test date entry, display, 12/24-hour clocks, week start, and ambiguous dates.', benchmark: 'Dates and times follow the selected locale and remain unambiguous; locale-aware formatting is used rather than hardcoded strings.', measureHint: 'e.g., en-US/en-GB/ar-AE tested; 2 hardcoded US dates; timezone Pass' },
      { id: 'l02', title: 'Numbers, decimals & currency', criteria: 'Test currency-symbol placement, decimal/thousand separators, negative values, large values, and parsing after locale changes.', benchmark: 'Displayed and entered values follow the selected locale and retain the correct underlying value.', measureHint: 'e.g., 1,234.56 ↔ 1.234,56 correct; AED placement Pass; parsing 1 failure' },
      { id: 'l03', title: 'International address & phone forms', criteria: 'Use alphanumeric postal codes, variable phone lengths, international prefixes, and country-dependent region/address structures.', benchmark: 'No US-only assumptions block valid international data; labels and validation adapt to the selected country.', measureHint: 'e.g., 8 country datasets; 7 accepted; Canadian postal code rejected' },
      { id: 'l04', title: 'Color & cultural semantics', criteria: 'Review colors, icons, imagery, examples, and symbols with relevant regional users or reviewers in their actual context.', benchmark: 'No culturally inappropriate or misleading meaning identified in reviewed locales; uncertain items are explicitly flagged for local review.', measureHint: 'e.g., 24 assets reviewed for AE/IN/DE; 2 flagged for local reviewer' },
      { id: 'l05', title: 'Character encoding & round-trip integrity', criteria: 'Inspect charset declarations and submit/reload non-Latin, accented, emoji, and mixed-direction data through critical workflows.', benchmark: 'UTF-8 is declared and content survives entry, transmission, storage, export, and rerendering without mojibake or substitution.', measureHint: 'e.g., UTF-8 present; 24 test strings; 23 round-trip correctly; export defect' }
    ]
  }
]

export const ALL_METRICS = METRIC_MODULES.flatMap(module => module.metrics)
export const METRIC_COUNT = ALL_METRICS.length

export const METRIC_STATUSES = [
  { value: 'pass', label: 'Pass', description: 'The stated target is met.' },
  { value: 'partial', label: 'Partial', description: 'Some samples or conditions meet the target.' },
  { value: 'fail', label: 'Fail', description: 'The stated target is not met.' },
  { value: 'not-applicable', label: 'N/A', description: 'Out of scope, with justification.' }
] as const
