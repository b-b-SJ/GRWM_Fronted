import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Users, ArrowLeft, Edit, Trash2, MessageSquare, LogOut } from 'lucide-react';
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
        createAnnouncement,
        getMainAnnouncement
    } = useChatState();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [editRoomName, setEditRoomName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [mainAnnouncement, setMainAnnouncement] = useState(null);

    const menuRef = useRef(null);

    const currentRoom = chatRooms.find(room =>
        room.roomId == chatRoomId || room.chatRoomId == chatRoomId
    );

    // 사용자가 방장인지 확인 - 백엔드에서 isManager로 전달
    const isManager = currentRoom?.isManager === true;

    // chatRoomId에 해당하는 메시지들 (useChatState에서 관리)
    const roomMessages = messages[chatRoomId] || [];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEditRoom = () => {
        setEditRoomName(currentRoom.chatRoomName || currentRoom.roomName || currentRoom.name || '');
        setEditDescription(currentRoom.description || '');
        setShowEditModal(true);
        setShowMenu(false);
    };

    const handleSaveEdit = async () => {
        try {
            await editChatRoomName(chatRoomId, editRoomName, editDescription);
            setShowEditModal(false);
            alert('채팅방 정보가 수정되었습니다.');
        } catch (error) {
            alert(`수정 실패: ${error.message}`);
        }
    };

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

    const handleCreateAnnouncement = async () => {
        try {
            await createAnnouncement(chatRoomId, announcementContent);
            setAnnouncementContent('');
            setShowAnnouncementModal(false);
            await loadMainAnnouncement();
            alert('공지가 등록되었습니다.');
        } catch (error) {
            alert(`공지 등록 실패: ${error.message}`);
        }
    };

    const loadMainAnnouncement = async () => {
        try {
            const announcement = await getMainAnnouncement(chatRoomId);
            setMainAnnouncement(announcement);
        } catch (error) {
            console.error('공지 조회 실패:', error);
            setMainAnnouncement(null);
        }
    };

    useEffect(() => {
        if (chatRoomId) {
            setLoading(true);
            setError(null);
            loadMainAnnouncement();
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [chatRoomId]);

    useEffect(() => {
        if (connectionStatus === 'connected' || connectionStatus === 'error') {
            setLoading(false);
        }
    }, [connectionStatus]);

    const handleSendMessage = (content) => {
        try {
            sendMessage(chatRoomId, content, replyTo?.id);
            setReplyTo(null);
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            setError('메시지 전송에 실패했습니다.');
        }
    };

    const handleDeleteMessage = (messageId, deleteForEveryone = false) => {
        try {
            if (deleteForEveryone) {
                requestDeleteMessage(chatRoomId, messageId);
            }
        } catch (error) {
            console.error('메시지 삭제 실패:', error);
            setError('메시지 삭제에 실패했습니다.');
        }
    };

    const handleReplyToMessage = (message) => {
        setReplyTo(message);
    };

    const handleCancelReply = () => {
        setReplyTo(null);
    };

    if (!currentRoom) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">채팅방을 찾을 수 없습니다</h2>
                    <p className="text-gray-500 mb-4">채팅방 ID: {chatRoomId}</p>
                    <button onClick={onBack} className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-2 mx-auto">
                        <ArrowLeft size={16} />
                        <span>목록으로 돌아가기</span>
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 mb-2">채팅방에 접속하는 중...</p>
                    <p className="text-sm text-gray-500">연결 상태: {connectionStatus}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <div className="space-y-2">
                        <button onClick={() => { setError(null); setLoading(true); setTimeout(() => setLoading(false), 2000); }} className="text-blue-600 hover:text-blue-700 transition-colors block mx-auto">
                            다시 시도
                        </button>
                        <button onClick={onBack} className="text-gray-600 hover:text-gray-700 transition-colors flex items-center space-x-2 mx-auto">
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
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {currentRoom.chatRoomName || currentRoom.roomName || currentRoom.name || `채팅방 ${chatRoomId}`}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                                <Users size={14}/>
                                <span>{currentRoom.currentMembers || currentRoom.members || 0}명 참여</span>
                            </div>
                            {currentRoom.isPrivate && <span>• 비공개</span>}
                            <span>• {connectionStatus === 'connected' ? '온라인' : connectionStatus === 'error' ? '오프라인' : '연결 중'}</span>
                        </div>
                    </div>
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={20} className="text-gray-600"/>
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="py-1">
                                <button onClick={() => { setShowAnnouncementModal(true); setShowMenu(false); }} className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                    <MessageSquare size={16} />
                                    <span>공지 올리기</span>
                                </button>
                                {isManager && (
                                    <>
                                        <button onClick={handleEditRoom} className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                            <Edit size={16} />
                                            <span>채팅방 이름 수정</span>
                                        </button>
                                        <button onClick={handleDeleteRoom} className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600">
                                            <Trash2 size={16} />
                                            <span>채팅방 삭제</span>
                                        </button>
                                    </>
                                )}
                                <div className="border-t border-gray-200 my-1"></div>
                                <button onClick={handleLeaveRoom} className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600">
                                    <LogOut size={16} />
                                    <span>채팅방 나가기</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {mainAnnouncement && (
                <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex-shrink-0">
                    <div className="flex items-start space-x-2">
                        <MessageSquare size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            {/* 첫 줄: 공지사항 타이틀 + 시간 */}
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-amber-800">공지사항</p>
                                <p className="text-xs text-amber-600 flex-shrink-0 ml-4">
                                    {new Date(mainAnnouncement.createdAt).toLocaleString('ko-KR')}
                                </p>
                            </div>
                            {/* 둘째 줄: 공지 내용 + 작성자 (우측) */}
                            <div className="flex items-start justify-between gap-4">
                                <p className="text-sm text-amber-700 whitespace-pre-wrap flex-1">
                                    {mainAnnouncement.content}
                                </p>
                                <span className="text-xs text-amber-600 flex-shrink-0 self-start">
                        {mainAnnouncement.writerChatName || '관리자'}
                    </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {connectionStatus === 'error' && (
                <div className="bg-red-50 px-6 py-2 border-b flex-shrink-0">
                    <p className="text-sm text-red-700">실시간 채팅 서버에 연결할 수 없습니다. 테스트 모드로 동작합니다.</p>
                </div>
            )}

            {connectionStatus === 'connecting' && (
                <div className="bg-yellow-50 px-6 py-2 border-b flex-shrink-0">
                    <p className="text-sm text-yellow-700">채팅 서버에 연결하는 중...</p>
                </div>
            )}

            {roomMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                    <div className="text-center">
                        <Users size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">대화를 시작해보세요!</h3>
                        <p className="text-gray-500 mb-2">아직 메시지가 없습니다. 첫 메시지를 보내보세요.</p>
                    </div>
                </div>
            ) : (
                <ChatMessages
                    messages={roomMessages.map(msg => {
                        const isOwnMessage = (
                            // senderId가 존재하고, 두 ID가 일치하는지 확인
                            msg.senderId !== undefined && msg.senderId === currentUser.userId
                        );

                        console.log('--- 메시지 디버깅 시작 ---');

                        return {
                            ...msg,
                            isOwn: isOwnMessage
                        };
                    })}
                    onReply={handleReplyToMessage}
                    onDelete={handleDeleteMessage}
                />
            )}

            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={connectionStatus === 'connecting'}
                replyingTo={replyTo}
                onCancelReply={handleCancelReply}
            />

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">채팅방 정보 수정</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">채팅방 이름</label>
                                <input type="text" value={editRoomName} onChange={(e) => setEditRoomName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" maxLength={50} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">채팅방 설명</label>
                                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none" maxLength={200} />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">취소</button>
                            <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={!editRoomName.trim()}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {showAnnouncementModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">공지 작성</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">공지 내용</label>
                            <textarea value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="공지 내용을 입력하세요..." maxLength={500} />
                            <p className="text-xs text-gray-500 mt-1">{announcementContent.length}/500자</p>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button onClick={() => { setShowAnnouncementModal(false); setAnnouncementContent(''); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">취소</button>
                            <button onClick={handleCreateAnnouncement} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" disabled={!announcementContent.trim()}>공지 등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;