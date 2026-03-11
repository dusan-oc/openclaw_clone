'use client'

import { getPlatformIcon } from '@/lib/platform-icons'

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

function ImageCard({ link, isGrid, variant }: { link: Link; isGrid: boolean; variant: Variant }) {
  const height = isGrid ? 160 : 260
  const borderColor = variant === 'neon' ? 'rgba(168,85,247,0.2)' : 'transparent'

  return (
    <a
      href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
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

function DefaultImageCard({ link, isGrid, variant }: { link: Link; isGrid: boolean; variant: Variant }) {
  const isDark = variant !== 'soft'
  const bg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'
  const border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'
  const titleColor = isDark ? '#fff' : '#1a1a2e'
  const subColor = isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af'

  return (
    <a
      href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
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

function GlassCard({ link, isGrid, variant }: { link: Link; isGrid: boolean; variant: Variant }) {
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
      href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
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

function LinkCard({ link, isGrid, variant, linkStyle }: {
  link: Link; isGrid: boolean; variant: Variant; linkStyle: 'default' | 'overlay'
}) {
  if (link.thumbnail_url && linkStyle === 'overlay') {
    return <ImageCard link={link} isGrid={isGrid} variant={variant} />
  }
  if (link.thumbnail_url && linkStyle === 'default') {
    return <DefaultImageCard link={link} isGrid={isGrid} variant={variant} />
  }
  return <GlassCard link={link} isGrid={isGrid} variant={variant} />
}

/* ════════════════════════════════════════════
   LINKS SECTION — list or grid layout
   ════════════════════════════════════════════ */

function LinksSection({ links, variant, linkStyle, layout }: {
  links: Link[]; variant: Variant; linkStyle: 'default' | 'overlay'; layout: 'list' | 'grid'
}) {
  if (links.length === 0) return null

  if (layout === 'grid' && links.length > 1) {
    const first = links[0]
    const rest = links.slice(1)
    // If odd number remaining, pull last one out for full-width
    const hasOdd = rest.length % 2 === 1
    const gridLinks = hasOdd ? rest.slice(0, -1) : rest
    const lastLink = hasOdd ? rest[rest.length - 1] : null

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* First link always full width */}
        <LinkCard link={first} isGrid={false} variant={variant} linkStyle={linkStyle} />
        {/* Pairs in 2-column grid */}
        {gridLinks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {gridLinks.map(link => (
              <LinkCard key={link.id} link={link} isGrid={true} variant={variant} linkStyle={linkStyle} />
            ))}
          </div>
        )}
        {/* Odd one out → full width */}
        {lastLink && (
          <LinkCard link={lastLink} isGrid={false} variant={variant} linkStyle={linkStyle} />
        )}
      </div>
    )
  }

  // List layout
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {links.map(link => (
        <LinkCard key={link.id} link={link} isGrid={false} variant={variant} linkStyle={linkStyle} />
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════
   MAIN PROFILE PAGE
   ════════════════════════════════════════════ */

export default function ProfilePage({ user, links }: Props) {
  const enabledLinks = links.filter(l => l.enabled === 1)
  const variant: Variant = user.theme === 'neon' ? 'neon' : user.theme === 'soft' ? 'soft' : 'dark'
  const displayName = user.display_name ?? user.username
  const avatarUrl = user.avatar_url || ''
  const showBg = user.show_blurred_bg === 1
  const showBio = user.show_bio === 1
  const isSoft = variant === 'soft'

  // Page background
  const pageBg = isSoft
    ? '#FFF5FA'
    : '#000'

  // Bio color
  const bioColor = isSoft ? '#6b7280' : variant === 'neon' ? '#c4b5fd' : 'rgba(255,255,255,0.55)'

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: pageBg, minHeight: '100vh',
      display: 'flex', justifyContent: 'center',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${pageBg}; }
        ${variant === 'neon' ? `@keyframes neonPulse { 0%,100%{opacity:0.6}50%{opacity:1} }` : ''}
      `}</style>

      {/* ── Blurred Background ── */}
      {showBg && avatarUrl && (
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
        width: '100%', maxWidth: 440,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ════ HERO SECTION ════
            This is THE most important part. The hero photo IS the page.
            Name + handle overlay on the bottom with a dramatic gradient.
            The whole thing is a floating rounded card. */}
        <div style={{
          position: 'relative',
          margin: '8px 8px 0 8px',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
          // Subtle outer glow for depth
          boxShadow: isSoft
            ? '0 4px 30px rgba(0,0,0,0.08)'
            : '0 0 40px rgba(0,0,0,0.3)',
        }}>
          {/* Hero image */}
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

          {/* Dramatic bottom gradient — fades to fully opaque so hero bleeds into content */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
            background: isSoft
              ? 'linear-gradient(to bottom, transparent 0%, rgba(255,245,250,0.05) 25%, rgba(255,245,250,0.5) 60%, rgba(255,245,250,1) 100%)'
              : 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.85) 80%, #000 100%)',
          }} />

          {/* Name + badge + handle + bio overlaid on hero */}
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
            {/* Bio lives INSIDE the hero — no orphaned text */}
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

        {/* ════ CONTENT BELOW HERO ════ */}
        <div style={{ padding: '0px 8px 40px', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Links */}
          <LinksSection
            links={enabledLinks}
            variant={variant}
            linkStyle={user.link_style}
            layout={user.layout}
          />
        </div>
      </div>
    </div>
  )
}
