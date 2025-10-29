import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BarChart3, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';

/**
 * MainPage UI
 * - 빠른 액션 메뉴 기능
 * - 로그인한 사용자 환영 메시지 표시
 */
const MainPage = () => {
    const { user } = useAuth();

    const quickActions = [
        { icon: Calendar, label: '플래너', path: '/planner', color: 'from-blue-400 to-cyan-400', description: '일정과 할 일을 관리하세요' },
        { icon: BarChart3, label: '트래커', path: '/tracker?mode=todo', color: 'from-emerald-400 to-teal-400', description: '하루를 기록하세요' },
        { icon: Users, label: '협업공간', path: '/workspace', color: 'from-violet-400 to-purple-400', description: '다른 사용자와 함께 작업하세요' },
        { icon: MessageSquare, label: '커뮤니티', path: '/community', color: 'from-pink-400 to-rose-400', description: '다른 사용자와 소통하세요' }
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* 콘텐츠 래퍼 */}
            <div className="max-w-6xl mx-auto p-6">
                {/* 환영 메시지 */}
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-8 text-white mb-8 shadow-lg animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {user?.username ? `${user.username}님, 환영합니다!` : '환영합니다!'} 👋
                            </h1>
                            <p className="text-blue-100 text-lg">모두ING</p>
                        </div>
                    </div>
                </div>

                {/* 빠른 액션 버튼들 섹션 */}
                <div className="mb-8 animate-fade-in">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">오늘은 어떤 일을 하시나요?</h2>
                    {/* 그리드 레이아웃 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => {
                            const IconComponent = action.icon;
                            return (
                                <Link
                                    key={index}
                                    to={action.path}
                                    className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border hover:border-gray-200 block hover:-translate-y-2"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-md`}>
                                        <IconComponent size={24} className="text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">{action.label}</h3>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default MainPage;