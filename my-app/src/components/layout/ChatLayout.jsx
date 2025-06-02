import React, { useState } from 'react';
import Navigation from './Navigation';
import FixedSidebar from './FixedSidebar';
import Sidebar from './Sidebar';
import ChatRoom from '../chat/ChatRoom';
import WelcomeScreen from '../common/WelcomeScreen';
import { useChatState } from '../../hooks/useChatState';

const ChatLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [workspaceMode, setWorkspaceMode] = useState('채팅방'); // '채팅방' 또는 '스터디룸'
    const {
        selectedRoom,
        setSelectedRoom,
        chatRooms,
        currentUser
    } = useChatState();

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="h-screen flex bg-gray-50">
            {/* 고정 사이드바 */}
            <FixedSidebar currentUser={currentUser} />

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col">
                <Navigation
                    toggleSidebar={toggleSidebar}
                    currentUser={currentUser}
                />

                <div className="flex flex-1 overflow-hidden">
                    <Sidebar
                        sidebarOpen={sidebarOpen}
                        toggleSidebar={toggleSidebar}
                        chatRooms={chatRooms}
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                        workspaceMode={workspaceMode}
                        setWorkspaceMode={setWorkspaceMode}
                    />

                    {/* Overlay for mobile */}
                    {sidebarOpen && (
                        <div
                            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                            onClick={toggleSidebar}
                        />
                    )}

                    {/* 채팅 영역 */}
                    <div className="flex-1 flex flex-col">
                        {selectedRoom ? (
                            <ChatRoom
                                roomId={selectedRoom}
                                chatRooms={chatRooms}
                            />
                        ) : (
                            <WelcomeScreen workspaceMode={workspaceMode} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;