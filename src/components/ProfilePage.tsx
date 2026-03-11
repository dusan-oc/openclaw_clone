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

/* ── Link Card Icon ── */
function CardIcon({ link, variant }: { link: Link; variant: 'dark' | 'neon' | 'soft' }) {
  const icon = getPlatformIcon(link.url, link.icon)
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
  const needsBorder = (p: string) => ['tiktok', 'x', 'threads'].includes(p)

  const bg = icon.type === 'platform'
    ? (SOCIAL_BACKGROUNDS[icon.platform!] || icon.color!)
    : variant === 'soft' ? 'linear-gradient(135deg, #f9a8d4, #c084fc)' : 'rgba(255,255,255,0.1)'
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

/* ── Link Card (shared across themes) ── */
function LinkCard({ link, index, variant }: { link: Link; index: number; variant: 'dark' | 'neon' | 'soft' }) {
  const isPrimary = index === 0
  const hasThumbnail = !!link.thumbnail_url

  // Theme-specific styles
  const cardBg = variant === 'soft'
    ? (isPrimary ? 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(249,168,212,0.08))' : 'rgba(255,255,255,0.85)')
    : variant === 'neon' ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.06)'
  const cardBorder = variant === 'soft'
    ? (isPrimary ? '1px solid rgba(192,132,252,0.3)' : '1px solid rgba(0,0,0,0.06)')
    : variant === 'neon'
      ? (isPrimary ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(168,85,247,0.15)')
      : (isPrimary ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.08)')
  const titleColor = variant === 'soft' ? '#1a1a2e' : '#fff'
  const subtitleColor = variant === 'soft' ? '#9ca3af' : variant === 'neon' ? 'rgba(196,181,253,0.6)' : 'rgba(255,255,255,0.45)'
  const shadowPrimary = variant === 'soft'
    ? '0 4px 24px rgba(192,132,252,0.2), 0 2px 8px rgba(0,0,0,0.04)'
    : variant === 'neon'
      ? '0 0 30px rgba(168,85,247,0.15), 0 0 60px rgba(168,85,247,0.05)'
      : '0 0 30px rgba(139,92,246,0.1), 0 0 60px rgba(236,72,153,0.05)'
  const shadowDefault = variant === 'soft' ? '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' : 'none'

  return (
    <a
      href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
      style={{
        position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', textDecoration: 'none',
        display: 'block',
        background: cardBg,
        border: cardBorder,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isPrimary ? shadowPrimary : shadowDefault,
        animation: (variant === 'neon' && isPrimary) ? 'neonGlow 3s ease-in-out infinite' : undefined,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = variant === 'soft'
          ? '0 8px 32px rgba(192,132,252,0.25), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 0 40px rgba(139,92,246,0.2), 0 0 80px rgba(236,72,153,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isPrimary ? shadowPrimary : shadowDefault
      }}
    >
      {/* Thumbnail image — tall visual card */}
      {hasThumbnail && (
        <div style={{ position: 'relative' }}>
          <img src={link.thumbnail_url!} alt={link.title}
            style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
          {/* Gradient overlay on thumbnail bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: variant === 'soft'
              ? 'linear-gradient(transparent, rgba(255,255,255,0.9))'
              : 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          }} />
          {/* Platform icon overlay top-left */}
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <CardIcon link={link} variant={variant} />
          </div>
        </div>
      )}

      {/* Card body */}
      <div style={{
        padding: hasThumbnail ? '12px 16px 16px' : '22px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        minHeight: hasThumbnail ? undefined : 76,
      }}>
        {/* Icon only shown if no thumbnail */}
        {!hasThumbnail && <CardIcon link={link} variant={variant} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: hasThumbnail ? 16 : 15, fontWeight: 600, color: titleColor,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {link.title}
            {/* Subtle NEW badge — only on primary */}
            {isPrimary && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                background: variant === 'soft'
                  ? 'linear-gradient(135deg, #c084fc, #f9a8d4)'
                  : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' as const,
              }}>NEW</span>
            )}
          </div>
          <div style={{
            fontSize: 12, color: subtitleColor, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
          }}>
            {getDomain(link.url)}
          </div>
        </div>
      </div>
    </a>
  )
}

/* ── Social Icons Row ── */
function SocialIcons({ socials, variant }: {
  socials: { platform: string; svg: string; url: string }[];
  variant: 'dark' | 'neon' | 'soft'
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
            transition: 'transform 0.2s, background 0.2s', cursor: 'pointer', textDecoration: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.15)'
            e.currentTarget.style.background = variant === 'soft' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = iconBg
          }}
        >
          <span style={{ width: 15, height: 15, color: iconColor }} dangerouslySetInnerHTML={{ __html: s.svg }} />
        </a>
      ))}
    </div>
  )
}

/* ── Verified Badge ── */
function VerifiedBadge({ variant }: { variant: 'dark' | 'neon' | 'soft' }) {
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
  variant: 'dark' | 'neon' | 'soft'
}) {
  const avatarUrl = user.avatar_url || ''
  const nameColor = variant === 'soft' ? '#1a1a2e' : '#fff'
  const usernameColor = variant === 'soft' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'
  const gradientEnd = variant === 'soft' ? 'rgba(255,245,250,1)' : 'rgba(0,0,0,0.98)'
  const gradientMid = variant === 'soft' ? 'rgba(255,245,250,0.0)' : 'rgba(0,0,0,0.0)'

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: variant === 'soft' ? '0 0 28px 28px' : undefined }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: 520, objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', height: 520,
          background: variant === 'soft' ? 'linear-gradient(135deg, #f9a8d4, #c084fc, #93c5fd)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 800, color: '#fff',
        }}>
          {displayName[0]?.toUpperCase()}
        </div>
      )}

      {/* Long smooth gradient — starts at 50% down */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
        background: `linear-gradient(to bottom, transparent 0%, ${gradientMid} 40%, ${gradientEnd} 100%)`,
      }} />

      {/* Profile info overlaid on hero */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', zIndex: 3 }}>
        <div style={{
          fontSize: 30, fontWeight: 800, color: nameColor, letterSpacing: -0.5,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          textShadow: variant === 'soft' ? 'none' : '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          {displayName}
          <VerifiedBadge variant={variant} />
        </div>
        <div style={{ fontSize: 14, color: usernameColor, marginTop: 2, fontWeight: 400 }}>@{user.username}</div>
        <SocialIcons socials={socials} variant={variant} />
      </div>
    </div>
  )
}

/* ── Blurred Background ── */
function BlurredBackground({ avatarUrl, variant }: { avatarUrl: string; variant: 'dark' | 'neon' | 'soft' }) {
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
        filter: `blur(60px) brightness(${variant === 'neon' ? 0.25 : 0.35}) saturate(1.3)`,
        transform: 'scale(1.2)', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%)',
        zIndex: 1,
      }} />
    </>
  )
}

/* ── Dark Glass (Classic) ── */

function DarkGlassProfile({ user, links }: Props) {
  const socials = extractSocialIcons(links)
  const displayName = user.display_name ?? user.username

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      <BlurredBackground avatarUrl={user.avatar_url || ''} variant="dark" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <HeroSection user={user} displayName={displayName} socials={socials} variant="dark" />

        <div style={{ width: '100%', padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user.bio && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.5, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</p>
          )}

          {links.map((link, i) => (
            <LinkCard key={link.id} link={link} index={i} variant="dark" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Neon ── */

function NeonProfile({ user, links }: Props) {
  const socials = extractSocialIcons(links)
  const displayName = user.display_name ?? user.username

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes neonGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.3), 0 0 20px rgba(168,85,247,0.1); }
          50% { box-shadow: 0 0 16px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.2); }
        }
      `}</style>

      <BlurredBackground avatarUrl={user.avatar_url || ''} variant="neon" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <HeroSection user={user} displayName={displayName} socials={socials} variant="neon" />

        <div style={{ width: '100%', padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {user.bio && (
            <p style={{ textAlign: 'center', color: '#c4b5fd', fontSize: 13, lineHeight: 1.5, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</p>
          )}

          {links.map((link, i) => (
            <LinkCard key={link.id} link={link} index={i} variant="neon" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Soft ── */

function SoftProfile({ user, links }: Props) {
  const socials = extractSocialIcons(links)
  const displayName = user.display_name ?? user.username

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: 'linear-gradient(180deg, #FFF5FA 0%, #FDF4FF 30%, #F5F3FF 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      <BlurredBackground avatarUrl={user.avatar_url || ''} variant="soft" />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <HeroSection user={user} displayName={displayName} socials={socials} variant="soft" />

        <div style={{ width: '100%', padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user.bio && (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, lineHeight: 1.5, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</p>
          )}

          {links.map((link, i) => (
            <LinkCard key={link.id} link={link} index={i} variant="soft" />
          ))}
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
