export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1a0533 50%, #0a0010 100%)' }}>
      {children}
    </div>
  )
}
