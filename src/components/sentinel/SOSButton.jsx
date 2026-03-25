import { useState } from 'react';

export default function SOSButton({ onActivate }) {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const startPress = () => {
    setPressing(true);
    let p = 0;
    const id = setInterval(() => {
      p += 4;
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setPressing(false);
        setProgress(0);
        onActivate && onActivate();
      }
    }, 100);
    setIntervalId(id);
  };

  const cancelPress = () => {
    if (intervalId) clearInterval(intervalId);
    setPressing(false);
    setProgress(0);
  };

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          pressing
            ? 'shadow-[0_0_60px_rgba(220,38,38,0.6)]'
            : 'shadow-[0_0_30px_rgba(220,38,38,0.35)] sos-pulse'
        }`} />

        {/* Progress ring */}
        {pressing && (
          <svg
            className="absolute inset-0 -rotate-90"
            width="132"
            height="132"
            viewBox="0 0 132 132"
          >
            <circle
              cx="66"
              cy="66"
              r="52"
              fill="none"
              stroke="rgba(220,38,38,0.4)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          </svg>
        )}

        {/* Main button */}
        <button
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          aria-label="Botão SOS de emergência — segure por 3 segundos"
          className={`
            relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700
            flex flex-col items-center justify-center cursor-pointer select-none
            transition-all duration-200 active:scale-95
            ${pressing ? 'scale-95 brightness-110' : 'hover:brightness-110'}
          `}
          style={{
            boxShadow: pressing
              ? '0 0 0 6px rgba(220,38,38,0.2), 0 8px 32px rgba(220,38,38,0.5)'
              : '0 0 0 4px rgba(220,38,38,0.15), 0 8px 24px rgba(220,38,38,0.3)'
          }}
        >
          <span className="text-white font-black text-2xl tracking-widest">SOS</span>
          <span className="text-white/80 text-xs font-semibold tracking-wider">
            {pressing ? `${Math.round(progress)}%` : 'EMERGÊNCIA'}
          </span>
        </button>
      </div>
      <p className="text-muted-foreground text-xs text-center">
        {pressing ? 'Aguarde para acionar…' : 'Segure por 3 seg. para acionar'}
      </p>
    </div>
  );
}