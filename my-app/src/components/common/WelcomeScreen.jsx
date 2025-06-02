import React from 'react';
import { MessageCircle, BookOpen } from 'lucide-react';

const WelcomeScreen = ({ workspaceMode = '채팅방' }) => {
    const isStudyRoom = workspaceMode === '스터디룸';

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                {isStudyRoom ? (
                    <BookOpen size={64} className="text-green-400 mx-auto mb-4" />
                ) : (
                    <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
                )}
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                    {isStudyRoom ? '스터디룸을 선택해주세요' : '채팅방을 선택해주세요'}
                </h2>
                <p className="text-gray-500">
                    {isStudyRoom
                        ? '좌측에서 참여중인 스터디룸을 선택하거나 새로운 스터디룸을 탐색해보세요.'
                        : '좌측에서 참여중인 채팅방을 선택하거나 새로운 채팅방을 탐색해보세요.'
                    }
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;