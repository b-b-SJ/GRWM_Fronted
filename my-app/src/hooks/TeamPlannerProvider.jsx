import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TeamPlannerContext = createContext(null);

export const TeamPlannerProvider = ({ children }) => {
    const [planners, setPlanners] = useState([]);
    const [currentPlanner, setCurrentPlanner] = useState(null);
    const [members, setMembers] = useState([]);
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

    // 현재 유저의 정보
    const currentUser = user || {
        userId: null,
        username: '게스트',
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
     * @param {Object} plannerData - { title, description, profileImageLink }
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
                    profileImage: plannerData.profileImage || plannerData.profileImageLink || '',
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
            const response = await fetch(`/api/team-planner/list?userId=${currentUser.userId}`, {
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
     * @param {string} memberRole - "manager" or "member"
     * @returns {Promise<void>}
     */
    const addMember = useCallback(async (plannerId, memberId, memberRole) => {

    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 멤버 목록 조회
     * @param {number} plannerId
     * @returns {Promise<Array>} members
     */
    const fetchMembers = useCallback(async (plannerId) => {

    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 멤버 삭제
     * @param {number} plannerId
     * @param {number} memberId
     * @returns {Promise<void>}
     */
    const removeMember = useCallback(async (plannerId, memberId) => {

    }, [isAuthenticated, getAuthHeaders]);

    /**
     * 멤버 역할/별명 작성
     * @param {number} plannerId
     * @param {number} memberId
     * @param {string} roleName
     * @returns {Promise<void>}
     */
    const updateMemberRole = useCallback(async (plannerId, memberId, roleName) => {

    }, [isAuthenticated, getAuthHeaders]);

    // Context value
    const value = {
        // State
        planners,
        currentPlanner,
        members,
        loading,
        error,
        user, // 현재 사용자 정보 제공

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
        updateMemberRole,
    };

    return (
        <TeamPlannerContext.Provider value={value}>
            {children}
        </TeamPlannerContext.Provider>
    );
};

// 커스텀 훅
export const useTeamPlanner = () => {
    const context = useContext(TeamPlannerContext);
    if (!context) {
        throw new Error('useTeamPlanner must be used within TeamPlannerProvider');
    }
    return context;
};

export default TeamPlannerProvider;