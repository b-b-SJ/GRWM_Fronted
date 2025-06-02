import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';

const ChatRoom = ({ roomId, chatRooms }) => {
    const currentRoom = chatRooms.find(room => room.id === roomId);

    if (!currentRoom) return null;

    return (
        <>
            <ChatHeader room={currentRoom} />
            <ChatMessages roomId={roomId} />
            <MessageInput roomId={roomId} />
        </>
    );
};

export default ChatRoom;