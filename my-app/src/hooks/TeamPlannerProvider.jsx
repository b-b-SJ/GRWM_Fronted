import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const TeamPlannerContext = createContext(null);

export const TeamPlannerProvider = ({ children }) => {
  const [planners, setPlanners] = useState([]);
  const [currentPlanner, setCurrentPlanner] = useState(null);
  const [members, setMembers] = useState([]); // MemberDto 배열
  const [schedules, setSchedules] = useState([]); // TeamScheduleBriefDto 배열
  const [todaySchedules, setTodaySchedules] = useState([]); // 사이드바용
  const [categories, setCategories] = useState([]); // CategoryDto 배열
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, getAuthHeaders } = useAuth();

  // 에러 핸들링 헬퍼
  const handleError = (error, customMessage) => {
    console.error(customMessage, error);
    const errorMessage =
      error.response?.data?.message || error.message || customMessage;
    setError(errorMessage);
    throw new Error(errorMessage);
  };

  const currentUser = user || {
    userId: null,
    username: "게스트",
    loginId: null,
  };

  // 인증 체크
  const checkAuth = () => {
    if (!isAuthenticated || !user) {
      throw new Error("로그인이 필요합니다.");
    }
  };

  //==============로그인 아이디로 유저 아이디 매치 ==============

  const findUserIdByLoginId = useCallback(
    async (loginId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/find/${loginId}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("유저 찾기 실패:", response.status, errorText);
          throw new Error("해당 로그인 아이디를 가진 유저를 찾을 수 없습니다.");
          return null;
        }

        const userId = await response.json(); // Long 타입의 userId
        console.log("찾은 유저 ID:", userId);
        return userId;
      } catch (error) {
        handleError(error, "유저 찾기 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // ==================== 플래너 CRUD ====================

  // 플래너 생성
  const createPlanner = useCallback(
    async (plannerData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        console.log("플래너 생성 요청:", {
          ...plannerData,
          creatorId: currentUser.userId,
        });
        const response = await fetch(`/api/team-planner/create`, {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: plannerData.title,
            description: plannerData.description,
            profileImage: plannerData.profileImage || "",
            creatorId: currentUser.userId,
          }),
        });

        if (!response.ok) {
          throw new Error("플래너 생성에 실패했습니다.");
        }

        const plannerId = await response.json();
        console.log("생성된 플래너 ID:", plannerId);

        // 플래너 목록 다시 불러오기
        await fetchPlanners();

        return plannerId;
      } catch (error) {
        handleError(error, "플래너 생성 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [user, isAuthenticated, getAuthHeaders]
  );

  // 플래너 목록 조회
  const fetchPlanners = useCallback(async () => {
    checkAuth();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/team-planner/list`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("플래너 목록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      console.log("받아온 플래너 목록:", data);
      if (data && data.length > 0) {
        console.log("첫 번째 플래너:", data[0]);
        console.log("플래너 객체의 키들:", Object.keys(data[0]));
      }
      setPlanners(data);
      return data;
    } catch (error) {
      handleError(error, "플래너 목록 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, getAuthHeaders]);

  // 플래너 업데이트
  const updatePlanner = useCallback(
    async (plannerId, updateData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/team-planner/${plannerId}/update`, {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error("플래너 업데이트에 실패했습니다.");
        }

        const updatedPlanner = await response.json();

        // 로컬 상태 업데이트
        setPlanners((prev) =>
          prev.map((p) => (p.plannerId === plannerId ? updatedPlanner : p))
        );

        if (currentPlanner?.plannerId === plannerId) {
          setCurrentPlanner(updatedPlanner);
        }

        return updatedPlanner;
      } catch (error) {
        handleError(error, "플래너 업데이트 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [currentPlanner, isAuthenticated, getAuthHeaders]
  );

  // 플래너 삭제
  const deletePlanner = useCallback(
    async (plannerId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/team-planner/${plannerId}/delete`, {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("플래너 삭제에 실패했습니다.");
        }

        // 로컬 상태에서 제거
        setPlanners((prev) => prev.filter((p) => p.plannerId !== plannerId));

        if (currentPlanner?.plannerId === plannerId) {
          setCurrentPlanner(null);
          setMembers([]);
        }
      } catch (error) {
        handleError(error, "플래너 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [currentPlanner, isAuthenticated, getAuthHeaders]
  );

  // ==================== 멤버 관리 ====================

  // 멤버 추가
  const addMember = useCallback(
    async (plannerId, memberId, role) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8080/api/team-planner/${plannerId}/member/${memberId}/${role}`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("멤버 추가에 실패했습니다.");
        }

        // 멤버 목록 다시 불러오기
        await fetchMembers(plannerId);
      } catch (error) {
        handleError(error, "멤버 추가 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 멤버 목록 조회
  const fetchMembers = useCallback(
    async (plannerId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/team-planner/${plannerId}/member`, {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("멤버 목록을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        console.log("받아온 멤버 목록 (MemberDto[]):", data);

        if (data && data.length > 0) {
          console.log("첫 번째 멤버 DTO:", data[0]);
          console.log("MemberDto 필드:", Object.keys(data[0]));
        }

        const activeMembers = data.filter(
          (member) => member.status === "active"
        );
        setMembers(activeMembers);
        return activeMembers;
      } catch (error) {
        handleError(error, "멤버 목록 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 멤버 삭제 (status를 'withdrawn'으로 변경)
  const removeMember = useCallback(
    async (plannerId, memberId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/member/${memberId}`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("멤버 삭제에 실패했습니다.");
        }

        setMembers((prev) => prev.filter((m) => m.userId !== memberId));
      } catch (error) {
        handleError(error, "멤버 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 멤버 별명(nickname) 업데이트
  const updateMemberNickname = useCallback(
    async (plannerId, memberId, nickname) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/member/${memberId}/${nickname}`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("멤버 별명 업데이트에 실패했습니다.");
        }

        await fetchMembers(plannerId);
      } catch (error) {
        handleError(error, "멤버 별명 업데이트 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // ==================== 일정(Schedule) 관리 ====================

  // 일정 생성
  // scheduleData에 editorRange 추가
  const createSchedule = useCallback(
    async (plannerId, scheduleData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      console.log("ㅎㅇ 공유 플래너 스케쥴 생성 ㄱ할게");
      try {
        const response = await fetch(
          `http://localhost:8080/api/team-planner/${plannerId}/schedule/create`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              plannerId,
              categoryId: scheduleData.categoryId || null,
              title: scheduleData.title,
              startDateTime: scheduleData.startDateTime,
              finishDateTime: scheduleData.finishDateTime,
              location: scheduleData.location || "",
              memo: scheduleData.memo || "",
              editorRange: scheduleData.editorRange || "",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("일정 생성에 실패했습니다.");
        }

        const scheduleId = await response.json();
        console.log("생성된 일정 ID:", scheduleId);
        return scheduleId;
      } catch (error) {
        handleError(error, "일정 생성 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 일정 상세 조회
  const fetchScheduleDetail = useCallback(
    async (plannerId, scheduleId) => {
      checkAuth();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("일정 상세 조회에 실패했습니다.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        handleError(error, "일정 상세 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 일정 수정
  const updateSchedule = useCallback(
    async (plannerId, scheduleId, updateData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/edit`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          throw new Error("일정 수정에 실패했습니다.");
        }

        const updatedSchedule = await response.json();
        return updatedSchedule;
      } catch (error) {
        handleError(error, "일정 수정 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 일정 삭제
  const deleteSchedule = useCallback(
    async (plannerId, scheduleId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8080/api/team-planner/${plannerId}/schedule/${scheduleId}/delete`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text(); // 또는 response.json()
          console.error("삭제 실패 상세:", response.status, errorText);
          throw new Error(`일정 삭제 실패 (${response.status}): ${errorText}`);
        }

        setSchedules((prev) => prev.filter((s) => s.scheduleId !== scheduleId));
      } catch (error) {
        handleError(error, "일정 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 드래그앤드롭으로 일정 날짜 수정
  const updateScheduleDateTime = useCallback(
    async (plannerId, scheduleId, dateTime) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/drag-drop`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dateTime),
          }
        );

        if (!response.ok) {
          throw new Error("일정 날짜 수정에 실패했습니다.");
        }
      } catch (error) {
        handleError(error, "일정 날짜 수정 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 일정에 참여하기 -> 안쓰는듯..넘 헷갈려
  const joinSchedule = useCallback(
    async (plannerId, scheduleId, userId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/join/${userId}`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("일정 참여에 실패했습니다.");
        }

        const members = await response.json();
        return members;
      } catch (error) {
        handleError(error, "일정 참여 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 일정 참여 멤버 추가
  const addScheduleMember = useCallback(
    async (plannerId, scheduleId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/add-member`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("일정 멤버 추가에 실패했습니다.");
        }

        const members = await response.json();
        return members;
      } catch (error) {
        handleError(error, "일정 멤버 추가 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 일정 참여 멤버 삭제
  const removeScheduleMember = useCallback(
    async (plannerId, scheduleId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/delete-member`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("일정 멤버 삭제에 실패했습니다.");
        }
      } catch (error) {
        handleError(error, "일정 멤버 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 월별 일정 조회 (먼슬리)
  const fetchMonthlySchedules = useCallback(
    async (plannerId, year, month) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/monthly/${year}/${month}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("월별 일정 조회에 실패했습니다.");
        }

        const data = await response.json();
        setSchedules(data);
        return data;
      } catch (error) {
        handleError(error, "월별 일정 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 주별 일정 조회 (위클리)
  const fetchWeeklySchedules = useCallback(
    async (plannerId, year, weekNumber) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/weekly/${year}/${weekNumber}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("주별 일정 조회에 실패했습니다.");
        }

        const data = await response.json();
        setSchedules(data);
        return data;
      } catch (error) {
        handleError(error, "주별 일정 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 일별 일정 조회 (데일리)
  const fetchDailySchedules = useCallback(
    async (plannerId, year, month, day) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/daily/${year}/${month}/${day}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("일별 일정 조회에 실패했습니다.");
        }

        const data = await response.json();
        setSchedules(data);
        return data;
      } catch (error) {
        handleError(error, "일별 일정 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  //일별 일정 - 오늘 한저
  const fetchTodaySchedules = useCallback(
    async (plannerId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/daily/${year}/${month}/${day}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("일별 일정 조회에 실패했습니다.");
        }

        const data = await response.json();
        setTodaySchedules(data);
        return data;
      } catch (error) {
        handleError(error, "일별 일정 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // ==================== 카테고리 관리 ====================

  // 카테고리 생성
  const createCategory = useCallback(
    async (plannerId, categoryData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/category`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(categoryData),
          }
        );

        if (!response.ok) {
          throw new Error("카테고리 생성에 실패했습니다.");
        }

        const categoryId = await response.json();
        await fetchCategories(plannerId);
        return categoryId;
      } catch (error) {
        handleError(error, "카테고리 생성 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 카테고리 목록 조회
  const fetchCategories = useCallback(
    async (plannerId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/category`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("카테고리 목록 조회에 실패했습니다.");
        }

        const data = await response.json();
        setCategories(data);
        return data;
      } catch (error) {
        handleError(error, "카테고리 목록 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 카테고리 수정
  const updateCategory = useCallback(
    async (plannerId, categoryId, updateData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/category/${categoryId}`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          throw new Error("카테고리 수정에 실패했습니다.");
        }

        if (!response.ok) {
          throw new Error("카테고리 수정에 실패했습니다.");
        }
        let updatedCategory = null;
        if (response.status !== 204) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            updatedCategory = await response.json();
          }
        }
        // 카테고리 목록 새로고침
        await fetchCategories(plannerId);

        return updatedCategory;
      } catch (error) {
        handleError(error, "카테고리 수정 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 카테고리 삭제
  const deleteCategory = useCallback(
    async (plannerId, categoryId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/category/${categoryId}`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("카테고리 삭제에 실패했습니다.");
        }

        setCategories((prev) =>
          prev.filter((c) => c.categoryId !== categoryId)
        );
      } catch (error) {
        handleError(error, "카테고리 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 카테고리 별 일정 조회
  const fetchSchedulesByCategory = useCallback(
    async (plannerId, categoryId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/category/${categoryId}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("카테고리별 일정 조회에 실패했습니다.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        handleError(error, "카테고리별 일정 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // ==================== 투두리스트 관리 ====================

  // 투두 생성
  const createTodo = useCallback(
    async (plannerId, scheduleId, todoData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/todo`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(todoData),
          }
        );

        if (!response.ok) {
          throw new Error("투두 생성에 실패했습니다.");
        }

        const todoId = await response.json();
        return todoId;
      } catch (error) {
        handleError(error, "투두 생성 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 투두 수정 및 완료 체크
  const updateTodo = useCallback(
    async (plannerId, scheduleId, todoId, updateData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/todo/${todoId}`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          throw new Error("투두 수정에 실패했습니다.");
        }
      } catch (error) {
        handleError(error, "투두 수정 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 투두 삭제
  const deleteTodo = useCallback(
    async (plannerId, scheduleId, todoId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/schedule/${scheduleId}/todo/${todoId}`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("투두 삭제에 실패했습니다.");
        }
      } catch (error) {
        handleError(error, "투두 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // ==================== 시간 투표 ====================

  // 시간 투표 생성
  const createTimeVote = useCallback(
    async (plannerId, voteData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/time-vote`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(voteData),
          }
        );

        if (!response.ok) {
          throw new Error("시간 투표 생성에 실패했습니다.");
        }

        const voteId = await response.json();
        return voteId;
      } catch (error) {
        handleError(error, "시간 투표 생성 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 시간 투표 참여
  const submitTimeVote = useCallback(
    async (plannerId, voteId, availableDateTimes) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/time-vote/${voteId}`,
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(availableDateTimes),
          }
        );

        if (!response.ok) {
          throw new Error("시간 투표 제출에 실패했습니다.");
        }

        const voteResponse = await response.json();
        return voteResponse;
      } catch (error) {
        handleError(error, "시간 투표 제출 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 시간 재투표 (업데이트)
  const updateTimeVote = useCallback(
    async (plannerId, voteId, availableDateTimes) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/time-vote/${voteId}`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(availableDateTimes),
          }
        );

        if (!response.ok) {
          throw new Error("시간 재투표에 실패했습니다.");
        }

        const voteResponse = await response.json();
        return voteResponse;
      } catch (error) {
        handleError(error, "시간 재투표 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 타임테이블 조회 (색상 입히기용)
  const fetchTimeVoteTable = useCallback(
    async (plannerId, voteId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/team-planner/${plannerId}/time-vote/${voteId}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("타임테이블 조회에 실패했습니다.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        handleError(error, "타임테이블 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // ==================== 검색 ====================

  // 키워드로 일정 검색
  const searchSchedulesByKeyword = useCallback(
    async (plannerId, keyword) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8080/api/team-planner/${plannerId}/search?keyword=${encodeURIComponent(
            keyword
          )}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("일정 검색에 실패했습니다.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        handleError(error, "일정 검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // 사용자별 일정 검색 (생성 & 참여)
  const searchSchedulesByUser = useCallback(
    async (plannerId, userId) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8080/api/team-planner/${plannerId}/search?userId=${userId}`,
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("사용자별 일정 검색에 실패했습니다.");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        handleError(error, "사용자별 일정 검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, getAuthHeaders]
  );

  // Context value
  const value = {
    // State
    planners,
    currentPlanner,
    members,
    schedules,
    todaySchedules,
    categories,
    loading,
    error,
    user,

    // Setters
    setCurrentPlanner,
    setError,

    //유저 아이디로 로그인 아이디 검색
    findUserIdByLoginId,
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
    fetchTodaySchedules,

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
    throw new Error("useTeamPlanner must be used within TeamPlannerProvider");
  }
  return context;
};

export default TeamPlannerProvider;
