'use client'

import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

type LinkItem = {
  id: number
  title: string
  url: string
  icon: string
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
}

type Tab = 'links' | 'settings' | 'analytics'

const THEMES = [
  {
    id: 'classic' as const,
    name: 'Classic',
    desc: 'Dark & minimal',
    bg: '#0F0A1A',
    accent: '#8B5CF6',
    preview: (
      <div className="rounded-lg p-3 h-20" style={{ background: '#0F0A1A', border: '1px solid #2d1d4e' }}>
        <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ background: '#8B5CF6' }} />
        <div className="w-16 h-2 rounded mx-auto mb-1" style={{ background: '#1A1030' }} />
        <div className="w-12 h-2 rounded mx-auto" style={{ background: '#1A1030' }} />
      </div>
    ),
  },
  {
    id: 'neon' as const,
    name: 'Neon',
    desc: 'Vibrant & glowing',
    bg: '#000000',
    accent: '#EC4899',
    preview: (
      <div className="rounded-lg p-3 h-20" style={{ background: '#000', border: '1px solid #8B5CF6' }}>
        <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 0 8px #8B5CF6' }} />
        <div className="w-16 h-2 rounded mx-auto mb-1" style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
        <div className="w-12 h-2 rounded mx-auto" style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', opacity: 0.7 }} />
      </div>
    ),
  },
  {
    id: 'soft' as const,
    name: 'Soft',
    desc: 'Pastel & light',
    bg: '#FDF4FF',
    accent: '#EC4899',
    preview: (
      <div className="rounded-lg p-3 h-20" style={{ background: '#FDF4FF', border: '1px solid #f0d0ff' }}>
        <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ background: '#EC4899', opacity: 0.7 }} />
        <div className="w-16 h-2 rounded mx-auto mb-1" style={{ background: '#fff', border: '1px solid #f0d0ff' }} />
        <div className="w-12 h-2 rounded mx-auto" style={{ background: '#fff', border: '1px solid #f0d0ff' }} />
      </div>
    ),
  },
]

export default function DashboardClient({ user: initialUser }: { user: User }) {
  const [tab, setTab] = useState<Tab>('links')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [user, setUser] = useState<User>(initialUser)

  // Add link form
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newIcon, setNewIcon] = useState('🔗')
  const [addingLink, setAddingLink] = useState(false)

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    display_name: initialUser.display_name ?? '',
    bio: initialUser.bio ?? '',
    avatar_url: initialUser.avatar_url ?? '',
    theme: initialUser.theme,
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const fetchLinks = useCallback(async () => {
    const res = await fetch('/api/links')
    if (res.ok) {
      const data = await res.json()
      setLinks(data)
    }
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newUrl.trim()) return
    setAddingLink(true)
    try {
      let url = newUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), url, icon: newIcon }),
      })
      if (res.ok) {
        setNewTitle('')
        setNewUrl('')
        setNewIcon('🔗')
        await fetchLinks()
      }
    } finally {
      setAddingLink(false)
    }
  }

  const deleteLink = async (id: number) => {
    await fetch(`/api/links?id=${id}`, { method: 'DELETE' })
    await fetchLinks()
  }

  const toggleLink = async (id: number, enabled: number) => {
    await fetch(`/api/links?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: enabled === 1 ? 0 : 1 }),
    })
    await fetchLinks()
  }

  const moveLink = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= links.length) return

    const a = links[index]
    const b = links[swapIndex]

    await Promise.all([
      fetch(`/api/links?id=${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: b.position }),
      }),
      fetch(`/api/links?id=${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: a.position }),
      }),
    ])
    await fetchLinks()
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      })
      if (res.ok) {
        const updated = await res.json()
        setUser({ ...user, ...updated })
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 2000)
      }
    } finally {
      setSavingSettings(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://glimr.io/${user.username}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const inputStyle = {
    background: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  }

  return (
    <div className="min-h-screen" style={{ background: '#0F0A1A' }}>
      {/* Top Nav */}
      <nav className="border-b border-purple-900/30 px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(15, 10, 26, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            ✨
          </div>
          <span className="text-white font-bold text-lg">Glimr</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="text-sm text-purple-300 hover:text-white transition-colors flex items-center gap-1"
          >
            My Page <span>↗</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-purple-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {user.display_name ? `Hey, ${user.display_name}! 👋` : 'Dashboard'}
          </h1>
          <p className="text-purple-400 text-sm mt-1">
            glimr.io/<span className="text-purple-300">{user.username}</span>
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-8 rounded-xl p-1" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
          {([['links', '🔗 Links'], ['analytics', '📊 Analytics'], ['settings', '⚙️ Settings']] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white' }
                : { color: '#a78bfa' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* LINKS TAB */}
        {tab === 'links' && (
          <div className="space-y-6">
            {/* Add Link Form */}
            <div className="rounded-2xl border border-purple-900/50 p-6"
              style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
              <h2 className="text-white font-semibold mb-4">Add New Link</h2>
              <form onSubmit={addLink} className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newIcon}
                    onChange={e => setNewIcon(e.target.value)}
                    placeholder="🔗"
                    className="w-16 px-3 py-3 rounded-xl border text-white text-center text-xl outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Link title"
                    className="flex-1 px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none"
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none"
                    style={inputStyle}
                    required
                  />
                  <button
                    type="submit"
                    disabled={addingLink}
                    className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                  >
                    {addingLink ? '…' : '+ Add'}
                  </button>
                </div>
              </form>
            </div>

            {/* Links List */}
            {links.length === 0 ? (
              <div className="text-center text-purple-400 py-12">
                <div className="text-4xl mb-3">🔗</div>
                <p>No links yet. Add your first link above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {links.map((link, i) => (
                  <div
                    key={link.id}
                    className="rounded-xl border p-4 flex items-center gap-3 transition-all"
                    style={{
                      background: link.enabled ? 'rgba(26, 16, 48, 0.8)' : 'rgba(15, 10, 26, 0.5)',
                      borderColor: link.enabled ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)',
                      opacity: link.enabled ? 1 : 0.6,
                    }}
                  >
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveLink(i, 'up')}
                        disabled={i === 0}
                        className="text-purple-400 hover:text-white disabled:opacity-20 text-xs leading-none"
                      >▲</button>
                      <button
                        onClick={() => moveLink(i, 'down')}
                        disabled={i === links.length - 1}
                        className="text-purple-400 hover:text-white disabled:opacity-20 text-xs leading-none"
                      >▼</button>
                    </div>

                    {/* Icon + content */}
                    <span className="text-2xl">{link.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{link.title}</p>
                      <p className="text-purple-400 text-xs truncate">{link.url}</p>
                    </div>

                    {/* Click count */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                      <span>👆</span>
                      <span>{link.click_count}</span>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => toggleLink(link.id, link.enabled)}
                      className="w-10 h-6 rounded-full transition-all flex items-center px-1"
                      style={{
                        background: link.enabled
                          ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                          : 'rgba(139, 92, 246, 0.2)',
                      }}
                    >
                      <span className="w-4 h-4 rounded-full bg-white transition-transform"
                        style={{ transform: link.enabled ? 'translateX(16px)' : 'translateX(0)' }} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="text-purple-500 hover:text-pink-400 transition-colors text-lg"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="rounded-2xl border border-purple-900/50 p-8 text-center"
            style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-white font-bold text-xl mb-2">Full Analytics Dashboard</h2>
            <p className="text-purple-300 mb-6">Views, clicks, referrers, 30-day charts — all free.</p>
            <Link
              href="/dashboard/analytics"
              className="inline-block px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
            >
              Open Analytics →
            </Link>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="rounded-2xl border border-purple-900/50 p-6"
              style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
              <h2 className="text-white font-semibold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={settingsForm.display_name}
                    onChange={e => setSettingsForm(p => ({ ...p, display_name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none"
                    style={inputStyle}
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Bio</label>
                  <textarea
                    value={settingsForm.bio}
                    onChange={e => setSettingsForm(p => ({ ...p, bio: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none resize-none"
                    style={inputStyle}
                    placeholder="Tell your fans about yourself..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Avatar URL</label>
                  <input
                    type="url"
                    value={settingsForm.avatar_url}
                    onChange={e => setSettingsForm(p => ({ ...p, avatar_url: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none"
                    style={inputStyle}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Theme Picker */}
            <div className="rounded-2xl border border-purple-900/50 p-6"
              style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
              <h2 className="text-white font-semibold mb-4">Theme</h2>
              <div className="grid grid-cols-3 gap-4">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSettingsForm(p => ({ ...p, theme: theme.id }))}
                    className="rounded-xl p-3 text-left transition-all border-2"
                    style={{
                      borderColor: settingsForm.theme === theme.id ? '#8B5CF6' : 'transparent',
                      background: settingsForm.theme === theme.id
                        ? 'rgba(139, 92, 246, 0.15)'
                        : 'rgba(139, 92, 246, 0.05)',
                    }}
                  >
                    {theme.preview}
                    <p className="text-white text-sm font-medium mt-2">{theme.name}</p>
                    <p className="text-purple-400 text-xs">{theme.desc}</p>
                    {settingsForm.theme === theme.id && (
                      <span className="text-xs text-purple-300 mt-1 inline-block">✓ Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="flex-1 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
              >
                {savingSettings ? 'Saving…' : settingsSaved ? '✓ Saved!' : 'Save Changes'}
              </button>
              <button
                onClick={copyLink}
                className="px-6 py-3 rounded-xl text-purple-300 border border-purple-500/50 hover:border-purple-400 hover:text-white transition-all font-medium"
              >
                {linkCopied ? '✓ Copied!' : '🔗 Copy Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
