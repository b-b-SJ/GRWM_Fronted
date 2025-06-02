import React from 'react';
import { Hash, Lock, Bell, Settings } from 'lucide-react';

const ChatHeader = ({ room }) => {
    return (
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                    {room.isPrivate ? (
                        <Lock size={16} className="text-gray-500" />
                    ) : (
                        <Hash size={16} className="text-gray-500" />
                    )}
                    <h2 className="text-lg font-semibold text-gray-800">{room.name}</h2>
                </div>
                <span className="text-sm text-gray-500">{room.members}명</span>
            </div>

            <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell size={16} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings size={16} className="text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;