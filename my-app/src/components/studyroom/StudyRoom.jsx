import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Users, CheckCircle2, Circle, ThumbsUp, Plus, X, ChevronLeft, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useStudyRoomState } from '../../hooks/useStudyRoomState';
import { useStudyRoomWebSocket } from '../../hooks/StudyRoomWebSocketContext';
import { useAuth } from '../../hooks/AuthContext';

/**
 * 스터디룸 메인 컴포넌트 (WebSocket 통합)
 * 수정사항:
 * 1. WebSocket connect() 호출 추가
 * 2. WebSocket 이벤트 핸들러 등록
 * 3. 컴포넌트 언마운트 시 명시적 disconnect
 */
const StudyRoom = ({ studyRoomId, onBack = () => {} }) => {
    const { user } = useAuth();
    const {
        currentStudyRoom,
        todos,
        loading,
        error,
        fetchStudyRoomDetail,
        fetchTodos,
        joinStudyRoom,
        createTodo,
        updateTodo,
        deleteTodo,
        completeTodo,
        addTodoReaction,
        voteExtension,
        leaveStudyRoom,
        clearError
    } = useStudyRoomState();

    // WebSocket 훅 사용
    const {
        connectionStatus,
        connect,
        disconnect,
        addTodoHandler,
        addReactionHandler,
        addVoteHandler,
        addRoomHandler
    } = useStudyRoomWebSocket();

    const [newTodo, setNewTodo] = useState('');
    const [isAddingTodo, setIsAddingTodo] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [showVoteAlert, setShowVoteAlert] = useState(false);
    const [voteStatus, setVoteStatus] = useState({
        isVoting: false,
        votedUsers: [],
        totalVotes: 0,
        requiredVotes: 0
    });
    const [hasVoted, setHasVoted] = useState(false);

    // WebSocket 이벤트 핸들러 등록
    useEffect(() => {
        if (!studyRoomId) return;

        console.log('[StudyRoom] WebSocket 이벤트 핸들러 등록');

        // To-do와 리액션은 WebSocket 이벤트를 받지 않으므로,
        // CRUD 작업 후 수동으로 fetchTodos 호출

        // 투표 이벤트 핸들러
        const removeVoteHandler = addVoteHandler((event) => {
            console.log('[StudyRoom] 투표 이벤트 수신:', event);

            if (event.type === 'VOTE_UPDATED') {
                setVoteStatus(prev => ({
                    ...prev,
                    totalVotes: event.data.currentVotes,
                    votedUsers: event.data.votedUserIds || []
                }));
            } else if (event.type === 'ROOM_EXTENDED') {
                alert(`투표가 통과되었습니다! ${event.data.extensionMinutes}분 연장됩니다.`);
                setShowVoteAlert(false);
                setVoteStatus(prev => ({ ...prev, isVoting: false }));
                // 스터디룸 정보 새로고침
                fetchStudyRoomDetail(studyRoomId);
            }
        });

        // 스터디룸 이벤트 핸들러
        const removeRoomHandler = addRoomHandler((event) => {
            console.log('[StudyRoom] 스터디룸 이벤트 수신:', event);

            if (event.type === 'USER_JOINED' || event.type === 'USER_LEFT') {
                // 참여자 변경 시 스터디룸 정보 새로고침
                fetchStudyRoomDetail(studyRoomId);
            } else if (event.type === 'ROOM_CLOSED') {
                alert('스터디룸이 종료되었습니다.');
                leaveStudyRoom(studyRoomId);
                onBack();
            }
        });

        // 클린업: 핸들러 제거
        return () => {
            console.log('[StudyRoom] WebSocket 이벤트 핸들러 제거');
            removeVoteHandler();
            removeRoomHandler();
        };
    }, [studyRoomId, addVoteHandler, addRoomHandler]);

    // 스터디룸 참여 및 WebSocket 연결
    useEffect(() => {
        if (!studyRoomId || !user) {
            console.log('[StudyRoom] studyRoomId 또는 user가 없음');
            return;
        }

        console.log('[StudyRoom] 스터디룸 초기화 시작:', studyRoomId);

        const initializeStudyRoom = async () => {
            try {
                // currentStudyRoom이 이미 있는지 확인
                if (!currentStudyRoom || currentStudyRoom.studyRoomId !== studyRoomId) {
                    console.log('[StudyRoom] 스터디룸 상세 정보 로드');
                    await fetchStudyRoomDetail(studyRoomId);
                    await fetchTodos(studyRoomId);
                } else {
                    console.log('[StudyRoom] 스터디룸 정보 이미 로드됨');
                }

                // WebSocket 연결 (약간의 지연 후)
                setTimeout(() => {
                    console.log('[StudyRoom] WebSocket 연결 시작');
                    connect(studyRoomId);
                }, 500);

            } catch (error) {
                console.error('[StudyRoom] 초기화 오류:', error);
            }
        };

        initializeStudyRoom();

        // 컴포넌트 언마운트 시 정리
        return () => {
            console.log('[StudyRoom] 컴포넌트 언마운트 - 정리 시작');
            disconnect();
        };
    }, [studyRoomId, user]); // currentStudyRoom 의존성 제거

    // 남은 시간 계산 및 타이머
    useEffect(() => {
        // currentStudyRoom이 없거나 endTime이 없으면 실행하지 않음
        if (!currentStudyRoom || !currentStudyRoom.endTime) {
            console.log('[StudyRoom] 타이머 시작 불가 - currentStudyRoom 또는 endTime 없음');
            return;
        }

        console.log('[StudyRoom] 타이머 시작 - endTime:', currentStudyRoom.endTime);

        const updateTimer = () => {
            const now = new Date();
            let endTime;

            try {
                // endTime 파싱 처리
                if (currentStudyRoom.endTime.includes('T')) {
                    // ISO 8601 형식: "2024-11-03T16:01:54.077055"
                    endTime = new Date(currentStudyRoom.endTime);
                } else if (currentStudyRoom.endTime.includes(':')) {
                    // 시간만 있는 형식: "16:01:54.077055"
                    const today = new Date();
                    const timeStr = currentStudyRoom.endTime.split('.')[0]; // 밀리초 제거
                    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                    endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);

                    // 만약 계산된 시간이 현재 시간보다 과거라면 다음날로 설정
                    if (endTime < now) {
                        endTime.setDate(endTime.getDate() + 1);
                    }
                } else {
                    console.error('[StudyRoom] 알 수 없는 endTime 형식:', currentStudyRoom.endTime);
                    setRemainingTime(null);
                    return;
                }

                // endTime이 유효한 날짜인지 확인
                if (isNaN(endTime.getTime())) {
                    console.error('[StudyRoom] 유효하지 않은 endTime:', currentStudyRoom.endTime);
                    setRemainingTime(null);
                    return;
                }

                const diff = endTime - now;
                const minutes = Math.floor(diff / 1000 / 60);

                console.log('[StudyRoom] 남은 시간:', minutes, '분', '(endTime:', endTime.toISOString(), ')');
                setRemainingTime(minutes);

                // 5분 전 투표 시작
                if (minutes === 5 && !voteStatus.isVoting && !showVoteAlert) {
                    console.log('[StudyRoom] 연장 투표 시작');
                    setShowVoteAlert(true);
                    const requiredVotes = Math.ceil(currentStudyRoom.currentMembers / 2);
                    setVoteStatus({
                        isVoting: true,
                        votedUsers: [],
                        totalVotes: 0,
                        requiredVotes
                    });
                    setHasVoted(false);
                }

                // 시간 종료
                if (minutes <= 0) {
                    console.log('[StudyRoom] 스터디룸 시간 종료');
                    alert('스터디룸 시간이 종료되었습니다.');
                    disconnect();
                    leaveStudyRoom(studyRoomId);
                    onBack();
                }
            } catch (error) {
                console.error('[StudyRoom] 타이머 업데이트 오류:', error);
                setRemainingTime(null);
            }
        };

        // 즉시 한 번 실행
        updateTimer();

        // 1초마다 업데이트
        const timer = setInterval(updateTimer, 1000);

        return () => {
            console.log('[StudyRoom] 타이머 정리');
            clearInterval(timer);
        };
    }, [currentStudyRoom, voteStatus.isVoting, showVoteAlert, studyRoomId, leaveStudyRoom, onBack, disconnect]);

    // 사용자별 To-Do 그룹화
    const participantTodos = useCallback(() => {
        if (!currentStudyRoom || !user) return [];

        const userTodoMap = {};

        // 현재 사용자를 먼저 추가
        userTodoMap[user.communityId] = {
            userId: user.communityId,
            username: user.communityNickname,
            todos: []
        };

        // 스터디룸의 다른 사용자들 추가
        currentStudyRoom.users?.forEach(roomUser => {
            if (!userTodoMap[roomUser.communityId]) {
                userTodoMap[roomUser.communityId] = {
                    userId: roomUser.communityId,
                    username: roomUser.communityNickname,
                    todos: []
                };
            }
        });

        // To-Do를 사용자별로 그룹화
        todos?.forEach(todo => {
            if (!todo) {
                console.warn('[StudyRoom] todos 배열에 유효하지 않은 (null/undefined) todo 객체가 있음');
                return;
            }

            if (!todo.creatorId) {
                console.warn('[StudyRoom] Todo에 creatorId가 없음:', todo);
                return;
            }

            if (userTodoMap[todo.creatorId]) {
                userTodoMap[todo.creatorId].todos.push(todo);
            }
        });

        // 현재 사용자를 맨 앞에 배치
        const result = Object.values(userTodoMap);
        return result.sort((a, b) => {
            if (a.userId === user.communityId) return -1;
            if (b.userId === user.communityId) return 1;
            return 0;
        });
    }, [currentStudyRoom, todos, user]);

    // To-Do 추가
    const handleAddTodo = async () => {
        if (!newTodo.trim()) return;

        const result = await createTodo(studyRoomId, {
            content: newTodo.trim()
        });

        if (result) {
            setNewTodo('');
            setIsAddingTodo(false);
        }
    };

// To-Do 완료/미완료 토글
    const handleToggleTodo = async (todoId, currentCompleted) => {
        if (currentCompleted) {
            await updateTodo(studyRoomId, todoId, { completed: false });
        } else {
            await completeTodo(studyRoomId, todoId);
        }
    };

// To-Do 삭제
    const handleDeleteTodo = async (todoId) => {
        if (window.confirm('이 To-Do를 삭제하시겠습니까?')) {
            const success = await deleteTodo(studyRoomId, todoId);
        }
    };

// 리액션 추가
    const handleLikeTodo = async (todoUserId, todoId) => {
        if (todoUserId === user?.communityId) {
            alert('자신의 To-Do에는 리액션을 추가할 수 없습니다.');
            return;
        }

        const reactionId = await addTodoReaction(studyRoomId, todoId);
    };

    // 연장 투표
    const handleVote = async (approve) => {
        if (hasVoted) {
            alert('이미 투표하셨습니다.');
            return;
        }

        const vote = approve ? 'agree' : 'disagree';
        const result = await voteExtension(studyRoomId, vote);

        if (result) {
            setHasVoted(true);
        }
    };

    // 스터디룸 퇴장
    const handleLeaveRoom = async () => {
        if (window.confirm('스터디룸에서 나가시겠습니까?')) {
            disconnect();
            const success = await leaveStudyRoom(studyRoomId);
            if (success) {
                onBack();
            }
        }
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}시간 ${mins}분`;
        }
        return `${mins}분`;
    };

    // WebSocket 연결 상태 아이콘
    const ConnectionStatusIcon = () => {
        if (connectionStatus === 'connected') {
            return <Wifi size={16} className="text-green-500" title="실시간 연결됨" />;
        } else if (connectionStatus === 'connecting') {
            return <Wifi size={16} className="text-yellow-500 animate-pulse" title="연결 중..." />;
        } else {
            return <WifiOff size={16} className="text-red-500" title="연결 끊김" />;
        }
    };

    // 참여자 카드 컴포넌트
    const ParticipantCard = ({ participant, isCurrentUser }) => (
        <div className="bg-white rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all shadow-md">
            {/* 프로필 영역 */}
            <div className={`p-4 flex items-center space-x-4 ${
                isCurrentUser
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
                    {participant.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-lg">{participant.username}</h3>
                        {isCurrentUser && (
                            <span className="text-xs bg-white/30 text-white px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">나</span>
                        )}
                    </div>
                    <p className="text-sm text-white/90 mt-1 font-medium">
                        {participant.todos.filter(t => t.completed).length}/{participant.todos.length} 완료
                    </p>
                </div>
            </div>

            {/* To-Do 리스트 영역 */}
            <div className="p-4 bg-gray-50 min-h-[200px] max-h-[300px] overflow-y-auto">
                {isCurrentUser && !isAddingTodo && (
                    <button
                        onClick={() => setIsAddingTodo(true)}
                        className="w-full mb-3 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all text-sm flex items-center justify-center space-x-2 font-medium"
                        disabled={connectionStatus !== 'connected'}
                    >
                        <Plus size={16} />
                        <span>To-do 추가</span>
                    </button>
                )}

                {/* To-Do 입력 폼 */}
                {isCurrentUser && isAddingTodo && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                            placeholder="오늘의 목표는?"
                            className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 text-sm"
                            autoFocus
                            maxLength={100}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setIsAddingTodo(false);
                                    setNewTodo('');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleAddTodo}
                                disabled={!newTodo.trim() || loading || connectionStatus !== 'connected'}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
                            >
                                추가
                            </button>
                        </div>
                    </div>
                )}

                {/* To-Do 목록 */}
                <div className="space-y-2">
                    {participant.todos.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-sm">
                                {isCurrentUser ? '오늘의 목표를 추가해보세요!' : '아직 To-Do가 없습니다'}
                            </p>
                        </div>
                    ) : (
                        participant.todos.map(todo => (
                            <div
                                key={todo.todoId}
                                className={`p-2.5 rounded-lg border transition-all ${
                                    todo.completed
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                                        {isCurrentUser ? (
                                            <button
                                                onClick={() => handleToggleTodo(todo.todoId, todo.completed)}
                                                className="flex-shrink-0 mt-0.5"
                                                disabled={loading || connectionStatus !== 'connected'}
                                            >
                                                {todo.completed ? (
                                                    <CheckCircle2 size={18} className="text-green-600" />
                                                ) : (
                                                    <Circle size={18} className="text-gray-400 hover:text-blue-500" />
                                                )}
                                            </button>
                                        ) : (
                                            <div className="flex-shrink-0 mt-0.5">
                                                {todo.completed ? (
                                                    <CheckCircle2 size={18} className="text-green-600" />
                                                ) : (
                                                    <Circle size={18} className="text-gray-400" />
                                                )}
                                            </div>
                                        )}
                                        <span className={`text-sm flex-1 break-words ${
                                            todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                        }`}>
                                            {todo.content}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2">
                                        {!isCurrentUser && todo.completed && (
                                            <button
                                                onClick={() => handleLikeTodo(participant.userId, todo.todoId)}
                                                className="flex items-center space-x-1 px-1.5 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                disabled={loading || connectionStatus !== 'connected'}
                                            >
                                                <ThumbsUp size={14} />
                                                {todo.reactions && todo.reactions.length > 0 && (
                                                    <span className="text-xs font-medium">{todo.reactions.length}</span>
                                                )}
                                            </button>
                                        )}
                                        {isCurrentUser && (
                                            <button
                                                onClick={() => handleDeleteTodo(todo.todoId)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                disabled={loading || connectionStatus !== 'connected'}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    // 로딩 상태
    if (loading && !currentStudyRoom) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">스터디룸 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error && !currentStudyRoom) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <p className="text-gray-800 font-semibold mb-2">스터디룸을 불러올 수 없습니다</p>
                    <p className="text-gray-600 text-sm mb-4">{error}</p>
                    <div className="flex space-x-2 justify-center">
                        <button
                            onClick={() => {
                                clearError();
                                joinStudyRoom(studyRoomId);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            다시 시도
                        </button>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            목록으로
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentStudyRoom) return null;

    const participants = participantTodos();

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* 상단 헤더 */}
            <div className="border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLeaveRoom}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-gray-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{currentStudyRoom.roomName}</h1>
                            <p className="text-sm text-gray-600">{currentStudyRoom.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <ConnectionStatusIcon />
                            <span className="text-xs text-gray-600">
                                {connectionStatus === 'connected' ? '실시간' :
                                    connectionStatus === 'connecting' ? '연결 중' : '오프라인'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users size={16} className="text-blue-600" />
                            <span className="text-sm text-gray-700 font-medium">
                                {currentStudyRoom.currentMembers}/{currentStudyRoom.maxMembers}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock size={16} className={remainingTime <= 5 ? 'text-red-500' : 'text-blue-600'} />
                            <span className={`text-sm font-semibold ${remainingTime <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                                남은 시간: {formatTime(remainingTime)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 연결 끊김 경고 */}
            {connectionStatus !== 'connected' && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
                    <div className="flex items-center space-x-3">
                        <AlertCircle size={18} className="text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            실시간 연결이 끊어졌습니다. 다른 참여자의 업데이트를 받을 수 없습니다.
                        </p>
                    </div>
                </div>
            )}

            {/* 연장 투표 알림 */}
            {showVoteAlert && voteStatus.isVoting && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <AlertCircle size={20} className="text-amber-600" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">
                                    종료 5분 전입니다! 스터디룸을 {currentStudyRoom.extensionTime}분 연장하시겠습니까?
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    투표 현황: {voteStatus.totalVotes}/{voteStatus.requiredVotes}
                                    ({voteStatus.votedUsers.length}/{currentStudyRoom.currentMembers}명 참여)
                                </p>
                            </div>
                        </div>
                        {!hasVoted && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleVote(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                    disabled={loading || connectionStatus !== 'connected'}
                                >
                                    아니요
                                </button>
                                <button
                                    onClick={() => handleVote(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    disabled={loading || connectionStatus !== 'connected'}
                                >
                                    네, 연장할래요
                                </button>
                            </div>
                        )}
                        {hasVoted && (
                            <span className="text-sm text-amber-700 font-medium">
                                투표 완료 ✓
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 메인 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {participants.length === 0 ? (
                        <div className="text-center py-12">
                            <Users size={48} className="text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">참여자 정보를 불러오는 중...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {participants.map(participant => (
                                <ParticipantCard
                                    key={participant.userId}
                                    participant={participant}
                                    isCurrentUser={participant.userId === user?.communityId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyRoom;