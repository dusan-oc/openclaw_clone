import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1a0533 50%, #0a0010 100%)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-8"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
        ✨
      </div>

      <h1 className="text-8xl font-black mb-4"
        style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </h1>

      <p className="text-xl text-white font-semibold mb-2">This page doesn&apos;t exist.</p>
      <p className="text-purple-300 text-sm mb-8 max-w-sm">
        Looking for someone&apos;s page? Double-check the username.
      </p>

      <div className="flex gap-4">
        <Link href="/"
          className="px-6 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
          Go Home
        </Link>
        <Link href="/register"
          className="px-6 py-3 rounded-full text-purple-300 font-semibold border border-purple-500/50 hover:border-purple-400 hover:text-white transition-all">
          Create Your Page
        </Link>
      </div>
    </div>
  )
}
