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

type Props = {
  user: User
  links: Link[]
}

type Variant = 'dark' | 'neon' | 'soft'

/* ── Helpers ── */

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

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

/* ── Platform Badge (top-left of image cards) ── */
function PlatformBadge({ link }: { link: Link }) {
  const icon = getPlatformIcon(link.url, link.icon)
  if (icon.type !== 'platform' || !icon.svg) return null

  return (
    <div style={{
      position: 'absolute', top: 10, left: 10, zIndex: 5,
      width: 28, height: 28, borderRadius: '50%',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ width: 14, height: 14, color: '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
    </div>
  )
}

/* ── Card Icon (for non-thumbnail cards) ── */
function CardIcon({ link, variant }: { link: Link; variant: Variant }) {
  const icon = getPlatformIcon(link.url, link.icon)
  const SOCIAL_BACKGROUNDS: Record<string, string> = {
    instagram: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    tiktok: '#000', x: '#000', youtube: '#FF0000', telegram: '#26A5E4',
    spotify: '#1DB954', twitch: '#9146FF', snapchat: '#FFFC00',
    onlyfans: '#00AFF0', fansly: '#1FA7F2', patreon: '#FF424D', threads: '#000',
  }
  const bg = icon.type === 'platform'
    ? (SOCIAL_BACKGROUNDS[icon.platform!] || icon.color!)
    : variant === 'soft' ? 'linear-gradient(135deg, #f9a8d4, #c084fc)' : 'rgba(255,255,255,0.1)'
  const needsBorder = (p: string) => ['tiktok', 'x', 'threads'].includes(p)
  const border = icon.type === 'platform' && needsBorder(icon.platform!)
    ? (variant === 'soft' ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.15)')
    : 'none'

  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: bg, border,
    }}>
      {icon.type === 'platform' && icon.svg ? (
        <span style={{ width: 24, height: 24, color: '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
      ) : (
        <span style={{ fontSize: 22 }}>{icon.emoji}</span>
      )}
    </div>
  )
}

/* ── Link Card ── */
function LinkCard({ link, index, variant, linkStyle, isGrid }: {
  link: Link; index: number; variant: Variant; linkStyle: 'default' | 'overlay'; isGrid: boolean
}) {
  const isPrimary = index === 0 && !isGrid
  const hasThumbnail = !!link.thumbnail_url
  const useOverlay = linkStyle === 'overlay' && hasThumbnail
  const cardHeight = isGrid ? 140 : (hasThumbnail ? (useOverlay ? 240 : undefined) : undefined)

  // Theme-specific
  const glassCardBg = variant === 'soft'
    ? 'rgba(255,255,255,0.45)' : variant === 'neon' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.07)'
  const glassCardBorder = variant === 'soft'
    ? '1px solid rgba(255,255,255,0.5)' : variant === 'neon'
      ? (isPrimary ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(168,85,247,0.2)')
      : '1px solid rgba(255,255,255,0.12)'
  const glassCardShadow = variant === 'soft'
    ? '0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)'
    : variant === 'neon'
      ? (isPrimary ? '0 0 30px rgba(168,85,247,0.15)' : '0 2px 12px rgba(0,0,0,0.2)')
      : '0 2px 16px rgba(0,0,0,0.2)'
  const titleColor = variant === 'soft' ? '#1a1a2e' : '#fff'
  const subtitleColor = variant === 'soft' ? '#9ca3af' : 'rgba(255,255,255,0.45)'

  const neonShadow = variant === 'neon' && isPrimary
    ? '0 0 30px rgba(168,85,247,0.15), 0 0 60px rgba(168,85,247,0.05)' : 'none'

  if (useOverlay) {
    // Overlay style: text on top of image with gradient
    return (
      <a
        href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
        style={{
          position: 'relative', display: 'block', width: '100%',
          height: cardHeight, borderRadius: 14, overflow: 'hidden',
          textDecoration: 'none', cursor: 'pointer',
          boxShadow: neonShadow,
          border: variant === 'neon' ? glassCardBorder : 'none',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)' }}
      >
        <img src={link.thumbnail_url!} alt={link.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <PlatformBadge link={link} />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.75) 100%)',
        }} />
        {/* Text */}
        <div style={{
          position: 'absolute', bottom: 12, left: 14, right: 14, zIndex: 3,
        }}>
          <div style={{
            fontSize: isGrid ? 13 : 16, fontWeight: 700, color: '#fff',
            textShadow: '0 1px 8px rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {link.title}
            {isPrimary && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' as const,
              }}>NEW</span>
            )}
          </div>
        </div>
      </a>
    )
  }

  if (hasThumbnail && linkStyle === 'default') {
    // Default style: image above, text below
    return (
      <a
        href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
        style={{
          position: 'relative', display: 'block', width: '100%', borderRadius: 14, overflow: 'hidden',
          textDecoration: 'none', cursor: 'pointer',
          background: glassCardBg, border: glassCardBorder,
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isPrimary && variant === 'neon' ? neonShadow : glassCardShadow,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ position: 'relative' }}>
          <img src={link.thumbnail_url!} alt={link.title}
            style={{ width: '100%', height: isGrid ? 100 : 220, objectFit: 'cover', display: 'block' }} />
          <PlatformBadge link={link} />
        </div>
        <div style={{ padding: '12px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isGrid ? 13 : 15, fontWeight: 600, color: titleColor, display: 'flex', alignItems: 'center', gap: 8 }}>
              {link.title}
              {isPrimary && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' as const,
                }}>NEW</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: subtitleColor, marginTop: 2 }}>{getDomain(link.url)}</div>
          </div>
        </div>
      </a>
    )
  }

  // No thumbnail: glassmorphism card
  return (
    <a
      href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', borderRadius: 14, overflow: 'hidden',
        textDecoration: 'none', cursor: 'pointer',
        padding: '18px 16px', minHeight: isGrid ? 60 : 72,
        background: glassCardBg, border: glassCardBorder,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isPrimary && variant === 'neon' ? neonShadow : glassCardShadow,
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <CardIcon link={link} variant={variant} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isGrid ? 13 : 15, fontWeight: 600, color: titleColor, display: 'flex', alignItems: 'center', gap: 8 }}>
          {link.title}
          {isPrimary && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' as const,
            }}>NEW</span>
          )}
        </div>
        <div style={{
          fontSize: 11, color: subtitleColor, marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
        }}>{getDomain(link.url)}</div>
      </div>
    </a>
  )
}

/* ── Social Icons Row ── */
function SocialIcons({ socials, variant }: {
  socials: { platform: string; svg: string; url: string }[];
  variant: Variant
}) {
  if (socials.length === 0) return null
  const iconBg = variant === 'soft' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)'
  const iconColor = variant === 'soft' ? '#374151' : '#fff'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
      {socials.map(s => (
        <a key={s.platform} href={`/api/analytics/click?linkId=0&url=${encodeURIComponent(s.url)}`}
          style={{
            width: 30, height: 30, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: iconBg,
            border: variant !== 'soft' ? '1px solid rgba(255,255,255,0.08)' : 'none',
            transition: 'transform 0.2s', cursor: 'pointer', textDecoration: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <span style={{ width: 15, height: 15, color: iconColor }} dangerouslySetInnerHTML={{ __html: s.svg }} />
        </a>
      ))}
    </div>
  )
}

/* ── Verified Badge ── */
function VerifiedBadge({ variant }: { variant: Variant }) {
  const bg = variant === 'neon'
    ? 'linear-gradient(135deg, #A855F7, #06b6d4)'
    : variant === 'soft'
      ? 'linear-gradient(135deg, #c084fc, #f9a8d4)'
      : 'linear-gradient(135deg, #8B5CF6, #EC4899)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, background: bg, borderRadius: '50%',
      fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
    }}>✓</span>
  )
}

/* ── Hero Section ── */
function HeroSection({ user, displayName, socials, variant }: {
  user: User; displayName: string;
  socials: { platform: string; color: string; svg: string; url: string }[];
  variant: Variant
}) {
  const avatarUrl = user.avatar_url || ''
  const nameColor = '#fff'
  const usernameColor = 'rgba(255,255,255,0.5)'
  const gradientEnd = variant === 'soft' ? 'rgba(255,245,250,1)' : 'rgba(0,0,0,0.98)'
  const gradientMid = variant === 'soft' ? 'rgba(255,245,250,0.0)' : 'rgba(0,0,0,0.0)'

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: 480, objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', height: 480,
          background: variant === 'soft' ? 'linear-gradient(135deg, #f9a8d4, #c084fc, #93c5fd)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 800, color: '#fff',
        }}>
          {displayName[0]?.toUpperCase()}
        </div>
      )}

      {/* Long smooth gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
        background: `linear-gradient(to bottom, transparent 0%, ${gradientMid} 40%, ${gradientEnd} 100%)`,
      }} />

      {/* Profile info overlaid on hero */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
        <div style={{
          fontSize: 30, fontWeight: 800, color: nameColor, letterSpacing: -0.5,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          {displayName}
          <VerifiedBadge variant={variant} />
        </div>
        <div style={{ fontSize: 14, color: usernameColor, marginTop: 2, fontWeight: 400, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>@{user.username}</div>
        <SocialIcons socials={socials} variant={variant} />
      </div>
    </div>
  )
}

/* ── Blurred Background ── */
function BlurredBackground({ avatarUrl, variant }: { avatarUrl: string; variant: Variant }) {
  if (!avatarUrl) return null

  if (variant === 'soft') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${avatarUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center top',
        filter: 'blur(80px) brightness(1.2) saturate(0.4) opacity(0.3)',
        transform: 'scale(1.3)', zIndex: 0,
      }} />
    )
  }

  return (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${avatarUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center top',
        filter: `blur(50px) brightness(${variant === 'neon' ? 0.25 : 0.35}) saturate(1.4)`,
        transform: 'scale(1.25)', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1,
      }} />
    </>
  )
}

/* ── Links Section with Grid/List layout ── */
function LinksSection({ links, variant, linkStyle, layout }: {
  links: Link[]; variant: Variant; linkStyle: 'default' | 'overlay'; layout: 'list' | 'grid'
}) {
  if (links.length === 0) return null

  if (layout === 'grid' && links.length > 1) {
    const firstLink = links[0]
    const restLinks = links.slice(1)
    return (
      <>
        {/* First link: full width */}
        <LinkCard link={firstLink} index={0} variant={variant} linkStyle={linkStyle} isGrid={false} />
        {/* Remaining: 2-column grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {restLinks.map((link, i) => (
            <LinkCard key={link.id} link={link} index={i + 1} variant={variant} linkStyle={linkStyle} isGrid={true} />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      {links.map((link, i) => (
        <LinkCard key={link.id} link={link} index={i} variant={variant} linkStyle={linkStyle} isGrid={false} />
      ))}
    </>
  )
}

/* ── Main Profile ── */
function ProfileLayout({ user, links: enabledLinks, variant }: Props & { variant: Variant }) {
  const socials = extractSocialIcons(enabledLinks)
  const displayName = user.display_name ?? user.username
  const showBg = user.show_blurred_bg === 1
  const showBio = user.show_bio === 1

  const pageBg = variant === 'soft'
    ? 'linear-gradient(180deg, #FFF5FA 0%, #FDF4FF 30%, #F5F3FF 100%)'
    : '#0a0a0a'

  const bioColor = variant === 'soft' ? '#6b7280' : variant === 'neon' ? '#c4b5fd' : 'rgba(255,255,255,0.6)'

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: pageBg, minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        ${variant === 'neon' ? `@keyframes neonGlow { 0%,100%{box-shadow:0 0 8px rgba(168,85,247,0.3),0 0 20px rgba(168,85,247,0.1);}50%{box-shadow:0 0 16px rgba(168,85,247,0.5),0 0 40px rgba(168,85,247,0.2);}}` : ''}
        * { box-sizing: border-box; }
      `}</style>

      {showBg && <BlurredBackground avatarUrl={user.avatar_url || ''} variant={variant} />}

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <HeroSection user={user} displayName={displayName} socials={socials} variant={variant} />

        <div style={{ width: '100%', padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {showBio && user.bio && (
            <p style={{
              textAlign: 'center', color: bioColor, fontSize: 13, lineHeight: 1.5,
              marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{user.bio}</p>
          )}

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

/* ── Main Export ── */
export default function ProfilePage({ user, links }: Props) {
  const enabledLinks = links.filter(l => l.enabled === 1)
  const variant: Variant = user.theme === 'neon' ? 'neon' : user.theme === 'soft' ? 'soft' : 'dark'
  return <ProfileLayout user={user} links={enabledLinks} variant={variant} />
}
