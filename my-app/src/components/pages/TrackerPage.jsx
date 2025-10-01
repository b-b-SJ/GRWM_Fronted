import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    BarChart3,
    BookOpen,
    Plus,
    Hash,
} from 'lucide-react';
import TrackerSidebar from '../layout/TrackerSidebar';
import DiaryView from '../../components/tracker/DiaryView';
import TomorrowMessage from '../../components/tracker/TomorrowMessage';

/**
 * 트래커 페이지 - 회고일기 관리
 */
const TrackerPage = () => {
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [writeMode, setWriteMode] = useState(false);

    // URL 쿼리 파라미터로부터 모드 결정
    const modeFromUrl = searchParams.get('mode');
    const [trackerMode, setTrackerMode] = useState(
        modeFromUrl === 'todo' ? 'todo' : 'diary'
    );

    const [currentView, setCurrentView] = useState('diary-calendar');

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // 새 일기 작성 버튼 클릭 핸들러
    const handleWriteNewDiary = () => {
        setWriteMode(true);
    };

    // URL 파라미터 변경 감지하여 모드 업데이트
    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'todo') {
            setTrackerMode('todo');
        } else {
            setTrackerMode('diary');
        }
    }, [searchParams]);

    // Navigation의 toggleSidebar와 연결하기 위한 useEffect
    useEffect(() => {
        const handleToggleSidebar = () => {
            setSidebarOpen(prev => !prev);
        };

        window.addEventListener('toggleTrackerSidebar', handleToggleSidebar);

        return () => {
            window.removeEventListener('toggleTrackerSidebar', handleToggleSidebar);
        };
    }, []);

    // To-do 빈 화면
    const TodoEmptyView = () => (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <BarChart3 size={64} className="text-blue-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                    To-do 기능 준비 중
                </h2>
                <p className="text-gray-500">
                    곧 할일 관리 기능을 만나보실 수 있습니다.
                </p>
            </div>
        </div>
    );

    // 해시태그 분석 뷰
    const DiaryHashtagView = () => (
        <div className="flex-1 flex flex-col p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            해시태그 분석
                        </h1>
                        <p className="text-gray-600">
                            일기 패턴과 감정을 분석해보세요
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">자주 사용한 해시태그</h3>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { tag: '#공부', count: 15 },
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
        </div>
    );

    // 일기 캘린더 뷰 (DiaryView 래퍼)
    const DiaryCalendarView = () => (
        <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 overflow-auto">
                <DiaryView showHeader={false} writeMode={writeMode} setWriteMode={setWriteMode} />
            </div>
        </div>
    );

    // 내일의 나에게 메시지 뷰 (TomorrowMessage 래퍼)
    const TomorrowMessageView = () => (
        <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 overflow-auto">
                <TomorrowMessage showHeader={false} />
            </div>
        </div>
    );

    const renderCurrentView = () => {
        // trackerMode가 'todo'인 경우 빈 화면 표시
        if (trackerMode === 'todo') {
            return <TodoEmptyView />;
        }

        // diary 모드에서의 뷰 렌더링
        switch (currentView) {
            case 'diary-calendar':
                return <DiaryCalendarView />;
            case 'diary-message':
                return <TomorrowMessageView />;
            case 'diary-hashtag':
                return <DiaryHashtagView />;
            default:
                return <DiaryCalendarView />;
        }
    };

    // 기본 상태일 때 보여줄 화면
    const DefaultView = () => (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <BookOpen size={64} className="text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                    트래커 기능을 선택해주세요
                </h2>
                <p className="text-gray-500">
                    좌측에서 회고일기나 To-do 기능을 선택해보세요.
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* 사이드바 */}
                <TrackerSidebar
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    trackerMode={trackerMode}
                    setTrackerMode={setTrackerMode}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />

                {/* 오버레이: 사이드바 바깥 클릭 시 닫힘 */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-10 bg-black bg-opacity-0"
                        onClick={() => toggleSidebar()}
                    />
                )}

                {/* 메인 컨텐츠 컨테이너 */}
                <div className="flex-1 flex flex-col">
                    {/* 현재 뷰가 선택되지 않은 경우 기본 화면 표시 */}
                    {!currentView && !trackerMode ? (
                        <DefaultView />
                    ) : (
                        renderCurrentView()
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackerPage;