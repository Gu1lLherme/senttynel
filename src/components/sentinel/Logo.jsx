import { Shield } from 'lucide-react';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { box: 'w-10 h-10', icon: 18, text: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'w-16 h-16', icon: 28, text: 'text-2xl', sub: 'text-xs' },
    lg: { box: 'w-24 h-24', icon: 44, text: 'text-4xl', sub: 'text-sm' },
    xl: { box: 'w-32 h-32', icon: 60, text: 'text-5xl', sub: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow rings */}
        <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl scale-110" />
        <div className="absolute inset-0 rounded-3xl bg-red-500/15 blur-xl scale-105" />

        {/* Logo box */}
        <div
          className={`${s.box} relative rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-2xl`}
          style={{
            boxShadow: '0 0 0 4px rgba(59,130,246,0.15), 0 12px 40px rgba(59,130,246,0.4), inset 0 -4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Shield size={s.icon} className="text-white drop-shadow-lg" strokeWidth={2.5} />
          {/* Red accent dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
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