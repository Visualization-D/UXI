import { useEffect, useId, useRef, useState } from 'react'
import type { DragEvent, KeyboardEvent } from 'react'
import { ImagePlus, PenLine, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { processImage } from '../lib/images'
import { ImageAnnotator } from './ImageAnnotator'

let activeImageField: string | null = null

export function ImageField({ value, onChange, label, compact = false }: { value: string; onChange: (value: string) => void; label: string; compact?: boolean }) {
  const fieldId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const zoneRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [annotating, setAnnotating] = useState(false)

  async function accept(file?: File) {
    if (!file) return
    setBusy(true)
    try {
      onChange(await processImage(file))
      toast.success('Screenshot added and queued for auto-save.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The image could not be added.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function selectField() {
    activeImageField = fieldId
  }

  useEffect(() => {
    const paste = (event: globalThis.ClipboardEvent) => {
      if (activeImageField !== fieldId || value || busy) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, [contenteditable="true"]')) return
      const file = Array.from(event.clipboardData?.items || []).find(item => item.type.startsWith('image/'))?.getAsFile()
      if (!file) {
        toast.message('No image found on the clipboard. Copy a screenshot first.')
        return
      }
      event.preventDefault()
      void accept(file)
    }
    window.addEventListener('paste', paste)
    return () => window.removeEventListener('paste', paste)
  }, [fieldId, value, busy, onChange])

  useEffect(() => () => {
    if (activeImageField === fieldId) activeImageField = null
  }, [fieldId])

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    selectField()
    setDragging(false)
    void accept(event.dataTransfer.files[0])
  }

  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  if (value) {
    return <div className={`image-preview ${compact ? 'compact' : ''} ${annotating ? 'annotating' : ''}`}>
      {annotating ? <ImageAnnotator
        value={value}
        label={label}
        onCancel={() => setAnnotating(false)}
        onSave={annotated => {
          onChange(annotated)
          setAnnotating(false)
          toast.success('Annotation saved and queued for auto-save.')
        }}
      /> : <>
        <img src={value} alt={label} />
        <div className="image-actions">
          <button type="button" className="text-button" onClick={() => setAnnotating(true)}><PenLine size={15} /> Annotate</button>
          <button type="button" className="text-button" onClick={() => inputRef.current?.click()}><RefreshCw size={15} /> Replace</button>
          <button type="button" className="text-button danger" onClick={() => onChange('')}><Trash2 size={15} /> Remove</button>
        </div>
      </>}
      <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" onChange={event => void accept(event.target.files?.[0])} />
    </div>
  }

  return <div
    ref={zoneRef}
    className={`paste-zone ${dragging ? 'dragging' : ''} ${compact ? 'compact' : ''}`}
    role="group"
    tabIndex={0}
    aria-label={`${label}. Drag and drop an image, browse to add, or paste with Ctrl or Cmd+V.`}
    aria-busy={busy}
    onFocus={selectField}
    onPointerDown={selectField}
    onKeyDown={keyboard}
    onClick={() => { selectField(); zoneRef.current?.focus() }}
    onDragOver={event => { event.preventDefault(); selectField(); setDragging(true) }}
    onDragLeave={() => setDragging(false)}
    onDrop={drop}
  >
    <ImagePlus size={24} strokeWidth={1.6} />
    <strong>{busy ? 'Processing screenshot…' : label}</strong>
    <span>Drag &amp; drop an image, browse to add, or press Ctrl/Cmd+V</span>
    <button type="button" className="text-button browse-image-button" onClick={event => { event.stopPropagation(); selectField(); inputRef.current?.click() }}>Browse to add</button>
    <small>Select this field first. Windows: <b>Win+Shift+S</b>; Mac: <b>Control+Cmd+Shift+4</b> copies a region to the clipboard. Return here and press <b>Ctrl+V</b> or <b>Cmd+V</b>. After adding an image, choose <b>Annotate</b> to draw on it.</small>
    <input ref={inputRef} className="visually-hidden" type="file" accept="image/*" onChange={event => void accept(event.target.files?.[0])} />
  </div>
}
