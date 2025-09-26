import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Users, ArrowLeft, Settings, LogOut, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useChatState } from '../../hooks/useChatState';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';

/**
 * ChatRoom 컴포넌트 - useChatState 연동, 말풍선 스타일 채팅 UI
 * - useChatState의 메시지 상태와 함수들을 활용
 * - WebSocket을 통한 실시간 메시지 처리
 */
const ChatRoom = ({ chatRoomId, chatRooms, onBack }) => {
    const {
        messages,
        connectionStatus,
        currentUser,
        sendMessage,
        requestDeleteMessage,
        replyTo,
        setReplyTo,
        leaveChatRoom,
        editChatRoomName,
        deleteChatRoom,
        createAnnouncement
    } = useChatState();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [editRoomName, setEditRoomName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');

    const menuRef = useRef(null);
    const messagesEndRef = useRef(null);

    // 현재 채팅방 정보 찾기 (다양한 필드명 대응)
    const currentRoom = chatRooms.find(room =>
        room.roomId == chatRoomId ||
        room.chatRoomId == chatRoomId
    );

    // 사용자가 방장인지 확인
    const isOwner = currentRoom?.isOwner || currentRoom?.ownerId === currentUser.userId;

    // chatRoomId에 해당하는 메시지들 (useChatState에서 관리)
    const roomMessages = messages[chatRoomId] || [];

    console.log('ChatRoom rendered:', {
        chatRoomId,
        currentRoom,
        messageCount: roomMessages.length,
        connectionStatus,
        isOwner
    });

    // 메시지가 업데이트될 때마다 스크롤을 맨 아래로
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [roomMessages]);

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 편집 모달 열기
    const handleEditRoom = () => {
        setEditRoomName(currentRoom.chatRoomName || currentRoom.roomName || currentRoom.name || '');
        setEditDescription(currentRoom.description || '');
        setShowEditModal(true);
        setShowMenu(false);
    };

    // 채팅방 이름/설명 수정
    const handleSaveEdit = async () => {
        try {
            await editChatRoomName(chatRoomId, editRoomName, editDescription);
            setShowEditModal(false);
            alert('채팅방 정보가 수정되었습니다.');
        } catch (error) {
            alert(`수정 실패: ${error.message}`);
        }
    };

    // 채팅방 삭제
    const handleDeleteRoom = async () => {
        if (window.confirm('정말로 이 채팅방을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            try {
                await deleteChatRoom(chatRoomId);
                alert('채팅방이 삭제되었습니다.');
                onBack();
            } catch (error) {
                alert(`삭제 실패: ${error.message}`);
            }
        }
        setShowMenu(false);
    };

    // 채팅방 나가기
    const handleLeaveRoom = async () => {
        if (window.confirm('이 채팅방을 나가시겠습니까?')) {
            try {
                await leaveChatRoom(chatRoomId);
                alert('채팅방에서 나갔습니다.');
                onBack();
            } catch (error) {
                alert(`나가기 실패: ${error.message}`);
            }
        }
        setShowMenu(false);
    };

    // 공지 작성
    const handleCreateAnnouncement = async () => {
        try {
            await createAnnouncement(chatRoomId, announcementContent);
            setAnnouncementContent('');
            setShowAnnouncementModal(false);
            alert('공지가 등록되었습니다.');
        } catch (error) {
            alert(`공지 등록 실패: ${error.message}`);
        }
    };

    useEffect(() => {
        if (chatRoomId) {
            setLoading(true);
            setError(null);

            // useChatState에서 WebSocket 연결 및 메시지 로딩 처리
            // 연결 완료까지 대기
            const timer = setTimeout(() => {
                setLoading(false);
            }, 2000); // 2초 후 로딩 완료

            return () => clearTimeout(timer);
        }
    }, [chatRoomId]);

    // 연결 상태 변화에 따른 로딩 상태 업데이트
    useEffect(() => {
        if (connectionStatus === 'connected' || connectionStatus === 'error') {
            setLoading(false);
        }
    }, [connectionStatus]);

    // 메시지 전송 처리
    const handleSendMessage = (content) => {
        try {
            console.log('Sending message to chatRoom:', chatRoomId, 'Content:', content);
            sendMessage(chatRoomId, content, replyTo?.id);
            setReplyTo(null);
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            setError('메시지 전송에 실패했습니다.');
        }
    };

    // 메시지 삭제 처리
    const handleDeleteMessage = (messageId, deleteForEveryone = false) => {
        try {
            if (deleteForEveryone) {
                requestDeleteMessage(chatRoomId, messageId);
            } else {
                console.log('개인 삭제 기능은 아직 구현되지 않았습니다.');
            }
        } catch (error) {
            console.error('메시지 삭제 실패:', error);
            setError('메시지 삭제에 실패했습니다.');
        }
    };

    // 메시지에 답장
    const handleReplyToMessage = (message) => {
        setReplyTo(message);
    };

    // 메시지에 답장 취소
    const handleCancelReply = () => {
        setReplyTo(null);
    };

    // 채팅방이 존재하지 않는 경우
    if (!currentRoom) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">
                        채팅방을 찾을 수 없습니다
                    </h2>
                    <p className="text-gray-500 mb-4">
                        채팅방 ID: {chatRoomId}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                        사용 가능한 채팅방: {chatRooms.map(room => room.id || room.chatRoomId || room.roomId).join(', ')}
                    </p>
                    <button
                        onClick={onBack}
                        className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                        <ArrowLeft size={16} />
                        <span>목록으로 돌아가기</span>
                    </button>
                </div>
            </div>
        );
    }

    // 로딩 중 처리
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 mb-2">채팅방에 접속하는 중...</p>
                    <p className="text-sm text-gray-500">
                        연결 상태: {connectionStatus}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        채팅방 ID: {chatRoomId}
                    </p>
                </div>
            </div>
        );
    }

    // 에러 처리
    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                setTimeout(() => setLoading(false), 2000);
                            }}
                            className="text-blue-600 hover:text-blue-700 transition-colors block mx-auto"
                        >
                            다시 시도
                        </button>
                        <button
                            onClick={onBack}
                            className="text-gray-600 hover:text-gray-700 transition-colors flex items-center space-x-2 mx-auto"
                        >
                            <ArrowLeft size={16} />
                            <span>목록으로 돌아가기</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden">
            {/* 채팅방 헤더 */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-4">
                    {/* 뒤로가기 버튼 */}
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {currentRoom.chatRoomName || currentRoom.roomName || currentRoom.name || `채팅방 ${chatRoomId}`}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                                <Users size={14}/>
                                <span>
                                    {currentRoom.currentMembers || currentRoom.members || 0}명 참여
                                </span>
                            </div>
                            {currentRoom.isPrivate && <span>• 비공개</span>}
                            <span>• {connectionStatus === 'connected' ? '온라인' :
                                connectionStatus === 'error' ? '오프라인' : '연결 중'}</span>
                        </div>
                    </div>
                </div>

                {/* 설정 버튼 */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <MoreVertical size={20} className="text-gray-600"/>
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setShowAnnouncementModal(true);
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                >
                                    <MessageSquare size={16} />
                                    <span>공지 올리기</span>
                                </button>

                                {isOwner && (
                                    <>
                                        <button
                                            onClick={handleEditRoom}
                                            className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        >
                                            <Edit size={16} />
                                            <span>채팅방 이름 수정</span>
                                        </button>

                                        <button
                                            onClick={handleDeleteRoom}
                                            className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                                        >
                                            <Trash2 size={16} />
                                            <span>채팅방 삭제</span>
                                        </button>
                                    </>
                                )}

                                <div className="border-t border-gray-200 my-1"></div>

                                <button
                                    onClick={handleLeaveRoom}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                                >
                                    <LogOut size={16} />
                                    <span>채팅방 나가기</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 채팅방 설명 (있는 경우) */}
            {currentRoom.description && (
                <div className="bg-blue-50 px-6 py-3 border-b flex-shrink-0">
                    <p className="text-sm text-blue-700">
                        {currentRoom.description}
                    </p>
                </div>
            )}

            {/* 연결 상태 표시 */}
            {connectionStatus === 'error' && (
                <div className="bg-red-50 px-6 py-2 border-b flex-shrink-0">
                    <p className="text-sm text-red-700">
                        실시간 채팅 서버에 연결할 수 없습니다. 테스트 모드로 동작합니다.
                    </p>
                </div>
            )}

            {connectionStatus === 'connecting' && (
                <div className="bg-yellow-50 px-6 py-2 border-b flex-shrink-0">
                    <p className="text-sm text-yellow-700">
                        채팅 서버에 연결하는 중...
                    </p>
                </div>
            )}

            {/* 메시지 영역 - 스크롤 처리 */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
                {roomMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="text-center">
                            <Users size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                대화를 시작해보세요!
                            </h3>
                            <p className="text-gray-500 mb-2">
                                아직 메시지가 없습니다. 첫 메시지를 보내보세요.
                            </p>
                            <p className="text-xs text-gray-400">
                                연결 상태: {connectionStatus}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {/* 실제 ChatMessages 컴포넌트가 있다면 사용, 없다면 말풍선 스타일 메시지 리스트 */}
                        {typeof ChatMessages === 'undefined' ? (
                            <ChatBubbleMessages
                                messages={roomMessages}
                                currentUser={currentUser}
                                onReply={handleReplyToMessage}
                                onDelete={handleDeleteMessage}
                            />
                        ) : (
                            <ChatMessages
                                messages={roomMessages}
                                currentUser={currentUser}
                                onReply={handleReplyToMessage}
                                onDelete={handleDeleteMessage}
                            />
                        )}
                        {/* 스크롤 앵커 */}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* 메시지 입력 영역 - 하단 고정 */}
            <div className="border-t bg-white flex-shrink-0">
                {/* 실제 MessageInput 컴포넌트가 있다면 사용, 없다면 간단한 입력창 */}
                {typeof MessageInput === 'undefined' ? (
                    <SimpleMessageInput
                        onSendMessage={handleSendMessage}
                        disabled={connectionStatus === 'connecting'}
                        replyingTo={replyTo}
                        onCancelReply={handleCancelReply}
                    />
                ) : (
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        replyingTo={replyTo}
                        onCancelReply={handleCancelReply}
                        disabled={connectionStatus === 'connecting'}
                        placeholder={
                            connectionStatus === 'connecting'
                                ? '서버에 연결하는 중...'
                                : '메시지를 입력하세요...'
                        }
                    />
                )}
            </div>

            {/* 편집 모달 */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">채팅방 정보 수정</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    채팅방 이름
                                </label>
                                <input
                                    type="text"
                                    value={editRoomName}
                                    onChange={(e) => setEditRoomName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    maxLength={50}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    채팅방 설명
                                </label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    maxLength={200}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                disabled={!editRoomName.trim()}
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 공지 모달 */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">공지 작성</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                공지 내용
                            </label>
                            <textarea
                                value={announcementContent}
                                onChange={(e) => setAnnouncementContent(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="공지 내용을 입력하세요..."
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {announcementContent.length}/500자
                            </p>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAnnouncementModal(false);
                                    setAnnouncementContent('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateAnnouncement}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                disabled={!announcementContent.trim()}
                            >
                                공지 등록
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 말풍선 스타일 메시지 컴포넌트
const ChatBubbleMessages = ({ messages, currentUser, onReply, onDelete }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const isMyMessage = (message) => {
        // 디버깅을 위해 로그 출력
        console.log('메시지 소유권 확인:', {
            messageSenderId: message.senderId,
            messageSender: message.sender,
            messageWriterChatName: message.writerChatName,
            currentUserId: currentUser.userId,
            currentUserUsername: currentUser.username,
            currentUserLoginId: currentUser.loginId,
            currentUserName: currentUser.name
        });

        // 다양한 경우를 체크
        return message.senderId === currentUser.userId ||
            message.sender === currentUser.username ||
            message.sender === currentUser.loginId ||
            message.sender === currentUser.name ||
            message.writerChatName === currentUser.username ||
            message.writerChatName === currentUser.loginId ||
            message.writerChatName === currentUser.name;
    };

    return (
        <div className="space-y-4">
            {messages.map((message, index) => {
                const isMine = isMyMessage(message);
                const showAvatar = !isMine && (index === 0 || !isMyMessage(messages[index - 1]));

                return (
                    <div
                        key={message.id || index}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                            {/* 아바타 (다른 사람 메시지만) */}
                            {!isMine && (
                                <div className={`flex-shrink-0 w-8 h-8 ${showAvatar ? 'visible' : 'invisible'}`}>
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                        {(message.sender || '?')[0].toUpperCase()}
                                    </div>
                                </div>
                            )}

                            <div className={`${isMine ? 'ml-2' : 'mr-2'}`}>
                                {/* 발송자 이름 (다른 사람 메시지만, 새 발송자인 경우만) */}
                                {!isMine && showAvatar && (
                                    <div className="text-xs text-gray-500 mb-1 px-3">
                                        {message.sender || '익명'}
                                    </div>
                                )}

                                {/* 답장 표시 */}
                                {message.replyTo && (
                                    <div className={`text-xs text-gray-500 mb-1 px-3 ${isMine ? 'text-right' : 'text-left'}`}>
                                        {message.replyTo.sender}님에게 답장
                                    </div>
                                )}

                                {/* 메시지 말풍선 */}
                                <div
                                    className={`
                                        relative px-4 py-2 rounded-2xl break-words
                                        ${isMine
                                        ? 'bg-blue-500 text-white rounded-br-md'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                                    }
                                    `}
                                >
                                    {/* 말풍선 꼬리 */}
                                    {isMine ? (
                                        <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[10px] border-l-blue-500 border-t-[10px] border-t-transparent"></div>
                                    ) : (
                                        <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[10px] border-r-white border-t-[10px] border-t-transparent"></div>
                                    )}

                                    <div className="text-sm leading-relaxed">
                                        {message.content}
                                    </div>
                                </div>

                                {/* 시간 표시 */}
                                <div className={`text-xs text-gray-500 mt-1 px-3 ${isMine ? 'text-right' : 'text-left'}`}>
                                    {formatTime(message.timestamp)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// 간단한 메시지 입력 컴포넌트 (MessageInput이 없는 경우 대체용)
const SimpleMessageInput = ({ onSendMessage, disabled, replyingTo, onCancelReply }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    return (
        <div className="p-4">
            {replyingTo && (
                <div className="mb-2 p-3 bg-gray-50 rounded-lg text-sm border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="font-medium text-blue-600">{replyingTo.sender}님에게 답장</span>
                            <p className="text-gray-600 truncate mt-1">{replyingTo.content}</p>
                        </div>
                        <button
                            onClick={onCancelReply}
                            className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={disabled ? '연결 중...' : '메시지를 입력하세요...'}
                    disabled={disabled}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 outline-none"
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    전송
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;