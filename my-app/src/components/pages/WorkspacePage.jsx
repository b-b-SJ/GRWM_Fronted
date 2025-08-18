import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation, useSearchParams } from 'react-router-dom';
import WorkspaceSidebar from '../layout/WorkspaceSidebar';
import ChatRoom from '../chat/ChatRoom';
import ChatRoomExplorer from '../chat/ChatRoomExplorer';
import { useChatState } from '../../hooks/useChatState';
import { MessageCircle, BookOpen, Eye, EyeOff, Key } from 'lucide-react';

/**
 * WorkSpacePage UI 및 기능
 * - 채팅방 : 채팅방 디테일 페이지, 채팅방 생성 페이지, 탐색 페이지를 관리
 * - 스터디룸 구현 시 위와 같은 페이지 관리
 */

// 채팅방 생성 컴포넌트
const ChatRoomCreator = ({ workspaceMode, onRoomCreated, onCancel }) => {
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

    const categories = ['일반', '프로젝트', '스터디', '취미', '기타'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

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

        if (formData.maxMembers !== 30) {
            setError('최대 인원은 30명으로 고정됩니다.');
            return;
        }

        setIsLoading(true);

        try {
            const userId = 1; // TODO: 실제 사용자 ID로 변경

            const requestData = {
                userId: userId,
                roomName: formData.roomName.trim(),
                category: formData.category,
                description: formData.description.trim(),
                isPrivate: formData.isPrivate,
                password: formData.isPrivate ? formData.password.trim() : null,
                maxMembers: formData.maxMembers
            };

            const response = await fetch('/api/chat-room/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '채팅방 생성에 실패했습니다.');
            }

            const chatRoomId = await response.json();
            console.log('채팅방 생성 성공:', chatRoomId);

            // 성공 시 부모 컴포넌트에 알림
            if (onRoomCreated) {
                onRoomCreated(chatRoomId);
            }

            // 폼 초기화
            setFormData({
                roomName: '',
                category: '일반',
                description: '',
                isPrivate: false,
                password: '',
                maxMembers: 30
            });

            alert('채팅방이 성공적으로 생성되었습니다!');
            // 임의로 이동!!!!!!!!!!
            if (onRoomCreated) {
                onRoomCreated('room1'); // 실제라면 chatRoomId
            }

        } catch (error) {
            console.error('채팅방 생성 오류:', error);
            setError(error.message || '채팅방 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // 에러 메시지 초기화
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
                            rows={2}
                            className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={isLoading}
                            maxLength={50}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/50자
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
                                    placeholder="채팅방 비밀번호를 입력하세요. 비밀번호는 숫자 5개입니다."
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                    maxLength={10}
                                />
                            </div>
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
                                    <span>생성 중...</span>
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

// 채팅방 화면의 컨테이너 관리
const WorkspacePage = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { workspaceSidebarOpen, toggleWorkspaceSidebar } = useOutletContext();

    // URL 쿼리 파라미터로부터 모드 결정
    const modeFromUrl = searchParams.get('mode');
    const [workspaceMode, setWorkspaceMode] = useState(
        modeFromUrl === 'study' ? '스터디룸' : '채팅방'
    );

    const [currentView, setCurrentView] = useState('rooms'); // 'rooms', 'explore', 'create', 'chat'

    const {
        selectedRoom,
        setSelectedRoom,
        chatRooms
    } = useChatState();

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

    // Navigation의 toggleSidebar와 연결하기 위한 useEffect
    useEffect(() => {
        // 전역 이벤트 리스너로 네비게이션의 햄버거 버튼 클릭 감지
        const handleToggleSidebar = () => {
            toggleWorkspaceSidebar();
        };

        // 커스텀 이벤트 리스너 등록
        window.addEventListener('toggleWorkspaceSidebar', handleToggleSidebar);

        return () => {
            window.removeEventListener('toggleWorkspaceSidebar', handleToggleSidebar);
        };
    }, [toggleWorkspaceSidebar]);

    // 채팅방 생성 성공 시 호출되는 함수
    const handleRoomCreated = (chatRoomId) => {
        console.log('새 채팅방 생성됨:', chatRoomId);

        // 새로 생성된 채팅방을 목록에 추가
        // addChatRoom 함수가 useChatState에 있다고 가정

        // 생성 후 채팅방 목록 화면으로 돌아가기
        setCurrentView('rooms');

        // 선택적으로 생성된 채팅방으로 바로 이동
        // setSelectedRoom(chatRoomId);
        // setCurrentView('chat');
    };

    // 채팅방 입장 처리
    const handleJoinRoom = (roomId) => {
        console.log('채팅방 입장:', roomId);
        setSelectedRoom(roomId);
        setCurrentView('chat');
    };

    // 채팅방 생성 취소 시 호출되는 함수
    const handleCreateCancel = () => {
        setCurrentView('rooms');
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* 사이드바 정보 */}
                <WorkspaceSidebar
                    sidebarOpen={workspaceSidebarOpen}
                    toggleSidebar={toggleWorkspaceSidebar}
                    chatRooms={chatRooms}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    workspaceMode={workspaceMode}
                    setWorkspaceMode={setWorkspaceMode}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />

                {/* 오버레이: 사이드바 바깥 클릭 시 닫힘 */}
                {workspaceSidebarOpen && (
                    <div
                        className="fixed inset-0 z-10 bg-black bg-opacity-0"
                        onClick={() => toggleWorkspaceSidebar(false)}
                    />
                )}

                {/* 메인 컨텐츠 컨테이너 */}
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
                            onJoinRoom={handleJoinRoom}
                        />
                    ): selectedRoom ? (
                        <ChatRoom
                            roomId={selectedRoom}
                            chatRooms={chatRooms}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                {isStudyRoom ? (
                                    <BookOpen size={64} className="text-green-400 mx-auto mb-4" />
                                ) : (
                                    <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
                                )}
                                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                                    {isStudyRoom ? '스터디룸을 선택해주세요' : '채팅방을 선택해주세요'}
                                </h2>
                                <p className="text-gray-500">
                                    {isStudyRoom
                                        ? '좌측에서 참여중인 스터디룸을 선택하거나 새로운 스터디룸을 탐색해보세요.'
                                        : '좌측에서 참여중인 채팅방을 선택하거나 새로운 채팅방을 탐색해보세요.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkspacePage;