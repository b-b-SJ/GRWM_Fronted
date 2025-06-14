import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import ChatRoom from '../chat/ChatRoom';
import { useChatState } from '../../hooks/useChatState';
import { MessageCircle, BookOpen } from 'lucide-react';

const WorkspacePage = () => {
    const [workspaceMode, setWorkspaceMode] = useState('채팅방'); // '채팅방' 또는 '스터디룸'

    const { workspaceSidebarOpen, toggleWorkspaceSidebar } = useOutletContext();

    const {
        selectedRoom,
        setSelectedRoom,
        chatRooms
    } = useChatState();

    const isStudyRoom = workspaceMode === '스터디룸';

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    sidebarOpen={workspaceSidebarOpen}
                    toggleSidebar={toggleWorkspaceSidebar}
                    chatRooms={chatRooms}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    workspaceMode={workspaceMode}
                    setWorkspaceMode={setWorkspaceMode}
                />

                {/* Overlay for mobile */}
                {workspaceSidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                        onClick={toggleWorkspaceSidebar}
                    />
                )}

                {/* 채팅 or Welcome 메시지 */}
                <div className="flex-1 flex flex-col">
                    {selectedRoom ? (
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
