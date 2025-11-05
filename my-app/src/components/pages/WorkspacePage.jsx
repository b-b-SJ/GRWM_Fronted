import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation, useSearchParams } from 'react-router-dom';
import WorkspaceSidebar from '../layout/WorkspaceSidebar';
import ChatRoom from '../chat/ChatRoom';
import StudyRoom from '../studyroom/StudyRoom';
import StudyRoomCreator from '../studyroom/StudyRoomCreator';
import StudyRoomExplorer from '../studyroom/StudyRoomExplorer';
import ChatRoomExplorer from '../chat/ChatRoomExplorer';
import { useChatState } from '../../hooks/useChatState';
import { useStudyRoomState } from '../../hooks/useStudyRoomState';
import { useAuth } from '../../hooks/AuthContext';
import { MessageCircle, BookOpen, Eye, EyeOff, Key } from 'lucide-react';

/**
 * WorkspacePage - 모드 구분 개선
 * 주요 변경사항:
 * 1. selectedChatRoom과 selectedStudyRoom을 분리하여 타입 안전성 확보
 * 2. 모드 전환 시 선택 상태 자동 초기화
 * 3. 사이드바와의 상호작용 개선
 */

// 채팅방 생성 컴포넌트
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

        if (!user || !user.userId) {
            setError('로그인이 필요합니다.');
            return;
        }

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

            console.log('Chat room creation successful, chatRoomId:', result.chatRoomId);
            setLoadingMessage('채팅방 입장 중...');

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
            }

        } catch (error) {
            console.error('Chat room creation error:', error);
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

// 메인 WorkspacePage 컴포넌트
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

    // 채팅방과 스터디룸 ID를 분리하여 관리
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [selectedStudyRoom, setSelectedStudyRoom] = useState(null);

    const {
        chatRooms,
        isLoadingRooms,
        fetchChatRooms,
        joinRoom,
        joinChatRoom,
        verifyRoomPassword,
        unreadCounts
    } = useChatState();

    const {
        studyRooms,
        joinedStudyRoom,
        loading: isLoadingStudyRooms,
        fetchStudyRooms,
        fetchJoinedStudyRoom,
        joinStudyRoom,
    } = useStudyRoomState();

    // joinedStudyRoom 상태 변경 감지
    useEffect(() => {
        console.log('[WorkspacePage] joinedStudyRoom 상태 변경:', joinedStudyRoom);
    }, [joinedStudyRoom]);

    const isStudyRoom = workspaceMode === '스터디룸';

    // URL 파라미터 변경 감지하여 모드 업데이트
    useEffect(() => {
        const modeParam = searchParams.get('mode');
        const newMode = modeParam === 'study' ? '스터디룸' : '채팅방';

        if (newMode !== workspaceMode) {
            console.log('[WorkspacePage] 모드 전환:', workspaceMode, '->', newMode);
            setWorkspaceMode(newMode);

            // 모드 전환 시 선택 상태 초기화
            setSelectedChatRoom(null);
            setSelectedStudyRoom(null);
            setCurrentView('rooms');
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

    // 초기 데이터 로드
    useEffect(() => {
        console.log('[WorkspacePage] 데이터 로드 - 모드:', workspaceMode);
        if (isStudyRoom) {
            fetchJoinedStudyRoom();
        } else {
            fetchChatRooms();
        }
    }, [isStudyRoom]);

    // 채팅방 생성 성공 시 처리
    const handleChatRoomCreated = (chatRoomId) => {
        console.log('[WorkspacePage] 채팅방 생성 완료:', chatRoomId);

        try {
            joinRoom(chatRoomId);
            setSelectedChatRoom(chatRoomId);
            setSelectedStudyRoom(null); // 다른 모드 ID 클리어
            setCurrentView('chat');
        } catch (error) {
            console.error('[WorkspacePage] 채팅방 입장 실패:', error);
            alert(`채팅방 입장 실패: ${error.message}`);
            setCurrentView('rooms');
        }
    };


// 스터디룸 생성 성공 시 처리
    const handleStudyRoomCreated = async (studyRoomId) => {
        console.log('[WorkspacePage] 스터디룸 생성 완료:', studyRoomId);

        try {
            handleRefreshRooms();
            // joinStudyRoom에서 이미 모든 처리를 했으므로 바로 화면 전환
            setTimeout(() => {
                setSelectedStudyRoom(studyRoomId);
                setSelectedChatRoom(null);
                setCurrentView('study');
            }, 300);
        } catch (error) {
            console.error('[WorkspacePage] 스터디룸 입장 실패:', error);
            alert(`스터디룸 입장 실패: ${error.message}`);
            setCurrentView('rooms');
        }
    };

    // 사이드바에서 방 선택 시 처리 (모드별로 분리)
    const handleSelectRoom = (roomId) => {
        console.log('[WorkspacePage] 방 선택 - 모드:', workspaceMode, 'ID:', roomId);

        try {
            if (isStudyRoom) {
                // 사이드바에서 선택한 방은 이미 참여한 방이므로 API 호출 없이 바로 전환
                setSelectedStudyRoom(roomId);
                setSelectedChatRoom(null);
                setCurrentView('study');
            } else {
                setSelectedChatRoom(roomId);
                setSelectedStudyRoom(null);
                setCurrentView('chat');
            }
        } catch (error) {
            console.error('[WorkspacePage] 방 선택 실패:', error);
            alert(`방 입장 실패: ${error.message}`);
        }
    };

    // 탐색 페이지에서 채팅방 참여
    const handleJoinChatRoomFromExplorer = async (chatRoomId, isPrivate = false, password = null) => {
        console.log('[WorkspacePage] 채팅방 참여 from explorer:', chatRoomId);

        try {
            if (isPrivate && password) {
                await verifyRoomPassword(chatRoomId, password);
            }

            await joinChatRoom(chatRoomId);

            setTimeout(() => {
                setSelectedChatRoom(chatRoomId);
                joinRoom(chatRoomId);
                setSelectedStudyRoom(null);
                setCurrentView('chat');
            }, 300);

        } catch (error) {
            console.error('[WorkspacePage] 채팅방 참여 실패:', error);
            throw error;
        }
    };

    // 탐색 페이지에서 스터디룸 참여
    const handleJoinStudyRoomFromExplorer = async (studyRoomId, isPrivate = false, password = null) => {
        console.log('[WorkspacePage] 스터디룸 참여 from explorer:', studyRoomId);

        try {
            // 이미 참여한 스터디룸인지 확인
            const alreadyJoined = joinedStudyRoom && joinedStudyRoom.studyRoomId === studyRoomId;

            if (alreadyJoined) {
                console.log('[WorkspacePage] 이미 참여한 스터디룸입니다. 바로 입장합니다.');
                // API 호출 없이 바로 화면 전환
                setTimeout(() => {
                    setSelectedStudyRoom(studyRoomId);
                    setSelectedChatRoom(null);
                    setCurrentView('study');
                }, 100);
                return;
            }

            // 새로운 스터디룸에 참여하는 경우에만 joinStudyRoom 호출
            const success = await joinStudyRoom(studyRoomId);

            if (!success) {
                throw new Error('스터디룸 참여에 실패했습니다.');
            }

            console.log('[WorkspacePage] 스터디룸 참여 성공, 목록 갱신');

            // 참여 중인 스터디룸 목록 새로고침
            const updatedRooms = await fetchJoinedStudyRoom();
            console.log('[WorkspacePage] 갱신된 스터디룸 목록:', updatedRooms);

            // 약간 더 긴 지연으로 상태 전파 보장
            setTimeout(() => {
                setSelectedStudyRoom(studyRoomId);
                setSelectedChatRoom(null);
                setCurrentView('study');
            }, 300);

        } catch (error) {
            console.error('[WorkspacePage] 스터디룸 참여 실패:', error);
            alert(`스터디룸 참여 실패: ${error.message}`);
            throw error;
        }
    };

    // 생성 취소
    const handleCreateCancel = () => {
        setCurrentView('rooms');
    };

    // 목록 새로고침
    const handleRefreshRooms = () => {
        console.log('[WorkspacePage] 목록 새로고침 - 모드:', workspaceMode);
        if (isStudyRoom) {
            fetchJoinedStudyRoom();
        } else {
            fetchChatRooms();
        }
    };

    // 방에서 뒤로가기
    const handleBackFromRoom = () => {
        console.log('[WorkspacePage] 방에서 뒤로가기');
        setSelectedChatRoom(null);
        setSelectedStudyRoom(null);
        setCurrentView('rooms');
    };

    // 모드 전환 핸들러
    const handleModeChange = (newMode) => {
        console.log('[WorkspacePage] 모드 수동 전환:', workspaceMode, '->', newMode);

        setWorkspaceMode(newMode);
        setCurrentView('rooms');

        // 선택 상태 초기화
        setSelectedChatRoom(null);
        setSelectedStudyRoom(null);
    };

    // 현재 모드에 따른 방 목록
    const currentRooms = isStudyRoom
        ? (joinedStudyRoom ? [joinedStudyRoom] : [])
        : chatRooms;
    const currentIsLoading = isStudyRoom ? isLoadingStudyRooms : isLoadingRooms;
    const currentSelectedRoom = isStudyRoom ? selectedStudyRoom : selectedChatRoom;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
                {/* 사이드바 */}
                <WorkspaceSidebar
                    sidebarOpen={workspaceSidebarOpen}
                    toggleSidebar={toggleWorkspaceSidebar}
                    chatRooms={chatRooms}
                    joinedStudyRoom={joinedStudyRoom ? [joinedStudyRoom] : []}
                    selectedRoom={currentSelectedRoom}
                    setSelectedRoom={handleSelectRoom}
                    workspaceMode={workspaceMode}
                    setWorkspaceMode={handleModeChange}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    isLoadingRooms={currentIsLoading}
                    onRefreshRooms={handleRefreshRooms}
                    onRefreshStudyRooms={handleRefreshRooms}
                    unreadCounts={unreadCounts}
                />

                {/* 오버레이 */}
                {workspaceSidebarOpen && (
                    <div
                        className="fixed inset-0 z-10 bg-black bg-opacity-0"
                        onClick={() => toggleWorkspaceSidebar(false)}
                    />
                )}

                {/* 메인 컨텐츠 영역 */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {currentView === 'create' ? (
                        isStudyRoom ? (
                            <StudyRoomCreator
                                onRoomCreated={handleStudyRoomCreated}
                                onCancel={handleCreateCancel}
                            />
                        ) : (
                            <ChatRoomCreator
                                workspaceMode={workspaceMode}
                                onRoomCreated={handleChatRoomCreated}
                                onCancel={handleCreateCancel}
                            />
                        )
                    ) : currentView === 'explore' ? (
                        isStudyRoom ? (
                            <StudyRoomExplorer
                                onJoinRoom={handleJoinStudyRoomFromExplorer}
                                joinedRoomIds={joinedStudyRoom ? [joinedStudyRoom.studyRoomId] : []}
                            />
                        ) : (
                            <ChatRoomExplorer
                                workspaceMode={workspaceMode}
                                onJoinRoom={handleJoinChatRoomFromExplorer}
                                joinedRoomIds={chatRooms.map(room => room.chatRoomId)}
                            />
                        )
                    ) : currentView === 'chat' && selectedChatRoom ? (
                        <ChatRoom
                            chatRoomId={selectedChatRoom}
                            chatRooms={chatRooms}
                            onBack={handleBackFromRoom}
                        />
                    ) : currentView === 'study' && selectedStudyRoom ? (
                        <StudyRoom
                            studyRoomId={selectedStudyRoom}
                            onBack={handleBackFromRoom}
                        />
                    ) : (
                        // 기본 화면
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center max-w-md mx-auto px-4">
                                {isStudyRoom ? (
                                    <BookOpen size={64} className="text-green-400 mx-auto mb-4"/>
                                ) : (
                                    <MessageCircle size={64} className="text-gray-400 mx-auto mb-4"/>
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

                                {currentIsLoading && (
                                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm">
                                            {isStudyRoom ? '스터디룸' : '채팅방'} 목록 로딩 중...
                                        </span>
                                    </div>
                                )}

                                {!currentIsLoading && currentRooms.length === 0 && (
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