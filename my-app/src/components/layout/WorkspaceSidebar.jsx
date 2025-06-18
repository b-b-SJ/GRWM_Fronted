//components/layout/WorkspaceSidebar.jsx
import React from 'react';
import { X, Search, Hash, Lock, Crown, MessageCircle, BookOpen, Plus } from 'lucide-react';

/**
 * 채팅방의 사이드바 컴포넌트
 * 채팅방과 스터디룸을 전환할 수 있는 협업공간 사이드바
 */
const WorkspaceSidebar = ({
                     sidebarOpen,
                     toggleSidebar,
                     chatRooms,
                     selectedRoom,
                     setSelectedRoom,
                     workspaceMode,
                     setWorkspaceMode,
                     currentView,
                     setCurrentView
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
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={18}/>
                    </button>
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

                {/* 채팅방, 사이드바 탐색창 화면으로 이동 */}
                <button
                    onClick={() => setCurrentView('explore')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mb-2"
                >
                    <Search size={16}/>
                    <span>{workspaceMode} 탐색</span>
                </button>

                {/* 채팅방, 사이드바 생성 화면으로 이동 */}
                <button
                    onClick={() => setCurrentView('create')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <Plus size={16}/>
                    <span>{workspaceMode} 개설하기</span>
                </button>
            </div>

            {/* 참여중인 채팅방 목록 표시 */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {workspaceMode === '채팅방' ? (
                        // 채팅방 목록 매핑 (수정 필요)
                        chatRooms.map((room) => (
                            <div
                                key={room.roomId}
                                onClick={() => {
                                    setSelectedRoom(room.roomId);
                                    setCurrentView('chat');
                                }}
                                className={`
                  p-3 rounded-lg cursor-pointer transition-colors mb-1
                  ${selectedRoom === room.roomId
                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                    : 'hover:bg-gray-50'
                                }
                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {/* 채팅방이 비공개방일 때, 유저가 방장일 때 아이콘으로 표시 */}
                                        <div className="flex items-center space-x-1">
                                            {room.isPrivate ? (
                                                <Lock size={14} className="text-gray-500" />
                                            ) : (
                                                <Hash size={14} className="text-gray-500" />
                                            )}
                                            {room.isOwner && <Crown size={14} className="text-yellow-500" />}
                                        </div>
                                        {/* 채팅방 정보 표시 */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-800 truncate">{room.roomName}</h3>
                                            <p className="text-sm text-gray-500">{room.members}명 참여중</p>
                                        </div>
                                    </div>
                                    {/* 확인하지 않은 알림이 있는 경우 표시 */}
                                    {room.hasNotification && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        // 스터디룸 목록 (예시 데이터, 차후 수정)
                        [
                            { id: 's1', name: '코딩테스트 스터디', members: 8, subject: 'Algorithm', status: 'active' },
                        ].map((room) => (
                            <div
                                key={room.id}
                                onClick={() => {
                                    setSelectedRoom(room.id);
                                    setCurrentView('chat');
                                }}
                                className={`
                  p-3 rounded-lg cursor-pointer transition-colors mb-1
                  ${selectedRoom === room.id
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkspaceSidebar;