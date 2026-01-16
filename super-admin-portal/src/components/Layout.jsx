import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCog,
    FileText,
    Settings,
    Menu,
    X,
    Shield,
    FolderTree,
    ClipboardList,
    History
} from 'lucide-react';
import { clsx } from 'clsx';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={clsx(
            "flex items-center px-4 py-3 mx-3 rounded-xl text-sm font-medium transition-all duration-200",
            active
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
    >
        <Icon className={clsx("h-5 w-5 mr-3", active ? "text-white" : "text-gray-400")} />
        {label}
    </Link>
);

const Layout = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: UserCog, label: 'Admins', to: '/admins' },
        { icon: Users, label: 'Staff', to: '/staff' },
        { icon: FolderTree, label: 'Categories', to: '/categories' },
        { icon: ClipboardList, label: 'Grievances', to: '/grievances' },
        { icon: Users, label: 'Users', to: '/users' },
        { icon: History, label: 'Logs', to: '/logs' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={clsx(
                    "bg-white w-72 shadow-xl fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static border-r border-gray-100",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="h-20 flex items-center justify-center border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Super Admin</h1>
                            <p className="text-xs text-blue-200">Grievance Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 space-y-1">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            icon={item.icon}
                            label={item.label}
                            to={item.to}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 text-center">
                            Grievance Management System
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                            v1.0.0
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white shadow-sm h-16 flex items-center px-6 border-b border-gray-100">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
                    >
                        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-800 capitalize">
                            {location.pathname.replace('/', '') || 'Dashboard'}
                        </h2>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">SA</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/20 z-10"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
