import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle2, Circle, ThumbsUp, Plus, X, ChevronLeft, AlertCircle } from 'lucide-react';

/**
 * 스터디룸 메인 컴포넌트
 * - To-Do 리스트 작성 및 관리
 * - 다른 참여자들의 To-Do 리스트 보기
 * - 완료된 To-Do에 엄지척 반응
 * - 종료 5분 전 연장 투표
 *
 * @param {string} studyRoomId - 스터디룸 ID (API 조회용)
 * @param {function} onBack - 뒤로가기 콜백
 */
const StudyRoom = ({ studyRoomId, onBack = () => {} }) => {
    // TODO: API - 스터디룸 정보 가져오기
    // GET /api/study-rooms/${studyRoomId}
    const [roomInfo, setRoomInfo] = useState({
        roomId: studyRoomId,
        roomName: '자격증 준비 스터디',
        category: '자격증',
        description: '함께 자격증 공부해요',
        duration: 120, // 분
        extensionTime: 30,
        endTime: new Date(Date.now() + 120 * 60 * 1000), // 2시간 후
        createdAt: new Date(),
        currentMembers: 3,
        maxMembers: 10
    });

    // TODO: API - 현재 로그인한 사용자 정보 가져오기
    // GET /api/users/me
    const [currentUser] = useState({
        userId: 10,
        username: '농담곰러버'
    });

    // TODO: API - 참여자 목록 및 To-Do 리스트 가져오기
    // WebSocket으로 실시간 동기화: ws://api/study-rooms/${studyRoomId}/ws
    const [participants, setParticipants] = useState([
        {
            userId: 10,
            username: '농담곰러버',
            todos: []
        },
        {
            userId: 20,
            username: '치이카와',
            todos: [
                { id: 'todo-1', content: '1장 정리하기', completed: true, likes: 2 },
                { id: 'todo-2', content: '2장 문제 풀기', completed: false, likes: 0 }
            ]
        },
        {
            userId: 30,
            username: '하치와레',
            todos: [
                { id: 'todo-3', content: '모의고사 풀기', completed: true, likes: 1 }
            ]
        }
    ]);

    // 투표 상태
    const [voteStatus, setVoteStatus] = useState({
        isVoting: false,
        votedUsers: [],
        totalVotes: 0,
        requiredVotes: 2 // 과반수
    });

    // 시간 관련 상태
    const [remainingTime, setRemainingTime] = useState(0);
    const [showVoteAlert, setShowVoteAlert] = useState(false);

    // 새 To-Do 입력
    const [newTodo, setNewTodo] = useState('');
    const [isAddingTodo, setIsAddingTodo] = useState(false);

    // TODO: WebSocket 연결 설정
    useEffect(() => {
        // const ws = new WebSocket(`ws://api/study-rooms/${studyRoomId}/ws`);
        //
        // ws.onmessage = (event) => {
        //     const data = JSON.parse(event.data);
        //     switch(data.type) {
        //         case 'TODO_ADDED':
        //         case 'TODO_UPDATED':
        //         case 'TODO_DELETED':
        //         case 'TODO_LIKED':
        //             // 참여자 목록 업데이트
        //             setParticipants(data.participants);
        //             break;
        //         case 'VOTE_UPDATED':
        //             setVoteStatus(data.voteStatus);
        //             break;
        //     }
        // };
        //
        // return () => ws.close();
    }, [studyRoomId]);

    // 남은 시간 계산
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = roomInfo.endTime - now;
            const minutes = Math.floor(diff / 1000 / 60);

            setRemainingTime(minutes);

            // 5분 전에 투표 시작
            if (minutes === 5 && !voteStatus.isVoting) {
                setShowVoteAlert(true);
                setVoteStatus(prev => ({ ...prev, isVoting: true }));
                // TODO: API - 투표 시작 알림
                // POST /api/study-rooms/${studyRoomId}/vote/start
            }

            // 시간 종료
            if (minutes <= 0) {
                clearInterval(timer);
                alert('스터디룸 시간이 종료되었습니다.');
                if (onBack) onBack();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [roomInfo.endTime, voteStatus.isVoting, onBack, studyRoomId]);

    // To-Do 추가
    const handleAddTodo = () => {
        if (!newTodo.trim()) return;

        const newTodoItem = {
            id: `todo-${Date.now()}`,
            content: newTodo.trim(),
            completed: false,
            likes: 0
        };

        setParticipants(prev => prev.map(p =>
            p.userId === currentUser.userId
                ? { ...p, todos: [...p.todos, newTodoItem] }
                : p
        ));

        setNewTodo('');
        setIsAddingTodo(false);

        // TODO: API - To-Do 추가
        // POST /api/study-rooms/${studyRoomId}/todos
        // Body: { content: newTodo.trim() }
        console.log('Add todo:', newTodoItem);
    };

    // To-Do 완료/미완료 토글
    const handleToggleTodo = (todoId) => {
        setParticipants(prev => prev.map(p =>
            p.userId === currentUser.userId
                ? {
                    ...p,
                    todos: p.todos.map(t =>
                        t.id === todoId ? { ...t, completed: !t.completed } : t
                    )
                }
                : p
        ));

        // TODO: API - To-Do 상태 변경
        // PATCH /api/study-rooms/${studyRoomId}/todos/${todoId}
        // Body: { completed: !currentCompleted }
        console.log('Toggle todo:', todoId);
    };

    // To-Do 삭제
    const handleDeleteTodo = (todoId) => {
        setParticipants(prev => prev.map(p =>
            p.userId === currentUser.userId
                ? { ...p, todos: p.todos.filter(t => t.id !== todoId) }
                : p
        ));

        // TODO: API - To-Do 삭제
        // DELETE /api/study-rooms/${studyRoomId}/todos/${todoId}
        console.log('Delete todo:', todoId);
    };

    // 엄지척 추가
    const handleLikeTodo = (userId, todoId) => {
        if (userId === currentUser.userId) {
            alert('자신의 To-Do에는 좋아요를 누를 수 없습니다.');
            return;
        }

        setParticipants(prev => prev.map(p =>
            p.userId === userId
                ? {
                    ...p,
                    todos: p.todos.map(t =>
                        t.id === todoId ? { ...t, likes: t.likes + 1 } : t
                    )
                }
                : p
        ));

        // TODO: API - 좋아요 추가
        // POST /api/study-rooms/${studyRoomId}/todos/${todoId}/like
        console.log('Like todo:', { userId, todoId });
    };

    // 연장 투표
    const handleVote = (approve) => {
        if (voteStatus.votedUsers.includes(currentUser.userId)) {
            alert('이미 투표하셨습니다.');
            return;
        }

        const newVotedUsers = [...voteStatus.votedUsers, currentUser.userId];
        const newTotalVotes = approve ? voteStatus.totalVotes + 1 : voteStatus.totalVotes;

        setVoteStatus(prev => ({
            ...prev,
            votedUsers: newVotedUsers,
            totalVotes: newTotalVotes
        }));

        // 모든 참여자가 투표했거나 과반수 달성
        if (newVotedUsers.length === roomInfo.currentMembers) {
            if (newTotalVotes >= voteStatus.requiredVotes) {
                alert(`투표가 통과되었습니다! ${roomInfo.extensionTime}분 연장됩니다.`);
                setRoomInfo(prev => ({
                    ...prev,
                    endTime: new Date(prev.endTime.getTime() + roomInfo.extensionTime * 60 * 1000)
                }));
            } else {
                alert('투표가 부결되었습니다. 스터디룸은 예정대로 종료됩니다.');
            }
            setVoteStatus(prev => ({ ...prev, isVoting: false }));
            setShowVoteAlert(false);
        }

        // TODO: API - 투표하기
        // POST /api/study-rooms/${studyRoomId}/vote
        // Body: { approve: boolean }
        console.log('Vote:', { approve, userId: currentUser.userId });
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}시간 ${mins}분`;
        }
        return `${mins}분`;
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
                {/* 프로필 이미지 */}
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
                    {participant.username.charAt(0)}
                </div>

                {/* 닉네임 및 진행률 */}
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
                    >
                        <Plus size={16} />
                        <span>목표 추가</span>
                    </button>
                )}

                {/* To-Do 입력 폼 (현재 사용자만) */}
                {isCurrentUser && isAddingTodo && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                            placeholder="학습 목표를 입력하세요..."
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
                                disabled={!newTodo.trim()}
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
                            <p className="text-sm">아직 학습 목표가 없습니다</p>
                        </div>
                    ) : (
                        participant.todos.map(todo => (
                            <div
                                key={todo.id}
                                className={`p-2.5 rounded-lg border ${
                                    todo.completed
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                                        {isCurrentUser ? (
                                            <button
                                                onClick={() => handleToggleTodo(todo.id)}
                                                className="flex-shrink-0 mt-0.5"
                                            >
                                                {todo.completed ? (
                                                    <CheckCircle2 size={18} className="text-green-600" />
                                                ) : (
                                                    <Circle size={18} className="text-gray-400" />
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
                                                onClick={() => handleLikeTodo(participant.userId, todo.id)}
                                                className="flex items-center space-x-1 px-1.5 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                            >
                                                <ThumbsUp size={14} />
                                                {todo.likes > 0 && (
                                                    <span className="text-xs font-medium">{todo.likes}</span>
                                                )}
                                            </button>
                                        )}
                                        {isCurrentUser && (
                                            <button
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
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

    return (
        <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* 상단 헤더 */}
            <div className="border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-gray-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{roomInfo.roomName}</h1>
                            <p className="text-sm text-gray-600">{roomInfo.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Users size={16} className="text-blue-600" />
                            <span className="text-sm text-gray-700 font-medium">
                                {roomInfo.currentMembers}/{roomInfo.maxMembers}
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

            {/* 연장 투표 알림 */}
            {showVoteAlert && voteStatus.isVoting && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <AlertCircle size={20} className="text-amber-600" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">
                                    종료 5분 전입니다! 스터디룸을 {roomInfo.extensionTime}분 연장하시겠습니까?
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    투표 현황: {voteStatus.totalVotes}/{voteStatus.requiredVotes}
                                    ({voteStatus.votedUsers.length}/{roomInfo.currentMembers}명 참여)
                                </p>
                            </div>
                        </div>
                        {!voteStatus.votedUsers.includes(currentUser.userId) && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleVote(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                >
                                    아니요
                                </button>
                                <button
                                    onClick={() => handleVote(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    네, 연장할래요
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 메인 컨텐츠 - 화상통화 그리드 스타일 */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {participants.map(participant => (
                            <ParticipantCard
                                key={participant.userId}
                                participant={participant}
                                isCurrentUser={participant.userId === currentUser.userId}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyRoom;