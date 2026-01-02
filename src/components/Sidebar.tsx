import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, ClipboardCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const navItems = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/projects', label: 'Projects', icon: FolderKanban },
    ];

    return (
        <div className="h-screen w-64 bg-gradient-to-b from-purple-50 to-blue-50 border-r border-purple-100 flex flex-col shadow-lg">
            <div className="p-6 border-b border-purple-100">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                        <ClipboardCheck className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        TestManager
                    </h1>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-white/50 hover:shadow-md"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "drop-shadow-md")} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-purple-100 bg-white/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                            {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    onClick={logout}
                >
                    <LogOut size={16} />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;

