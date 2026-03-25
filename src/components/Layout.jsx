import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Map, Users, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/mapa', icon: Map, label: 'Mapa' },
  { path: '/contatos', icon: Users, label: 'Contatos' },
  { path: '/configuracoes', icon: Settings, label: 'Config' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-sm mx-auto relative">
      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-20">
        <div className="glass-card border-t border-white/10 px-2 py-2">
          <div className="flex justify-around items-center">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[56px] ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-primary/20' : ''
                  }`}>
                    <Icon
                      size={20}
                      className={isActive ? 'text-primary' : 'text-muted-foreground'}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}