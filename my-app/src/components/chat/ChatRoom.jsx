import React, { useState, useEffect } from 'react';
import { MoreVertical, Users } from 'lucide-react';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';

/**
 * ChatRoom 컴포넌트
 * - 채팅 메시지조회, 전송, 삭제  관리
 * - 채팅방 전체 레이아웃
 */
const ChatRoom = ({ roomId, chatRooms, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const currentRoom = chatRooms.find(room => room.roomId === roomId);

    // 메시지 조회 API - 컴포넌트 마운트 시 & roomId 변경 시 호출
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                setError(null);

                // TODO: API 호출 - 메시지 목록 조회
                // const response = await getMessages(roomId);
                // setMessages(response.data);

                // 임시 더미 데이터 (API 연결 전)
                let dummyMessages = [];

                if (roomId === 'room1') {
                    dummyMessages = [
                        {
                            id: 1,
                            userId: 'user123',
                            username: '농담곰',
                            content: '안녕하세요!',
                            timestamp: '오전 12:30',
                            createdAt: new Date(Date.now() - 10 * 60 * 1000),
                            isOwn: false,
                            isOwner: false
                        },
                    ];
                } else if (roomId === 'room2') {
                    dummyMessages = [
                        {
                            id: 3,
                            userId: 'user456',
                            username: '기린이',
                            content: '다들 소공 시험 잘 보셨나요?',
                            timestamp: '오후 3:00',
                            createdAt: new Date(Date.now() - 15 * 60 * 1000),
                            isOwn: false,
                            isOwner: true
                        },
                        {
                            id: 4,
                            userId: 'currentUser',
                            username: '나',
                            content: 'ㅜㅜ!',
                            timestamp: '오후 3:02',
                            createdAt: new Date(Date.now() - 13 * 60 * 1000),
                            isOwn: true,
                            isOwner: false
                        },
                        {
                            id: 5,
                            userId: 'currentUser',
                            username: '염소',
                            content: '그런 거 물어보지 말아주세요.',
                            timestamp: '오후 3:05',
                            createdAt: new Date(Date.now() - 13 * 60 * 1000),
                            isOwn: false,
                            isOwner: false
                        },
                        {
                            id: 6,
                            userId: 'currentUser',
                            username: '염소',
                            content: '채팅이 많은 경우',
                            timestamp: '오후 3:08',
                            createdAt: new Date(Date.now() - 13 * 60 * 1000),
                            isOwn: false,
                            isOwner: false
                        },
                        {
                            id: 7,
                            userId: 'currentUser',
                            username: '염소',
                            content: '스크롤바가 생기고.',
                            timestamp: '오후 3:05',
                            createdAt: new Date(Date.now() - 13 * 60 * 1000),
                            isOwn: false,
                            isOwner: false
                        },
                        {
                            id: 8,
                            userId: 'currentUser',
                            username: '염소',
                            content: '컨테이너 구역에서 스크롤이 가능합니다.',
                            timestamp: '오후 3:05',
                            createdAt: new Date(Date.now() - 13 * 60 * 1000),
                            isOwn: false,
                            isOwner: false
                        },
                        {
                            id: 9,
                            userId: 'currentUser',
                            username: '기린이',
                            content: '채팅이 많은 환경',
                            timestamp: '오후 3:05',
                            createdAt: new Date(Date.now() - 13 * 60 * 1000),
                            isOwn: false,
                            isOwner: true
                        }
                    ];
                }

                setMessages(dummyMessages);

            } catch (err) {
                setError('메시지를 불러오는데 실패했습니다.');
                console.error('메시지 조회 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            fetchMessages();
        }
    }, [roomId]);


    // 메시지 전송 API 호출
    const handleSendMessage = (content, replyToId = null) => {
        const newMessage = {
            id: messages.length + 1,
            userId: 'currentUser',
            username: '나',
            content: content,
            timestamp: new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            createdAt: new Date(),
            isOwn: true,
            isOwner: false,
            replyTo: replyToId ? messages.find(msg => msg.id === replyToId) : null
        };

        setMessages([...messages, newMessage]);
        setReplyingTo(null);

        // TODO: API 호출 - 메시지 전송
        // await sendMessage({ roomId, content, replyToId });
    };

    // API 연결 시 수정 필요: 메시지 삭제 API 호출
    const handleDeleteMessage = (messageId, deleteForEveryone = false) => {
        if (deleteForEveryone) {
            // 전체 삭제 - 메시지를 "삭제된 메시지입니다"로 변경
            setMessages(messages.map(msg =>
                msg.id === messageId
                    ? { ...msg, content: '삭제된 메시지입니다.', isDeleted: true }
                    : msg
            ));

            // TODO: API 호출 - 전체 삭제
            // await deleteMessageForEveryone(messageId);
        } else {
            // 나에게서만 삭제 - 메시지를 완전히 제거
            setMessages(messages.filter(msg => msg.id !== messageId));
            
            // TODO: API 호출 - 개인 삭제
            // await deleteMessageForMe(messageId);
        }
    };

    // 메시지에 답장
    const handleReplyToMessage = (message) => {
        setReplyingTo(message);
    };

    // 메시지에 답장 취소
    const handleCancelReply = () => {
        setReplyingTo(null);
    };

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
                    <p className="text-gray-600">메시지를 불러오는 중...</p>
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
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={20} className="text-gray-600"/>
                </button>
            </div>

            {/* 메시지 영역 - flex-1로 남은 공간 모두 사용 */}
            <div className="flex-1 overflow-y-auto">
                <ChatMessages
                    messages={messages}
                    onReply={handleReplyToMessage}
                    onDelete={handleDeleteMessage}
                />
            </div>

            {/* 메시지 입력 영역 */}
            <div className="sticky bottom-0 bg-white border-t z-20">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    replyingTo={replyingTo}
                    onCancelReply={handleCancelReply}
                />
            </div>
        </div>
    );
};

export default ChatRoom;