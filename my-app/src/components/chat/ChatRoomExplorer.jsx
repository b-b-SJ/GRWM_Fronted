import React, { useState, useEffect } from 'react';
import {
    Search,
    Users,
    Lock,
    Unlock,
    Filter,
    X,
    Key,
    MessageCircle,
    BookOpen
} from 'lucide-react';

// 비밀번호 입력 모달 컴포넌트
const PasswordModal = ({ isOpen, onClose, onSubmit, roomName, isLoading }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('비밀번호를 입력해주세요.');
            return;
        }
        onSubmit(password);
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        비공개 채팅방 입장
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                    >
                        <X size={20} />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">
                    "<span className="font-medium">{roomName}</span>"에 입장하려면 비밀번호를 입력해주세요.
                </p>

                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit(e);
                                    }
                                }}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="비밀번호를 입력하세요"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={isLoading}
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            disabled={isLoading}
                        >
                            {isLoading ? '확인 중...' : '입장하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 채팅방 카드 컴포넌트
const ChatRoomCard = ({ room, onJoinRoom }) => {
    const isFull = room.maxMembers > 0 && room.currentMembers >= room.maxMembers;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-lg truncate">
                            {room.roomName}
                        </h3>
                        {room.isPrivate ? (
                            <Lock size={16} className="text-red-500 flex-shrink-0" />
                        ) : (
                            <Unlock size={16} className="text-green-500 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {room.description || '설명이 없습니다.'}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>
                            {room.currentMembers}
                            {room.maxMembers > 0 ? `/${room.maxMembers}` : ''}
                        </span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {room.category}
                    </span>
                </div>

                <button
                    onClick={() => onJoinRoom(room)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isFull}
                >
                    {isFull ? '만석' : '입장하기'}
                </button>
            </div>
        </div>
    );
};

// 메인 탐색 컴포넌트
const ChatRoomExplorer = ({
                              workspaceMode = '채팅룸',
                              onJoinRoom = (roomId) => console.log('Joining room:', roomId)
                          }) => {
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [showPrivateOnly, setShowPrivateOnly] = useState(false);
    const [passwordModal, setPasswordModal] = useState({
        isOpen: false,
        room: null,
        isLoading: false
    });

    const isStudyRoom = workspaceMode === '스터디룸';

    // 채팅방 목록 불러오기
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);

                // 로컬 스토리지에서 토큰 가져오기
                const token = localStorage.getItem('accessToken'); // 또는 'token', 'authToken' 등

                // 디버깅: 토큰 확인
                console.log('Token:', token ? '존재함' : '없음');

                if (!token) {
                    throw new Error('로그인 토큰이 없습니다.');
                }

                const response = await fetch('http://localhost:8080/api/chat-room/show', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
                    },
                    credentials: 'include',
                });

                // 디버깅: 응답 상태 확인
                console.log('Response status:', response.status);

                if (!response.ok) {
                    if (response.status === 403 || response.status === 401) {
                        throw new Error('인증이 만료되었거나 유효하지 않습니다.');
                    }
                    throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
                }

                const data = await response.json();

                // DTO를 컴포넌트 형식으로 변환
                const formattedRooms = data.map(room => ({
                    id: room.chatRoomId,
                    roomName: room.chatRoomName,
                    description: room.description,
                    category: room.category,
                    isPrivate: room.isPrivate,
                    currentMembers: room.currentMembers,
                    maxMembers: room.maxMembers,
                }));

                setRooms(formattedRooms);

            } catch (error) {
                console.error('채팅방 목록 로딩 오류:', error);

                // 403 에러 (인증 필요) 처리
                if (error.message.includes('403') || error.message.includes('Forbidden')) {
                    alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');
                    // 로그인 페이지로 리다이렉트 (실제 경로로 수정 필요)
                    // window.location.href = '/login';
                } else {
                    alert('채팅방 목록을 불러올 수 없습니다. 다시 시도해주세요.');
                }
                setRooms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // 카테고리 목록 동적 생성
    const categories = ['전체', ...new Set(rooms.map(room => room.category))];

    // 필터링 로직
    useEffect(() => {
        let filtered = rooms;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(room =>
                room.roomName.toLowerCase().includes(query) ||
                room.category.toLowerCase().includes(query) ||
                (room.description && room.description.toLowerCase().includes(query))
            );
        }

        if (selectedCategory !== '전체') {
            filtered = filtered.filter(room => room.category === selectedCategory);
        }

        if (showPrivateOnly) {
            filtered = filtered.filter(room => room.isPrivate);
        }

        setFilteredRooms(filtered);
    }, [rooms, searchQuery, selectedCategory, showPrivateOnly]);

    // 채팅방 입장 처리
    const handleJoinRoom = async (room) => {
        if (room.isPrivate) {
            setPasswordModal({
                isOpen: true,
                room,
                isLoading: false
            });
        } else {
            await joinPublicRoom(room);
        }
    };

    // 공개방 입장
    const joinPublicRoom = async (room) => {
        try {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                throw new Error('로그인 토큰이 없습니다.');
            }

            const response = await fetch(`http://localhost:8080/api/chat-room/${room.id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
                }
                const errorText = await response.text();
                throw new Error(errorText || '입장에 실패했습니다.');
            }

            onJoinRoom(room.id);

        } catch (error) {
            console.error('공개방 입장 오류:', error);
            alert(error.message || '채팅방 입장에 실패했습니다.');
        }
    };

    // 비밀번호 확인 후 비공개방 입장
    const handlePasswordSubmit = async (password) => {
        setPasswordModal(prev => ({ ...prev, isLoading: true }));

        try {
            const verifyResponse = await fetch(
                `http://localhost:8080/api/chat-room/${passwordModal.room.id}/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ password }),
                }
            );

            if (!verifyResponse.ok) {
                const errorText = await verifyResponse.text();
                throw new Error(errorText || '비밀번호가 일치하지 않습니다.');
            }

            const joinResponse = await fetch(
                `http://localhost:8080/api/chat-room/${passwordModal.room.id}/join`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );

            if (!joinResponse.ok) {
                const errorText = await joinResponse.text();
                throw new Error(errorText || '입장에 실패했습니다.');
            }

            setPasswordModal({ isOpen: false, room: null, isLoading: false });
            onJoinRoom(passwordModal.room.id);

        } catch (error) {
            console.error('비공개방 입장 오류:', error);
            alert(error.message || '입장에 실패했습니다.');
            setPasswordModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">{workspaceMode} 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                    {isStudyRoom ? (
                        <BookOpen size={24} className="text-green-600" />
                    ) : (
                        <MessageCircle size={24} className="text-blue-600" />
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">
                        {workspaceMode} 탐색
                    </h1>
                </div>
                <p className="text-gray-600">
                    다양한 {workspaceMode}을 찾아보고 참여해보세요.
                </p>
            </div>

            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="채팅방 이름, 카테고리, 설명으로 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                </div>

                <div className="flex items-center space-x-4 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                        <Filter size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">필터:</span>
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showPrivateOnly}
                            onChange={(e) => setShowPrivateOnly(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm text-gray-700">비공개방만 보기</span>
                    </label>
                </div>

                <div className="text-sm text-gray-500">
                    총 {filteredRooms.length}개의 {workspaceMode}
                </div>
            </div>

            <div className="flex-1">
                {filteredRooms.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRooms.map(room => (
                            <ChatRoomCard
                                key={room.id}
                                room={room}
                                onJoinRoom={handleJoinRoom}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <div className="text-center">
                            <Search size={64} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-500 mb-2">
                                검색 결과가 없습니다
                            </h3>
                            <p className="text-gray-400">
                                다른 검색어나 필터를 시도해보세요.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <PasswordModal
                isOpen={passwordModal.isOpen}
                onClose={() => setPasswordModal({ isOpen: false, room: null, isLoading: false })}
                onSubmit={handlePasswordSubmit}
                roomName={passwordModal.room?.roomName || ''}
                isLoading={passwordModal.isLoading}
            />
        </div>
    );
};

export default ChatRoomExplorer;