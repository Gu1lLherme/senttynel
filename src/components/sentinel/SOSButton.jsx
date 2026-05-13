import { useState } from 'react';

// SOS — paleta SENTINEL: vermelho #A81825, borda inferior 1px #7A1020,
// border-radius 18px, sem sombra elevada genérica.
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

  // Botão agora é “rounded-square” (18px), então o ring/progress segue um square.
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <button
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          aria-label="Botão SOS de emergência — segure por 3 segundos"
          className={`
            relative w-36 h-36 flex flex-col items-center justify-center
            cursor-pointer select-none transition-transform duration-150
            active:scale-[0.97] ${pressing ? 'scale-[0.97] brightness-110' : ''}
          `}
          style={{
            background: '#A81825',
            borderRadius: 18,
            borderBottom: '1px solid #7A1020',
            color: '#FFFFFF',
          }}
        >
          <span className="font-display text-3xl tracking-[0.18em]">SOS</span>
          <span className="text-[11px] font-semibold tracking-[0.18em] mt-1 text-white/85">
            {pressing ? `${Math.round(progress)}%` : 'EMERGÊNCIA'}
          </span>

          {/* Barra de progresso na borda inferior, sem ring elevado */}
          {pressing && (
            <span
              className="absolute left-0 bottom-0 h-[3px]"
              style={{
                width: `${progress}%`,
                background: '#FFFFFF',
                borderBottomLeftRadius: 18,
                borderBottomRightRadius: progress >= 100 ? 18 : 0,
                transition: 'width 100ms linear',
              }}
            />
          )}
        </button>
      </div>
      <p className="text-sm" style={{ color: '#607090' }}>
        {pressing ? 'Aguarde para acionar…' : 'Segure por 3 seg. para acionar'}
      </p>
    </div>
  );
}