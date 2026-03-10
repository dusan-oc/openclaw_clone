const PLATFORM_MAP: Record<string, { name: string; color: string; letter: string }> = {
  'instagram.com': { name: 'instagram', color: '#E4405F', letter: 'I' },
  'tiktok.com': { name: 'tiktok', color: '#000000', letter: 'T' },
  'twitter.com': { name: 'twitter', color: '#1DA1F2', letter: 'X' },
  'x.com': { name: 'twitter', color: '#000000', letter: 'X' },
  'youtube.com': { name: 'youtube', color: '#FF0000', letter: 'Y' },
  'onlyfans.com': { name: 'onlyfans', color: '#00AFF0', letter: 'O' },
  'fansly.com': { name: 'fansly', color: '#1FA7F2', letter: 'F' },
  'telegram.me': { name: 'telegram', color: '#26A5E4', letter: 'T' },
  't.me': { name: 'telegram', color: '#26A5E4', letter: 'T' },
  'snapchat.com': { name: 'snapchat', color: '#FFFC00', letter: 'S' },
  'twitch.tv': { name: 'twitch', color: '#9146FF', letter: 'T' },
  'spotify.com': { name: 'spotify', color: '#1DB954', letter: 'S' },
  'patreon.com': { name: 'patreon', color: '#FF424D', letter: 'P' },
}

export function getPlatformIcon(url: string, fallbackEmoji: string): {
  type: 'platform' | 'emoji'
  platform?: string
  color?: string
  letter?: string
  emoji?: string
} {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    for (const [domain, info] of Object.entries(PLATFORM_MAP)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return { type: 'platform', platform: info.name, color: info.color, letter: info.letter }
      }
    }
  } catch {
    // invalid URL
  }
  return { type: 'emoji', emoji: fallbackEmoji }
}
