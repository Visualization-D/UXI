# UX Audit Workspace V3

**Author:** Prof. Mohammad Lataifeh @ University of Sharjah

**Hosted application:** https://visualization-d.github.io/UXH/

## Professional UX evaluation in one workspace

UX Audit Workspace V3 is a screenshot-led evaluation workbook for professionals, students, researchers, designers, developers, and other auditors. It combines systematic heuristic inspection with usability measurement and technical UX verification. Users evaluate one digital platform through coherent, realistic task flows, document actual observations and measurements, and export a durable evidence package.

The application is frontend-only. Work auto-saves in the current browser with IndexedDB; there is no account, backend, or cross-device synchronization.

## Section 01 — 10 Heuristics

The complete V2 heuristic workflow is retained:

- Audit Nielsen’s ten heuristics one by one, with contemporary and AI-relevant lenses where applicable.
- Document **three different successful deployments per heuristic**, producing **30 strength examples**.
- Each strength includes a title, precise location, observation, heuristic reasoning, user benefit, and screenshot.
- Diagnose **five distinct UX defects** with primary and optional secondary heuristic mappings, severity, user impact, a “before” screenshot, and a visual alternative.

## Section 02 — Usability Metrics

The metrics section expands the supplied UI/UX and accessibility framework into **36 documented metrics across six modules**:

1. **Core usability performance (8):** task success, time on task, error rate, efficiency, learnability, assistance and recovery, single-task satisfaction, and perceived usability.
2. **Accessibility, WCAG 2.2 & ARIA (7):** contrast, focus, target size, accessible authentication, redundant entry, ARIA semantics, dragging alternatives, and motion.
3. **Cross-environment resilience (5):** browser parity, OS preferences, zoom/reflow, input modalities, and Core Web Vitals.
4. **UI components & interaction states (5):** typography, visual resiliency, forms, interaction states, and media.
5. **Internationalization & bidirectional UI (6):** language tags, RTL layout, directional icons, text expansion, script typography, and input directionality.
6. **Localization & regional formats (5):** dates, numbers/currency, international forms, cultural semantics, and character encoding.

Every metric provides:

- Pass, partial, fail, or not-applicable outcome
- Observed result or measurement
- Test context, participant group, environment, and tools
- Finding and interpretation
- Recommendation or next action
- Evidence notes and/or an annotated screenshot

Results remain disaggregated rather than being hidden inside a single “UX score.” V2 JSON backups can be imported and migrated without discarding existing heuristic work.

## Screenshot and annotation workflow

Every image field supports drag-and-drop, **Browse to add**, and direct clipboard paste with **Ctrl+V** or **Cmd+V**. Select the destination field before capturing. On Windows, **Win+Shift+S** copies a region to the clipboard; on macOS, **Control+Cmd+Shift+4** does the same. Return to the browser and paste without opening a file browser.

After adding an image, choose **Annotate** to draw freehand with a mouse, touch, or stylus. Six pen colors, undo, and clear are available. Saving flattens the annotation into the screenshot for autosave, JSON backups, reports, and ZIP export.

Crop to the relevant interface region and redact personal information before adding an image.

## Saving, backup, report, and export

- Work auto-saves only in the current browser and device.
- The **Audit file** menu starts a new audit, imports V2/V3 JSON, or exports current JSON even when unfinished.
- A printable standalone HTML report includes heuristic evidence, defect case studies, all metric results, screenshots, and synthesis.
- The complete ZIP contains the visual report, editable workbook data, and package notes.
- Complete ZIP export requires every checklist item; draft JSON and printable reports remain available.
- Later edits mark the previous export as pending. Exit and browser-close safeguards warn about out-of-date work.

## Privacy, ethics, and evidence integrity

Use test accounts and non-destructive tasks where possible. Do not include passwords, private messages, payment details, or other people’s personal data. Never enter real payment information or perform destructive actions for an audit. Do not fabricate platform behavior, participants, measurements, features, error states, or examples.

## GitHub Pages deployment

### Full-source package

Upload the source package contents to the repository root. In **Settings → Pages**, choose **GitHub Actions** as the source. The included `.github/workflows/deploy.yml` installs dependencies, builds `dist/`, and deploys it on pushes to `main`. The Vite base is relative, so project URLs such as `https://username.github.io/repository/` are supported.

### Prebuilt static package

To deploy without a build workflow, upload the contents of the prebuilt package directly to the publishing branch and choose **Deploy from a branch**. The package contains compiled assets, `index.html`, and `.nojekyll`; do not upload the V3 source folder as a static site.

## Project commands

```bash
npm install
npm run dev
npm run build
```

The production build is generated in `dist/`. Vite uses a relative base path for GitHub Pages compatibility.
