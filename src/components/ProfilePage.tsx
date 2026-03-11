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
  thumbnail_url: string | null
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

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

/* ── Shared Components ── */

function HeroSection({ user, displayName, socials, variant }: {
  user: User; displayName: string;
  socials: { platform: string; color: string; svg: string; url: string }[];
  variant: 'dark' | 'neon' | 'soft'
}) {
  const avatarUrl = user.avatar_url || ''
  const nameColor = variant === 'soft' ? '#1a1a2e' : '#fff'
  const usernameColor = variant === 'soft' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'
  const gradientEnd = variant === 'soft' ? 'rgba(255,245,250,0.98)' : 'rgba(0,0,0,0.95)'
  const gradientMid = variant === 'soft' ? 'rgba(255,245,250,0.1)' : 'rgba(0,0,0,0.1)'

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: 520, objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: 520, background: variant === 'soft' ? 'linear-gradient(135deg, #f9a8d4, #c084fc)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 800, color: '#fff' }}>
          {displayName[0]?.toUpperCase()}
        </div>
      )}
      {/* Multi-stop gradient fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
        background: `linear-gradient(to bottom, transparent 0%, ${gradientMid} 50%, ${gradientEnd} 100%)`,
      }} />

      {/* Profile info overlay */}
      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
        <div style={{
          fontSize: 30, fontWeight: 800, color: nameColor, letterSpacing: -0.5,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          textShadow: variant === 'soft' ? 'none' : '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          {displayName}
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24,
            background: variant === 'neon' ? 'linear-gradient(135deg, #A855F7, #06b6d4)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            borderRadius: '50%', fontSize: 13, color: '#fff', fontWeight: 700,
          }}>✓</span>
        </div>
        <div style={{ fontSize: 14, color: usernameColor, marginTop: 4, fontWeight: 400 }}>@{user.username}</div>

        {socials.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
            {socials.map(s => (
              <a key={s.platform} href={`/api/analytics/click?linkId=0&url=${encodeURIComponent(s.url)}`}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: variant === 'soft' ? 'rgba(0,0,0,0.06)' : (SOCIAL_BACKGROUNDS[s.platform] || s.color),
                  border: (variant !== 'soft' && needsBorder(s.platform)) ? '1px solid rgba(255,255,255,0.15)' : 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.boxShadow = variant === 'neon' ? '0 0 20px rgba(168,85,247,0.4)' : '0 0 16px rgba(255,255,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ width: 18, height: 18, color: variant === 'soft' ? '#374151' : '#fff' }} dangerouslySetInnerHTML={{ __html: s.svg }} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
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
        <HeroSection user={user} displayName={displayName} socials={socials} variant="dark" />

        <div style={{ width: '100%', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user.bio && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</p>
          )}

          {links.map((link, i) => {
            const icon = getPlatformIcon(link.url, link.icon)
            const isPrimary = i === 0
            return (
              <a key={link.id}
                href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
                style={{
                  position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', textDecoration: 'none',
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
                {link.thumbnail_url && (
                  <img src={link.thumbnail_url} alt={link.title}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                )}
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
                      {getDomain(link.url)}
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
  const socials = extractSocialIcons(links)
  const avatarUrl = user.avatar_url || ''
  const displayName = user.display_name ?? user.username

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes neonGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.3), 0 0 20px rgba(168,85,247,0.1), inset 0 0 8px rgba(168,85,247,0.05); }
          50% { box-shadow: 0 0 16px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.2), inset 0 0 16px rgba(168,85,247,0.08); }
        }
        @keyframes neonLine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* Blurred background */}
      {avatarUrl && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${avatarUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center top',
            filter: 'blur(60px) brightness(0.25) saturate(1.5)',
            transform: 'scale(1.2)', zIndex: 0,
          }} />
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.98) 100%)',
            zIndex: 1,
          }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <HeroSection user={user} displayName={displayName} socials={socials} variant="neon" />

        <div style={{ width: '100%', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {user.bio && (
            <p style={{ textAlign: 'center', color: '#c4b5fd', fontSize: 14, lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</p>
          )}

          {links.map((link, i) => {
            const icon = getPlatformIcon(link.url, link.icon)
            const isPrimary = i === 0
            return (
              <a key={link.id}
                href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
                style={{
                  position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', textDecoration: 'none',
                  background: 'rgba(168,85,247,0.06)',
                  border: isPrimary ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(168,85,247,0.15)',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  animation: isPrimary ? 'neonGlow 3s ease-in-out infinite' : 'none',
                  boxShadow: !isPrimary ? '0 0 8px rgba(168,85,247,0.1)' : undefined,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-2px)'
                  el.style.borderColor = 'rgba(236,72,153,0.6)'
                  el.style.boxShadow = '0 0 24px rgba(168,85,247,0.4), 0 0 48px rgba(236,72,153,0.15)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(0)'
                  el.style.borderColor = isPrimary ? 'rgba(168,85,247,0.5)' : 'rgba(168,85,247,0.15)'
                  el.style.boxShadow = isPrimary ? '' : '0 0 8px rgba(168,85,247,0.1)'
                }}
              >
                {link.thumbnail_url && (
                  <div style={{ position: 'relative' }}>
                    <img src={link.thumbnail_url} alt={link.title}
                      style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }} />
                  </div>
                )}
                <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: icon.type === 'platform' ? (SOCIAL_BACKGROUNDS[icon.platform!] || icon.color!) : 'rgba(168,85,247,0.15)',
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
                    <div style={{ fontSize: 12, color: 'rgba(196,181,253,0.6)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDomain(link.url)}
                    </div>
                  </div>
                  <span style={{ color: 'rgba(168,85,247,0.5)', fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
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
  const socials = extractSocialIcons(links)
  const avatarUrl = user.avatar_url || ''
  const displayName = user.display_name ?? user.username

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: 'linear-gradient(180deg, #FFF5FA 0%, #FDF4FF 30%, #F5F3FF 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Soft blurred background — very light, desaturated */}
      {avatarUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${avatarUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center top',
          filter: 'blur(80px) brightness(1.2) saturate(0.4) opacity(0.3)',
          transform: 'scale(1.3)', zIndex: 0,
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Hero with rounded corners */}
        <div style={{ width: '100%', padding: '0 0 0', position: 'relative' }}>
          <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '0 0 28px 28px' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: 460, objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: 460, background: 'linear-gradient(135deg, #f9a8d4, #c084fc, #93c5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 800, color: '#fff' }}>
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            {/* Soft fade to page bg */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255,245,250,0.1) 50%, rgba(255,245,250,0.98) 100%)',
            }} />
            <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', letterSpacing: -0.5, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {displayName}
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'linear-gradient(135deg, #c084fc, #f9a8d4)', borderRadius: '50%', fontSize: 13, color: '#fff', fontWeight: 700 }}>✓</span>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.4)', marginTop: 4, fontWeight: 400 }}>@{user.username}</div>
              {socials.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                  {socials.map(s => (
                    <a key={s.platform} href={`/api/analytics/click?linkId=0&url=${encodeURIComponent(s.url)}`}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.06)', transition: 'transform 0.2s', cursor: 'pointer', textDecoration: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(0,0,0,0.06)' }}
                    >
                      <span style={{ width: 18, height: 18, color: '#374151' }} dangerouslySetInnerHTML={{ __html: s.svg }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ width: '100%', padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user.bio && (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</p>
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
                  background: '#fff',
                  border: isPrimary ? '1px solid rgba(192,132,252,0.3)' : '1px solid rgba(0,0,0,0.04)',
                  boxShadow: isPrimary ? '0 4px 24px rgba(192,132,252,0.15), 0 1px 4px rgba(0,0,0,0.04)' : '0 1px 8px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = isPrimary ? '0 8px 32px rgba(192,132,252,0.25), 0 2px 8px rgba(0,0,0,0.06)' : '0 4px 20px rgba(236,72,153,0.12)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = isPrimary ? '0 4px 24px rgba(192,132,252,0.15), 0 1px 4px rgba(0,0,0,0.04)' : '0 1px 8px rgba(0,0,0,0.04)'
                }}
              >
                {link.thumbnail_url && (
                  <img src={link.thumbnail_url} alt={link.title}
                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: icon.type === 'platform' ? (SOCIAL_BACKGROUNDS[icon.platform!] || icon.color!) : 'linear-gradient(135deg, #f9a8d4, #c084fc)',
                    border: icon.type === 'platform' && needsBorder(icon.platform!) ? '1px solid rgba(0,0,0,0.08)' : 'none',
                  }}>
                    {icon.type === 'platform' && icon.svg ? (
                      <span style={{ width: 22, height: 22, color: '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>{icon.emoji}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>{link.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getDomain(link.url)}
                    </div>
                  </div>
                  <span style={{ color: '#d1d5db', fontSize: 18, flexShrink: 0 }}>›</span>
                </div>
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
