import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const PersonalPlannerContext = createContext(null);

export const PersonalPlannerProvider = ({ children }) => {
  const [planners, setPlanners] = useState([]);
  const [currentPlanner, setCurrentPlanner] = useState(null);
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
        const response = await fetch(`/api/personal-planner/create`, {
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
          throw new Error("개인 플래너 생성에 실패했습니다.");
        }

        const plannerId = await response.json();
        console.log("생성된 개인플래너 ID:", plannerId);

        // 플래너 목록 다시 불러오기
        await fetchPlanners();

        return plannerId;
      } catch (error) {
        handleError(error, "개인 플래너 생성 중 오류가 발생했습니다.");
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
    console.log("목록불러오기전", user, user.userId);
    try {
      const response = await fetch(
        `/api/personal-planner/list/${user.userId}`,
        {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

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
      console.log(
        "자 이제 개인 플래너 업데이트를 드가를 드가겠슨니다",
        updateData
      );
      try {
        const response = await fetch(
          `/api/personal-planner/list/${plannerId}/edit`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(plannerId, ...updateData),
          }
        );

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
        const response = await fetch(
          `/api/personal-planner/list/${plannerId}/delete`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("플래너 삭제에 실패했습니다.");
        }

        // 로컬 상태에서 제거
        setPlanners((prev) => prev.filter((p) => p.plannerId !== plannerId));

        if (currentPlanner?.plannerId === plannerId) {
          setCurrentPlanner(null);
        }
      } catch (error) {
        handleError(error, "플래너 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [currentPlanner, isAuthenticated, getAuthHeaders]
  );

  // ==================== 일정(Schedule) 관리 ====================

  // 일정 생성
  // scheduleData에 editorRange 추가
  const createSchedule = useCallback(
    async (plannerId, scheduleData) => {
      checkAuth();
      setLoading(true);
      setError(null);
      console.log("안녕, 개인 플래너 스케쥴 생성 시작할게요");
      try {
        const response = await fetch(
          `http://localhost:8080/api/personal-planner/${plannerId}/schedule/create`,
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
          `/api/personal-planner/${plannerId}/schedule/${scheduleId}`,
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
          `/api/personal-planner/${plannerId}/schedule/${scheduleId}`,
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

        // ✅ 응답이 비어있을 수 있으므로 체크
        const text = await response.text();
        const updatedSchedule = text ? JSON.parse(text) : updateData;

        console.log("✅ 일정 수정 성공:", updatedSchedule);
        return updatedSchedule;
      } catch (error) {
        // ✅ handleError 대신 직접 처리
        console.error("일정 수정 중 오류가 발생했습니다.", error);
        setError(error.message);
        return null; // ⬅️ null 반환 (에러를 던지지 않음)
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
          `http://localhost:8080/api/personal-planner/${plannerId}/schedule/${scheduleId}/delete`,
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
          `/api/personal-planner/${plannerId}/schedule/${scheduleId}/move`,
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

  // 월별 일정 조회 (먼슬리)
  const fetchMonthlySchedules = useCallback(
    async (plannerId, year, month) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/personal-planner/${plannerId}/${year}/${month}/monthly`,
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
          `/api/personal-planner/${plannerId}/${year}/${weekNumber}/weekly`,
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
          `/api/personal-planner/${plannerId}/${year}/${month}/${day}/daily`,
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
          `/api/personal-planner/${plannerId}/${year}/${month}/${day}/daily`,
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
          `/api/personal-planner/${plannerId}/category`,
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
          `/api/personal-planner/${plannerId}/category`,
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
          `/api/personal-planner/${plannerId}/category/${categoryId}`,
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
          `/api/personal-planner/${plannerId}/category/${categoryId}`,
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
          `/api/personal-planner/${plannerId}/category/${categoryId}`,
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
          `/api/personal-planner/${plannerId}/schedule/${scheduleId}/todo`,
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
          `/api/personal-planner/${plannerId}/schedule/${scheduleId}/todo/${todoId}`,
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
          `/api/personal-planner/${plannerId}/schedule/${scheduleId}/todo/${todoId}`,
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

  // ==================== 검색 ====================

  // 키워드로 일정 검색
  const searchSchedulesByKeyword = useCallback(
    async (plannerId, keyword) => {
      checkAuth();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/personal-planner/${plannerId}/search?keyword=${encodeURIComponent(
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
          `/api/personal-planner/${plannerId}/search?userId=${userId}`,
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
    schedules,
    todaySchedules,
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

    // Schedule Management
    createSchedule,
    fetchScheduleDetail,
    updateSchedule,
    deleteSchedule,
    updateScheduleDateTime,
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

    // Search
    searchSchedulesByKeyword,
    searchSchedulesByUser,
  };

  return (
    <PersonalPlannerContext.Provider value={value}>
      {children}
    </PersonalPlannerContext.Provider>
  );
};

// Custom Hook
export const usePersonalPlanner = () => {
  const context = useContext(PersonalPlannerContext);
  if (!context) {
    throw new Error(
      "usePersonalPlanner must be used within PersonalPlannerProvider"
    );
  }
  return context;
};

export default PersonalPlannerProvider;
