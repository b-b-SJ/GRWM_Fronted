import React, { useState } from 'react';

const MessageInput = ({ roomId }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            // 여기서 웹소켓으로 메시지 전송
            console.log('메시지 전송:', message);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white border-t p-4">
            <div className="flex items-center space-x-3">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default MessageInput;