import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoreVertical, Users, ArrowLeft, Edit, Trash2, MessageSquare, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { useChatState } from '../../hooks/useChatState';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
// import { useWebSocket } from '../../hooks/WebSocketContext';  // 추가
import { useAuth } from '../../hooks/AuthContext';  // 추가

const ChatRoom = ({ chatRoomId, chatRooms, onBack }) => {
    const { isAuthenticated } = useAuth();

    const {
        messages,
        connectionStatus,  // useChatState의 connectionStatus
        reconnectAttempts,
        currentUser,
        sendMessage,
        requestDeleteMessage,
        replyTo,
        setReplyTo,
        leaveChatRoom: leaveChatRoomServer,
        editChatRoomName,
        deleteChatRoom,
        createAnnouncement,
        getMainAnnouncement,
        getChatRoomMembers,
        reconnectWebSocket,
        connectToRoom,
        joinRoom, // useChatState의 joinRoom 함수 사용
        leaveRoom: leaveRoomUI // useChatState의 leaveRoom 함수 사용 (UI 정리용)
    } = useChatState();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [editRoomName, setEditRoomName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [mainAnnouncement, setMainAnnouncement] = useState(null);
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const menuRef = useRef(null);

    const currentRoom = chatRooms.find(room =>
        room.roomId === chatRoomId || room.chatRoomId === chatRoomId
    );

    const isManager = currentRoom?.isManager === true;
    const roomMessages = messages[chatRoomId] || [];

    //  WebSocket 연결 useEffect
    useEffect(() => {
        console.log('[ChatRoom] ===== WebSocket/History 연결 useEffect =====');

        if (!chatRoomId || !isAuthenticated) { // isAuthenticated는 useAuth 대신 useChatState의 context에서 제공하는 user 정보로 판단하거나,
            // ChatStateProvider에서 user를 받아오고 있으므로,
            // 여기서는 user가 유효한지 여부만 체크해도 됨.
            return;
        }

        connectToRoom(chatRoomId);

        return () => {
            console.log('[ChatRoom] 컴포넌트 언마운트 - leaveRoom (UI 정리) 호출');
            leaveRoomUI(); // UI 상태 정리용 leaveRoom 호출
        };
    }, [chatRoomId, joinRoom, leaveRoomUI, currentUser.userId]); // 의존성 목록 정리

    // 외부 클릭 감지
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

    // 채팅방 나가기 (서버) 함수 수정
    const handleLeaveRoom = async () => {
        if (window.confirm('이 채팅방을 나가시겠습니까?')) {
            try {
                await leaveChatRoomServer(chatRoomId); // ✅ leaveChatRoomServer 사용
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

    const loadMainAnnouncement = useCallback(async () => {
        try {
            const announcement = await getMainAnnouncement(chatRoomId);
            // 공지가 없거나 content가 없으면 null로 설정
            if (!announcement || !announcement.content) {
                setMainAnnouncement(null);
            } else {
                setMainAnnouncement(announcement);
            }
        } catch (error) {
            console.error('공지 조회 실패:', error);
            setMainAnnouncement(null);
        }
    }, [chatRoomId, getMainAnnouncement]);

    const loadMembers = async () => {
        setLoadingMembers(true);
        try {
            const memberList = await getChatRoomMembers(chatRoomId);
            setMembers(memberList);
        } catch (error) {
            console.error('참여자 목록 조회 실패:', error);
            alert(`참여자 목록 조회 실패: ${error.message}`);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleShowMembers = () => {
        setShowMembersModal(true);
        setShowMenu(false);
        loadMembers();
    };

    const handleReconnect = () => {
        if (reconnectWebSocket) {
            reconnectWebSocket();
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
    }, [chatRoomId, loadMainAnnouncement]);

    useEffect(() => {
        if (connectionStatus === 'connected' || connectionStatus === 'error') {
            setLoading(false);
        }
    }, [connectionStatus]);

    const handleSendMessage = (content) => {
        try {
            const replyMessageId = replyTo?.id || null;
            sendMessage(chatRoomId, content, replyMessageId);
            setReplyTo(null);
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            setError('메시지 전송에 실패했습니다.');
        }
    };

    // 메시지 삭제 핸들러 - 5분 기준 처리
    const handleDeleteMessage = async (messageId, canDeleteForEveryone) => {
        try {
            console.log('메시지 삭제 시도:', { messageId, canDeleteForEveryone });

            if (canDeleteForEveryone) {
                // 5분 이내 - WebSocket으로 모두에게서 삭제
                if (window.confirm('모든 사용자에게서 이 메시지를 삭제하시겠습니까?')) {
                    await requestDeleteMessage(chatRoomId, messageId, true);
                    console.log('모두에게서 삭제 요청 전송');
                }
            } else {
                // 5분 경과 - 나에게서만 삭제
                if (window.confirm('나에게서만 이 메시지를 삭제하시겠습니까?\n(다른 사용자에게는 계속 표시됩니다)')) {
                    await requestDeleteMessage(chatRoomId, messageId, false);
                    console.log('나에게서만 삭제 완료');
                }
            }
        } catch (error) {
            console.error('메시지 삭제 실패:', error);
            alert(error.message || '메시지 삭제에 실패했습니다.');
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
            {/* 헤더 */}
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
                            {reconnectAttempts > 0 && connectionStatus === 'disconnected' && (
                                <span className="text-amber-600">• 재연결 중 ({reconnectAttempts}/5)</span>
                            )}
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
                                <button onClick={handleShowMembers} className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                                    <Users size={16} />
                                    <span>참여자 목록</span>
                                </button>
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

            {/* 공지사항 영역 */}
            {mainAnnouncement && (
                <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex-shrink-0">
                    <div className="flex items-start space-x-2">
                        <MessageSquare size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-amber-800">공지사항</p>
                                <p className="text-xs text-amber-600 flex-shrink-0 ml-4">
                                    {new Date(mainAnnouncement.createdAt).toLocaleString('ko-KR')}
                                </p>
                            </div>
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

            {/* 연결 상태 알림 */}
            {connectionStatus === 'error' && (
                <div className="bg-red-50 px-6 py-3 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <AlertCircle size={16} className="text-red-600" />
                            <p className="text-sm text-red-700">
                                실시간 채팅 서버에 연결할 수 없습니다.
                                {reconnectAttempts >= 5 && ' 최대 재연결 횟수를 초과했습니다.'}
                            </p>
                        </div>
                        <button
                            onClick={handleReconnect}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                        >
                            <RefreshCw size={14} />
                            <span>재연결</span>
                        </button>
                    </div>
                </div>
            )}

            {connectionStatus === 'connecting' && (
                <div className="bg-yellow-50 px-6 py-2 border-b flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                        <p className="text-sm text-yellow-700">채팅 서버에 연결하는 중...</p>
                    </div>
                </div>
            )}

            {connectionStatus === 'disconnected' && reconnectAttempts > 0 && reconnectAttempts < 5 && (
                <div className="bg-amber-50 px-6 py-2 border-b flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <RefreshCw size={16} className="text-amber-600 animate-spin" />
                        <p className="text-sm text-amber-700">자동 재연결 중... ({reconnectAttempts}/5)</p>
                    </div>
                </div>
            )}

            {/* 메시지 영역 */}
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
                            msg.senderId !== undefined && msg.senderId === currentUser.userId
                        );

                        if (msg.type === 'system') {
                            return msg;
                        }

                        let replyToMessage = null;
                        if (msg.replyMessageId || msg.replyToMessageId) {
                            const replyId = msg.replyMessageId || msg.replyToMessageId;
                            replyToMessage = roomMessages.find(m => m.id === replyId);
                        }

                        return {
                            ...msg,
                            isOwn: isOwnMessage,
                            replyMessageId: msg.replyToMessageId || msg.replyMessageId || null,
                            replyTo: replyToMessage || msg.replyTo || null
                        };
                    })}
                    onReply={handleReplyToMessage}
                    onDelete={handleDeleteMessage}
                />
            )}

            {/* 메시지 입력 영역 */}
            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={connectionStatus === 'connecting'}
                replyingTo={replyTo}
                onCancelReply={handleCancelReply}
            />

            {/* 채팅방 수정 모달 */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">채팅방 정보 수정</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">채팅방 이름</label>
                                <input
                                    type="text"
                                    value={editRoomName}
                                    onChange={(e) => setEditRoomName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">채팅방 설명</label>
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

            {/* 공지 작성 모달 */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">공지 작성</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">공지 내용</label>
                            <textarea
                                value={announcementContent}
                                onChange={(e) => setAnnouncementContent(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="공지 내용을 입력하세요..."
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">{announcementContent.length}/500자</p>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => { setShowAnnouncementModal(false); setAnnouncementContent(''); }}
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

            {/* 참여자 목록 모달 */}
            {showMembersModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">참여자 목록</h3>
                            <span className="text-sm text-gray-500">
                                {members.length}명
                            </span>
                        </div>

                        {loadingMembers ? (
                            <div className="flex-1 flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                {members.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        참여자가 없습니다.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {members.map((member, index) => (
                                            <div
                                                key={member.communityId || index}
                                                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                {member.profileImage ? (
                                                    <img
                                                        src={member.profileImage}
                                                        alt={member.nickname}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium text-sm">
                                                            {member.nickname?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {member.nickname}
                                                    </p>
                                                    {member.communityId === currentUser.userId && (
                                                        <p className="text-xs text-gray-500">나</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t">
                            <button
                                onClick={() => setShowMembersModal(false)}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;