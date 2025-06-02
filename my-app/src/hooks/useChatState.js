import { useState, useEffect } from 'react';

export const useChatState = () => {
    const [selectedRoom, setSelectedRoom] = useState(null);
    // 채팅방 목록 데이터 (실제에서는 API에서 가져올 데이터)
    const [chatRooms, setChatRooms] = useState([
        { id: 1, name: "컴공 정보 공유방", members: 45, isPrivate: false, hasNotification: true, isOwner: true },
        { id: 2, name: "아무거나", members: 12, isPrivate: false, hasNotification: false, isOwner: false },
        { id: 3, name: "졸업 프로젝트", members: 3, isPrivate: true, hasNotification: true, isOwner: false },
    ]);
    const [currentUser, setCurrentUser] = useState({
        id: 'user1',
        username: '나',
        avatar: null
    });

    // 웹소켓 연결 및 실시간 데이터 처리는 여기서
    useEffect(() => {
        // WebSocket 연결 로직
        // 채팅방 목록 fetch
        // 실시간 메시지 수신 처리
    }, []);

    return {
        selectedRoom,
        setSelectedRoom,
        chatRooms,
        setChatRooms,
        currentUser,
        setCurrentUser
    };
};