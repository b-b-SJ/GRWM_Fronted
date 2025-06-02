import React from 'react';
import { Menu, Calendar, BarChart3, Users, MessageSquare, User } from 'lucide-react';

const Navigation = ({ toggleSidebar, currentUser }) => {
    const navItems = [
        { icon: Calendar, label: '플래너', href: '#' },
        { icon: BarChart3, label: '트래커', href: '#' },
        { icon: Users, label: '협업공간', href: '#' },
        { icon: MessageSquare, label: '커뮤니티', href: '#' }
    ];

    return (
        <nav className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800">GRWM</h1>
                </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </a>
                ))}
            </div>

        </nav>
    );
};

export default Navigation;
