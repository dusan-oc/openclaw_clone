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

function PlatformBadge({ url, fallbackEmoji }: { url: string; fallbackEmoji: string }) {
  const icon = getPlatformIcon(url, fallbackEmoji)
  if (icon.type === 'platform' && icon.svg) {
    return (
      <span className="w-6 h-6 shrink-0 text-white"
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    )
  }
  return <span className="text-xl shrink-0">{icon.emoji}</span>
}

function ClassicProfile({ user, links }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12" style={{ background: '#0F0A1A' }}>
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />

      <div className="relative w-full max-w-[680px] flex flex-col items-center pt-8">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.display_name ?? user.username}
            className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-purple-500/40" />
        ) : (
          <div className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            {(user.display_name ?? user.username)[0].toUpperCase()}
          </div>
        )}

        <h1 className="text-2xl font-bold text-white mb-2">{user.display_name ?? user.username}</h1>
        {user.bio && <p className="text-gray-400 text-sm text-center mb-8 max-w-sm leading-relaxed">{user.bio}</p>}

        <div className="w-full space-y-3 mt-2">
          {links.map(link => (
            <a key={link.id}
              href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
              className="flex items-center gap-3 w-full px-5 py-4 transition-all hover:scale-[1.02] group font-mono"
              style={{
                background: '#1A1030',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                borderRadius: '4px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139, 92, 246, 0.6)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139, 92, 246, 0.15)'
              }}
            >
              <PlatformBadge url={link.url} fallbackEmoji={link.icon} />
              <span className="flex-1 text-white font-medium text-center">{link.title}</span>
            </a>
          ))}
        </div>

        <div className="mt-12">
          <a href="/" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-purple-400 text-xs border border-purple-800/30 hover:border-purple-600/50 transition-colors"
            style={{ background: 'rgba(139, 92, 246, 0.05)' }}>
            ✨ Made with Glimr
          </a>
        </div>
      </div>
    </div>
  )
}

function NeonProfile({ user, links }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-12" style={{ background: '#000' }}>
      <style>{`
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 20px #A855F7, 0 0 40px #A855F720; }
          50% { box-shadow: 0 0 30px #A855F7, 0 0 60px #A855F740; }
        }
      `}</style>
      <div className="w-full flex justify-center mb-8 pt-10">
        <div className="w-full max-w-[680px]">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-3xl opacity-30"
              style={{ background: 'linear-gradient(135deg, #A855F7, #EC4899)' }} />
            <div className="relative flex flex-col items-center py-8 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name ?? user.username}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                  style={{ animation: 'neonPulse 3s ease-in-out infinite' }} />
              ) : (
                <div className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #A855F7, #EC4899)',
                    animation: 'neonPulse 3s ease-in-out infinite',
                  }}>
                  {(user.display_name ?? user.username)[0].toUpperCase()}
                </div>
              )}
              <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }}>
                {user.display_name ?? user.username}
              </h1>
              {user.bio && <p className="text-purple-300 text-sm text-center mt-2 max-w-xs leading-relaxed px-4">{user.bio}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[680px] space-y-3">
        {links.map(link => (
          <a key={link.id}
            href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
            className="flex items-center gap-3 w-full px-5 py-4 transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(168, 85, 247, 0.05)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '9999px',
              boxShadow: '0 0 15px #8B5CF620, 0 0 30px #8B5CF610',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(168, 85, 247, 0.15)'
              el.style.borderColor = '#EC4899'
              el.style.boxShadow = '0 0 15px #8B5CF6, 0 0 30px #8B5CF620'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(168, 85, 247, 0.05)'
              el.style.borderColor = 'rgba(168, 85, 247, 0.3)'
              el.style.boxShadow = '0 0 15px #8B5CF620, 0 0 30px #8B5CF610'
            }}
          >
            <PlatformBadge url={link.url} fallbackEmoji={link.icon} />
            <span className="flex-1 text-white font-medium text-center">{link.title}</span>
            <span style={{ color: '#39FF14', fontSize: '10px' }}>●</span>
          </a>
        ))}
      </div>

      <div className="mt-12">
        <a href="/" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-purple-500 text-xs border border-purple-900/30 hover:border-purple-600/50 transition-colors">
          ✨ Made with Glimr
        </a>
      </div>
    </div>
  )
}

function SoftProfile({ user, links }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12"
      style={{ background: 'linear-gradient(180deg, #FDF4FF 0%, #FFF1F2 30%, #F5F3FF 100%)' }}>
      <div className="w-full max-w-[680px]">
        <div className="bg-white rounded-3xl p-8 mb-6 text-center"
          style={{ boxShadow: '0 4px 30px rgba(236, 72, 153, 0.1)' }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.display_name ?? user.username}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
              style={{ boxShadow: '0 0 20px rgba(236, 72, 153, 0.25)' }} />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #f9a8d4, #c084fc)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.25)',
              }}>
              {(user.display_name ?? user.username)[0].toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{user.display_name ?? user.username}</h1>
          {user.bio && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{user.bio}</p>}
        </div>

        <div className="space-y-3">
          {links.map(link => (
            <a key={link.id}
              href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
              className="flex items-center gap-3 w-full px-5 py-4 bg-white transition-all hover:scale-[1.02]"
              style={{
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                borderRadius: '16px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(236, 72, 153, 0.15)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04)'
              }}
            >
              <PlatformBadge url={link.url} fallbackEmoji={link.icon} />
              <span className="flex-1 text-gray-800 font-medium text-center">{link.title}</span>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-pink-300 text-xs border border-pink-200 hover:border-pink-300 transition-colors bg-white/50">
            ✨ Made with Glimr
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage({ user, links }: Props) {
  const enabledLinks = links.filter(l => l.enabled === 1)

  if (user.theme === 'neon') return <NeonProfile user={user} links={enabledLinks} />
  if (user.theme === 'soft') return <SoftProfile user={user} links={enabledLinks} />
  return <ClassicProfile user={user} links={enabledLinks} />
}
