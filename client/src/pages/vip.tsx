import { useTheme } from "next-themes"

export default function VipPage() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Gradient Background Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />

        {/* Content */}
        <div className="relative space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            🚀 Exclusive VIP Access Coming Soon!
          </h1>
          
          <p className={`text-lg md:text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          } animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200`}>
            Stay tuned for something special, only for our VIP members. ✨
          </p>

          {/* Optional: Decorative Line */}
          <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300" />
        </div>
      </div>
    </div>
  )
}