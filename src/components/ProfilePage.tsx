'use client'

import { getPlatformIcon } from '@/lib/platform-icons'

type User = {
  id: number
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  theme: 'classic' | 'neon' | 'soft'
}

type Link = {
  id: number
  title: string
  url: string
  icon: string
  position: number
  enabled: number
  click_count: number
}

type Props = {
  user: User
  links: Link[]
}

/* ── Helpers ── */

const SOCIAL_BACKGROUNDS: Record<string, string> = {
  instagram: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
  tiktok: '#000',
  x: '#000',
  youtube: '#FF0000',
  telegram: '#26A5E4',
  spotify: '#1DB954',
  twitch: '#9146FF',
  snapchat: '#FFFC00',
  onlyfans: '#00AFF0',
  fansly: '#1FA7F2',
  patreon: '#FF424D',
  threads: '#000',
}

function extractSocialIcons(links: Link[]) {
  const seen = new Set<string>()
  const icons: { platform: string; color: string; svg: string; url: string }[] = []
  for (const link of links) {
    const info = getPlatformIcon(link.url, link.icon)
    if (info.type === 'platform' && info.platform && !seen.has(info.platform)) {
      seen.add(info.platform)
      icons.push({ platform: info.platform, color: info.color!, svg: info.svg!, url: link.url })
    }
  }
  return icons
}

function needsBorder(platform: string) {
  return ['tiktok', 'x', 'threads'].includes(platform)
}

/* ── Dark Glass (Classic) ── */

function DarkGlassProfile({ user, links }: Props) {
  const socials = extractSocialIcons(links)
  const avatarUrl = user.avatar_url || ''
  const displayName = user.display_name ?? user.username

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes pulse-badge { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
      `}</style>

      {/* Blurred background */}
      {avatarUrl && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${avatarUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center top',
            filter: 'blur(60px) brightness(0.4) saturate(1.3)',
            transform: 'scale(1.2)', zIndex: 0,
          }} />
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)',
            zIndex: 1,
          }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Hero */}
        <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: 520, objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 520, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 800, color: '#fff' }}>
              {displayName[0].toUpperCase()}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(transparent, rgba(0,0,0,0.95))' }} />

          {/* Profile info overlay */}
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {displayName}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', borderRadius: '50%', fontSize: 12, color: '#fff' }}>✓</span>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 400 }}>@{user.username}</div>

            {/* Social icons */}
            {socials.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
                {socials.map(s => (
                  <a key={s.platform} href={`/api/analytics/click?linkId=0&url=${encodeURIComponent(s.url)}`}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: SOCIAL_BACKGROUNDS[s.platform] || s.color,
                      border: needsBorder(s.platform) ? '1px solid rgba(255,255,255,0.15)' : 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', textDecoration: 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <span style={{ width: 18, height: 18, color: '#fff' }} dangerouslySetInnerHTML={{ __html: s.svg }} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ width: '100%', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user.bio && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.5, marginBottom: 8 }}>{user.bio}</p>
          )}

          {links.map((link, i) => {
            const icon = getPlatformIcon(link.url, link.icon)
            const isPrimary = i === 0
            return (
              <a key={link.id}
                href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
                style={{
                  position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  border: isPrimary ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: isPrimary ? '0 0 30px rgba(139,92,246,0.1), 0 0 60px rgba(236,72,153,0.05)' : 'none',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-2px)'
                  if (isPrimary) {
                    el.style.boxShadow = '0 0 40px rgba(139,92,246,0.2), 0 0 80px rgba(236,72,153,0.1)'
                    el.style.borderColor = 'rgba(139,92,246,0.5)'
                  } else {
                    el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
                    el.style.borderColor = 'rgba(255,255,255,0.15)'
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(0)'
                  if (isPrimary) {
                    el.style.boxShadow = '0 0 30px rgba(139,92,246,0.1), 0 0 60px rgba(236,72,153,0.05)'
                    el.style.borderColor = 'rgba(139,92,246,0.3)'
                  } else {
                    el.style.boxShadow = 'none'
                    el.style.borderColor = 'rgba(255,255,255,0.08)'
                  }
                }}
              >
                <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: icon.type === 'platform' ? (SOCIAL_BACKGROUNDS[icon.platform!] || icon.color!) : 'rgba(255,255,255,0.1)',
                    border: icon.type === 'platform' && needsBorder(icon.platform!) ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  }}>
                    {icon.type === 'platform' && icon.svg ? (
                      <span style={{ width: 22, height: 22, color: '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>{icon.emoji}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{link.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(() => { try { return new URL(link.url).hostname.replace('www.', '') } catch { return link.url } })()}
                    </div>
                  </div>
                  {isPrimary && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff', whiteSpace: 'nowrap', animation: 'pulse-badge 2s ease-in-out infinite' }}>🔥 NEW</span>
                  )}
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Neon ── */

function NeonProfile({ user, links }: Props) {
  const displayName = user.display_name ?? user.username
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes neonPulse { 0%, 100% { box-shadow: 0 0 20px #A855F7, 0 0 40px #A855F720; } 50% { box-shadow: 0 0 30px #A855F7, 0 0 60px #A855F740; } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 440, padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Header card */}
        <div style={{ position: 'relative', width: '100%', marginBottom: 24 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 20, filter: 'blur(40px)', opacity: 0.3, background: 'linear-gradient(135deg, #A855F7, #EC4899)' }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={displayName} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, animation: 'neonPulse 3s ease-in-out infinite' }} />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: '50%', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #A855F7, #EC4899)', animation: 'neonPulse 3s ease-in-out infinite' }}>
                {displayName[0].toUpperCase()}
              </div>
            )}
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', textShadow: '0 0 20px rgba(168,85,247,0.8)' }}>{displayName}</h1>
            {user.bio && <p style={{ color: '#c4b5fd', fontSize: 14, textAlign: 'center', marginTop: 8, maxWidth: 280, lineHeight: 1.5 }}>{user.bio}</p>}
          </div>
        </div>

        {/* Links */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {links.map(link => {
            const icon = getPlatformIcon(link.url, link.icon)
            return (
              <a key={link.id}
                href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 9999,
                  background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.3)',
                  boxShadow: '0 0 15px #8B5CF620', transition: 'all 0.2s', textDecoration: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(168,85,247,0.15)'; el.style.borderColor = '#EC4899'; el.style.boxShadow = '0 0 20px #8B5CF6'; el.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(168,85,247,0.05)'; el.style.borderColor = 'rgba(168,85,247,0.3)'; el.style.boxShadow = '0 0 15px #8B5CF620'; el.style.transform = 'translateY(0)' }}
              >
                {icon.type === 'platform' && icon.svg ? (
                  <span style={{ width: 24, height: 24, color: '#fff', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
                ) : (
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon.emoji}</span>
                )}
                <span style={{ flex: 1, color: '#fff', fontWeight: 600, textAlign: 'center', fontSize: 15 }}>{link.title}</span>
                <span style={{ color: '#39FF14', fontSize: 10 }}>●</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Soft ── */

function SoftProfile({ user, links }: Props) {
  const displayName = user.display_name ?? user.username
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: 'linear-gradient(180deg, #FDF4FF 0%, #FFF1F2 30%, #F5F3FF 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ width: '100%', maxWidth: 440, padding: '48px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 32, marginBottom: 24, textAlign: 'center', boxShadow: '0 4px 30px rgba(236,72,153,0.1)' }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={displayName} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', boxShadow: '0 0 20px rgba(236,72,153,0.25)' }} />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #f9a8d4, #c084fc)', boxShadow: '0 0 20px rgba(236,72,153,0.25)' }}>
              {displayName[0].toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>{displayName}</h1>
          {user.bio && <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{user.bio}</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {links.map(link => {
            const icon = getPlatformIcon(link.url, link.icon)
            return (
              <a key={link.id}
                href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#fff', borderRadius: 16,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'all 0.2s', textDecoration: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(236,72,153,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {icon.type === 'platform' && icon.svg ? (
                  <span style={{ width: 24, height: 24, color: icon.color, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
                ) : (
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon.emoji}</span>
                )}
                <span style={{ flex: 1, color: '#374151', fontWeight: 600, textAlign: 'center', fontSize: 15 }}>{link.title}</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Main Export ── */

export default function ProfilePage({ user, links }: Props) {
  const enabledLinks = links.filter(l => l.enabled === 1)

  if (user.theme === 'neon') return <NeonProfile user={user} links={enabledLinks} />
  if (user.theme === 'soft') return <SoftProfile user={user} links={enabledLinks} />
  return <DarkGlassProfile user={user} links={enabledLinks} />
}
