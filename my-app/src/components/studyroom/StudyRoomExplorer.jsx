import React, { useState, useEffect, useCallback } from 'react';
import { Search, Clock, Users, Lock, Unlock, X, Key, RefreshCw } from 'lucide-react';
import { useStudyRoomState } from '../../hooks/useStudyRoomState';

/**
 * 스터디룸 탐색 컴포넌트
 * - 공개 스터디룸 목록 조회
 * - 카테고리별 필터링
 * - 비공개 스터디룸 비밀번호 입력
 */
const StudyRoomExplorer = ({ onJoinRoom, joinedRoomIds = [] }) => {
    const { studyRooms, fetchStudyRooms, loading } = useStudyRoomState();

    const [filteredRooms, setFilteredRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');

    // 비밀번호 모달
    const [passwordModal, setPasswordModal] = useState({
        isOpen: false,
        roomId: null,
        roomName: '',
        password: '',
        error: ''
    });

    const categories = ['전체', '일반', '자격증', '스터디', '기타'];

    // 스터디룸 목록 불러오기
    const loadStudyRooms = useCallback(async () => {
        await fetchStudyRooms(0, 10);
    }, [fetchStudyRooms]);

    useEffect(() => {
        loadStudyRooms();
    }, [loadStudyRooms]);

    // 검색 및 필터링
    useEffect(() => {
        if (!studyRooms || studyRooms.length === 0) {
            setFilteredRooms([]);
            return;
        }

        let filtered = [...studyRooms];

        // 카테고리 필터
        if (selectedCategory !== '전체') {
            filtered = filtered.filter(room => room.category === selectedCategory);
        }

        // 검색 필터
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(room =>
                (room.name || '').toLowerCase().includes(query) ||
                (room.description || '').toLowerCase().includes(query)
            );
        }

        setFilteredRooms(filtered);
    }, [studyRooms, searchQuery, selectedCategory]);

    const handleJoinRoom = async (room) => {
        const roomId = room.studyRoomId || room.id;

        // 이미 참여중인 방인지 확인
        if (joinedRoomIds.includes(roomId)) {
            alert('이미 참여중인 스터디룸입니다.');
            return;
        }

        // 인원 초과 확인
        const currentMembers = room.currentMembers || room.userCount || 0;
        const maxMembers = room.maxMembers || 8;

        if (currentMembers >= maxMembers) {
            alert('스터디룸 인원이 가득 찼습니다.');
            return;
        }

        // 비공개 방이면 비밀번호 입력 모달 열기
        if (room.isPrivate) {
            setPasswordModal({
                isOpen: true,
                roomId: roomId,
                roomName: room.studyRoomName || room.name || '스터디룸',
                password: '',
                error: ''
            });
            return;
        }

        // 공개 방은 바로 참여
        if (onJoinRoom) {
            try {
                await onJoinRoom(roomId, false, null);
                // 참여 성공 후 목록 새로고침
                await loadStudyRooms();
            } catch (error) {
                console.error('Failed to join room:', error);
                alert('스터디룸 참여에 실패했습니다.');
            }
        }
    };

    const handlePasswordSubmit = async () => {
        if (!passwordModal.password.trim()) {
            setPasswordModal(prev => ({ ...prev, error: '비밀번호를 입력해주세요.' }));
            return;
        }

        if (passwordModal.password.length !== 5) {
            setPasswordModal(prev => ({ ...prev, error: '비밀번호는 5자리여야 합니다.' }));
            return;
        }

        if (!/^\d{5}$/.test(passwordModal.password)) {
            setPasswordModal(prev => ({ ...prev, error: '비밀번호는 5자리 숫자여야 합니다.' }));
            return;
        }

        try {
            if (onJoinRoom) {
                await onJoinRoom(passwordModal.roomId, true, passwordModal.password);
                // 참여 성공 후 목록 새로고침
                await loadStudyRooms();
            }
            closePasswordModal();
        } catch (error) {
            console.error('Failed to join private room:', error);
            setPasswordModal(prev => ({
                ...prev,
                error: error.message || '비밀번호가 올바르지 않습니다.'
            }));
        }
    };

    const closePasswordModal = () => {
        setPasswordModal({
            isOpen: false,
            roomId: null,
            roomName: '',
            password: '',
            error: ''
        });
    };

    const formatTime = (minutes) => {
        if (!minutes || minutes < 0) return '종료됨';

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}시간 ${mins}분`;
        }
        return `${mins}분`;
    };

    const getRemainingTime = (endTime) => {
        if (!endTime) return 0;

        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;
        const minutes = Math.floor(diff / 1000 / 60);
        return minutes > 0 ? minutes : 0;
    };

    return (
        <div className="flex-1 flex flex-col p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                        스터디룸 탐색
                    </h1>
                    <button
                        onClick={loadStudyRooms}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>새로고침</span>
                    </button>
                </div>
                <p className="text-gray-600 text-sm">
                    다양한 스터디룸을 찾아 함께 공부해보세요
                </p>
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-6 space-y-4">
                {/* 검색바 */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="스터디룸 이름이나 설명으로 검색..."
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>

                {/* 카테고리 필터 */}
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedCategory === category
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* 스터디룸 목록 */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-green-600">
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>스터디룸 목록을 불러오는 중...</span>
                        </div>
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-2">검색 결과가 없습니다.</p>
                        <p className="text-sm text-gray-400">다른 검색어나 카테고리를 시도해보세요.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {filteredRooms.map((room, index) => {
                            const roomId = room.studyRoomId || room.id;
                            const isJoined = joinedRoomIds.includes(roomId);
                            const currentMembers = room.currentMembers || 0;
                            const maxMembers = room.maxMembers || 8;
                            const isFull = currentMembers >= maxMembers;
                            const remainingMinutes = getRemainingTime(room.endTime);

                            return (
                                <div
                                    key={roomId || `room-${index}`}
                                    className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
                                >
                                    {/* 헤더 */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-gray-800 truncate">
                                                    {room.studyRoomName || room.name || '이름 없는 스터디룸'}
                                                </h3>
                                                {room.isPrivate ? (
                                                    <Lock size={14} className="text-gray-400 flex-shrink-0" />
                                                ) : (
                                                    <Unlock size={14} className="text-gray-400 flex-shrink-0" />
                                                )}
                                            </div>
                                            {room.category && (
                                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                    {room.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 설명 */}
                                    {room.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {room.description}
                                        </p>
                                    )}

                                    {/* 정보 */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <Clock size={14} />
                                                <span>남은 시간</span>
                                            </div>
                                            <span className={`font-medium ${
                                                remainingMinutes <= 10 ? 'text-red-600' : 'text-gray-800'
                                            }`}>
                                                {formatTime(remainingMinutes)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <Users size={14} />
                                                <span>참여 인원</span>
                                            </div>
                                            <span className="font-medium text-gray-800">
                                                {currentMembers}/{maxMembers}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 참여 버튼 */}
                                    <button
                                        onClick={() => handleJoinRoom(room)}
                                        disabled={isJoined || isFull}
                                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                            isJoined
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : isFull
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                    >
                                        {isJoined
                                            ? '참여중'
                                            : isFull
                                                ? '인원 마감'
                                                : room.isPrivate
                                                    ? '비밀번호 입력'
                                                    : '참여하기'
                                        }
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 비밀번호 입력 모달 */}
            {passwordModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                비밀번호 입력
                            </h3>
                            <button
                                onClick={closePasswordModal}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            <span className="font-medium">{passwordModal.roomName}</span>에 참여하려면 비밀번호를 입력해주세요.
                        </p>

                        {passwordModal.error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{passwordModal.error}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                비밀번호 (5자리 숫자)
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    value={passwordModal.password}
                                    onChange={(e) => setPasswordModal(prev => ({
                                        ...prev,
                                        password: e.target.value,
                                        error: ''
                                    }))}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                    placeholder="5자리 숫자를 입력하세요"
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    maxLength={5}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={closePasswordModal}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                참여하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyRoomExplorer;