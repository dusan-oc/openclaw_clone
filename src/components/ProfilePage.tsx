'use client'

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

function ClassicProfile({ user, links }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12" style={{ background: '#0F0A1A' }}>
      {/* Purple gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-[680px] flex flex-col items-center">
        {/* Avatar */}
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name ?? user.username}
            className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-purple-500/40"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            {(user.display_name ?? user.username)[0].toUpperCase()}
          </div>
        )}

        {/* Name */}
        <h1 className="text-2xl font-bold text-white mb-2">
          {user.display_name ?? user.username}
        </h1>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-400 text-sm text-center mb-8 max-w-sm leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Links */}
        <div className="w-full space-y-3 mt-2">
          {links.map(link => (
            <a
              key={link.id}
              href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
              className="flex items-center gap-3 w-full px-5 py-4 rounded-xl transition-all hover:scale-[1.02] group"
              style={{
                background: '#1A1030',
                border: '1px solid rgba(139, 92, 246, 0.15)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139, 92, 246, 0.6)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.2)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139, 92, 246, 0.15)'
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
              }}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="flex-1 text-white font-medium text-center">{link.title}</span>
            </a>
          ))}
        </div>

        {/* Glimr watermark */}
        <div className="mt-12 text-center">
          <a href="/" className="text-purple-700 text-xs hover:text-purple-500 transition-colors">
            Made with ✨ Glimr
          </a>
        </div>
      </div>
    </div>
  )
}

function NeonProfile({ user, links }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-12" style={{ background: '#000' }}>
      {/* Neon header gradient */}
      <div className="w-full flex justify-center mb-8 pt-10">
        <div className="w-full max-w-[680px]">
          <div className="relative">
            {/* Glow BG */}
            <div className="absolute inset-0 rounded-2xl blur-3xl opacity-30"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }} />

            <div className="relative flex flex-col items-center py-8 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name ?? user.username}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                  style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.4)' }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(236, 72, 153, 0.4)',
                  }}>
                  {(user.display_name ?? user.username)[0].toUpperCase()}
                </div>
              )}

              <h1 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.8)' }}>
                {user.display_name ?? user.username}
              </h1>

              {user.bio && (
                <p className="text-purple-300 text-sm text-center mt-2 max-w-xs leading-relaxed px-4">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="w-full max-w-[680px] space-y-3">
        {links.map(link => (
          <a
            key={link.id}
            href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
            className="flex items-center gap-3 w-full px-5 py-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(139, 92, 246, 0.15)'
              el.style.borderColor = '#EC4899'
              el.style.boxShadow = '0 0 20px rgba(236, 72, 153, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(139, 92, 246, 0.05)'
              el.style.borderColor = 'rgba(139, 92, 246, 0.3)'
              el.style.boxShadow = 'none'
            }}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="flex-1 text-white font-medium text-center">{link.title}</span>
          </a>
        ))}
      </div>

      <div className="mt-12 text-center">
        <a href="/" className="text-purple-800 text-xs hover:text-purple-600 transition-colors">
          Made with ✨ Glimr
        </a>
      </div>
    </div>
  )
}

function SoftProfile({ user, links }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12" style={{ background: '#FDF4FF' }}>
      <div className="w-full max-w-[680px]">
        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 text-center" style={{ boxShadow: '0 4px 30px rgba(236, 72, 153, 0.1)' }}>
          {/* Avatar */}
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name ?? user.username}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-pink-400/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #f9a8d4, #c084fc)',
                boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
              }}>
              {(user.display_name ?? user.username)[0].toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900">
            {user.display_name ?? user.username}
          </h1>

          {user.bio && (
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              {user.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {links.map(link => (
            <a
              key={link.id}
              href={`/api/analytics/click?linkId=${link.id}&url=${encodeURIComponent(link.url)}`}
              className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-white transition-all hover:scale-[1.02]"
              style={{
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                borderLeft: '3px solid transparent',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderLeftColor = '#EC4899'
                el.style.boxShadow = '0 4px 20px rgba(236, 72, 153, 0.15)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderLeftColor = 'transparent'
                el.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.06)'
              }}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="flex-1 text-gray-800 font-medium text-center">{link.title}</span>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="/" className="text-pink-300 text-xs hover:text-pink-500 transition-colors">
            Made with ✨ Glimr
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
