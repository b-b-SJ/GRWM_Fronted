import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Users } from 'lucide-react';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';

const ChatRoom = ({ roomId, chatRooms, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const currentRoom = chatRooms.find(room => room.id === roomId);

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
                const dummyMessages = [
                    {
                        id: 1,
                        userId: 'user123',
                        username: '김철수',
                        content: '안녕하세요!',
                        timestamp: '오후 2:30',
                        createdAt: new Date(Date.now() - 10 * 60 * 1000),
                        isOwn: false,
                        isOwner: false
                    },
                    {
                        id: 2,
                        userId: 'currentUser',
                        username: '나',
                        content: '안녕하세요! 반갑습니다.',
                        timestamp: '오후 2:31',
                        createdAt: new Date(Date.now() - 2 * 60 * 1000),
                        isOwn: true,
                        isOwner: false
                    }
                ];
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
            // 전체 삭제 - 메시지를 완전히 제거
            setMessages(messages.filter(msg => msg.id !== messageId));
            // TODO: API 호출 - 전체 삭제
            // await deleteMessageForEveryone(messageId);
        } else {
            // 나에게서만 삭제 - 메시지를 "삭제된 메시지입니다"로 변경
            setMessages(messages.map(msg =>
                msg.id === messageId
                    ? { ...msg, content: '삭제된 메시지입니다.', isDeleted: true }
                    : msg
            ));
            // TODO: API 호출 - 개인 삭제
            // await deleteMessageForMe(messageId);
        }
    };

    const handleReplyToMessage = (message) => {
        setReplyingTo(message);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

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
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600"/>
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{currentRoom.name}</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
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
            <div className="overflow-y-scroll" style={{minHeight: '560px', maxHeight: '560px'}}>
                {/* 스크롤이 필요한 컨텐츠 */}
                <div className="flex-1 overflow-y-auto">
                    <ChatMessages
                        messages={messages}
                        onReply={handleReplyToMessage}
                        onDelete={handleDeleteMessage}
                    />
                </div>
                {/* 메시지 영역 */}

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