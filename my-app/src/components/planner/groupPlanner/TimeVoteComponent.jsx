import React, { useState, useEffect } from 'react';
import { useTeamPlanner } from '../../../hooks/TeamPlannerProvider';
import { Calendar, Clock, Users, X, Check } from 'lucide-react';

const TimeVoteComponent = ({ plannerId, voteId, onClose }) => {
    const {
        user,
        members,
        createTimeVote,
        submitTimeVote,
        updateTimeVote,
        fetchTimeVoteDetail,
        fetchTimeVoteList,
    } = useTeamPlanner();

    // 상태 관리
    const [mode, setMode] = useState('list'); // 'list', 'create', 'vote', 'view'
    const [voteList, setVoteList] = useState([]);
    const [currentVote, setCurrentVote] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [showVoterModal, setShowVoterModal] = useState(false);
    const [selectedSlotInfo, setSelectedSlotInfo] = useState(null);

    // 생성 폼 상태 (임시, 추후에 정확한 필드로 수정 요망!)
    const [createForm, setCreateForm] = useState({
        title: '',
        voteRange: [],
        finishTime: '',
        memberIds: [],
    });

    // 시간 슬롯 설정 (1시간 단위로 구분)
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
        const time = `${String(hour).padStart(2, '0')}:00`;
        timeSlots.push(time);
    }

    // 초기 투표 목록 로드
    useEffect(() => {
        if (mode === 'list') {
            loadVoteList();
        }
    }, [mode, plannerId]);

    // MOCK!! 아래는 플래너 id가 없어서, 임의로 투표 생성하기 위한 더미 데이터입니다. 추후 삭제 ~.~
    // MOCK!! 임시 더미 데이터 생성 함수. 추후에 삭제
    const createDummyVote = () => {
        const today = new Date();
        const dummyVote = {
            id: 1,
            title: '팀 미팅 시간 정하기',
            voteRange: [
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString().split('T')[0],
            ],
            finishTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 23, 59).toISOString(),
            members: [
                { userId: 1, nickname: 'A', username: 'A' },
                { userId: 2, nickname: 'B', username: 'B' },
                { userId: 3, nickname: 'C', username: 'C' },
                { userId: 4, nickname: 'D', username: 'D' },
            ],
            matrix: generateDummyMatrix([
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
                new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString().split('T')[0],
            ])
        };

        setVoteList([dummyVote]);
        return dummyVote;
    };

    // MOCK!! 더미 매트릭스 데이터 생성 (1시간 단위), 추후 삭제
    const generateDummyMatrix = (dates) => {
        const matrix = [];
        const totalMembers = 4;

        dates.forEach(date => {
            // 9시부터 18시까지만 생성
            for (let hour = 9; hour < 18; hour++) {
                const time = `${String(hour).padStart(2, '0')}:00`;
                // 랜덤하게 득표율 생성
                let overlapCount;
                if (hour === 12 || hour === 13) {
                    overlapCount = Math.floor(Math.random() * 2); // 0-1명
                } else if (hour >= 14 && hour <= 16) {
                    overlapCount = Math.floor(Math.random() * 4) + 1; // 1-4명 (높은 득표율)
                } else {
                    overlapCount = Math.floor(Math.random() * 3); // 0-2명
                }

                matrix.push({
                    date: date,
                    slotStart: time,
                    slotEnd: `${String(hour + 1).padStart(2, '0')}:00`,
                    overlapCount: overlapCount,
                    overlapPercentage: (overlapCount / totalMembers) * 100
                });
            }
        });

        return matrix;
    };

    // 특정 투표 상세 로드
    useEffect(() => {
        if (voteId && (mode === 'vote' || mode === 'view')) {
            loadVoteDetail(voteId);
        }
    }, [voteId, mode]);

    const loadVoteList = async () => {
        try {
            const list = await fetchTimeVoteList(plannerId);
            setVoteList(list || []);
        } catch (error) {
            console.error('투표 목록 로드 실패:', error);
            console.log('더미 데이터를 사용합니다.');
            createDummyVote();
        }
    };

    const loadVoteDetail = async (id) => {
        try {
            const detail = await fetchTimeVoteDetail(plannerId, id);
            setCurrentVote(detail);
        } catch (error) {
            console.error('투표 상세 로드 실패:', error);
            console.log('더미 데이터를 사용합니다.');
            const dummy = createDummyVote();
            setCurrentVote(dummy);
        }
    };

    // 날짜 선택 핸들러
    const handleDateSelect = (date) => {
        setCreateForm(prev => {
            const dates = [...prev.voteRange];
            const index = dates.indexOf(date);
            if (index > -1) {
                dates.splice(index, 1);
            } else if (dates.length < 5) {
                dates.push(date);
            }
            return { ...prev, voteRange: dates.sort() };
        });
    };

    // 멤버 선택 핸들러
    const handleMemberSelect = (memberId) => {
        setCreateForm(prev => {
            const ids = [...prev.memberIds];
            const index = ids.indexOf(memberId);
            if (index > -1) {
                ids.splice(index, 1);
            } else {
                ids.push(memberId);
            }
            return { ...prev, memberIds: ids };
        });
    };

    // 투표 생성
    const handleCreateVote = async () => {
        try {
            const newVoteId = await createTimeVote(plannerId, createForm);
            alert('시간 투표가 생성되었습니다!');
            setMode('list');
            setCreateForm({ title: '', voteRange: [], finishTime: '', memberIds: [] });
        } catch (error) {
            console.error('투표 생성 실패:', error);
            alert('투표 생성에 실패했습니다.');
        }
    };

    // 슬롯 클릭 시 투표자 보기
    const handleSlotClick = (date, time, matrixSlot) => {
        if (mode === 'view' && matrixSlot && matrixSlot.overlapCount > 0) {
            const voters = generateVotersForSlot(matrixSlot.overlapCount);
            setSelectedSlotInfo({
                date: date,
                time: time,
                voters: voters,
                count: matrixSlot.overlapCount,
                percentage: matrixSlot.overlapPercentage
            });
            setShowVoterModal(true);
        }
    };

    // 더미 투표자 생성
    const generateVotersForSlot = (count) => {
        const allMembers = currentVote?.members || [
            { userId: 1, nickname: 'A', username: 'A' },
            { userId: 2, nickname: 'B', username: 'B' },
            { userId: 3, nickname: 'C', username: 'C' },
            { userId: 4, nickname: 'D', username: 'D' },
        ];

        const shuffled = [...allMembers].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // 슬롯 선택/해제 (드래그)
    const handleSlotMouseDown = (date, time) => {
        setIsDragging(true);
        toggleSlot(date, time);
    };

    const handleSlotMouseEnter = (date, time) => {
        if (isDragging) {
            toggleSlot(date, time);
        }
    };

    const handleSlotMouseUp = () => {
        setIsDragging(false);
    };

    const toggleSlot = (date, timeStr) => {
        const slotKey = `${date}_${timeStr}`;
        setSelectedSlots(prev => {
            if (prev.includes(slotKey)) {
                return prev.filter(s => s !== slotKey);
            } else {
                return [...prev, slotKey];
            }
        });
    };

    // 선택한 슬롯을 AvailableDateTimeDto 형식으로 변환
    const convertSlotsToDto = () => {
        const dateMap = {};

        selectedSlots.forEach(slotKey => {
            const [date, time] = slotKey.split('_');
            if (!dateMap[date]) {
                dateMap[date] = [];
            }
            dateMap[date].push(time);
        });

        return Object.keys(dateMap).map(date => {
            const times = dateMap[date].sort();
            const intervals = [];
            let startTime = null;

            times.forEach((time, index) => {
                if (!startTime) {
                    startTime = time;
                }

                const nextTime = times[index + 1];
                const currentMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
                const nextMinutes = nextTime ? parseInt(nextTime.split(':')[0]) * 60 + parseInt(nextTime.split(':')[1]) : null;

                if (!nextTime || nextMinutes - currentMinutes > 60) {
                    const endHour = parseInt(time.split(':')[0]) + 1;
                    const endTime = `${String(endHour).padStart(2, '0')}:00`;

                    intervals.push({
                        startTime: startTime,
                        endTime: endTime
                    });
                    startTime = null;
                }
            });

            return {
                date: date,
                intervals: intervals
            };
        });
    };

    // 투표 제출
    const handleSubmitVote = async () => {
        try {
            const availableDateTimes = convertSlotsToDto();
            await submitTimeVote(plannerId, currentVote.id, availableDateTimes);
            alert('투표가 제출되었습니다!');
            loadVoteDetail(currentVote.id);
        } catch (error) {
            console.error('투표 제출 실패:', error);
            alert('투표 제출에 실패했습니다.');
        }
    };

    // 재투표
    const handleUpdateVote = async () => {
        try {
            const availableDateTimes = convertSlotsToDto();
            await updateTimeVote(plannerId, currentVote.id, availableDateTimes);
            alert('투표가 수정되었습니다!');
            loadVoteDetail(currentVote.id);
        } catch (error) {
            console.error('재투표 실패:', error);
            alert('재투표에 실패했습니다.');
        }
    };

    // 득표율에 따른 색상 (일단 초록색 베이스)
    const getColorByPercentage = (percentage) => {
        if (percentage === 0) return 'bg-gray-100';
        if (percentage < 30) return 'bg-green-200';
        if (percentage < 60) return 'bg-green-400';
        if (percentage < 90) return 'bg-green-600';
        return 'bg-green-800';
    };

    // 리스트 모드 렌더링
    if (mode === 'list') {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Clock className="w-6 h-6" />
                        시간 투표
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={createDummyVote}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            더미 투표 생성 (테스트용)
                        </button>
                        <button
                            onClick={() => setMode('create')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            새 투표 만들기
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {voteList.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">진행 중인 투표가 없습니다.</p>
                    ) : (
                        voteList.map(vote => (
                            <div
                                key={vote.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => {
                                    setMode('view');
                                    loadVoteDetail(vote.id);
                                }}
                            >
                                <h3 className="font-semibold text-lg">{vote.title}</h3>
                                <div className="text-sm text-gray-600 mt-2">
                                    <p>투표 기간: {vote.voteRange?.join(', ')}</p>
                                    <p>마감: {new Date(vote.finishTime).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // 생성 모드 렌더링
    if (mode === 'create') {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">새 시간 투표 만들기</h2>
                    <button onClick={() => setMode('list')} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block font-semibold mb-2">투표 제목</label>
                        <input
                            type="text"
                            value={createForm.title}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="예: 팀 미팅 시간 정하기"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">투표 날짜 선택 (최대 5일)</label>
                        <input
                            type="date"
                            onChange={(e) => handleDateSelect(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {createForm.voteRange.map(date => (
                                <span
                                    key={date}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1"
                                >
                  {date}
                                    <X
                                        className="w-4 h-4 cursor-pointer"
                                        onClick={() => handleDateSelect(date)}
                                    />
                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">마감 시간</label>
                        <input
                            type="datetime-local"
                            value={createForm.finishTime}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, finishTime: e.target.value }))}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2">참여 멤버</label>
                        <div className="grid grid-cols-2 gap-2">
                            {members.map(member => (
                                <label
                                    key={member.userId}
                                    className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={createForm.memberIds.includes(member.userId)}
                                        onChange={() => handleMemberSelect(member.userId)}
                                    />
                                    <span>{member.nickname || member.username}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleCreateVote}
                        disabled={!createForm.title || createForm.voteRange.length === 0 || !createForm.finishTime}
                        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        투표 생성하기
                    </button>
                </div>
            </div>
        );
    }

    // 투표/조회 모드 렌더링
    if (mode === 'vote' || mode === 'view') {
        if (!currentVote) {
            return <div className="text-center py-8">로딩 중...</div>;
        }

        const isExpired = new Date(currentVote.finishTime) < new Date();

        return (
            <>
                <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{currentVote.title}</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                마감: {new Date(currentVote.finishTime).toLocaleString()}
                                {isExpired && <span className="text-red-500 ml-2">(마감됨)</span>}
                            </p>
                        </div>
                        <button onClick={() => setMode('list')} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            참여 멤버 ({currentVote.members?.length || 0}명)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {currentVote.members?.map(member => (
                                <span key={member.userId} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {member.nickname || member.username}
                </span>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto mb-6">
                        <div className="inline-block min-w-full">
                            <table className="border-collapse">
                                <thead>
                                <tr>
                                    <th className="border p-2 bg-gray-100 sticky left-0 z-10">시간</th>
                                    {currentVote.voteRange?.map(date => (
                                        <th key={date} className="border p-2 bg-gray-100 min-w-[120px]">
                                            {new Date(date).toLocaleDateString('ko-KR', {
                                                month: 'short',
                                                day: 'numeric',
                                                weekday: 'short'
                                            })}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {timeSlots.map(time => (
                                    <tr key={time}>
                                        <td className="border p-2 text-sm bg-gray-50 sticky left-0 z-10">
                                            {time}
                                        </td>
                                        {currentVote.voteRange?.map(date => {
                                            const matrixSlot = currentVote.matrix?.find(
                                                m => m.date === date && m.slotStart === time
                                            );
                                            const slotKey = `${date}_${time}`;
                                            const isSelected = selectedSlots.includes(slotKey);

                                            return (
                                                <td
                                                    key={`${date}_${time}`}
                                                    className={`border p-2 transition-colors ${
                                                        mode === 'view'
                                                            ? `${getColorByPercentage(matrixSlot?.overlapPercentage || 0)} ${matrixSlot?.overlapCount > 0 ? 'cursor-pointer hover:opacity-80' : ''}`
                                                            : isSelected
                                                                ? 'bg-blue-500 cursor-pointer'
                                                                : 'bg-white hover:bg-blue-100 cursor-pointer'
                                                    }`}
                                                    onClick={() => mode === 'view' ? handleSlotClick(date, time, matrixSlot) : null}
                                                    onMouseDown={() => !isExpired && mode === 'vote' && handleSlotMouseDown(date, time)}
                                                    onMouseEnter={() => !isExpired && mode === 'vote' && handleSlotMouseEnter(date, time)}
                                                    onMouseUp={handleSlotMouseUp}
                                                >
                                                    {mode === 'view' && matrixSlot && (
                                                        <div className="text-xs text-center font-semibold">
                                                            {matrixSlot.overlapCount}명
                                                            <br />
                                                            ({matrixSlot.overlapPercentage.toFixed(0)}%)
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {mode === 'view' && (
                        <div className="flex items-center gap-4 mb-6 text-sm">
                            <span className="font-semibold">득표율:</span>
                            <div className="flex items-center gap-1">
                                <div className="w-6 h-6 bg-gray-100 border"></div>
                                <span>0%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-6 h-6 bg-green-200 border"></div>
                                <span>~30%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-6 h-6 bg-green-400 border"></div>
                                <span>~60%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-6 h-6 bg-green-600 border"></div>
                                <span>~90%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-6 h-6 bg-green-800 border"></div>
                                <span>90%+</span>
                            </div>
                        </div>
                    )}

                    {mode === 'vote' && !isExpired && (
                        <div className="flex gap-4">
                            <button
                                onClick={handleSubmitVote}
                                disabled={selectedSlots.length === 0}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                투표 제출하기
                            </button>
                            <button
                                onClick={() => setMode('view')}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                결과 보기
                            </button>
                        </div>
                    )}

                    {mode === 'view' && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setMode('vote');
                                    setSelectedSlots([]);
                                }}
                                disabled={isExpired}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                            >
                                내 투표 수정하기
                            </button>
                        </div>
                    )}
                </div>

                {/* 투표자 모달 */}
                {showVoterModal && selectedSlotInfo && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowVoterModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold">투표자 정보</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(selectedSlotInfo.date).toLocaleDateString('ko-KR', {
                                            month: 'short',
                                            day: 'numeric',
                                            weekday: 'short'
                                        })} {selectedSlotInfo.time}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowVoterModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Users className="w-4 h-4" />
                                    <span className="font-semibold">
                    {selectedSlotInfo.count}명이 투표 ({selectedSlotInfo.percentage.toFixed(0)}%)
                  </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700 mb-2">투표한 멤버:</p>
                                {selectedSlotInfo.voters.map((voter) => (
                                    <div
                                        key={voter.userId}
                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                                            {voter.nickname}
                                        </div>
                                        <span className="text-sm">{voter.nickname}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowVoterModal(false)}
                                className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return null;
};

export default TimeVoteComponent;