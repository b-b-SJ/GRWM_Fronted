import React, { useState, useEffect, useRef } from 'react';
import {
    MoreVertical, Bell, BellOff, Users, Pin, LogOut, Edit3, Trash2} from 'lucide-react';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import { useChatState } from '../../hooks/useChatState'; // Context 활용

/**
 * ChatRoom 컴포넌트
 * - 채팅 메시지조회, 전송, 삭제  관리
 * - 채팅방 전체 레이아웃
 * - 채팅방 설정 기능
 */
const ChatRoom = ({ roomId, onBack }) => {
    const {
        chatRooms,
        currentUser,
        messages,
        connectionStatus,
        replyTo,
        setReplyTo,
        sendMessage,
        requestDeleteMessage,
        leaveChatRoom,
        fetchChatRooms,
        joinRoom,
        leaveRoom
    } = useChatState();

    // 채팅방 설정 관련 상태
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const settingsRef = useRef(null);

    const currentRoom = chatRooms.find(room => room.roomId === roomId);
    const roomMessages = messages[roomId] || [];

    // 외부 클릭 시 설정 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 방 입장 및 메시지 로드
    useEffect(() => {
        if (roomId && currentRoom) {
            setLoading(true);
            setError(null);

            try {
                // Context의 joinRoom 함수를 통해 WebSocket 연결 및 메시지 히스토리 요청
                joinRoom(roomId);
                setLoading(false);
            } catch (err) {
                setError('채팅방 연결에 실패했습니다.');
                setLoading(false);
            }
        }

        // 컴포넌트 언마운트 시 방 나가기
        return () => {
            if (roomId) {
                leaveRoom();
            }
        };
    }, [roomId, currentRoom, joinRoom, leaveRoom]);

    // 연결 상태에 따른 로딩 처리
    useEffect(() => {
        if (connectionStatus === 'connected') {
            setLoading(false);
            setError(null);
        } else if (connectionStatus === 'error') {
            setLoading(false);
            setError('서버와의 연결에 문제가 있습니다.');
        }
    }, [connectionStatus]);

    // 채팅방 설정 핸들러들
    const handleNotificationToggle = async () => {
        try {
            // API 호출 - 알림 설정 변경**** 백엔드 추가 필요.
            const response = await fetch(`/api/chat-room/${roomId}/notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    roomId: roomId,
                    enabled: !currentRoom.hasNotification
                })
            });

            if (response.ok) {
                // 채팅방 목록 새로고침
                await fetchChatRooms();
                console.log('알림 설정 변경:', !currentRoom.hasNotification);
            } else {
                throw new Error('알림 설정 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('알림 설정 변경 오류:', error);
            alert('알림 설정을 변경할 수 없습니다.');
        }
        setIsSettingsOpen(false);
    };

    const handleViewParticipants = () => {
        setIsSettingsOpen(false);
        // TODO: 참여자 목록 모달 구현
        // WebSocket에서 실시간 참여자 정보를 받아올 수 있음
        console.log('참여자 목록 보기');
        alert('참여자 목록 기능은 준비 중입니다.');
    };

    const handleSetAnnouncement = async () => {
        const announcement = prompt('공지사항을 입력하세요:');
        if (announcement && announcement.trim()) {
            try {
                // API 호출 - 공지사항 설정
                const response = await fetch(`/api/chat-room/${roomId}/anoouncement`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        roomId: roomId,
                        announcement: announcement.trim()
                    })
                });

                if (response.ok) {
                    console.log('공지사항 설정:', announcement.trim());
                    alert('공지사항이 설정되었습니다.');
                } else {
                    throw new Error('공지사항 설정에 실패했습니다.');
                }
            } catch (error) {
                console.error('공지사항 설정 오류:', error);
                alert('공지사항을 설정할 수 없습니다.');
            }
        }
        setIsSettingsOpen(false);
    };

    const handleLeaveChat = async () => {
        if (window.confirm('채팅방을 나가시겠습니까?')) {
            try {
                // Context의 leaveChatRoom 함수 사용
                await leaveChatRoom(roomId);
                console.log('채팅방 나가기 성공');
                onBack(); // 목록으로 돌아가기
            } catch (error) {
                console.error('채팅방 나가기 실패:', error);
                alert('채팅방을 나갈 수 없습니다.');
            }
            setIsSettingsOpen(false);
        }
    };

    const handleEditChatName = async () => {
        const newName = prompt('새로운 채팅방 이름을 입력하세요:', currentRoom.roomName);
        if (newName && newName.trim() && newName.trim() !== currentRoom.roomName) {
            try {
                // API 호출 - 채팅방 이름 변경
                const response = await fetch(`/api/chat-room/${roomId}/edit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        roomId: roomId,
                        newName: newName.trim()
                    })
                });

                if (response.ok) {
                    console.log('채팅방 이름 변경:', newName.trim());
                    // WebSocket을 통해 room_updated 메시지가 오면 자동으로 목록이 새로고침됨
                    alert('채팅방 이름이 변경되었습니다.');
                } else {
                    throw new Error('채팅방 이름 변경에 실패했습니다.');
                }
            } catch (error) {
                console.error('채팅방 이름 변경 오류:', error);
                alert('채팅방 이름을 변경할 수 없습니다.');
            }
            setIsSettingsOpen(false);
        }
    };

    const handleDeleteChatRoom = async () => {
        if (window.confirm('채팅방을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
            try {
                // API 호출 - 채팅방 삭제
                const response = await fetch(`/api/chat-room/${roomId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        roomId: roomId
                    })
                });

                if (response.ok) {
                    console.log('채팅방 삭제 성공');
                    alert('채팅방이 삭제되었습니다.');
                    onBack(); // 목록으로 돌아가기
                } else {
                    throw new Error('채팅방 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('채팅방 삭제 오류:', error);
                alert('채팅방을 삭제할 수 없습니다.');
            }
            setIsSettingsOpen(false);
        }
    };

    // 메시지 전송 (Context의 sendMessage 사용)
    const handleSendMessage = async (content, replyToId = null) => {
        try {
            await sendMessage(roomId, content, replyToId);
            setReplyTo(null);
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            alert('메시지를 전송할 수 없습니다.');
        }
    };

    // 메시지 삭제 (Context의 requestDeleteMessage 사용)
    const handleDeleteMessage = async (messageId, deleteForEveryone = false) => {
        try {
            await requestDeleteMessage(roomId, messageId);
            console.log('메시지 삭제 요청:', messageId);
        } catch (error) {
            console.error('메시지 삭제 실패:', error);
            alert('메시지를 삭제할 수 없습니다.');
        }
    };

    // 메시지에 답장
    const handleReplyToMessage = (message) => {
        setReplyTo(message);
    };

    // 메시지에 답장 취소
    const handleCancelReply = () => {
        setReplyTo(null);
    };

    // 설정 메뉴 아이템 정의
    const settingsMenuItems = [
        {
            icon: currentRoom?.hasNotification ? BellOff : Bell,
            label: currentRoom?.hasNotification ? '알림 끄기' : '알림 켜기',
            onClick: handleNotificationToggle,
            showForAll: true
        },
        {
            icon: Users,
            label: '참여자 목록',
            onClick: handleViewParticipants,
            showForAll: true
        },
        {
            icon: Pin,
            label: '공지 설정',
            onClick: handleSetAnnouncement,
            showForAll: true
        },
        {
            icon: Edit3,
            label: '채팅방 이름 변경',
            onClick: handleEditChatName,
            showForAll: false,
            ownerOnly: true
        },
        {
            icon: LogOut,
            label: '채팅방 나가기',
            onClick: handleLeaveChat,
            showForAll: true,
            textColor: 'text-red-600'
        },
        {
            icon: Trash2,
            label: '채팅방 삭제',
            onClick: handleDeleteChatRoom,
            showForAll: false,
            ownerOnly: true,
            textColor: 'text-red-600'
        }
    ];

    const filteredMenuItems = settingsMenuItems.filter(item =>
        item.showForAll || (item.ownerOnly && currentRoom?.isOwner)
    );

    // 채팅방이 존재하지 않는 경우
    if (!currentRoom) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">채팅방을 찾을 수 없습니다</h2>
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 로딩 중 처리
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">채팅방에 연결하는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 처리
    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white h-full relative">
            {/* 채팅방 헤더 */}
            <div className="bg-white border-b px-8 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{currentRoom.roomName}</h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <Users size={14}/>
                            <span>{currentRoom.members}명 참여</span>
                            {currentRoom.isPrivate && <span>• 비공개</span>}
                            {currentRoom.isOwner && <span>• 방장</span>}
                            {connectionStatus === 'connected' && <span>• 연결됨</span>}
                            {connectionStatus === 'disconnected' && <span>• 연결 끊김</span>}
                        </div>
                    </div>
                </div>

                {/* 설정 드롭다운 */}
                <div className="relative" ref={settingsRef}>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    >
                        <MoreVertical size={20} className="text-gray-600"/>
                    </button>

                    {/* 설정 드롭다운 메뉴 */}
                    {isSettingsOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            {filteredMenuItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={item.onClick}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                                            item.textColor || 'text-gray-700'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                <ChatMessages
                    messages={roomMessages}
                    onReply={handleReplyToMessage}
                    onDelete={handleDeleteMessage}
                />
            </div>

            {/* 메시지 입력 영역 */}
            <div className="sticky bottom-0 bg-white border-t z-20">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    replyingTo={replyTo}
                    onCancelReply={handleCancelReply}
                />
            </div>
        </div>
    );
};

export default ChatRoom;