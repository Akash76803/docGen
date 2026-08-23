import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Home } from '../pages/Home.tsx';
import { Templates } from '../pages/Templates.tsx';
import { Generate } from '../pages/Generate.tsx';
import { Settings } from '../pages/Settings.tsx';
import { LayoutDashboard, Layers, Play, Settings as SettingsIcon, FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export type AppTheme = 'light' | 'soft' | 'ocean' | 'lavender' | 'forest' | 'dark';
const THEME_KEY = 'document-tool-theme';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    return saved === 'dark' || saved === 'soft' || saved === 'light' || saved === 'ocean' || saved === 'lavender' || saved === 'forest' ? saved : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);



  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'templates':
        return <Templates />;
      case 'generate':
        return <Generate onOpenTemplates={() => setCurrentPage('templates')} />;
      case 'settings':
        return <Settings theme={theme} onThemeChange={setTheme} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="app-sidebar">
        <div>
          <div className="sidebar-header">
            <div className="brand-logo"><FileText size={22} className="logo-svg" /></div>
            {!sidebarCollapsed && <span className="brand-title">DocTool</span>}
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} title={sidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'} aria-label={sidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}>
              {sidebarCollapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>} 
            </button>
          </div>

          <nav className="sidebar-menu">
            <NavButton icon={<LayoutDashboard size={18}/>} label="Dashboard" active={currentPage === 'home'} collapsed={sidebarCollapsed} onClick={() => setCurrentPage('home')}/>
            <NavButton icon={<Layers size={18}/>} label="Templates" active={currentPage === 'templates'} collapsed={sidebarCollapsed} onClick={() => setCurrentPage('templates')}/>
            <NavButton icon={<Play size={18}/>} label="Generate" active={currentPage === 'generate'} collapsed={sidebarCollapsed} onClick={() => setCurrentPage('generate')}/>
            <NavButton icon={<SettingsIcon size={18}/>} label="Settings" active={currentPage === 'settings'} collapsed={sidebarCollapsed} onClick={() => setCurrentPage('settings')}/>
          </nav>
        </div>

        <div className="sidebar-footer">
          {!sidebarCollapsed ? (
            <>
              <label className="sidebar-theme-picker">Theme
                <select value={theme} onChange={(event) => setTheme(event.target.value as AppTheme)}>
                  <option value="light">Light</option>
                  <option value="soft">Soft</option>
                  <option value="ocean">Ocean</option>
                  <option value="lavender">Lavender</option>
                  <option value="forest">Forest</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
              <div className="version-info">Phase 4.3 PDF</div>
            </>
          ) : <div className="version-info">4.3</div>}
        </div>
      </aside>

      <main className="app-main-content"><div className="page-wrapper">{renderPage()}</div></main>
    </div>
  );
}

function NavButton({ icon, label, active, collapsed, onClick }: { icon: ReactNode; label: string; active: boolean; collapsed: boolean; onClick: () => void }) {
  return <button className={`menu-item ${active ? 'active' : ''}`} onClick={onClick} title={collapsed ? label : undefined}>{icon}{!collapsed && <span>{label}</span>}</button>;
}

export { App };
