import { Home, Film, MessageCircle, Search, Bell, Settings, ShieldAlert, LogOut, Award, Users, Code2, Wallet } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadNotifications: number;
  unreadMessages: number;
  isAdmin: boolean;
  onLogout: () => void;
  theme: 'light' | 'dark' | 'glass';
}

export default function Navbar({
  activeTab,
  setActiveTab,
  unreadNotifications,
  unreadMessages,
  isAdmin,
  onLogout,
  theme
}: NavbarProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, badge: 0 },
    { id: 'shorts', label: 'PulseShorts', icon: Film, badge: 0 },
    { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessages },
    { id: 'search', label: 'Explore', icon: Search, badge: 0 },
    { id: 'communities', label: 'Communities', icon: Users, badge: 0 },
    { id: 'wallet', label: 'Wallet & Pay', icon: Wallet, badge: 0 },
    { id: 'creator', label: 'Creator Hub', icon: Award, badge: 0 },
    { id: 'developer', label: 'Dev Console', icon: Code2, badge: 0 },
    { id: 'notifications', label: 'Activity', icon: Bell, badge: unreadNotifications },
    { id: 'settings', label: 'Settings', icon: Settings, badge: 0 },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Moderate', icon: ShieldAlert, badge: 0 });
  }

  const bgStyle = theme === 'glass'
    ? 'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800/20'
    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800';

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex flex-col fixed left-4 top-4 bottom-4 w-64 rounded-2xl border p-6 transition-colors duration-300 ${bgStyle} shadow-lg z-50`}
      >
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-display font-extrabold text-xl tracking-tight">P</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Pulse
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-desktop-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-gradient-to-b from-pink-500 to-purple-500" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                <span>{tab.label}</span>

                {tab.badge > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
          <button
            id="btn-desktop-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-950/10 transition-all"
          >
            <LogOut className="w-5 h-5 stroke-[1.8px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div 
        id="mobile-navbar"
        className={`md:hidden fixed bottom-4 left-4 right-4 h-16 rounded-2xl border transition-colors duration-300 shadow-xl flex items-center justify-around px-2 z-50 ${bgStyle}`}
      >
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-mobile-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl relative text-zinc-400"
            >
              <Icon 
                className={`w-5 h-5 transition-transform ${
                  isActive 
                    ? 'text-purple-500 stroke-[2.5px] scale-110' 
                    : 'text-zinc-500 dark:text-zinc-400 stroke-[1.8px]'
                }`} 
              />
              {tab.badge > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
        {/* Settings / Profile button on bottom tab for quick access */}
        <button
          id="tab-btn-mobile-settings"
          onClick={() => setActiveTab('settings')}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-zinc-400"
        >
          <Settings 
            className={`w-5 h-5 transition-transform ${
              activeTab === 'settings' 
                ? 'text-purple-500 stroke-[2.5px] scale-110' 
                : 'text-zinc-500 dark:text-zinc-400 stroke-[1.8px]'
            }`} 
          />
        </button>
      </div>
    </>
  );
}
