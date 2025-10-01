import React from 'react';
import { X, Search, Hash, Lock, Crown, MessageCircle, BookOpen, Plus, RefreshCw } from 'lucide-react';

/**
 * 채팅방의 사이드바 컴포넌트
 * - useChatState의 데이터 구조에 맞게 필드명 수정
 * - 로딩 상태 및 새로고침 기능 추가
 * - 채팅방과 스터디룸을 전환할 수 있는 협업공간 사이드바
 */
const WorkspaceSidebar = ({
                              sidebarOpen,
                              toggleSidebar,
                              chatRooms = [],
                              selectedRoom,
                              setSelectedRoom,
                              workspaceMode,
                              setWorkspaceMode,
                              currentView,
                              setCurrentView,
                              isLoadingRooms = false,
                              onRefreshRooms
                          }) => {
    const workspaceModes = [
        { id: '채팅방', label: '채팅방', icon: MessageCircle },
        { id: '스터디룸', label: '스터디룸', icon: BookOpen }
    ];

    return (
        <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
            w-80 bg-white border-r shadow-lg lg:shadow-none
            transition-transform duration-300 ease-in-out
            flex flex-col
        `}>
            {/* 사이드바의 헤더 */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">협업공간</h2>
                    <div className="flex items-center space-x-1">
                        {/* 새로고침 버튼 */}
                        {onRefreshRooms && (
                            <button
                                onClick={onRefreshRooms}
                                disabled={isLoadingRooms}
                                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                                    isLoadingRooms ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                                title="채팅방 목록 새로고침"
                            >
                                <RefreshCw
                                    size={16}
                                    className={isLoadingRooms ? 'animate-spin' : ''}
                                />
                            </button>
                        )}
                        {/* 모바일에서 사이드바 닫기 버튼 */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={18}/>
                        </button>
                    </div>
                </div>

                {/* 워크스페이스 모드 선택 */}
                <div className="mb-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {workspaceModes.map((mode) => {
                            const IconComponent = mode.icon;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setWorkspaceMode(mode.id);
                                        setCurrentView('rooms');
                                        setSelectedRoom(null);
                                    }}
                                    className={`
                                        flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all
                                        ${workspaceMode === mode.id
                                        ? 'bg-white text-blue-600 shadow-sm font-medium'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }
                                    `}
                                >
                                    <IconComponent size={16}/>
                                    <span className="text-sm">{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 채팅방 탐색 및 생성 버튼 */}
                <div className="space-y-2">
                    <button
                        onClick={() => setCurrentView('explore')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <Search size={16}/>
                        <span>{workspaceMode} 탐색</span>
                    </button>

                    <button
                        onClick={() => setCurrentView('create')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <Plus size={16}/>
                        <span>{workspaceMode} 개설하기</span>
                    </button>
                </div>
            </div>

            {/* 참여중인 채팅방/스터디룸 목록 표시 */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {/* 로딩 상태 표시 */}
                    {isLoadingRooms && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2 text-gray-500">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                <span className="text-sm">로딩 중...</span>
                            </div>
                        </div>
                    )}

                    {/* 채팅방이 없는 경우 */}
                    {!isLoadingRooms && chatRooms.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                                {workspaceMode === '채팅방' ? (
                                    <MessageCircle size={24} className="mx-auto" />
                                ) : (
                                    <BookOpen size={24} className="mx-auto" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                                참여중인 {workspaceMode}이 없습니다
                            </p>
                        </div>
                    )}

                    {/* 채팅방 목록 */}
                    {!isLoadingRooms && workspaceMode === '채팅방' && chatRooms.map((room, index) => {
                        // chatRoomId로 통일
                        const chatRoomId = room.chatRoomId || room.id || room.roomId;

                        return (
                            <div
                                key={chatRoomId || `fallback-${index}`}
                                onClick={() => {
                                    if (chatRoomId) {
                                        console.log('Selecting room with chatRoomId:', chatRoomId);
                                        setSelectedRoom(chatRoomId);
                                        setCurrentView('chat');
                                    } else {
                                        console.error('chatRoomId is undefined for room:', room);
                                        console.error('Available room keys:', Object.keys(room));
                                        alert('채팅방 ID를 찾을 수 없습니다. 백엔드 API 응답을 확인해주세요.');
                                    }
                                }}
                                className={`
                                p-3 rounded-lg cursor-pointer transition-colors mb-1
                                ${selectedRoom === chatRoomId
                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                    : 'hover:bg-gray-50'
                                }
                                ${!chatRoomId ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {/* 채팅방 아이콘 및 상태 표시 */}
                                        <div className="flex items-center space-x-1">
                                            {room.isPrivate ? (
                                                <Lock size={14} className="text-gray-500" />
                                            ) : (
                                                <Hash size={14} className="text-gray-500" />
                                            )}
                                            {room.isManager && <Crown size={14} className="text-yellow-500" />}
                                        </div>

                                        {/* 채팅방 정보 표시 */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-800 truncate">
                                                {room.chatRoomName || room.roomName || room.name || '이름 없는 채팅방'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {room.currentMembers || room.members || 0}명 참여중
                                            </p>
                                        </div>
                                    </div>

                                    {/* 알림 표시 */}
                                    {room.hasNotification && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                </div>

                                {/* 채팅방 설명 표시 (있는 경우) */}
                                {room.description && (
                                    <div className="mt-2 pl-8">
                                        <p className="text-xs text-gray-400 truncate">
                                            {room.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* 스터디룸 목록 (예시 데이터, 차후 수정) */}
                    {!isLoadingRooms && workspaceMode === '스터디룸' && [
                        { studyRoomId: '1', name: '코딩테스트 스터디', members: 8, subject: 'Algorithm', status: 'active' },
                        { studyRoomId: '2', name: 'React 프로젝트', members: 5, subject: 'Frontend', status: 'active' },
                    ].map((room) => (
                        <div
                            key={room.studyRoomId}
                            onClick={() => {
                                setSelectedRoom(room.studyRoomId);
                                setCurrentView('chat');
                            }}
                            className={`
                                p-3 rounded-lg cursor-pointer transition-colors mb-1
                                ${selectedRoom === room.studyRoomId
                                ? 'bg-green-50 border-l-4 border-green-600'
                                : 'hover:bg-gray-50'
                            }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <BookOpen size={14} className="text-green-600" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-800 truncate">{room.name}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {room.subject}
                                            </span>
                                            <span className="text-sm text-gray-500">{room.members}명</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${
                                    room.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkspaceSidebar;