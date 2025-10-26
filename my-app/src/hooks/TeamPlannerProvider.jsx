import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TeamPlannerContext = createContext(null);

export const TeamPlannerProvider = ({ children }) => {
    const [planners, setPlanners] = useState([]);
    const [currentPlanner, setCurrentPlanner] = useState(null);
    const [members, setMembers] = useState([]); // MemberDto 배열
    const [schedules, setSchedules] = useState([]); // TeamScheduleBriefDto 배열
    const [categories, setCategories] = useState([]); // CategoryDto 배열
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, isAuthenticated, getAuthHeaders } = useAuth();

    // 에러 핸들링 헬퍼
    const handleError = (error, customMessage) => {
        console.error(customMessage, error);
        const errorMessage = error.response?.data?.message || error.message || customMessage;
        setError(errorMessage);
        throw new Error(errorMessage);
    };

    const currentUser = user || {
        userId: null,
        username: '게스트',
        loginId: null,
    };

    // 인증 체크
    const checkAuth = () => {
        if (!isAuthenticated || !user) {
            throw new Error('로그인이 필요합니다.');
        }
    };

    // ==================== 플래너 CRUD ====================

    /**
     * 플래너 생성
     * @param {Object} plannerData - { title, description, profileImage }
     * @returns {Promise<number>} plannerId
     */
    const createPlanner = useCallback(async (plannerData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            console.log('플래너 생성 요청:', { ...plannerData, creatorId: currentUser.userId });
            const response = await fetch(`/api/team-planner/create`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: plannerData.title,
                    description: plannerData.description,
                    profileImage: plannerData.profileImage || '',
                    creatorId: currentUser.userId
                }),
            });

            if (!response.ok) {
                throw new Error('플래너 생성에 실패했습니다.');
            }

            const plannerId = await response.json();
            console.log('생성된 플래너 ID:', plannerId);

            // 플래너 목록 다시 불러오기
            await fetchPlanners();

            return plannerId;
        } catch (error) {
            handleError(error, '플래너 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [user, isAuthenticated, getAuthHeaders]);

    /**
     * 플래너 목록 조회
     * @returns {Promise<Array>} planners
     */
    const fetchPlanners = useCallback(async () => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/team-planner/list`, {
                method: 'GET',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('플래너 목록을 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log('받아온 플래너 목록:', data);
            if (data && data.length > 0) {
                console.log('첫 번째 플래너:', data[0]);
                console.log('플래너 객체의 키들:', Object.keys(data[0]));
            }
            setPlanners(data);
            return data;
        } catch (error) {
            handleError(error, '플래너 목록 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [user, isAuthenticated, getAuthHeaders]);

    /**
     * 플래너 업데이트
     * @param {number} plannerId
     * @param {Object} updateData - { title, description, profileImage }
     * @returns {Promise<Object>} TeamPlannerDto
     */
    const updatePlanner = useCallback(async (plannerId, updateData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/team-planner/${plannerId}/update`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('플래너 업데이트에 실패했습니다.');
            }

            const updatedPlanner = await response.json();

            // 로컬 상태 업데이트
            setPlanners(prev =>
                prev.map(p => p.plannerId === plannerId ? updatedPlanner : p)
            );

            if (currentPlanner?.plannerId === plannerId) {
                setCurrentPlanner(updatedPlanner);
            }

            return updatedPlanner;
        } catch (error) {
            handleError(error, '플래너 업데이트 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [currentPlanner, isAuthenticated, getAuthHeaders]);

    /**
     * 플래너 삭제
     * @param {number} plannerId
     * @returns {Promise<void>}
     */
    const deletePlanner = useCallback(async (plannerId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/team-planner/${plannerId}/delete`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('플래너 삭제에 실패했습니다.');
            }

            // 로컬 상태에서 제거
            setPlanners(prev => prev.filter(p => p.plannerId !== plannerId));

            if (currentPlanner?.plannerId === plannerId) {
                setCurrentPlanner(null);
                setMembers([]);
            }
        } catch (error) {
            handleError(error, '플래너 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [currentPlanner, isAuthenticated, getAuthHeaders]);

    // ==================== 멤버 관리 ====================

    /**
     * 멤버 추가
     * @param {number} plannerId
     * @param {number} memberId
     * @param {string} role - "manager" or "member"
     * @returns {Promise<void>}
     */
    const addMember = useCallback(async (plannerId, memberId, role) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/member/${memberId}/${role}`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('멤버 추가에 실패했습니다.');
            }

            // 멤버 목록 다시 불러오기
            await fetchMembers(plannerId);
        } catch (error) {
            handleError(error, '멤버 추가 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 멤버 목록 조회 (활성 멤버만)
     * @param {number} plannerId
     * @returns {Promise<Array>} MemberDto 배열
     */
    const fetchMembers = useCallback(async (plannerId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/member`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('멤버 목록을 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log('받아온 멤버 목록 (MemberDto[]):', data);

            if (data && data.length > 0) {
                console.log('첫 번째 멤버 DTO:', data[0]);
                console.log('MemberDto 필드:', Object.keys(data[0]));
            }

            const activeMembers = data.filter(member => member.status === 'active');
            setMembers(activeMembers);
            return activeMembers;
        } catch (error) {
            handleError(error, '멤버 목록 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 멤버 삭제 (status를 'withdrawn'으로 변경)
     * @param {number} plannerId
     * @param {number} memberId
     * @returns {Promise<void>}
     */
    const removeMember = useCallback(async (plannerId, memberId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/member/${memberId}`,
                {
                    method: 'DELETE',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('멤버 삭제에 실패했습니다.');
            }

            setMembers(prev => prev.filter(m => m.userId !== memberId));
        } catch (error) {
            handleError(error, '멤버 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 멤버 별명(nickname) 업데이트
     * @param {number} plannerId
     * @param {number} memberId
     * @param {string} nickname - 새로운 별명
     * @returns {Promise<void>}
     */
    const updateMemberNickname = useCallback(async (plannerId, memberId, nickname) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/member/${memberId}/${nickname}`,
                {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('멤버 별명 업데이트에 실패했습니다.');
            }

            await fetchMembers(plannerId);
        } catch (error) {
            handleError(error, '멤버 별명 업데이트 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    // ==================== 일정(Schedule) 관리 ====================

    /**
     * 일정 생성
     * @param {number} plannerId
     * @param {Object} scheduleData - { title, categoryId?, startDateTime, finishDateTime, location, memo + editorRange }
     * @returns {Promise<number>} scheduleId
     */
    const createSchedule = useCallback(async (plannerId, scheduleData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/create`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        plannerId,
                        categoryId: scheduleData.categoryId || null,
                        title: scheduleData.title,
                        startDateTime: scheduleData.startDateTime,
                        finishDateTime: scheduleData.finishDateTime,
                        location: scheduleData.location || '',
                        memo: scheduleData.memo || '',
                        editorRange: scheduleData.editorRange || ''
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('일정 생성에 실패했습니다.');
            }

            const scheduleId = await response.json();
            console.log('생성된 일정 ID:', scheduleId);
            return scheduleId;
        } catch (error) {
            handleError(error, '일정 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 일정 상세 조회
     * @param {number} plannerId
     * @param {number} scheduleId
     * @returns {Promise<Object>} TeamScheduleDto
     */
    const fetchScheduleDetail = useCallback(async (plannerId, scheduleId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('일정 상세 조회에 실패했습니다.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            handleError(error, '일정 상세 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 일정 수정
     * @param {number} plannerId
     * @param {number} scheduleId
     * @param {Object} updateData
     * @returns {Promise<Object>} TeamScheduleDto
     */
    const updateSchedule = useCallback(async (plannerId, scheduleId, updateData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/edit`,
                {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                }
            );

            if (!response.ok) {
                throw new Error('일정 수정에 실패했습니다.');
            }

            const updatedSchedule = await response.json();
            return updatedSchedule;
        } catch (error) {
            handleError(error, '일정 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 일정 삭제
     * @param {number} plannerId
     * @param {number} scheduleId
     * @returns {Promise<void>}
     */
    const deleteSchedule = useCallback(async (plannerId, scheduleId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/delete`,
                {
                    method: 'DELETE',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('일정 삭제에 실패했습니다.');
            }

            setSchedules(prev => prev.filter(s => s.scheduleId !== scheduleId));
        } catch (error) {
            handleError(error, '일정 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 드래그앤드롭으로 일정 날짜 수정
     * @param {number} plannerId
     * @param {number} scheduleId
     * @param {Object} dateTime - { startDateTime, finishDateTime }
     * @returns {Promise<void>}
     */
    const updateScheduleDateTime = useCallback(async (plannerId, scheduleId, dateTime) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/drag-drop`,
                {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dateTime),
                }
            );

            if (!response.ok) {
                throw new Error('일정 날짜 수정에 실패했습니다.');
            }
        } catch (error) {
            handleError(error, '일정 날짜 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 일정에 참여하기
     * @param {number} plannerId
     * @param {number} scheduleId
     * @param {number} userId
     * @returns {Promise<Array>} MemberBriefDto[]
     */
    const joinSchedule = useCallback(async (plannerId, scheduleId, userId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/join/${userId}`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('일정 참여에 실패했습니다.');
            }

            const members = await response.json();
            return members;
        } catch (error) {
            handleError(error, '일정 참여 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 일정 참여 멤버 추가
     * @param {number} plannerId
     * @param {number} scheduleId
     * @returns {Promise<Array>} MemberBriefDto[]
     */
    const addScheduleMember = useCallback(async (plannerId, scheduleId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/add-member`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('일정 멤버 추가에 실패했습니다.');
            }

            const members = await response.json();
            return members;
        } catch (error) {
            handleError(error, '일정 멤버 추가 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 일정 참여 멤버 삭제
     * @param {number} plannerId
     * @param {number} scheduleId
     * @returns {Promise<void>}
     */
    const removeScheduleMember = useCallback(async (plannerId, scheduleId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/delete-member`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('일정 멤버 삭제에 실패했습니다.');
            }
        } catch (error) {
            handleError(error, '일정 멤버 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 월별 일정 조회
     * @param {number} plannerId
     * @param {number} year
     * @param {number} month
     * @returns {Promise<Array>} TeamScheduleBriefDto[]
     */
    const fetchMonthlySchedules = useCallback(async (plannerId, year, month) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/monthly/${year}/${month}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('월별 일정 조회에 실패했습니다.');
            }

            const data = await response.json();
            setSchedules(data);
            return data;
        } catch (error) {
            handleError(error, '월별 일정 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 주별 일정 조회
     * @param {number} plannerId
     * @param {number} year
     * @param {number} weekNumber
     * @returns {Promise<Array>} TeamScheduleBriefDto[]
     */
    const fetchWeeklySchedules = useCallback(async (plannerId, year, weekNumber) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/weekly/${year}/${weekNumber}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('주별 일정 조회에 실패했습니다.');
            }

            const data = await response.json();
            setSchedules(data);
            return data;
        } catch (error) {
            handleError(error, '주별 일정 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 일별 일정 조회
     * @param {number} plannerId
     * @param {number} year
     * @param {number} month
     * @param {number} day
     * @returns {Promise<Array>} TeamScheduleBriefDto[]
     */
    const fetchDailySchedules = useCallback(async (plannerId, year, month, day) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/daily/${year}/${month}/${day}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('일별 일정 조회에 실패했습니다.');
            }

            const data = await response.json();
            setSchedules(data);
            return data;
        } catch (error) {
            handleError(error, '일별 일정 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    // ==================== 카테고리 관리 ====================

    /**
     * 카테고리 생성
     * @param {number} plannerId
     * @param {Object} categoryData - { name, color }
     * @returns {Promise<number>} categoryId
     */
    const createCategory = useCallback(async (plannerId, categoryData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/category`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(categoryData),
                }
            );

            if (!response.ok) {
                throw new Error('카테고리 생성에 실패했습니다.');
            }

            const categoryId = await response.json();
            await fetchCategories(plannerId);
            return categoryId;
        } catch (error) {
            handleError(error, '카테고리 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 카테고리 목록 조회
     * @param {number} plannerId
     * @returns {Promise<Array>} CategoryDto[]
     */
    const fetchCategories = useCallback(async (plannerId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/category`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('카테고리 목록 조회에 실패했습니다.');
            }

            const data = await response.json();
            setCategories(data);
            return data;
        } catch (error) {
            handleError(error, '카테고리 목록 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 카테고리 수정
     * @param {number} plannerId
     * @param {number} categoryId
     * @param {Object} updateData - { name, color }
     * @returns {Promise<Object>} CategoryDto
     */
    const updateCategory = useCallback(async (plannerId, categoryId, updateData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/category/${categoryId}`,
                {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                }
            );

            if (!response.ok) {
                throw new Error('카테고리 수정에 실패했습니다.');
            }

            const updatedCategory = await response.json();
            setCategories(prev =>
                prev.map(c => c.categoryId === categoryId ? updatedCategory : c)
            );
            return updatedCategory;
        } catch (error) {
            handleError(error, '카테고리 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 카테고리 삭제
     * @param {number} plannerId
     * @param {number} categoryId
     * @returns {Promise<void>}
     */
    const deleteCategory = useCallback(async (plannerId, categoryId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/category/${categoryId}`,
                {
                    method: 'DELETE',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('카테고리 삭제에 실패했습니다.');
            }

            setCategories(prev => prev.filter(c => c.categoryId !== categoryId));
        } catch (error) {
            handleError(error, '카테고리 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 카테고리별 일정 조회
     * @param {number} plannerId
     * @param {number} categoryId
     * @returns {Promise<Array>} TeamScheduleBriefDto[]
     */
    const fetchSchedulesByCategory = useCallback(async (plannerId, categoryId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/category/${categoryId}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('카테고리별 일정 조회에 실패했습니다.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            handleError(error, '카테고리별 일정 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    // ==================== 투두리스트 관리 ====================

    /**
     * 투두 생성
     * @param {number} plannerId
     * @param {number} scheduleId
     * @param {Object} todoData - { content, isCompleted, isPrivate }
     * @returns {Promise<number>} todoId
     */
    const createTodo = useCallback(async (plannerId, scheduleId, todoData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/todo`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(todoData),
                }
            );

            if (!response.ok) {
                throw new Error('투두 생성에 실패했습니다.');
            }

            const todoId = await response.json();
            return todoId;
        } catch (error) {
            handleError(error, '투두 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 투두 수정 및 완료 체크
     * @param {number} plannerId
     * @param {number} scheduleId
     * @param {number} todoId
     * @param {Object} updateData - { content, isCompleted, isPrivate }
     * @returns {Promise<void>}
     */
    const updateTodo = useCallback(async (plannerId, scheduleId, todoId, updateData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/todo/${todoId}`,
                {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                }
            );

            if (!response.ok) {
                throw new Error('투두 수정에 실패했습니다.');
            }
        } catch (error) {
            handleError(error, '투두 수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 투두 삭제
     * @param {number} plannerId
     * @param {number} scheduleId
     * @param {number} todoId
     * @returns {Promise<void>}
     */
    const deleteTodo = useCallback(async (plannerId, scheduleId, todoId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/schedule/${scheduleId}/todo/${todoId}`,
                {
                    method: 'DELETE',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('투두 삭제에 실패했습니다.');
            }
        } catch (error) {
            handleError(error, '투두 삭제 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    // ==================== 시간 투표 ====================

    /**
     * 시간 투표 생성
     * @param {number} plannerId
     * @param {Object} voteData - { title, voteRange, finishTime, memberIds }
     * @returns {Promise<number>} voteId
     */
    const createTimeVote = useCallback(async (plannerId, voteData) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/time-vote`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(voteData),
                }
            );

            if (!response.ok) {
                throw new Error('시간 투표 생성에 실패했습니다.');
            }

            const voteId = await response.json();
            return voteId;
        } catch (error) {
            handleError(error, '시간 투표 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 시간 투표 참여
     * @param {number} plannerId
     * @param {number} voteId
     * @param {Array} availableDateTimes - AvailableDateTimeDto[]
     * @returns {Promise<Object>} VoteResponseDto
     */
    const submitTimeVote = useCallback(async (plannerId, voteId, availableDateTimes) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/time-vote/${voteId}`,
                {
                    method: 'POST',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(availableDateTimes),
                }
            );

            if (!response.ok) {
                throw new Error('시간 투표 제출에 실패했습니다.');
            }

            const voteResponse = await response.json();
            return voteResponse;
        } catch (error) {
            handleError(error, '시간 투표 제출 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 시간 재투표 (업데이트)
     * @param {number} plannerId
     * @param {number} voteId
     * @param {Array} availableDateTimes - AvailableDateTimeDto[]
     * @returns {Promise<Object>} VoteResponseDto
     */
    const updateTimeVote = useCallback(async (plannerId, voteId, availableDateTimes) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/time-vote/${voteId}`,
                {
                    method: 'PUT',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(availableDateTimes),
                }
            );

            if (!response.ok) {
                throw new Error('시간 재투표에 실패했습니다.');
            }

            const voteResponse = await response.json();
            return voteResponse;
        } catch (error) {
            handleError(error, '시간 재투표 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 타임테이블 조회 (색상 입히기용)
     * @param {number} plannerId
     * @param {number} voteId
     * @returns {Promise<Array>} 시간 슬롯별 중복도 데이터
     */
    const fetchTimeVoteTable = useCallback(async (plannerId, voteId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/time-vote/${voteId}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('타임테이블 조회에 실패했습니다.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            handleError(error, '타임테이블 조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    // ==================== 검색 ====================

    /**
     * 키워드로 일정 검색
     * @param {number} plannerId
     * @param {string} keyword
     * @returns {Promise<Array>} TeamScheduleBriefDto[]
     */
    const searchSchedulesByKeyword = useCallback(async (plannerId, keyword) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/search?keyword=${encodeURIComponent(keyword)}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('일정 검색에 실패했습니다.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            handleError(error, '일정 검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 사용자별 일정 검색 (생성 & 참여)
     * @param {number} plannerId
     * @param {number} userId
     * @returns {Promise<Object>} { createdSchedules, joinedSchedules }
     */
    const searchSchedulesByUser = useCallback(async (plannerId, userId) => {
        checkAuth();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/team-planner/${plannerId}/search?userId=${userId}`,
                {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('사용자별 일정 검색에 실패했습니다.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            handleError(error, '사용자별 일정 검색 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getAuthHeaders]);

    // Context value
    const value = {
        // State
        planners,
        currentPlanner,
        members,
        schedules,
        categories,
        loading,
        error,
        user,

        // Setters
        setCurrentPlanner,
        setError,

        // Planner CRUD
        createPlanner,
        fetchPlanners,
        updatePlanner,
        deletePlanner,

        // Member Management
        addMember,
        fetchMembers,
        removeMember,
        updateMemberNickname,

        // Schedule Management
        createSchedule,
        fetchScheduleDetail,
        updateSchedule,
        deleteSchedule,
        updateScheduleDateTime,
        joinSchedule,
        addScheduleMember,
        removeScheduleMember,
        fetchMonthlySchedules,
        fetchWeeklySchedules,
        fetchDailySchedules,

        // Category Management
        createCategory,
        fetchCategories,
        updateCategory,
        deleteCategory,
        fetchSchedulesByCategory,

        // Todo Management
        createTodo,
        updateTodo,
        deleteTodo,

        // Time Vote
        createTimeVote,
        submitTimeVote,
        updateTimeVote,
        fetchTimeVoteTable,

        // Search
        searchSchedulesByKeyword,
        searchSchedulesByUser,
    };

    return (
        <TeamPlannerContext.Provider value={value}>
            {children}
        </TeamPlannerContext.Provider>
    );
};

// Custom Hook
export const useTeamPlanner = () => {
    const context = useContext(TeamPlannerContext);
    if (!context) {
        throw new Error('useTeamPlanner must be used within TeamPlannerProvider');
    }
    return context;
};

export default TeamPlannerProvider