// Cabeçalho padrão usado em todas as páginas internas
// Mantém consistência de tipografia, cor de marca e espaçamento.
export default function PageHeader({ icon: Icon, label, title, subtitle, action }) {
  return (
    <header className="mb-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-blue-600" />
              </div>
            )}
            {label && (
              <p className="text-blue-600 text-[11px] font-semibold uppercase tracking-[0.18em]">
                {label}
              </p>
            )}
          </div>
          <h1 className="text-foreground text-2xl sm:text-3xl font-black leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}