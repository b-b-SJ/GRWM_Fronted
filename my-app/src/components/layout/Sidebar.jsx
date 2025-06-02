import React from 'react';
import { X, Search, Hash, Lock, Crown, MessageCircle, BookOpen } from 'lucide-react';

const Sidebar = ({
                     sidebarOpen,
                     toggleSidebar,
                     chatRooms,
                     selectedRoom,
                     setSelectedRoom,
                     workspaceMode,
                     setWorkspaceMode
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
            {/* Sidebar Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">협업공간</h2>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={18} />
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
                                    onClick={() => setWorkspaceMode(mode.id)}
                                    className={`
                    flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all
                    ${workspaceMode === mode.id
                                        ? 'bg-white text-blue-600 shadow-sm font-medium'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }
                  `}
                                >
                                    <IconComponent size={16} />
                                    <span className="text-sm">{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Search size={16} />
                    <span>{workspaceMode} 탐색</span>
                </button>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {workspaceMode === '채팅방' ? (
                        // 채팅방 목록
                        chatRooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(room.id)}
                                className={`
                  p-3 rounded-lg cursor-pointer transition-colors mb-1
                  ${selectedRoom === room.id
                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                    : 'hover:bg-gray-50'
                                }
                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="flex items-center space-x-1">
                                            {room.isPrivate ? (
                                                <Lock size={14} className="text-gray-500" />
                                            ) : (
                                                <Hash size={14} className="text-gray-500" />
                                            )}
                                            {room.isOwner && <Crown size={14} className="text-yellow-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-800 truncate">{room.name}</h3>
                                            <p className="text-sm text-gray-500">{room.members}명 참여중</p>
                                        </div>
                                    </div>
                                    {room.hasNotification && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        // 스터디룸 목록 (예시 데이터)
                        [
                            { id: 's1', name: '코딩테스트 스터디', members: 8, subject: 'Algorithm', status: 'active' },
                            { id: 's2', name: 'React 심화 학습', members: 12, subject: 'Frontend', status: 'active' },
                            { id: 's3', name: '데이터베이스 기초', members: 15, subject: 'Database', status: 'scheduled' }
                        ].map((room) => (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(room.id)}
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

export default Sidebar;