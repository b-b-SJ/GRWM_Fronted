import React, { useState } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';

/**
 * MessagesInput 컴포넌트
 * - 채팅 메시지 입력창 UI 및 동작 관리
 * - Enter 키, 메시지 전송 버튼으로 전송
 * - 답장 미리보기 Ui
 * - 첨부파일 및 이모지 전송 기능 구현 예정
 */
const MessageInput = ({ onSendMessage, replyingTo, onCancelReply }) => {
    const [message, setMessage] = useState('');

    // 메시지 전송 처리 후 입력창 초기화
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message, replyingTo?.id);
            setMessage('');
        }
    };

    // Enter 키 입력 처리. (shift+Enter는 줄바꿈 허용)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    // 답장 미리보기 메시지 길이 제한
    const formatReplyPreview = (content) => {
        return content.length > 60 ? content.substring(0, 60) + '...' : content;
    };

    return (
        <div className="relative bg-white border-t">
            {/* 답장 미리보기 */}
            {replyingTo && (
                <div className="absolute -top-[70px] left-0 right-0 mx-4 mb-2 px-4 py-2 bg-gray-100 border rounded-md shadow z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-1 h-8 bg-blue-500 rounded"></div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">
                                    {replyingTo.username}에게 답장
                                </div>
                                <div className="text-sm text-gray-600">
                                    {formatReplyPreview(replyingTo.content)}
                                </div>
                            </div>
                        </div>
                        {/* 답장 취소 버튼 */}
                        <button
                            onClick={onCancelReply}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X size={16} className="text-gray-500" />
                        </button>
                    </div>
                </div>
            )}

            {/* 메시지 입력 영역 */}
            <div className="p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    {/* 파일 첨부 버튼 (기능 구현 예정) */}
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="파일 첨부"
                    >
                        <Paperclip size={20} className="text-gray-600" />
                    </button>
                    {/* 텍스트 입력창 */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={replyingTo ? "답장을 입력하세요..." : "메시지를 입력하세요..."}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                        />
                        {/*
                       // 이모지 버튼 (임시. 일단 삭제)
                         <button
                             type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="이모지"
                        >
                            <Smile size={18} className="text-gray-600" />
                        </button>
                         */}
                    </div>

                    {/* 메시지 전송 버튼 */}
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                        title="메시지 보내기"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessageInput;