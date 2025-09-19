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
                            onClick={(e) => handleSubmit(e)}
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
const ChatRoomCard = ({ room, onJoinRoom, workspaceMode }) => {
    const isStudyRoom = workspaceMode === '스터디룸';

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
                        {room.description}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{room.currentMembers}/{room.maxMembers}</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {room.category}
                    </span>
                </div>

                <button
                    onClick={() => onJoinRoom(room)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={room.currentMembers >= room.maxMembers}
                >
                    {room.currentMembers >= room.maxMembers ? '만석' : '입장하기'}
                </button>
            </div>
        </div>
    );
};

// 메인 탐색 컴포넌트
const ChatRoomExplorer = ({ workspaceMode = '채팅룸', onJoinRoom = (roomId) => console.log('Joining room:', roomId) }) => {
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

    const categories = ['전체', '일반', '프로젝트', '스터디', '취미', '기타'];
    const isStudyRoom = workspaceMode === '스터디룸';

    // Mock 데이터로 채팅방 목록 불러오기
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);

                // API 연결 전 임시 Mock 데이터
                const mockRooms = [
                    {
                        id: 'room1',
                        roomName: '졸업 프로젝트',
                        description: '졸프 이야기~ 잘 졸업해봅시다...',
                        category: '일반',
                        isPrivate: false,
                        currentMembers: 3,
                        maxMembers: 30,
                        createdAt: '2024-01-15T10:30:00Z'
                    },
                    {
                        id: 'room2',
                        roomName: '소공 스터디',
                        description: '4학년 1학기 전공! 소공 스터디!',
                        category: '프로젝트',
                        isPrivate: true,
                        currentMembers: 10,
                        maxMembers: 20,
                        createdAt: '2024-01-14T15:20:00Z'
                    },
                    {
                        id: 'room3',
                        roomName: '개발 스터디',
                        description: '개발 학습을 함께 하는 스터디룸',
                        category: '스터디',
                        isPrivate: false,
                        currentMembers: 15,
                        maxMembers: 25,
                        createdAt: '2024-01-13T09:45:00Z'
                    },
                    {
                        id: 'room4',
                        roomName: '게임 좀 하고 삽시다',
                        description: '다양한 게임에 대해 이야기하는 공간입니다. 게임 추천, 공략, 리뷰 등 자유롭게!',
                        category: '취미',
                        isPrivate: false,
                        currentMembers: 23,
                        maxMembers: 30,
                        createdAt: '2024-01-12T14:15:00Z'
                    },
                    {
                        id: 'room5',
                        roomName: '배구 보는 사람',
                        description: '배구를 사랑하는 사람의 모임',
                        category: '취미',
                        isPrivate: true,
                        currentMembers: 18,
                        maxMembers: 20,
                        createdAt: '2024-01-11T11:00:00Z'
                    }
                ];

                // 로딩 시뮬레이션 (실제로는 필요 없음)
                await new Promise(resolve => setTimeout(resolve, 800));

                setRooms(mockRooms);

            } catch (error) {
                console.error('채팅방 목록 로딩 오류:', error);
                // Mock 데이터를 사용하므로 오류 처리 제거
                // setError('채팅방 목록을 불러올 수 없습니다. 다시 시도해주세요.');
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [isStudyRoom]);

    // 필터링 로직
    useEffect(() => {
        let filtered = rooms;

        // 검색어 필터
        if (searchQuery.trim()) {
            filtered = filtered.filter(room =>
                room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 카테고리 필터
        if (selectedCategory !== '전체') {
            filtered = filtered.filter(room => room.category === selectedCategory);
        }

        // 비공개방만 보기 필터
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
            // 공개방 입장 (Mock)
            await joinPublicRoom(room);
        }
    };

    // 공개방 입장 (Mock)
    const joinPublicRoom = async (room) => {
        try {
            // Mock API 호출 시뮬레이션
            console.log('공개방 입장:', room);

            // 로딩 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 500));

            // 입장 성공 시 채팅방으로 이동
            onJoinRoom(room.id);

        } catch (error) {
            console.error('공개방 입장 오류:', error);
            alert('채팅방 입장에 실패했습니다.');
        }
    };

    // 비밀번호 확인 후 비공개방 입장 (Mock)
    const handlePasswordSubmit = async (password) => {
        setPasswordModal(prev => ({ ...prev, isLoading: true }));

        try {
            // Mock API 호출 시뮬레이션
            console.log('비공개방 입장 시도:', passwordModal.room, 'password:', password);

            // 로딩 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock 비밀번호 검증 (실제로는 서버에서 검증)
            const correctPassword = '1234'; // Mock 비밀번호
            if (password !== correctPassword) {
                throw new Error('비밀번호가 일치하지 않습니다. (비번: 1234)');
            }

            // 입장 성공 시 모달 닫고 채팅방으로 이동
            setPasswordModal({ isOpen: false, room: null, isLoading: false });
            onJoinRoom(passwordModal.room.id);

        } catch (error) {
            console.error('비공개방 입장 오류:', error);
            alert(error.message || '입장에 실패했습니다.');
        } finally {
            setPasswordModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">{workspaceMode} 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 bg-gray-50 min-h-screen">
            {/* 헤더 */}
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
                    다양한 {workspaceMode}을 찾아보고 참여해보세요. (Mock 데이터)
                </p>
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-6 space-y-4">
                {/* 검색바 */}
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

                {/* 필터 옵션 */}
                <div className="flex items-center space-x-4 flex-wrap">
                    <div className="flex items-center space-x-2">
                        <Filter size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">필터:</span>
                    </div>

                    {/* 카테고리 선택 */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    {/* 비공개방만 보기 */}
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

                {/* 결과 개수 */}
                <div className="text-sm text-gray-500">
                    총 {filteredRooms.length}개의 {workspaceMode}
                </div>
            </div>

            {/* 채팅방 목록 */}
            <div className="flex-1">
                {filteredRooms.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRooms.map(room => (
                            <ChatRoomCard
                                key={room.id}
                                room={room}
                                onJoinRoom={handleJoinRoom}
                                workspaceMode={workspaceMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
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

            {/* 비밀번호 입력 모달 */}
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