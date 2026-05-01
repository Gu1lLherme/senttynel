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
      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20">
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer min-w-[56px] ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-blue-50' : ''
                  }`}>
                    <Icon
                      size={20}
                      className={isActive ? 'text-blue-600' : 'text-gray-400'}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
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