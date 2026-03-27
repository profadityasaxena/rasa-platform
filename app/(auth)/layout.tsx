export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#C96BCF] tracking-tight">RASA</h1>
          <p className="text-sm text-gray-500 mt-1">Civic Contribution Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
