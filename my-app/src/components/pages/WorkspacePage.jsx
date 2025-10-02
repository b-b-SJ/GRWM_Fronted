import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation, useSearchParams } from 'react-router-dom';
import WorkspaceSidebar from '../layout/WorkspaceSidebar';
import ChatRoom from '../chat/ChatRoom';
import ChatRoomExplorer from '../chat/ChatRoomExplorer';
import { useChatState } from '../../hooks/useChatState';
import { useAuth } from '../../hooks/AuthContext';
import { MessageCircle, BookOpen, Eye, EyeOff, Key } from 'lucide-react';

/**
 * WorkspacePage UI 및 기능
 * - useChatState 연동 개선된
 * - useChatState의 새로운 인터페이스에 맞게 업데이트
 * - 채팅방 생성, 참여, 관리 기능 연동
 * - 에러 처리 및 로딩 상태 개선
 */

// 채팅방 생성 컴포넌트 - useChatState 연동 개선
const ChatRoomCreator = ({ workspaceMode, onRoomCreated, onCancel }) => {
    const { user } = useAuth();
    const { createAndJoinRoom, CATEGORY_MAP } = useChatState();

    const [formData, setFormData] = useState({
        roomName: '',
        category: '일반',
        description: '',
        isPrivate: false,
        password: '',
        maxMembers: 30
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');

    const categories = Object.keys(CATEGORY_MAP);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 로그인 체크
        if (!user || !user.userId) {
            setError('로그인이 필요합니다.');
            return;
        }

        // 유효성 검사
        if (!formData.roomName.trim()) {
            setError('채팅방 이름을 입력해주세요.');
            return;
        }

        if (!formData.description.trim()) {
            setError('채팅방 설명을 입력해주세요.');
            return;
        }

        if (formData.isPrivate && !formData.password.trim()) {
            setError('비공개 채팅방은 비밀번호가 필요합니다.');
            return;
        }

        if (formData.isPrivate && formData.password.length !== 5) {
            setError('비밀번호는 5자리여야 합니다.');
            return;
        }

        if (formData.isPrivate && !/^\d{5}$/.test(formData.password)) {
            setError('비밀번호는 5자리 숫자여야 합니다.');
            return;
        }

        setIsLoading(true);

        try {
            setLoadingMessage('채팅방을 생성하고 있습니다...');

            // createAndJoinRoom 사용 (생성 + 참여 + 목록 갱신까지 처리)
            const result = await createAndJoinRoom(formData);

            console.log('Chat room creation and join successful, result:', result);
            console.log('result.chatRoomId:', result.chatRoomId);

            setLoadingMessage('채팅방 입장 중...');

            // 폼 초기화
            setFormData({
                roomName: '',
                category: '일반',
                description: '',
                isPrivate: false,
                password: '',
                maxMembers: 30
            });

            alert('채팅방이 성공적으로 생성되고 입장되었습니다!');

            if (onRoomCreated && result.chatRoomId) {
                onRoomCreated(result.chatRoomId);
            } else {
                console.error('onRoomCreated 호출 실패: chatRoomId가 없습니다');
            }

        } catch (error) {
            console.error('Chat room creation and join error:', error);
            setError(error.message || '채팅방 생성 및 입장 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (error) {
            setError('');
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            새 {workspaceMode} 만들기
                        </h1>
                    </div>
                </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* 로딩 메시지 */}
            {loadingMessage && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-700 text-sm">{loadingMessage}</p>
                    </div>
                </div>
            )}

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 채팅방 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {workspaceMode} 이름 *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.roomName}
                            onChange={(e) => handleChange('roomName', e.target.value)}
                            placeholder="채팅방 이름을 입력하세요 (예: 자유 토론방)"
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                            maxLength={50}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.roomName.length}/50자
                        </p>
                    </div>

                    {/* 카테고리 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            카테고리 *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* 채팅방 설명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            채팅방 설명 *
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="채팅방에 대한 간단한 설명을 입력하세요"
                            rows={3}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={isLoading}
                            maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/200자
                        </p>
                    </div>

                    {/* 공개/비공개 설정 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            공개 설정 *
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <input
                                    type="radio"
                                    id="public"
                                    name="privacy"
                                    checked={!formData.isPrivate}
                                    onChange={() => handleChange('isPrivate', false)}
                                    className="mr-3 mt-1"
                                    disabled={isLoading}
                                />
                                <label htmlFor="public" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Eye size={16} className="text-gray-500" />
                                        <span className="font-medium">공개 채팅방</span>
                                    </div>
                                    <p className="text-sm text-gray-600">누구나 참여할 수 있습니다</p>
                                </label>
                            </div>
                            <div className="flex items-start">
                                <input
                                    type="radio"
                                    id="private"
                                    name="privacy"
                                    checked={formData.isPrivate}
                                    onChange={() => handleChange('isPrivate', true)}
                                    className="mr-3 mt-1"
                                    disabled={isLoading}
                                />
                                <label htmlFor="private" className="flex-1 cursor-pointer">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <EyeOff size={16} className="text-gray-500" />
                                        <span className="font-medium">비공개 채팅방</span>
                                    </div>
                                    <p className="text-sm text-gray-600">비밀번호를 알아야 참여할 수 있습니다</p>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 비밀번호 (비공개일 때만) */}
                    {formData.isPrivate && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                비밀번호 *
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="5자리 숫자를 입력하세요"
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                    maxLength={5}
                                    pattern="[0-9]{5}"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                비밀번호는 5자리 숫자여야 합니다. ({formData.password.length}/5자)
                            </p>
                        </div>
                    )}

                    {/* 생성 버튼 */}
                    <div className="pt-4 flex space-x-3">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`
                                flex-1 py-3 px-6 rounded-lg font-medium transition-colors
                                ${isLoading
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }
                            `}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>처리 중...</span>
                                </div>
                            ) : (
                                `${workspaceMode} 생성하기`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 메인 WorkspacePage 컴포넌트 - useChatState 연동 개선
const WorkspacePage = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { workspaceSidebarOpen, toggleWorkspaceSidebar } = useOutletContext();

    // URL 쿼리 파라미터로부터 모드 결정
    const modeFromUrl = searchParams.get('mode');
    const [workspaceMode, setWorkspaceMode] = useState(
        modeFromUrl === 'study' ? '스터디룸' : '채팅방'
    );

    const [currentView, setCurrentView] = useState('rooms');

    // useChatState 훅 사용
    const {
        chatRooms,
        isLoadingRooms,
        fetchChatRooms,
        joinRoom,
        joinChatRoom,
        verifyRoomPassword
    } = useChatState();

    // 선택된 채팅방 상태를 로컬에서 관리 (테스트용)
    const [selectedRoom, setSelectedRoom] = useState(null);

    const isStudyRoom = workspaceMode === '스터디룸';

    // URL 파라미터 변경 감지하여 모드 업데이트
    useEffect(() => {
        const modeParam = searchParams.get('mode');
        if (modeParam === 'study') {
            setWorkspaceMode('스터디룸');
        } else {
            setWorkspaceMode('채팅방');
        }
    }, [searchParams]);

    // Navigation의 toggleSidebar와 연결
    useEffect(() => {
        const handleToggleSidebar = () => {
            toggleWorkspaceSidebar();
        };

        window.addEventListener('toggleWorkspaceSidebar', handleToggleSidebar);

        return () => {
            window.removeEventListener('toggleWorkspaceSidebar', handleToggleSidebar);
        };
    }, [toggleWorkspaceSidebar]);

    // 채팅방 생성 성공 시 처리 - createAndJoinRoom이 모든 것을 처리하므로 단순화
    const handleRoomCreated = (chatRoomId) => {
        console.log('Chat room creation completed, entering room:', chatRoomId);

        // 생성한 채팅방은 무조건 방장으로 표시. (임시)
        const createdRoom = {
            chatRoomId: chatRoomId,
            isManager: true, // 임시로 방장 표시
        };

        // WebSocket 연결만 수행
        try {
            joinRoom(chatRoomId);
            setCurrentView('chat');
            console.log('Successfully entered created room:', chatRoomId);
        } catch (error) {
            console.error('Failed to enter created room:', error);
            alert(`채팅방 입장 실패: ${error.message}`);
            setCurrentView('rooms');
        }
    };

    // 사이드바에서 채팅방 선택 시 처리 - 단순화
    const handleSelectRoom = (roomId) => {
        console.log('Selecting room from sidebar:', roomId);

        try {
            setSelectedRoom(roomId); // 선택된 방 설정
            setCurrentView('chat');
        } catch (error) {
            console.error('Room selection error:', error);
            alert(`채팅방 입장 실패: ${error.message}`);
        }
    };

    // 탐색 페이지에서 채팅방 참여 처리
    const handleJoinRoomFromExplorer = async (chatRoomId, isPrivate = false, password = null) => {
        console.log('Joining room from explorer:', chatRoomId, { isPrivate, hasPassword: !!password });

        try {
            // 1. 비공개 채팅방인 경우 비밀번호 검증
            if (isPrivate && password) {
                console.log('Verifying password for private room');
                await verifyRoomPassword(chatRoomId, password);
                console.log('Password verification successful');
            }

            // 2. 채팅방 참여 API 호출
            console.log('Calling JOIN API...');
            await joinChatRoom(chatRoomId);
            console.log('JOIN API successful');

            // 3. WebSocket 연결 및 화면 전환
            setTimeout(() => {
                joinRoom(chatRoomId);
                setCurrentView('chat');
                console.log('Successfully joined room from explorer:', chatRoomId);
            }, 500);

        } catch (error) {
            console.error('Failed to join room from explorer:', error);
            throw error; // ChatRoomExplorer에서 에러 처리
        }
    };

    // 채팅방 생성 취소
    const handleCreateCancel = () => {
        setCurrentView('rooms');
    };

    // 채팅방 목록 새로고침
    const handleRefreshRooms = () => {
        fetchChatRooms();
    };

    // 채팅방에서 뒤로가기
    const handleBackFromChat = () => {
        setSelectedRoom(null); // 선택된 방 초기화
        setCurrentView('rooms');
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* 사이드바 */}
                <WorkspaceSidebar
                    sidebarOpen={workspaceSidebarOpen}
                    toggleSidebar={toggleWorkspaceSidebar}
                    chatRooms={chatRooms}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={handleSelectRoom}
                    workspaceMode={workspaceMode}
                    setWorkspaceMode={setWorkspaceMode}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    isLoadingRooms={isLoadingRooms}
                    onRefreshRooms={handleRefreshRooms}
                />

                {/* 오버레이: 사이드바 바깥 클릭 시 닫힘 */}
                {workspaceSidebarOpen && (
                    <div
                        className="fixed inset-0 z-10 bg-black bg-opacity-0"
                        onClick={() => toggleWorkspaceSidebar(false)}
                    />
                )}

                {/* 메인 컨텐츠 영역 */}
                <div className="flex-1 flex flex-col">
                    {currentView === 'create' ? (
                        <ChatRoomCreator
                            workspaceMode={workspaceMode}
                            onRoomCreated={handleRoomCreated}
                            onCancel={handleCreateCancel}
                        />
                    ) : currentView === 'explore' ? (
                        <ChatRoomExplorer
                            workspaceMode={workspaceMode}
                            onJoinRoom={handleJoinRoomFromExplorer}
                            joinedRoomIds={chatRooms.map(room => room.chatRoomId)}
                        />
                    ) : selectedRoom ? (
                        <ChatRoom
                            chatRoomId={selectedRoom}
                            chatRooms={chatRooms}
                            onBack={handleBackFromChat}
                        />
                    ) : (
                        // 기본 화면: 채팅방/스터디룸 선택 안내
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center max-w-md mx-auto px-4">
                                {isStudyRoom ? (
                                    <BookOpen size={64} className="text-green-400 mx-auto mb-4" />
                                ) : (
                                    <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
                                )}
                                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                                    {isStudyRoom ? '스터디룸을 선택해주세요' : '채팅방을 선택해주세요'}
                                </h2>
                                <p className="text-gray-500 mb-4">
                                    {isStudyRoom
                                        ? '좌측에서 참여중인 스터디룸을 선택하거나 새로운 스터디룸을 탐색해보세요.'
                                        : '좌측에서 참여중인 채팅방을 선택하거나 새로운 채팅방을 탐색해보세요.'
                                    }
                                </p>

                                {/* 로딩 상태 표시 */}
                                {isLoadingRooms && (
                                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm">채팅방 목록 로딩 중...</span>
                                    </div>
                                )}

                                {/* 채팅방이 없는 경우 */}
                                {!isLoadingRooms && chatRooms.length === 0 && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 text-sm mb-3">
                                            참여중인 {isStudyRoom ? '스터디룸' : '채팅방'}이 없습니다.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkspacePage;