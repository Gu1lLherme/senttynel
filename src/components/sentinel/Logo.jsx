// Logo SENTINEL — sólido, sem gradientes, paleta Índigo Profundo.
export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { box: 'w-10 h-10', svg: 24, text: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'w-16 h-16', svg: 40, text: 'text-2xl', sub: 'text-xs' },
    lg: { box: 'w-20 h-20', svg: 52, text: 'text-3xl', sub: 'text-sm' },
    xl: { box: 'w-24 h-24', svg: 64, text: 'text-4xl', sub: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${s.box} rounded-2xl flex items-center justify-center`}
        style={{ background: '#1743B8' }}
      >
        <svg
          width={s.svg}
          height={s.svg}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 6 L52 13 V32 C52 44 43 53 32 58 C21 53 12 44 12 32 V13 Z"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M32 18 C26.5 18 22 22.5 22 28 C22 35.5 32 46 32 46 C32 46 42 35.5 42 28 C42 22.5 37.5 18 32 18 Z"
            fill="#FFFFFF"
          />
          <circle cx="32" cy="28" r="3.6" fill="#1743B8" />
        </svg>
      </div>

      {showText && (
        <div className="text-center">
          <h1 className={`${s.text} font-display tracking-tight`} style={{ color: '#0C1A38' }}>
            SENTINEL
          </h1>
          <p className={`${s.sub} font-semibold uppercase tracking-[0.3em] mt-0.5`} style={{ color: '#607090' }}>
            Proteção Inteligente
          </p>
        </div>
      )}
    </div>
  );
}