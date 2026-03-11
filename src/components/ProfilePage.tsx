'use client'

import { useState } from 'react'
import { getPlatformIcon } from '@/lib/platform-icons'

function isOnlyFansUrl(url: string) {
  return /onlyfans\.com/i.test(url)
}

function ContentWarningModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: '32px 28px 24px', maxWidth: 400, width: '100%',
        position: 'relative', fontFamily: 'Inter, sans-serif', color: '#111',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, background: 'none', border: '1.5px solid #ddd',
          borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#666',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
        <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, textAlign: 'center' }}>
          18+ content warning
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 1.5 }}>
          This link may contain content that is not appropriate for all audiences.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px 0', borderRadius: 999, border: '1.5px solid #ddd',
            background: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#111',
          }}>Nevermind</button>
          <button onClick={() => { onClose(); window.open(url, '_blank', 'noopener,noreferrer') }} style={{
            flex: 1, padding: '14px 0', borderRadius: 999, border: 'none',
            background: '#111', color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', textAlign: 'center',
          }}>Continue</button>
        </div>
      </div>
    </div>
  )
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

type Link = {
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

type Props = { user: User; links: Link[] }
type Variant = 'dark' | 'neon' | 'soft'

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

function extractSocialIcons(links: Link[]) {
  const seen = new Set<string>()
  const icons: { platform: string; svg: string; url: string }[] = []
  for (const link of links) {
    const info = getPlatformIcon(link.url, link.icon)
    if (info.type === 'platform' && info.platform && !seen.has(info.platform)) {
      seen.add(info.platform)
      icons.push({ platform: info.platform, svg: info.svg!, url: link.url })
    }
  }
  return icons
}

/* ════════════════════════════════════════════
   VERIFIED BADGE — purple/blue style like LinkMe
   ════════════════════════════════════════════ */

function VerifiedBadge() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2L14.09 4.26L17 3.64L17.18 6.57L19.56 8.17L18.27 10.86L19.56 13.56L17.18 15.16L17 18.09L14.09 17.47L12 19.73L9.91 17.47L7 18.09L6.82 15.16L4.44 13.56L5.73 10.86L4.44 8.17L6.82 6.57L7 3.64L9.91 4.26L12 2Z" fill="url(#badge_grad)"/>
      <path d="M9.5 12.5L11 14L15 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <defs><linearGradient id="badge_grad" x1="4" y1="2" x2="20" y2="20"><stop stopColor="#818CF8"/><stop offset="1" stopColor="#A78BFA"/></linearGradient></defs>
    </svg>
  )
}

/* ════════════════════════════════════════════
   PLATFORM BADGE — small icon on image cards (top-left)
   ════════════════════════════════════════════ */

function PlatformBadge({ link }: { link: Link }) {
  const icon = getPlatformIcon(link.url, link.icon)
  if (icon.type !== 'platform' || !icon.svg) return null
  return (
    <div style={{
      position: 'absolute', top: 10, left: 10, zIndex: 5,
      width: 30, height: 30, borderRadius: '50%',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ width: 15, height: 15, color: '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
    </div>
  )
}

/* ════════════════════════════════════════════
   CARD ICON — colored square icon for non-image cards
   ════════════════════════════════════════════ */

const SOCIAL_BG: Record<string, string> = {
  instagram: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
  tiktok: '#000', x: '#000', youtube: '#FF0000', telegram: '#26A5E4',
  spotify: '#1DB954', twitch: '#9146FF', snapchat: '#FFFC00',
  onlyfans: '#00AFF0', fansly: '#1FA7F2', patreon: '#FF424D', threads: '#000',
}

function CardIcon({ link, variant }: { link: Link; variant: Variant }) {
  const icon = getPlatformIcon(link.url, link.icon)
  const bg = icon.type === 'platform'
    ? (SOCIAL_BG[icon.platform!] || icon.color!) : 'rgba(255,255,255,0.1)'
  const needsBorder = ['tiktok', 'x', 'threads'].includes(icon.platform ?? '')
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: bg,
      border: needsBorder ? '1px solid rgba(255,255,255,0.15)' : 'none',
    }}>
      {icon.type === 'platform' && icon.svg ? (
        <span style={{ width: 24, height: 24, color: '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
      ) : (
        <span style={{ fontSize: 22 }}>{icon.emoji}</span>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════
   IMAGE LINK CARD — text overlay on image
   ════════════════════════════════════════════ */

type OnWarning = (url: string) => void

function linkProps(link: Link, onWarning?: OnWarning) {
  const analyticsUrl = `/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`
  if (onWarning && isOnlyFansUrl(link.url)) {
    return {
      href: '#' as string,
      onClick: (e: React.MouseEvent) => { e.preventDefault(); onWarning(analyticsUrl) },
    }
  }
  return { href: analyticsUrl }
}

function ImageCard({ link, isGrid, variant, onWarning }: { link: Link; isGrid: boolean; variant: Variant; onWarning?: OnWarning }) {
  const height = isGrid ? 160 : 260
  const borderColor = variant === 'neon' ? 'rgba(168,85,247,0.2)' : 'transparent'

  return (
    <a
      {...linkProps(link, onWarning)}
      style={{
        position: 'relative', display: 'block', width: '100%',
        height, borderRadius: 16, overflow: 'hidden',
        textDecoration: 'none', cursor: 'pointer',
        border: `1px solid ${borderColor}`,
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.008)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
    >
      <img src={link.thumbnail_url!} alt={link.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <PlatformBadge link={link} />
      {/* Heavy bottom gradient — fades to near-black for seamless card flow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
        background: variant === 'soft'
          ? 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)'
          : 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 25%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)',
      }} />
      <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 3 }}>
        <div style={{
          fontSize: isGrid ? 14 : 17, fontWeight: 700, color: '#fff',
          textShadow: '0 1px 8px rgba(0,0,0,0.7)',
        }}>
          {link.title}
        </div>
      </div>
    </a>
  )
}

/* ════════════════════════════════════════════
   DEFAULT IMAGE CARD — image on top, text row below
   ════════════════════════════════════════════ */

function DefaultImageCard({ link, isGrid, variant, onWarning }: { link: Link; isGrid: boolean; variant: Variant; onWarning?: OnWarning }) {
  const isDark = variant !== 'soft'
  const bg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'
  const titleColor = isDark ? '#fff' : '#1a1a2e'
  const subColor = isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'

  return (
    <a
      {...linkProps(link, onWarning)}
      style={{
        display: 'block', width: '100%', borderRadius: 16, overflow: 'hidden',
        textDecoration: 'none', cursor: 'pointer',
        background: bg, border,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ position: 'relative' }}>
        <img src={link.thumbnail_url!} alt={link.title}
          style={{ width: '100%', height: isGrid ? 120 : 200, objectFit: 'cover', display: 'block' }} />
        <PlatformBadge link={link} />
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <CardIcon link={link} variant={variant} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: isGrid ? 13 : 15, fontWeight: 600, color: titleColor }}>{link.title}</div>
          {!isGrid && (
            <div style={{ fontSize: 11, color: subColor, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
              {(() => { try { return new URL(link.url).hostname.replace('www.', '') } catch { return '' } })()}
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

/* ════════════════════════════════════════════
   GLASS LINK CARD — no thumbnail, glassmorphism
   ════════════════════════════════════════════ */

function GlassCard({ link, isGrid, variant, onWarning }: { link: Link; isGrid: boolean; variant: Variant; onWarning?: OnWarning }) {
  const isDark = variant !== 'soft'
  const bg = isDark
    ? (variant === 'neon' ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.06)')
    : 'rgba(255,255,255,0.7)'
  const border = isDark
    ? (variant === 'neon' ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(255,255,255,0.08)')
    : '1px solid rgba(0,0,0,0.06)'
  const titleColor = isDark ? '#fff' : '#1a1a2e'
  const subColor = isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'

  return (
    <a
      {...linkProps(link, onWarning)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', borderRadius: 16, overflow: 'hidden',
        textDecoration: 'none', cursor: 'pointer',
        padding: isGrid ? '14px 12px' : '18px 16px',
        background: bg, border,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        transition: 'transform 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
    >
      <CardIcon link={link} variant={variant} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isGrid ? 13 : 15, fontWeight: 600, color: titleColor }}>{link.title}</div>
        {!isGrid && (
          <div style={{ fontSize: 11, color: subColor, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
            {(() => { try { return new URL(link.url).hostname.replace('www.', '') } catch { return '' } })()}
          </div>
        )}
      </div>
    </a>
  )
}

/* ════════════════════════════════════════════
   LINK CARD — routes to Image or Glass
   ════════════════════════════════════════════ */

function LinkCard({ link, isGrid, variant, linkStyle, onWarning }: {
  link: Link; isGrid: boolean; variant: Variant; linkStyle: 'default' | 'overlay'; onWarning?: OnWarning
}) {
  if (link.thumbnail_url && linkStyle === 'overlay') {
    return <ImageCard link={link} isGrid={isGrid} variant={variant} onWarning={onWarning} />
  }
  if (link.thumbnail_url && linkStyle === 'default') {
    return <DefaultImageCard link={link} isGrid={isGrid} variant={variant} onWarning={onWarning} />
  }
  return <GlassCard link={link} isGrid={isGrid} variant={variant} onWarning={onWarning} />
}

/* ════════════════════════════════════════════
   LINKS SECTION — list or grid layout
   ════════════════════════════════════════════ */

function LinksSection({ links, variant, linkStyle, onWarning }: {
  links: Link[]; variant: Variant; linkStyle: 'default' | 'overlay'; onWarning?: OnWarning
}) {
  if (links.length === 0) return null

  // Build rows: consecutive 'half' links get paired, 'full' links get their own row
  const rows: (Link | [Link, Link])[] = []
  let i = 0
  while (i < links.length) {
    const link = links[i]
    if (link.card_size === 'half' && i + 1 < links.length && links[i + 1].card_size === 'half') {
      rows.push([link, links[i + 1]])
      i += 2
    } else {
      rows.push(link)
      i++
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map((row, idx) => {
        if (Array.isArray(row)) {
          return (
            <div key={`row-${idx}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <LinkCard link={row[0]} isGrid={true} variant={variant} linkStyle={linkStyle} onWarning={onWarning} />
              <LinkCard link={row[1]} isGrid={true} variant={variant} linkStyle={linkStyle} onWarning={onWarning} />
            </div>
          )
        }
        return <LinkCard key={row.id} link={row} isGrid={false} variant={variant} linkStyle={linkStyle} onWarning={onWarning} />
      })}
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN PROFILE PAGE
   ════════════════════════════════════════════ */

export default function ProfilePage({ user, links }: Props) {
  const [warningUrl, setWarningUrl] = useState<string | null>(null)
  const enabledLinks = links.filter(l => l.enabled === 1)
  const variant: Variant = user.theme === 'neon' ? 'neon' : user.theme === 'soft' ? 'soft' : 'dark'
  const displayName = user.display_name ?? user.username
  const avatarUrl = user.avatar_url || ''
  const showBio = user.show_bio === 1
  const isSoft = variant === 'soft'
  const headerLinks = enabledLinks.filter(l => l.show_in_header === 1)
  const bgMode = user.bg_mode || 'blur'

  // Parse AI background CSS if applicable
  let aiBgStyles: Record<string, string> = {}
  let aiBgKeyframes = ''
  if (bgMode === 'ai' && user.bg_value) {
    try {
      const parsed = JSON.parse(user.bg_value)
      if (parsed['@keyframes']) {
        aiBgKeyframes = `@keyframes ${parsed['@keyframes']}`
        delete parsed['@keyframes']
      }
      aiBgStyles = parsed
    } catch { /* fallback to default */ }
  }

  // Page background
  const pageBg = bgMode === 'color' && user.bg_value
    ? user.bg_value
    : bgMode === 'ai' && aiBgStyles.background
      ? aiBgStyles.background
      : isSoft ? '#FFF5FA' : '#000'

  const showBlurBg = bgMode === 'blur' && user.show_blurred_bg === 1

  // Bio color
  const bioColor = isSoft ? '#6b7280' : variant === 'neon' ? '#c4b5fd' : 'rgba(255,255,255,0.55)'

  return (
    <>
    {warningUrl && <ContentWarningModal url={warningUrl} onClose={() => setWarningUrl(null)} />}
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: '100vh',
      display: 'flex', justifyContent: 'center',
      overflowX: 'hidden',
      ...(bgMode === 'ai' && Object.keys(aiBgStyles).length > 0
        ? aiBgStyles
        : { background: pageBg }),
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bgMode === 'color' && user.bg_value ? user.bg_value : isSoft ? '#FFF5FA' : '#000'}; }
        ${variant === 'neon' ? `@keyframes neonPulse { 0%,100%{opacity:0.6}50%{opacity:1} }` : ''}
        ${aiBgKeyframes}
      `}</style>

      {/* ── Blurred Background ── */}
      {showBlurBg && avatarUrl && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${avatarUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center top',
            filter: isSoft
              ? 'blur(60px) brightness(1.3) saturate(0.4)'
              : `blur(40px) brightness(${variant === 'neon' ? 0.45 : 0.55}) saturate(1.6)`,
            transform: 'scale(1.3)',
            zIndex: 0,
          }} />
          {!isSoft && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.6) 100%)',
              zIndex: 1,
            }} />
          )}
        </>
      )}

      {/* ── Page Container ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 560,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ════ THE CARD ════
            One big card that contains EVERYTHING — hero image + name + links.
            Rounded top corners, extends to the bottom of the page.
            Like LinkMe: the hero is wider, links are narrower inside it. */}
        <div style={{
          position: 'relative',
          margin: '8px 4px 0 4px',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
          background: isSoft ? '#FFF5FA' : '#0a0a0a',
          boxShadow: isSoft
            ? '0 4px 30px rgba(0,0,0,0.08)'
            : '0 0 50px rgba(0,0,0,0.4)',
          minHeight: '95vh',
        }}>
          {/* Hero image */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{
                width: '100%', height: 520, objectFit: 'cover', objectPosition: 'center top', display: 'block',
              }} />
            ) : (
              <div style={{
                width: '100%', height: 520,
                background: isSoft
                  ? 'linear-gradient(135deg, #f9a8d4, #c084fc, #93c5fd)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 120, fontWeight: 900, color: 'rgba(255,255,255,0.3)',
              }}>
                {displayName[0]?.toUpperCase()}
              </div>
            )}

            {/* Dramatic bottom gradient — fades into the card background */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
              background: isSoft
                ? 'linear-gradient(to bottom, transparent 0%, rgba(255,245,250,0.05) 25%, rgba(255,245,250,0.5) 60%, #FFF5FA 100%)'
                : 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.1) 25%, rgba(10,10,10,0.5) 55%, rgba(10,10,10,0.85) 80%, #0a0a0a 100%)',
            }} />

            {/* Name + badge + handle + header icons + bio overlaid on hero */}
            <div style={{
              position: 'absolute', bottom: 24, left: 0, right: 0,
              textAlign: 'center', zIndex: 3,
            }}>
              <div style={{
                fontSize: 36, fontWeight: 900,
                color: isSoft ? '#1a1a2e' : '#fff',
                letterSpacing: -0.8,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                textShadow: isSoft ? '0 1px 12px rgba(255,255,255,0.5)' : '0 2px 20px rgba(0,0,0,0.5)',
              }}>
                {displayName}
                <VerifiedBadge />
              </div>
              <div style={{
                fontSize: 15,
                color: isSoft ? 'rgba(26,26,46,0.5)' : 'rgba(255,255,255,0.55)',
                marginTop: 4, fontWeight: 400,
                textShadow: isSoft ? 'none' : '0 1px 8px rgba(0,0,0,0.4)',
              }}>
                @{user.username}
              </div>
              {/* Quick-link icon bar */}
              {headerLinks.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                  {headerLinks.map(link => {
                    const icon = getPlatformIcon(link.url, link.icon)
                    return (
                      <a key={link.id}
                        {...linkProps(link, setWarningUrl)}
                        style={{
                          width: 34, height: 34, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isSoft ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)',
                          border: isSoft ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.12)',
                          backdropFilter: 'blur(8px)',
                          transition: 'transform 0.2s, background 0.2s',
                          cursor: 'pointer', textDecoration: 'none',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.background = isSoft ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = isSoft ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)' }}
                      >
                        {icon.type === 'platform' && icon.svg ? (
                          <span style={{ width: 17, height: 17, color: isSoft ? '#1a1a2e' : '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
                        ) : (
                          <span style={{ fontSize: 16 }}>{icon.emoji || link.icon}</span>
                        )}
                      </a>
                    )
                  })}
                </div>
              )}
              {/* Bio */}
              {showBio && user.bio && (
                <p style={{
                  color: isSoft ? 'rgba(26,26,46,0.45)' : 'rgba(255,255,255,0.5)',
                  fontSize: 13, lineHeight: 1.5,
                  marginTop: 6, padding: '0 24px',
                  textShadow: isSoft ? 'none' : '0 1px 6px rgba(0,0,0,0.3)',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* ════ LINKS — inside the card, narrower than the hero ════ */}
          <div style={{ padding: '4px 14px 32px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <LinksSection
              links={enabledLinks}
              variant={variant}
              linkStyle={user.link_style}
              onWarning={setWarningUrl}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
