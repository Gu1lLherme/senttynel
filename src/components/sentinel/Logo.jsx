const LOGO_URL = 'https://media.base44.com/images/public/69c47181374dcefd655136e4/9157f22b8_generated_image.png';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { box: 'w-10 h-10', text: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' },
    lg: { box: 'w-24 h-24', text: 'text-4xl', sub: 'text-sm' },
    xl: { box: 'w-32 h-32', text: 'text-5xl', sub: 'text-base' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow rings */}
        <div className="absolute inset-0 rounded-3xl bg-blue-500/25 blur-2xl scale-110" />
        <div className="absolute inset-0 rounded-3xl bg-blue-400/15 blur-xl scale-105" />

        {/* Logo image */}
        <img
          src={LOGO_URL}
          alt="SENTINEL"
          className={`${s.box} relative rounded-3xl object-cover shadow-2xl`}
          style={{
            boxShadow: '0 0 0 4px rgba(59,130,246,0.15), 0 12px 40px rgba(59,130,246,0.4)'
          }}
        />
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