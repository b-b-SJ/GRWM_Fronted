// TodoView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Grid, List } from 'lucide-react';
import TodoWeekView from './TodoWeekView';
import TodoDayView from './TodoDayView';
import useTodoApi from "../../hooks/useTodoApi";
import { useAuth } from "../../hooks/AuthContext";

// 날짜 유틸리티
export function getLocalDateString(daysOffset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toLocaleDateString('en-CA');
}

export const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
};

export const formatShortDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
};

export const getDayName = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
};

export const getWeekDates = (date) => {
    const week = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day;

    for (let i = 0; i < 7; i++) {
        const weekDate = new Date(current);
        weekDate.setDate(diff + i);
        week.push(weekDate);
    }
    return week;
};

// 공통 모달 컴포넌트
export const TodoModal = ({ todo, onSave, onCancel, weekDates = null }) => {
    const [formData, setFormData] = useState(
        todo || { title: '', description: '', date: '' }
    );
    const isEdit = !!todo?.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {isEdit ? '할일 수정' : '새 할일 추가'}
                </h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="할일 제목"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <textarea
                        placeholder="설명 (선택사항)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={isEdit ? "3" : "2"}
                    />
                    {!isEdit && weekDates && (
                        <select
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">날짜 선택 (기본: 오늘)</option>
                            {weekDates.map((date) => {
                                const dateString = date.toLocaleDateString('en-CA');
                                return (
                                    <option key={dateString} value={dateString}>
                                        {formatDate(date)}
                                    </option>
                                );
                            })}
                        </select>
                    )}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onSave(formData)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {isEdit ? '저장' : '추가'}
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 메인 컴포넌트
const TodoView = ({ showHeader = true, selectedDateProp = null }) => {
    // 1. AuthContext에서 인증 정보 가져오기
    const { user, isAuthenticated, getAuthHeaders } = useAuth();

    // 2. useTodoApi 훅에 인증 정보 전달
    const {
        loading,
        error,
        getTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        completeTodo,
    } = useTodoApi(user, isAuthenticated, getAuthHeaders);

    // 3. 사용자 ID 확인 (비로그인 시 API 호출 방지)
    const currentUserId = user?.userId;

    const [selectedDate, setSelectedDate] = useState(
        selectedDateProp ? new Date(selectedDateProp) : new Date()
    );
    const [viewMode, setViewMode] = useState('week');
    const [todos, setTodos] = useState([]);

    const [modalState, setModalState] = useState({ isOpen: false, todo: null, weekDates: null });
    const [postponingTodo, setPostponingTodo] = useState(null);

    const todayString = new Date().toLocaleDateString('en-CA');
    const currentDateString = selectedDate.toLocaleDateString('en-CA');

    // to-do 목록 조회 함수
    const fetchTodos = useCallback(async (date) => {
        if (!currentUserId) {
            setTodos([]);
            return;
        }

        try {
            const dateString = date ? date.toLocaleDateString('en-CA') : null;
            if (!dateString) {
                console.error("조회 대상 날짜가 설정되지 않았습니다.");
                return;
            }

            const fetchedTodos = await getTodos(currentUserId, {
                date: dateString,
            });

            if (fetchedTodos) {
                const normalizedTodos = Array.isArray(fetchedTodos) ? fetchedTodos.map(todo => ({
                    ...todo,
                    id: todo.todoId,
                    date: todo.date
                })) : [];
                setTodos(normalizedTodos);
            }
        } catch (e) {
            console.error("To-Do 목록 로드 실패:", e);
        }
    }, [currentUserId, getTodos]);


    // 선택된 날짜나 사용자 ID가 변경될 때마다 To-Do 목록을 다시 불러옴 (Read)
    useEffect(() => {
        fetchTodos(selectedDate);
    }, [selectedDate, currentUserId, fetchTodos]); // fetchTodos를 종속성 배열에 추가


    // ... (rest of useEffects)
    useEffect(() => {
        if (selectedDateProp) {
            setSelectedDate(new Date(selectedDateProp));
        }
    }, [selectedDateProp]);

    // ... (modal open/close functions)
    const openAddModal = (weekDates = null) => {
        setModalState({ isOpen: true, todo: null, weekDates });
    };

    const openEditModal = (todo) => {
        setModalState({ isOpen: true, todo, weekDates: null });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, todo: null, weekDates: null });
    };

    // To-Do 저장/수정 핸들러 (Create/Update)
    const handleSaveTodo = async (formData) => {
        if (!formData.title.trim() || !currentUserId) return;

        try {
            if (modalState.todo?.id) {
                // 수정
                await updateTodo(currentUserId, modalState.todo.id, formData);
            } else {
                const todayDate = getLocalDateString();
                // 추가
                const newTodoData = {
                    title: formData.title,
                    description: formData.description || '',
                    date: formData.date || todayDate,
                };
                await createTodo(currentUserId, newTodoData);
            }

            closeModal();
            // 성공 후 목록 새로고침 (Read)
            await fetchTodos(selectedDate);

        } catch (e) {
            // useTodoApi에서 에러를 state에 설정하므로 사용자에게 표시 가능
            console.error("To-Do 저장/수정 실패:", e);
        }
    };

    // To-Do 완료 처리 핸들러 (Complete)
    const handleToggleComplete = async (todoId) => {
        if (!currentUserId) return;

        try {
            const todo = todos.find(t => t.id === todoId);
            if (!todo) return;

            if (!todo.completed) {
                // 완료 처리
                await completeTodo(currentUserId, todoId);
            } else {
                // 완료 해제 - 전체 데이터 전달
                await updateTodo(currentUserId, todoId, {
                    title: todo.title,
                    description: todo.description,
                    date: todo.date,
                    completed: false,
                    postponed: todo.postponed,
                });
            }

            // 성공 후 목록 새로고침 (Read)
            await fetchTodos(selectedDate);
        } catch (e) {
            console.error("To-Do 완료 처리 실패:", e);
        }
    };

    // To-Do 삭제 핸들러 (Delete)
    const handleDeleteTodo = async (todoId) => {
        if (!currentUserId) return;

        try {
            // **삭제 (Delete)**
            await deleteTodo(currentUserId, todoId);

            // 성공 후 목록 새로고침 (Read)
            await fetchTodos(selectedDate);
        } catch (e) {
            console.error("To-Do 삭제 실패:", e);
        }
    };

    // To-Do 미루기 핸들러
    const handlePostponeTodo = async (todoId, days) => {
        if (!currentUserId) return;

        try {
            const todo = todos.find(t => t.id === todoId);
            if (!todo) return;

            const newDate = new Date(todo.date);
            newDate.setDate(newDate.getDate() + days);
            const newDateString = newDate.toLocaleDateString('en-CA');

            // 1. 기존 todo를 postponed=true로 업데이트
            await updateTodo(currentUserId, todoId, {
                title: todo.title,
                description: todo.description,
                date: todo.date,
                completed: todo.completed,
                postponed: true, // 서버에 저장
            });

            // 2. 새 날짜에 새 to-do 생성
            await createTodo(currentUserId, {
                title: todo.title,
                description: todo.description,
                date: newDateString,
            });

            // 3. 목록 새로고침
            setPostponingTodo(null);
            await fetchTodos(selectedDate);

        } catch (e) {
            console.error("To-Do 미루기 실패:", e);
        }
    };

    // 클릭 외부 감지를 위한 useEffect 추가
    useEffect(() => {
        const handleClickOutside = () => {
            if (postponingTodo) {
                setPostponingTodo(null);
            }
        };

        if (postponingTodo) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [postponingTodo]);

    // 날짜 이동 함수 (기존 내용 유지)
    const goToPreviousWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedDate(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedDate(newDate);
    };

    return (
        <div className="flex-1 flex flex-col">
            {showHeader && (
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">To-Do</h1>
                    <p className="text-gray-600">
                        {isAuthenticated ? `${user.username}님의 ` : ''}오늘 할 일을 관리하세요
                    </p>
                </div>
            )}

            {/* 뷰 전환 버튼 */}
            <div className="mb-4 flex justify-end">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('week')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                            viewMode === 'week'
                                ? 'bg-white text-blue-600 shadow-sm font-medium'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <Grid size={16} />
                        <span className="text-sm">주간</span>
                    </button>
                    <button
                        onClick={() => setViewMode('day')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                            viewMode === 'day'
                                ? 'bg-white text-blue-600 shadow-sm font-medium'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <List size={16} />
                        <span className="text-sm">일간</span>
                    </button>
                </div>
            </div>

            {/* 로딩/에러/비로그인 상태 표시 */}
            {!isAuthenticated ? (
                <div className="text-center py-10 text-gray-500 font-medium border rounded-lg bg-gray-50">
                    <p>로그인 후 To-Do 기능을 사용할 수 있습니다.</p>
                </div>
            ) : loading ? (
                <div className="text-center py-10 text-blue-600 font-medium border rounded-lg bg-blue-50">
                    <p>To-Do 목록을 불러오는 중입니다...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-600 font-medium border rounded-lg bg-red-50">
                    <p>[Tracker] 오류 발생: {error}</p>
                </div>
            ) : (
                // 선택된 뷰 렌더링
                <>
                    {viewMode === 'week' ? (
                        <TodoWeekView
                            selectedDate={selectedDate}
                            todos={todos}
                            todayString={todayString}
                            onOpenAddModal={openAddModal}
                            onToggleComplete={handleToggleComplete}
                            onEditTodo={openEditModal}
                            onDeleteTodo={handleDeleteTodo}
                            onPostponeTodo={handlePostponeTodo}
                            postponingTodo={postponingTodo}
                            setPostponingTodo={setPostponingTodo}
                            onPreviousWeek={goToPreviousWeek}
                            onNextWeek={goToNextWeek}
                        />
                    ) : (
                        <TodoDayView
                            selectedDate={selectedDate}
                            todos={todos}
                            todayString={todayString}
                            onOpenAddModal={openAddModal}
                            onToggleComplete={handleToggleComplete}
                            onEditTodo={openEditModal}
                            onDeleteTodo={handleDeleteTodo}
                            onPostponeTodo={handlePostponeTodo}
                            postponingTodo={postponingTodo}
                            setPostponingTodo={setPostponingTodo}
                        />
                    )}
                </>
            )}

            {/* 통합 모달 */}
            {modalState.isOpen && (
                <TodoModal
                    todo={modalState.todo}
                    onSave={handleSaveTodo}
                    onCancel={closeModal}
                    weekDates={modalState.weekDates}
                />
            )}
        </div>
    );
};

export default TodoView;