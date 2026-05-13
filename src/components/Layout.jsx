import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Map, Users, Settings, Baby } from 'lucide-react';

const navItems = [
  { path: '/app', icon: Home, label: 'Home' },
  { path: '/mapa', icon: Map, label: 'Mapa' },
  { path: '/familia', icon: Baby, label: 'Família' },
  { path: '/contatos', icon: Users, label: 'Contatos' },
  { path: '/configuracoes', icon: Settings, label: 'Config' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation — sem fundo no item ativo, apenas cor */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20">
        <div
          className="px-2 py-2"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid #C4D0E5',
            boxShadow: '0 -4px 20px rgba(12,26,56,0.04)',
          }}
        >
          <div className="flex justify-around items-center">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              const color = isActive ? '#1743B8' : '#3A4E72';
              const opacity = isActive ? 1 : 0.35;
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center gap-1 px-4 py-2 cursor-pointer min-w-[56px] transition-opacity"
                  style={{ color, opacity }}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}