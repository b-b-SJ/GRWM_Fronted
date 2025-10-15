import React, { useState, useRef, useEffect } from 'react';
import { Crown, Reply, Copy, Trash2, MoreHorizontal } from 'lucide-react';

/**
 * ChatMessages 컴포넌트
 * - 채팅 메시지를 목록으로 표시
 * - 메시지 복사, 답장, 삭제 기능 제공
 * - 메시지 마우스 호버 시 메뉴 표시
 * - 시스템 메시지(입장/퇴장) 처리
 * - 5분 기준 삭제 판별
 */
const ChatMessages = ({ messages, onReply, onDelete }) => {
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [showMenuForId, setShowMenuForId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 메시지 내용 복사
    const handleCopyMessage = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            console.log('메시지가 복사되었습니다.');
        } catch (err) {
            console.error('복사 실패:', err);
        }
        setShowMenuForId(null);
    };

    // 답장 기능 처리
    const handleReplyMessage = (message) => {
        onReply(message);
        setShowMenuForId(null);
    };

    // 삭제 기능 처리 - 5분 기준 계산
    const handleDeleteMessage = (messageId, timestamp) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffMinutes = (now - messageTime) / 1000 / 60;

        const canDeleteForEveryone = diffMinutes <= 5;

        console.log('삭제 시도:', {
            messageId,
            timestamp,
            diffMinutes: diffMinutes.toFixed(2),
            canDeleteForEveryone
        });

        onDelete(messageId, canDeleteForEveryone);
        setShowMenuForId(null);
    };

    // 답장 미리보기 내용 자르기
    const formatReplyPreview = (content) => {
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
    };

    // 메시지 시간 포맷
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                console.error('유효하지 않은 시간 형식입니다:', timestamp);
                return '시간 오류';
            }
            const options = { hour: '2-digit', minute: '2-digit', hour12: false };
            return date.toLocaleTimeString('ko-KR', options);
        } catch (e) {
            console.error('시간 변환 오류:', e);
            return '시간 오류';
        }
    };

    // 시스템 메시지 렌더링
    const renderSystemMessage = (msg) => {
        return (
            <div key={msg.id} className="flex justify-center my-3">
                <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">
                    {msg.content}
                </div>
            </div>
        );
    };

    // 일반 사용자 메시지 렌더링
    const renderUserMessage = (msg) => {
        const isMine = msg.isOwn;
        const isDeleted = msg.isDeleted;

        return (
            <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'} relative`}
                onMouseLeave={() => {
                    setHoveredMessageId(null);
                    setShowMenuForId(null);
                }}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
            >
                <div className={`max-w-xs lg:max-w-md ${isMine ? 'order-2' : 'order-1'} relative`}>
                    {/* 답장 메시지 표시 */}
                    {!isDeleted && msg.replyTo && (
                        <div
                            className={`mb-2 px-3 py-2 rounded-lg bg-gray-100 border-l-4 border-gray-400 ${
                                isMine ? 'ml-8' : 'mr-8'
                            }`}
                        >
                            <div className="text-xs text-gray-600 font-medium">
                                {msg.replyTo.sender || '알 수 없음'}
                            </div>
                            <div className="text-sm text-gray-700">
                                {msg.replyTo.isDeleted
                                    ? '삭제된 메시지입니다.'
                                    : formatReplyPreview(msg.replyTo.content || '')}
                            </div>
                        </div>
                    )}

                    {/* 타인의 메시지일 경우 사용자명 + 방장 아이콘 표시 */}
                    {!isMine && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1 px-1">
                            <span>{msg.sender}</span>
                            {msg.isOwner && <Crown size={12} className="text-yellow-500" />}
                        </div>
                    )}

                    {/* 메시지 내용 */}
                    <div
                        className={`px-4 py-2 rounded-2xl ${
                            isDeleted
                                ? 'bg-gray-200 text-gray-500 italic'
                                : isMine
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                        }`}
                    >
                        {msg.content}
                    </div>

                    {/* 시간 표시 */}
                    <div
                        className={`text-xs text-gray-500 mt-1 px-1 ${
                            isMine ? 'text-right' : 'text-left'
                        }`}
                    >
                        {formatTime(msg.timestamp)}
                    </div>

                    {/* 메뉴 버튼 */}
                    {hoveredMessageId === msg.id && !isDeleted && (
                        <button
                            onClick={() =>
                                setShowMenuForId((prev) => (prev === msg.id ? null : msg.id))
                            }
                            className={`absolute top-1/2 -translate-y-1/2 ${
                                isMine ? '-left-10' : '-right-10'
                            } p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors`}
                        >
                            <MoreHorizontal size={14} className="text-gray-600" />
                        </button>
                    )}

                    {/* 드롭다운 메뉴 */}
                    {showMenuForId === msg.id && !isDeleted && (
                        <div
                            className={`absolute top-1/2 -translate-y-1/2 ${
                                isMine ? '-left-[160px]' : '-right-[140px]'
                            } bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]`}
                        >
                            {/* 답장 버튼 */}
                            <button
                                onClick={() => handleReplyMessage(msg)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                <Reply size={14} />
                                <span>답장</span>
                            </button>

                            {/* 복사 버튼 */}
                            <button
                                onClick={() => handleCopyMessage(msg.content)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                <Copy size={14} />
                                <span>복사</span>
                            </button>

                            {/* 삭제 버튼 (본인 메시지에만) */}
                            {isMine && (
                                <button
                                    onClick={() => handleDeleteMessage(msg.id, msg.timestamp)}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                >
                                    <Trash2 size={14} />
                                    <span>삭제</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
                if (msg.type === 'system') {
                    return <div key={msg.id}>{renderSystemMessage(msg)}</div>;
                }
                return <div key={msg.id}>{renderUserMessage(msg)}</div>;
            })}
            <div ref={messagesEndRef}/>
        </div>
    );
};

export default ChatMessages;