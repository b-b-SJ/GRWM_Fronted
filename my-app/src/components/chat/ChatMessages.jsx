import React, { useState, useRef, useEffect } from 'react';
import { Crown, Reply, Copy, Trash2, MoreHorizontal } from 'lucide-react';

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

    const handleCopyMessage = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            console.log('메시지가 복사되었습니다.');
        } catch (err) {
            console.error('복사 실패:', err);
        }
        setShowMenuForId(null);
    };

    const handleReplyMessage = (message) => {
        onReply(message);
        setShowMenuForId(null);
    };

    const handleDeleteMessage = (messageId, canDeleteForEveryone) => {
        if (canDeleteForEveryone) {
            const confirmDelete = window.confirm('모든 사용자에게서 이 메시지를 삭제하시겠습니까?');
            if (confirmDelete) {
                onDelete(messageId, true);
            }
        } else {
            const confirmDelete = window.confirm('나에게서만 이 메시지를 삭제하시겠습니까?');
            if (confirmDelete) {
                onDelete(messageId, false);
            }
        }
        setShowMenuForId(null);
    };

    const canDeleteForEveryone = (message) => {
        if (!message.isOwn) return false;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return message.createdAt > fiveMinutesAgo;
    };

    const formatReplyPreview = (content) => {
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
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

                        {/* 사용자명 표시 (타인 메시지만) */}
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

                        {/* 드롭다운 메뉴 */}
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
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
