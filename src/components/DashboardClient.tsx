'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Copy, Check, Pencil, X as XIcon, Loader2, GripVertical } from 'lucide-react'
import ProfilePage from './ProfilePage'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type LinkItem = {
  id: number
  title: string
  url: string
  icon: string
  thumbnail_url: string | null
  card_size: 'full' | 'half'
  show_in_header: number
  position: number
  enabled: number
  click_count: number
}

type User = {
  id: number
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  theme: 'classic' | 'neon' | 'soft'
  link_style: 'default' | 'overlay'
  layout: 'list' | 'grid'
  show_blurred_bg: number
  show_bio: number
  bg_mode: 'blur' | 'color' | 'ai'
  bg_value: string | null
  bg_prompt: string | null
}

const BG_PRESETS = [
  { label: 'Black', value: '#000000' },
  { label: 'Dark Navy', value: '#0a0a1a' },
  { label: 'Deep Purple', value: '#1a0533' },
  { label: 'Charcoal', value: '#1a1a1a' },
  { label: 'Midnight Blue', value: '#0d1b2a' },
  { label: 'Dark Teal', value: '#0a1f1f' },
  { label: 'Wine', value: '#2a0a1a' },
  { label: 'Soft Pink', value: '#FFF5FA' },
]

const sidebarBg = 'rgba(15, 10, 26, 0.98)'
const inputBg = 'rgba(255,255,255,0.06)'
const inputBorder = 'rgba(255,255,255,0.1)'
const accent = '#6366F1'

function StudioInput({ label, value, onChange, placeholder, type = 'text', rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number
}) {
  const style: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${inputBorder}`,
    background: inputBg, color: '#fff', fontSize: 13, outline: 'none', resize: 'none' as const,
    fontFamily: 'inherit',
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{label}</label>
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={style} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />
      )}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 13, color: '#D1D5DB' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: value ? accent : 'rgba(255,255,255,0.15)', transition: 'background 0.15s',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: 8, background: '#fff',
          transition: 'left 0.15s',
        }} />
      </button>
    </div>
  )
}

function PreviewArea({ settingsForm, user, links }: {
  settingsForm: {
    display_name: string; bio: string; avatar_url: string; theme: 'classic' | 'neon' | 'soft'
    link_style: 'default' | 'overlay'; layout: 'list' | 'grid'; show_blurred_bg: number; show_bio: number
    bg_mode: 'blur' | 'color' | 'ai'; bg_value: string; bg_prompt: string
  }
  user: User
  links: LinkItem[]
}) {
  const isSoft = settingsForm.theme === 'soft'

  // Parse AI background for the preview area
  let previewBg = '#0A0612'
  let previewStyle: React.CSSProperties = {}
  let keyframesCss = ''

  if (settingsForm.bg_mode === 'color' && settingsForm.bg_value) {
    previewBg = settingsForm.bg_value
  } else if (settingsForm.bg_mode === 'ai' && settingsForm.bg_value) {
    try {
      const parsed = JSON.parse(settingsForm.bg_value)
      if (parsed.type === 'image' && parsed.url) {
        // Image mode — show the generated image as background
        previewStyle = {
          backgroundImage: `url(${parsed.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }
        previewBg = '#000'
      } else {
        // CSS/pattern mode
        const copy = { ...parsed }
        if (copy['@keyframes']) {
          keyframesCss = `@keyframes ${copy['@keyframes']}`
          delete copy['@keyframes']
        }
        for (const [key, val] of Object.entries(copy)) {
          ;(previewStyle as Record<string, unknown>)[key] = val
        }
        previewBg = ''
      }
    } catch { /* fallback */ }
  } else if (settingsForm.bg_mode === 'blur') {
    previewBg = isSoft ? '#FFF5FA' : '#111'
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      padding: 24, overflow: 'auto', position: 'relative',
      background: previewBg || undefined,
      ...previewStyle,
    }}>
      {keyframesCss && <style>{keyframesCss}</style>}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12, textAlign: 'center' as const, position: 'relative', zIndex: 2 }}>
        Live Preview — glimr.io/{user.username}
      </div>
      <div style={{
        width: '100%', maxWidth: 430, borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 0 60px rgba(99, 102, 241, 0.08)',
        overflow: 'hidden',
        position: 'relative', zIndex: 2,
        clipPath: 'inset(0 round 16px)',
      }}>
        <ProfilePage
          user={{
            ...user,
            display_name: settingsForm.display_name || null,
            bio: settingsForm.bio || null,
            avatar_url: settingsForm.avatar_url || null,
            theme: settingsForm.theme,
            link_style: settingsForm.link_style,
            layout: settingsForm.layout,
            show_blurred_bg: settingsForm.show_blurred_bg,
            show_bio: settingsForm.show_bio,
            bg_mode: settingsForm.bg_mode,
            bg_value: settingsForm.bg_value || null,
            bg_prompt: settingsForm.bg_prompt || null,
          }}
          links={links}
        />
      </div>
    </div>
  )
}

function SortableLinkItem({ link, editingId, editForm, setEditForm, saveEdit, setEditingId, startEdit, toggleLink, deleteLink, confirmDeleteId }: {
  link: LinkItem
  editingId: number | null
  editForm: { title: string; url: string; icon: string; thumbnail_url: string; card_size: 'full' | 'half'; show_in_header: number }
  setEditForm: React.Dispatch<React.SetStateAction<typeof editForm>>
  saveEdit: () => void
  setEditingId: (id: number | null) => void
  startEdit: (link: LinkItem) => void
  toggleLink: (id: number, enabled: number) => void
  deleteLink: (id: number) => void
  confirmDeleteId: number | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : link.enabled ? 1 : 0.5,
    padding: '8px 10px', borderRadius: 8, background: isDragging ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
    border: isDragging ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div ref={setNodeRef} style={style}>
      {editingId === link.id ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="text" value={editForm.icon} onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))}
              style={{ width: 36, padding: '4px', borderRadius: 4, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', textAlign: 'center' as const, fontSize: 14, outline: 'none' }} />
            <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
              style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 12, outline: 'none' }} />
          </div>
          <input type="text" value={editForm.url} onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))}
            style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 12, outline: 'none' }} />
          <input type="text" value={editForm.thumbnail_url} onChange={e => setEditForm(p => ({ ...p, thumbnail_url: e.target.value }))}
            placeholder="Thumbnail URL" style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 11, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select value={editForm.card_size} onChange={e => setEditForm(p => ({ ...p, card_size: e.target.value as 'full' | 'half' }))}
              style={{ flex: 1, padding: '4px 6px', borderRadius: 4, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 11, outline: 'none' }}>
              <option value="full">Full width</option>
              <option value="half">Half width</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9CA3AF', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
              <input type="checkbox" checked={editForm.show_in_header === 1}
                onChange={e => setEditForm(p => ({ ...p, show_in_header: e.target.checked ? 1 : 0 }))}
                style={{ accentColor: accent }} />
              Header icon
            </label>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={saveEdit} style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: 'none', background: accent, color: '#fff', fontSize: 12, cursor: 'pointer' }}>Save</button>
            <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: `1px solid ${inputBorder}`, background: 'none', color: '#9CA3AF', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#4B5563', display: 'flex', alignItems: 'center', touchAction: 'none' }}>
            <GripVertical size={14} />
          </div>
          <span style={{ fontSize: 16 }}>{link.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: 13, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{link.title}</p>
            <p style={{ color: '#6B7280', fontSize: 11, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{link.url}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button onClick={() => startEdit(link)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 2 }}><Pencil size={13} /></button>
            <button onClick={() => toggleLink(link.id, link.enabled)} style={{
              width: 28, height: 16, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: link.enabled ? accent : 'rgba(255,255,255,0.15)', position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: link.enabled ? 14 : 2,
                width: 12, height: 12, borderRadius: 6, background: '#fff', transition: 'left 0.15s',
              }} />
            </button>
            <button onClick={() => deleteLink(link.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              color: confirmDeleteId === link.id ? '#EF4444' : '#6B7280',
            }}>
              {confirmDeleteId === link.id ? <span style={{ fontSize: 10, color: '#EF4444' }}>Del?</span> : <XIcon size={13} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardClient({ user: initialUser }: { user: User }) {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [user, setUser] = useState<User>(initialUser)

  // Add link form
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newIcon, setNewIcon] = useState('🔗')
  const [newThumbnail, setNewThumbnail] = useState('')
  const [addingLink, setAddingLink] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    display_name: initialUser.display_name ?? '',
    bio: initialUser.bio ?? '',
    avatar_url: initialUser.avatar_url ?? '',
    theme: initialUser.theme,
    link_style: initialUser.link_style ?? 'overlay' as const,
    layout: initialUser.layout ?? 'list' as const,
    show_blurred_bg: initialUser.show_blurred_bg ?? 1,
    show_bio: initialUser.show_bio ?? 1,
    bg_mode: initialUser.bg_mode ?? 'blur' as 'blur' | 'color' | 'ai',
    bg_value: initialUser.bg_value ?? '',
    bg_prompt: initialUser.bg_prompt ?? '',
  })
  const [linkCopied, setLinkCopied] = useState(false)
  const [generatingBg, setGeneratingBg] = useState(false)
  const [bgPromptInput, setBgPromptInput] = useState(initialUser.bg_prompt ?? '')
  const [aiSubMode, setAiSubMode] = useState<'patterns' | 'image'>(() => {
    // Detect current sub-mode from existing bg_value
    if (initialUser.bg_value) {
      try { const p = JSON.parse(initialUser.bg_value); if (p.type === 'image') return 'image' } catch {}
    }
    return 'patterns'
  })

  // Inline editing
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ title: '', url: '', icon: '', thumbnail_url: '', card_size: 'full' as 'full' | 'half', show_in_header: 0 })
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const refreshPreview = useCallback(() => {
    // No-op: preview updates automatically from local state
  }, [])

  const fetchLinks = useCallback(async () => {
    const res = await fetch('/api/links')
    if (res.ok) setLinks(await res.json())
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  // Track unsaved changes
  const updateSettings = useCallback((updater: (prev: typeof settingsForm) => typeof settingsForm) => {
    setSettingsForm(prev => {
      const next = updater(prev)
      setHasUnsavedChanges(true)
      return next
    })
  }, [])

  // Save settings explicitly
  const saveSettings = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })
      if (res.ok) {
        const updated = await res.json()
        setUser(prev => ({ ...prev, ...updated }))
        setHasUnsavedChanges(false)
        refreshPreview()
      }
    } finally {
      setSaving(false)
    }
  }, [settingsForm, refreshPreview])

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) return
    setAddingLink(true)
    try {
      let url = newUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), url, icon: newIcon, thumbnail_url: newThumbnail.trim() || null }),
      })
      if (res.ok) {
        setNewTitle(''); setNewUrl(''); setNewIcon('🔗'); setNewThumbnail(''); setShowAddForm(false)
        await fetchLinks()
        refreshPreview()
      }
    } finally { setAddingLink(false) }
  }

  const deleteLink = async (id: number) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); setTimeout(() => setConfirmDeleteId(null), 3000); return }
    await fetch(`/api/links?id=${id}`, { method: 'DELETE' })
    setConfirmDeleteId(null)
    await fetchLinks()
    refreshPreview()
  }

  const toggleLink = async (id: number, enabled: number) => {
    await fetch(`/api/links?id=${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: enabled === 1 ? 0 : 1 }) })
    await fetchLinks()
    refreshPreview()
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = links.findIndex(l => l.id === active.id)
    const newIndex = links.findIndex(l => l.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    // Optimistic reorder
    const reordered = arrayMove(links, oldIndex, newIndex)
    setLinks(reordered)
    // Persist new positions
    await Promise.all(
      reordered.map((link, i) =>
        fetch(`/api/links?id=${link.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ position: i }) })
      )
    )
    await fetchLinks()
    refreshPreview()
  }

  const startEdit = (link: LinkItem) => {
    setEditingId(link.id)
    setEditForm({ title: link.title, url: link.url, icon: link.icon, thumbnail_url: link.thumbnail_url ?? '', card_size: link.card_size ?? 'full', show_in_header: link.show_in_header ?? 0 })
  }

  const saveEdit = async () => {
    if (!editingId) return
    await fetch(`/api/links?id=${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    setEditingId(null)
    await fetchLinks()
    refreshPreview()
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://glimr.io/${user.username}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0A1A', fontFamily: "'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(15, 10, 26, 0.98)', backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>G</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Studio</span>
          {hasUnsavedChanges && (
            <button onClick={saveSettings} disabled={saving} style={{
              marginLeft: 12, padding: '5px 16px', borderRadius: 6, border: 'none',
              background: saving ? '#4B5563' : accent, color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: saving ? 'default' : 'pointer', transition: 'background 0.15s',
            }}>
              {saving ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : 'Save Changes'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href={`/${user.username}`} target="_blank" style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }}>
            View Page ↗
          </Link>
          <button onClick={copyLink} style={{ color: '#9CA3AF', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {linkCopied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Link</>}
          </button>
          <Link href="/dashboard/analytics" style={{ color: '#9CA3AF', fontSize: 13, textDecoration: 'none' }}>Analytics</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ color: '#6B7280', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      {/* Main: 3 columns */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR — Links */}
        <div style={{
          width: 280, minWidth: 280, background: sidebarBg, borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>Links</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} style={{
              background: accent, color: '#fff', border: 'none', borderRadius: 6,
              padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}>
              {showAddForm ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={addLink} style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="text" value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="🔗"
                  style={{ width: 40, padding: '6px 4px', borderRadius: 6, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', textAlign: 'center' as const, fontSize: 16, outline: 'none' }} />
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title"
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 13, outline: 'none' }} required />
              </div>
              <input type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..."
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' as const }} required />
              <input type="text" value={newThumbnail} onChange={e => setNewThumbnail(e.target.value)} placeholder="Thumbnail URL (optional)"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 12, outline: 'none', marginBottom: 8, boxSizing: 'border-box' as const }} />
              <button type="submit" disabled={addingLink} style={{
                width: '100%', padding: '7px 0', borderRadius: 6, border: 'none', background: accent,
                color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: addingLink ? 0.5 : 1,
              }}>
                {addingLink ? 'Adding…' : 'Add Link'}
              </button>
            </form>
          )}

          {links.length === 0 ? (
            <div style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No links yet</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {links.map((link) => (
                    <SortableLinkItem
                      key={link.id}
                      link={link}
                      editingId={editingId}
                      editForm={editForm}
                      setEditForm={setEditForm}
                      saveEdit={saveEdit}
                      setEditingId={setEditingId}
                      startEdit={startEdit}
                      toggleLink={toggleLink}
                      deleteLink={deleteLink}
                      confirmDeleteId={confirmDeleteId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* CENTER — Live Preview (inline, no iframe) */}
        <PreviewArea settingsForm={settingsForm} user={user} links={links} />

        {/* RIGHT SIDEBAR — Settings */}
        <div style={{
          width: 280, minWidth: 280, background: sidebarBg, borderLeft: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto', padding: '20px 16px',
        }}>
          <h2 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>Settings</h2>

          {/* Profile */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Profile</div>
            <StudioInput label="Display Name" value={settingsForm.display_name} onChange={v => updateSettings(p => ({ ...p, display_name: v }))} placeholder="Your Name" />
            <StudioInput label="Bio" value={settingsForm.bio} onChange={v => updateSettings(p => ({ ...p, bio: v }))} placeholder="About you…" rows={3} />
            <StudioInput label="Avatar URL" value={settingsForm.avatar_url} onChange={v => updateSettings(p => ({ ...p, avatar_url: v }))} placeholder="https://..." />
          </div>

          {/* Theme */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Theme</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['classic', 'neon', 'soft'] as const).map(t => (
                <button key={t} onClick={() => updateSettings(p => ({ ...p, theme: t }))} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, border: settingsForm.theme === t ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.08)',
                  background: settingsForm.theme === t ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  color: settingsForm.theme === t ? '#fff' : '#9CA3AF', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  textTransform: 'capitalize' as const,
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Layout options */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Layout</div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Card Style</label>
              <select value={settingsForm.link_style} onChange={e => updateSettings(p => ({ ...p, link_style: e.target.value as 'default' | 'overlay' }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${inputBorder}`, background: inputBg, color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
                <option value="overlay">Overlay</option>
                <option value="default">Default</option>
              </select>
            </div>

            <Toggle label="Show Bio" value={!!settingsForm.show_bio} onChange={v => updateSettings(p => ({ ...p, show_bio: v ? 1 : 0 }))} />
          </div>

          {/* Background */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Background</div>
            
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {([['blur', '🖼 Blur'], ['color', '🎨 Color'], ['ai', '✨ AI']] as const).map(([mode, label]) => (
                <button key={mode} onClick={() => updateSettings(p => ({ ...p, bg_mode: mode, ...(mode === 'blur' ? { show_blurred_bg: 1 } : {}) }))}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8,
                    border: settingsForm.bg_mode === mode ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.08)',
                    background: settingsForm.bg_mode === mode ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                    color: settingsForm.bg_mode === mode ? '#fff' : '#9CA3AF',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Blur mode */}
            {settingsForm.bg_mode === 'blur' && (
              <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>
                Uses your hero photo as a blurred background.
              </p>
            )}

            {/* Color mode */}
            {settingsForm.bg_mode === 'color' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {BG_PRESETS.map(p => (
                  <button key={p.value} onClick={() => updateSettings(prev => ({ ...prev, bg_value: p.value, show_blurred_bg: 0 }))}
                    title={p.label}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: 8, cursor: 'pointer',
                      background: p.value,
                      border: settingsForm.bg_value === p.value ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* AI mode */}
            {settingsForm.bg_mode === 'ai' && (
              <div>
                {/* Sub-mode tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {([['patterns', '✨ Patterns'], ['image', '🎨 Image']] as const).map(([mode, label]) => (
                    <button key={mode} onClick={() => setAiSubMode(mode)}
                      style={{
                        flex: 1, padding: '6px 4px', borderRadius: 6,
                        border: aiSubMode === mode ? `1.5px solid ${accent}` : '1.5px solid rgba(255,255,255,0.08)',
                        background: aiSubMode === mode ? 'rgba(99,102,241,0.12)' : 'transparent',
                        color: aiSubMode === mode ? '#fff' : '#6B7280',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={bgPromptInput}
                  onChange={e => setBgPromptInput(e.target.value)}
                  placeholder={aiSubMode === 'image'
                    ? "Describe your background image... e.g. 'angel on the left, devil on the right, dark moody atmosphere'"
                    : "Describe your background... e.g. 'dark aurora borealis with purple and teal'"
                  }
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: `1px solid ${inputBorder}`, background: inputBg,
                    color: '#fff', fontSize: 13, fontFamily: 'inherit',
                    outline: 'none', resize: 'vertical',
                  }}
                />
                {aiSubMode === 'image' && (
                  <p style={{ fontSize: 10, color: '#6B7280', margin: '4px 0 0', lineHeight: 1.4 }}>
                    Generates a landscape image via AI. Takes ~15-30s.
                  </p>
                )}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    disabled={generatingBg || !bgPromptInput.trim()}
                    onClick={async () => {
                      setGeneratingBg(true)
                      try {
                        const endpoint = aiSubMode === 'image' ? '/api/user/generate-bg-image' : '/api/user/generate-bg'
                        const res = await fetch(endpoint, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: bgPromptInput.trim() }),
                        })
                        if (res.ok) {
                          const data = await res.json()
                          updateSettings(p => ({
                            ...p,
                            bg_mode: 'ai' as const,
                            bg_value: data.bg_value,
                            bg_prompt: data.bg_prompt,
                            show_blurred_bg: 0,
                          }))
                        }
                      } finally {
                        setGeneratingBg(false)
                      }
                    }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8,
                      border: 'none', cursor: generatingBg ? 'wait' : 'pointer',
                      background: generatingBg ? 'rgba(99,102,241,0.3)' : accent,
                      color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    }}>
                    {generatingBg ? (aiSubMode === 'image' ? '🎨 Generating image…' : '✨ Generating…')
                      : (aiSubMode === 'image' ? '🎨 Generate Image' : '✨ Generate Patterns')}
                  </button>
                  <button
                    disabled={generatingBg}
                    onClick={async () => {
                      const RANDOM_PROMPTS = aiSubMode === 'image' ? [
                        'ethereal angel wings on the left, dark demon silhouette on the right, moody atmosphere',
                        'cosmic galaxy with planets and nebula, deep space vibes',
                        'dark enchanted forest with glowing mushrooms and mystical fog',
                        'underwater scene with bioluminescent creatures in deep ocean',
                        'gothic cathedral architecture fading into darkness',
                        'neon cyberpunk cityscape at night with rain and reflections',
                        'dark fantasy throne room with candles and mysterious shadows',
                        'abstract smoke and fire swirling in darkness',
                        'japanese cherry blossom garden at night with lanterns',
                        'aurora borealis over snowy mountains, cinematic and dramatic',
                      ] : [
                        'dark cosmic nebula with deep purple and blue swirls',
                        'neon pink and cyan retro synthwave grid with glow',
                        'midnight ocean waves with moonlight reflections',
                        'dark forest with floating fireflies and green mist',
                        'abstract liquid metal in silver and purple',
                        'starfield with shooting stars and aurora borealis',
                        'dark cherry blossom rain with soft pink petals',
                        'geometric sacred geometry patterns in gold on black',
                        'underwater bioluminescent jellyfish in deep blue',
                        'volcanic lava cracks glowing orange on dark rock',
                        'holographic rainbow shimmer on dark background',
                        'dark rose garden with dew drops and moonlight',
                        'cyberpunk city rain with neon purple reflections',
                        'scattered diamonds and sparkles on velvet black',
                        'northern lights dancing over a frozen dark landscape',
                        'dark tropical jungle with neon flowers',
                        'ethereal angel wings with soft white feathers on black',
                        'constellation map with glowing stars connected by thin lines',
                        'dark marble texture with gold veins',
                        'floating hearts and butterflies in soft pink and purple',
                      ]
                      const prompt = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]
                      setBgPromptInput(prompt)
                      setGeneratingBg(true)
                      try {
                        const endpoint = aiSubMode === 'image' ? '/api/user/generate-bg-image' : '/api/user/generate-bg'
                        const res = await fetch(endpoint, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt }),
                        })
                        if (res.ok) {
                          const data = await res.json()
                          updateSettings(p => ({
                            ...p,
                            bg_mode: 'ai' as const,
                            bg_value: data.bg_value,
                            bg_prompt: data.bg_prompt,
                            show_blurred_bg: 0,
                          }))
                        }
                      } finally {
                        setGeneratingBg(false)
                      }
                    }}
                    style={{
                      padding: '10px 14px', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.12)', cursor: generatingBg ? 'wait' : 'pointer',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    }}>
                    🎲
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
