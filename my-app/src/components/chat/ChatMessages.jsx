import React from 'react';
import { Crown } from 'lucide-react';

const ChatMessages = ({ roomId }) => {
    // 실제로는 props나 hooks를 통해 메시지 데이터를 받아올 예정
    const sampleMessages = [
        {
            id: 1,
            userId: 'userA',
            username: '사용자A',
            message: '안녕하세요! 새로 참여하게 되었습니다.',
            timestamp: '오후 2:30',
            isOwner: false
        },
        {
            id: 2,
            userId: 'userB',
            username: '사용자B',
            message: '환영합니다! 자유롭게 대화해주세요.',
            timestamp: '오후 2:31',
            isOwner: true
        }
    ];

    return (
        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-4">
                {sampleMessages.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-semibold">
                  {msg.username.charAt(msg.username.length - 1)}
                </span>
                            </div>
                            <span className="font-medium text-gray-800">{msg.username}</span>
                            {msg.isOwner && <Crown size={12} className="text-yellow-500" />}
                            <span className="text-xs text-gray-500">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-700 ml-8">{msg.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatMessages;