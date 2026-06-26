export default function Home() {
  return (
    <div className="relative flex-1 min-h-screen flex items-center justify-center bg-neutral-950 overflow-hidden font-sans select-none">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-950/40 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-950/40 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Glassmorphic Container with Subtle Animation */}
      <div className="relative z-10 px-12 py-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/10 hover:bg-white/[0.03]">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          Hello World
        </h1>
      </div>
    </div>
  );
}

