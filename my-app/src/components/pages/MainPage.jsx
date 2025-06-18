import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BarChart3, Users, MessageSquare} from 'lucide-react';

/**
 * MainPage UI
 * - 빠른 액션 메뉴 기능
 * - 이후 회원가입, 로그인 버튼 추가
 */
const MainPage = () => {
    const quickActions = [
        { icon: Calendar, label: '플래너', path: '/planner', color: 'from-blue-500 to-blue-600', description: '일정과 할 일을 관리하세요' },
        { icon: BarChart3, label: '트래커', path: '/tracker', color: 'from-green-500 to-green-600', description: '하루를 기록하세요' },
        { icon: Users, label: '협업공간', path: '/workspace', color: 'from-purple-500 to-purple-600', description: '다른 사용자와 함께 작업하세요' },
        { icon: MessageSquare, label: '커뮤니티', path: '/community', color: 'from-pink-500 to-pink-600', description: '다른 사용자와 소통하세요' }
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            {/* 콘텐츠 래퍼 */}
            <div className="max-w-6xl mx-auto p-6">
                {/* 환영 메시지 */}
                <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-sky-200 rounded-2xl p-8 text-white mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">안녕하세요! 👋</h1>
                            <p className="text-blue-100 text-lg">GRWM</p>
                        </div>
                    </div>
                </div>

                {/* 빠른 액션 버튼들 섹션 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">오늘은 어떤 일을 하시나요?</h2>
                    {/* 그리드 레이아웃 - 반응형 디자인 적용 : 모바일 1열, 패드 2열, 데스크톱 4열 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* quickActions 배열을 순회하며 각 액션 버튼 생성 */}
                        {quickActions.map((action, index) => {
                            const IconComponent = action.icon;
                            return (
                                // React Router의 Link 컴포넌트로 페이지 이동 처리
                                <Link
                                    key={index}  // 리스트 렌더링을 위한 고유 키
                                    to={action.path} // 이동할 경로
                                    className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border hover:border-gray-200 block"
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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
        </div>
    );
};

export default MainPage;
