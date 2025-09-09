import React, { useState, useRef, useEffect } from 'react';
import { Crown, Reply, Copy, Trash2, MoreHorizontal } from 'lucide-react';

/**
 * ChatMessages 컴포넌트
 * - 채팅 메시지를 목록으로 표시
 * - 메시지 복사, 답장, 삭제 기능 제공
 * - 메시지 마우스 호버 시 메뉴 표시
 * - 시스템 메시지(입장/퇴장) 처리
 */
const ChatMessages = ({ messages, onReply, onDelete }) => {
    // 마우스를 올린 메시지 ID 추적
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    // 드롭다운 메뉴가 열려 있는 메시지 ID 추적
    const [showMenuForId, setShowMenuForId] = useState(null);
    // 채팅창 하단으로 자동 스크롤을 위한 ref
    const messagesEndRef = useRef(null);

    // 메시지 목록이 업데이트될 때마다 맨 아래로 스크롤
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

    // 삭제 기능 처리 (조건: 전체 삭제 가능 여부)
    const handleDeleteMessage = (message, canDeleteForEveryone) => {
        if (canDeleteForEveryone) {
            const confirmDelete = window.confirm('모든 사용자에게서 이 메시지를 삭제하시겠습니까?');
            if (confirmDelete) {
                onDelete(message, true);
            }
        } else {
            const confirmDelete = window.confirm('나에게서만 이 메시지를 삭제하시겠습니까?');
            if (confirmDelete) {
                onDelete(message, false);
            }
        }
        setShowMenuForId(null);
    };

    // 본인 메시지이고 5분 이내면 전체 삭제 가능
    const canDeleteForEveryone = (message) => {
        if (!message.isOwn) return false;

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const messageDate = new Date(message.createdAt); // 문자열 -> Date 객체 변환

        return messageDate > fiveMinutesAgo;
    };

    // 답장 미리보기 내용 자르기
    const formatReplyPreview = (content) => {
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
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
        return (
            <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} relative`}
                onMouseLeave={() => {
                    setHoveredMessageId(null);
                    setShowMenuForId(null);
                }}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
            >
                <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'order-2' : 'order-1'} relative`}>
                    {/* 답장 메시지 표시 */}
                    {msg.replyTo && (
                        <div
                            className={`mb-2 px-3 py-2 rounded-lg bg-gray-100 border-l-4 border-gray-400 ${
                                msg.isOwn ? 'ml-8' : 'mr-8'
                            }`}
                        >
                            <div className="text-xs text-gray-600 font-medium">{msg.replyTo.username}</div>
                            <div className="text-sm text-gray-700">{formatReplyPreview(msg.replyTo.content)}</div>
                        </div>
                    )}

                    {/* 타인의 메시지일 경우 사용자명 + 방장 아이콘 표시 */}
                    {!msg.isOwn && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1 px-1">
                            <span>{msg.username}</span>
                            {msg.isOwner && <Crown size={12} className="text-yellow-500" />}
                        </div>
                    )}

                    {/* 메시지 내용 */}
                    <div
                        className={`px-4 py-2 rounded-2xl ${
                            msg.isDeleted
                                ? 'bg-gray-200 text-gray-500 italic'
                                : msg.isOwn
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {msg.content}
                    </div>

                    {/* 시간 표시 */}
                    <div
                        className={`text-xs text-gray-500 mt-1 px-1 ${
                            msg.isOwn ? 'text-right' : 'text-left'
                        }`}
                    >
                        {msg.timestamp}
                    </div>

                    {/* 메뉴 버튼 */}
                    {hoveredMessageId === msg.id && !msg.isDeleted && (
                        <button
                            onClick={() =>
                                setShowMenuForId((prev) => (prev === msg.id ? null : msg.id))
                            }
                            className={`absolute top-1/2 -translate-y-1/2 ${
                                msg.isOwn ? '-left-10' : '-right-10'
                            } p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors`}
                        >
                            <MoreHorizontal size={14} className="text-gray-600" />
                        </button>
                    )}

                    {/* 드롭다운 메뉴 (복사, 답장, 삭제) */}
                    {showMenuForId === msg.id && !msg.isDeleted && (
                        <div
                            className={`absolute top-1/2 -translate-y-1/2 ${
                                msg.isOwn ? '-left-[200px]' : '-right-[180px]'
                            } bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]`}
                        >
                            {/* 타인 메시지 메뉴 */}
                            {!msg.isOwn && (
                                <>
                                    <button
                                        onClick={() => handleReplyMessage(msg)}
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        <Reply size={14} />
                                        <span>답장</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopyMessage(msg.content)}
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        <Copy size={14} />
                                        <span>복사</span>
                                    </button>
                                </>
                            )}

                            {/* 본인 메시지 메뉴 */}
                            {msg.isOwn && (
                                <>
                                    <button
                                        onClick={() =>
                                            handleDeleteMessage(msg.id, canDeleteForEveryone(msg))
                                        }
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                    >
                                        <Trash2 size={14} />
                                        <span>
                                            {canDeleteForEveryone(msg)
                                                ? '모두에게서 삭제'
                                                : '나에게서만 삭제'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => handleCopyMessage(msg.content)}
                                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                        <Copy size={14} />
                                        <span>복사</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 메시지 목록 렌더링 */}
            {messages.map((msg) => {
                // 시스템 메시지인지 확인
                if (msg.type === 'system') {
                    return renderSystemMessage(msg);
                }

                // 일반 사용자 메시지
                return renderUserMessage(msg);
            })}
            {/* 항상 하단 스크롤 유지를 위한 요소 */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;