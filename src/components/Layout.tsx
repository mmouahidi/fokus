import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, PlayCircle, Settings, LayoutGrid, BarChart2 } from 'lucide-react'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'
import InstallPrompt from './InstallPrompt'

export default function Layout() {
    const location = useLocation()

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/review', icon: PlayCircle, label: 'Review' },
        { path: '/board', icon: LayoutGrid, label: 'Board' },
        { path: '/analytics', icon: BarChart2, label: 'Analytics' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <main className="pb-20">
                <Outlet />
            </main>

            {/* Keyboard Shortcuts Help */}
            <KeyboardShortcutsHelp />
            <InstallPrompt />

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-t border-white/10 z-[9999]">
                <div className="max-w-md mx-auto flex justify-around py-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${isActive
                                    ? 'text-primary-400'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
