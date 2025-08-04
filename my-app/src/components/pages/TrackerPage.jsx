import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    BarChart3,
    BookOpen,
    Plus,
    Hash,
    MessageCircle
} from 'lucide-react';
import TrackerSidebar from '../layout/TrackerSidebar';
import DiaryView from '../../components/tracker/DiaryView';

/**
 * 트래커 페이지 - 회고일기 관리
 */
const TrackerPage = () => {
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // URL 쿼리 파라미터로부터 모드 결정
    const modeFromUrl = searchParams.get('mode');
    const [trackerMode, setTrackerMode] = useState(
        modeFromUrl === 'todo' ? 'todo' : 'diary'
    );

    const [currentView, setCurrentView] = useState('diary-calendar');

    // URL 파라미터 변경 감지하여 모드 업데이트
    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'todo') {
            setTrackerMode('todo');
        } else {
            setTrackerMode('diary');
        }
    }, [searchParams]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // To-do 빈 화면
    const TodoEmptyView = () => (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="text-6xl text-gray-200 mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-500 mb-2">To-do 기능</h3>
                <p className="text-gray-400">준비 중입니다</p>
            </div>
        </div>
    );

    // 메시지 뷰
    const DiaryMessageView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">메시지 작성</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                전달 날짜
                            </label>
                            <input
                                type="date"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                메시지
                            </label>
                            <textarea
                                rows={6}
                                placeholder="미래의 나에게 전하고 싶은 말을 적어보세요..."
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                            메시지 예약 전송
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );

    // 해시태그 (임시 페이지. 다른 기능으로 대체 or 삭제)
    const DiaryHashtagView = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">자주 사용한 해시태그</h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        { tag: '#성장', count: 25 },
                        { tag: '#감사', count: 18 },
                        { tag: '#도전', count: 15 },
                        { tag: '#행복', count: 12 },
                        { tag: '#학습', count: 10 },
                        { tag: '#건강', count: 8 }
                    ].map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
              <Hash size={14} className="mr-1" />
                            {item.tag} ({item.count})
            </span>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">감정 분석</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { emotion: '😊 기쁨', count: 45, color: 'yellow' },
                        { emotion: '😌 평온', count: 32, color: 'blue' },
                        { emotion: '😔 슬픔', count: 12, color: 'gray' },
                        { emotion: '😤 분노', count: 5, color: 'red' }
                    ].map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="text-2xl mb-2">{item.emotion}</div>
                            <div className="text-lg font-bold text-gray-800">{item.count}회</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // 현재 뷰의 제목과 설명을 반환하는 함수
    const getCurrentViewInfo = () => {
        if (trackerMode === 'todo') {
            return {
                title: 'To-do',
                description: '할일을 관리하고 진행률을 확인하세요',
                icon: <BarChart3 className="mr-3" size={32} />
            };
        }

        switch (currentView) {
            case 'diary-calendar':
                return {
                    title: '회고일기',
                    description: '하루를 돌아보고 기록하세요',
                    icon: <BookOpen className="mr-3" size={32} />,
                    showButton: true
                };
            case 'diary-message':
                return {
                    title: '내일의 나에게',
                    description: '미래의 나에게 메시지를 전송하세요',
                    icon: <MessageCircle className="mr-3" size={32} />
                };
            case 'diary-hashtag':
                return {
                    title: '해시태그 분석',
                    description: '일기 패턴과 감정을 분석해보세요',
                    icon: <Hash className="mr-3" size={32} />
                };
            default:
                return {
                    title: '회고일기',
                    description: '하루를 돌아보고 기록하세요',
                    icon: <BookOpen className="mr-3" size={32} />,
                    showButton: true
                };
        }
    };

    const renderCurrentView = () => {
        // trackerMode가 'todo'인 경우 빈 화면 표시
        if (trackerMode === 'todo') {
            return <TodoEmptyView />;
        }

        // diary 모드에서의 뷰 렌더링
        switch (currentView) {
            case 'diary-calendar':
                return <DiaryView showHeader={false} />;
            case 'diary-message':
                return <DiaryMessageView />;
            case 'diary-hashtag':
                return <DiaryHashtagView />;
            default:
                return <DiaryView showHeader={false} />;
        }
    };

    const currentViewInfo = getCurrentViewInfo();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 사이드바 */}
            <TrackerSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                trackerMode={trackerMode}
                setTrackerMode={setTrackerMode}
                currentView={currentView}
                setCurrentView={setCurrentView}
            />

            {/* 메인 콘텐츠 */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6">
                    {/* 헤더 */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="lg:hidden mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <BarChart3 size={24} />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                                        {currentViewInfo.icon}
                                        {currentViewInfo.title}
                                    </h1>
                                    <p className="text-gray-600">
                                        {currentViewInfo.description}
                                    </p>
                                </div>
                            </div>

                            {/* 새 일기 작성 버튼 - diary-calendar 뷰에서만 표시 */}
                            {currentViewInfo.showButton && (
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm">
                                    <Plus size={16} />
                                    <span>새 일기 작성</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 현재 뷰 렌더링 */}
                    {renderCurrentView()}
                </div>
            </div>

            {/* 모바일에서 사이드바가 열렸을 때 오버레이 */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
};

export default TrackerPage;