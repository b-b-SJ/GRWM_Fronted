import React, { createContext, useContext, useState } from 'react';

const ChatStateContext = createContext();

export const ChatStateProvider = ({ children }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [currentUser] = useState({
        id: 1,
        username: '김사용자',
        communityNickname: '스터디러버',
        email: 'user@example.com'
    });

    const [chatRooms] = useState([
        {
            id: 'room1',
            name: '프론트엔드 스터디',
            members: 12,
            isPrivate: false,
            isOwner: true,
            hasNotification: true
        },
        {
            id: 'room2',
            name: '알고리즘 문제풀이',
            members: 8,
            isPrivate: false,
            isOwner: false,
            hasNotification: false
        },
        {
            id: 'room3',
            name: '팀 프로젝트',
            members: 4,
            isPrivate: true,
            isOwner: false,
            hasNotification: true
        }
    ]);

    const value = {
        selectedRoom,
        setSelectedRoom,
        chatRooms,
        currentUser
    };

    return (
        <ChatStateContext.Provider value={value}>
            {children}
        </ChatStateContext.Provider>
    );
};

export const useChatState = () => {
    const context = useContext(ChatStateContext);
    if (!context) {
        throw new Error('useChatState must be used within a ChatStateProvider');
    }
    return context;
};