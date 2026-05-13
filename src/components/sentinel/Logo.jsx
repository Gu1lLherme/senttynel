export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { box: 'w-10 h-10', svg: 28, text: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'w-16 h-16', svg: 44, text: 'text-2xl', sub: 'text-xs' },
    lg: { box: 'w-24 h-24', svg: 64, text: 'text-4xl', sub: 'text-sm' },
    xl: { box: 'w-32 h-32', svg: 88, text: 'text-5xl', sub: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow rings */}
        <div className="absolute inset-0 rounded-3xl bg-blue-500/25 blur-2xl scale-110" />
        <div className="absolute inset-0 rounded-3xl bg-blue-400/15 blur-xl scale-105" />

        {/* Logo box: blue shield with white location pin */}
        <div
          className={`${s.box} relative rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 flex items-center justify-center shadow-2xl overflow-hidden`}
          style={{
            boxShadow: '0 0 0 4px rgba(59,130,246,0.15), 0 12px 40px rgba(59,130,246,0.4), inset 0 -4px 12px rgba(0,0,0,0.18)'
          }}
        >
          {/* Subtle inner highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

          <svg
            width={s.svg}
            height={s.svg}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative drop-shadow-lg"
          >
            {/* Shield outline (white) */}
            <path
              d="M32 6 L52 13 V32 C52 44 43 53 32 58 C21 53 12 44 12 32 V13 Z"
              stroke="white"
              strokeWidth="3"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Location pin (white, solid) inside the shield */}
            <path
              d="M32 18 C26.5 18 22 22.5 22 28 C22 35.5 32 46 32 46 C32 46 42 35.5 42 28 C42 22.5 37.5 18 32 18 Z"
              fill="white"
            />
            {/* Pin hole (blue, matches gradient mid) */}
            <circle cx="32" cy="28" r="3.6" fill="#2563eb" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="text-center">
          <h1 className={`${s.text} font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 bg-clip-text text-transparent`}>
            SENTINEL
          </h1>
          <p className={`${s.sub} font-semibold uppercase tracking-[0.3em] text-muted-foreground mt-0.5`}>
            Proteção Inteligente
          </p>
        </div>
      )}
    </div>
  );
}