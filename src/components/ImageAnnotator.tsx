import { useEffect, useId, useRef, useState } from 'react'
import { Check, Eraser, PenLine, Undo2 } from 'lucide-react'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import type { ReactSketchCanvasRef } from 'react-sketch-canvas'
import { toast } from 'sonner'

const PEN_COLORS = [
  { name: 'Red', value: '#e11d48' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Black', value: '#111827' },
]

export function ImageAnnotator({ value, label, onSave, onCancel }: {
  value: string
  label: string
  onSave: (value: string) => void
  onCancel: () => void
}) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const canvasId = `annotation-${useId().replace(/:/g, '')}`
  const [color, setColor] = useState(PEN_COLORS[0].value)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  const [hasStrokes, setHasStrokes] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const image = new Image()
    image.onload = () => setSize({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => toast.error('The screenshot could not be opened for annotation.')
    image.src = value
  }, [value])

  async function save() {
    if (!canvasRef.current || !size || !hasStrokes) return
    setSaving(true)
    try {
      const svg = await canvasRef.current.exportSvg()
      const documentSvg = new DOMParser().parseFromString(svg, 'image/svg+xml')
      if (documentSvg.querySelector('parsererror')) throw new Error('The annotation could not be prepared.')
      const root = documentSvg.documentElement
      root.setAttribute('width', String(size.width))
      root.setAttribute('height', String(size.height))
      const blob = new Blob([new XMLSerializer().serializeToString(root)], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      try {
        const image = await loadImage(url)
        const output = document.createElement('canvas')
        output.width = size.width
        output.height = size.height
        const context = output.getContext('2d')
        if (!context) throw new Error('The annotation could not be rendered in this browser.')
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, size.width, size.height)
        context.drawImage(image, 0, 0, size.width, size.height)
        onSave(output.toDataURL('image/jpeg', 0.9))
      } finally {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The annotation could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="image-annotator" aria-label={`Annotate ${label}`}>
    <div className="annotation-heading">
      <strong><PenLine size={17} /> Annotate screenshot</strong>
      <span>Draw with a mouse, touch, or stylus.</span>
    </div>
    <div className="annotation-toolbar">
      <div className="pen-colors" role="group" aria-label="Pen color">
        {PEN_COLORS.map(pen => <button
          type="button"
          key={pen.value}
          className={`pen-color ${color === pen.value ? 'selected' : ''}`}
          style={{ backgroundColor: pen.value }}
          aria-label={`${pen.name} pen`}
          aria-pressed={color === pen.value}
          title={`${pen.name} pen`}
          onClick={() => setColor(pen.value)}
          disabled={saving}
        >
          {color === pen.value && <Check size={16} color={pen.name === 'Yellow' ? '#111827' : '#ffffff'} />}
        </button>)}
      </div>
      <div className="annotation-history">
        <button type="button" className="text-button" onClick={() => canvasRef.current?.undo()} disabled={!hasStrokes || saving}>
          <Undo2 size={15} /> Undo
        </button>
        <button type="button" className="text-button" onClick={() => canvasRef.current?.clearCanvas()} disabled={!hasStrokes || saving}>
          <Eraser size={15} /> Clear
        </button>
      </div>
    </div>
    <div className="annotation-canvas-wrap">
      {size ? <div
        className="annotation-canvas"
        style={{ aspectRatio: `${size.width} / ${size.height}`, width: `min(100%, calc(62vh * ${size.width / size.height}))` }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          id={canvasId}
          width="100%"
          height="100%"
          strokeWidth={5}
          strokeColor={color}
          backgroundImage={value}
          exportWithBackgroundImage
          preserveBackgroundImageAspectRatio="none"
          allowOnlyPointerType="all"
          onChange={paths => setHasStrokes(paths.length > 0)}
          style={{ border: '0', borderRadius: '0', cursor: 'crosshair' }}
        />
      </div> : <div className="annotation-loading" role="status">Preparing annotation canvas…</div>}
    </div>
    <div className="annotation-actions">
      <button type="button" className="text-button" onClick={onCancel} disabled={saving}>Cancel</button>
      <button type="button" className="primary-button" onClick={() => void save()} disabled={!hasStrokes || saving || !size}>
        <Check size={16} /> {saving ? 'Saving…' : 'Save annotation'}
      </button>
    </div>
  </div>
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The annotated image could not be rendered.'))
    image.src = source
  })
}
