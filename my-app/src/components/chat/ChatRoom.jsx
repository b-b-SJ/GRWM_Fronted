import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical, Users } from 'lucide-react';

const ChatRoom = ({ roomId, chatRooms, onBack }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            user: '김철수',
            content: '안녕하세요! 새로 들어온 김철수입니다.',
            timestamp: '오후 2:30',
            isOwn: false
        },
        {
            id: 2,
            user: '나',
            content: '안녕하세요! 반갑습니다.',
            timestamp: '오후 2:31',
            isOwn: true
        }
    ]);

    const messagesEndRef = useRef(null);
    const currentRoom = chatRooms.find(room => room.id === roomId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                user: '나',
                content: message,
                timestamp: new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                isOwn: true
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
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

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* 채팅방 헤더 */}
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{currentRoom.name}</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Users size={14} />
                            <span>{currentRoom.members}명 참여</span>
                            {currentRoom.isPrivate && <span>• 비공개</span>}
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={20} className="text-gray-600" />
                </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                            {!msg.isOwn && (
                                <div className="text-sm text-gray-600 mb-1 px-1">{msg.user}</div>
                            )}
                            <div
                                className={`px-4 py-2 rounded-2xl ${
                                    msg.isOwn
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {msg.content}
                            </div>
                            <div
                                className={`text-xs text-gray-500 mt-1 px-1 ${
                                    msg.isOwn ? 'text-right' : 'text-left'
                                }`}
                            >
                                {msg.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 영역 */}
            <div className="bg-white border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button
                        type="button"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Paperclip size={20} className="text-gray-600" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="메시지를 입력하세요..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Smile size={18} className="text-gray-600" />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatRoom;