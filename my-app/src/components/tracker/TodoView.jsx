// TodoView.jsx
import React, { useState, useEffect } from 'react';
import { Grid, List } from 'lucide-react';
import TodoWeekView from './TodoWeekView';
import TodoDayView from './TodoDayView';

// 날짜 유틸리티
export function getDateString(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
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
                                const dateString = date.toISOString().split('T')[0];
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
    const [selectedDate, setSelectedDate] = useState(
        selectedDateProp ? new Date(selectedDateProp) : new Date()
    );
    const [viewMode, setViewMode] = useState('week');
    const [todos, setTodos] = useState([
        {
            id: '1',
            title: '프로젝트 기획서 작성',
            description: '기능 정의 및 일정 수립',
            completed: true,
            postponed: false,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: '디자인 시스템 구축',
            description: '컴포넌트 라이브러리 설계',
            completed: true,
            postponed: false,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            title: '데이터베이스 설계',
            description: 'ERD 작성 및 스키마 정의',
            completed: false,
            postponed: false,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        },
        {
            id: '4',
            title: 'API 문서 작성',
            description: 'RESTful API 명세서 작성',
            completed: false,
            postponed: false,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        },
        {
            id: '5',
            title: '팀 미팅',
            description: '주간 계획',
            completed: false,
            postponed: false,
            date: getDateString(1),
            createdAt: new Date().toISOString()
        },
        {
            id: '6',
            title: '코드 리뷰',
            description: '팀원 코드 검토',
            completed: true,
            postponed: false,
            date: getDateString(-1),
            createdAt: new Date().toISOString()
        },
    ]);

    const [modalState, setModalState] = useState({ isOpen: false, todo: null, weekDates: null });
    const [postponingTodo, setPostponingTodo] = useState(null);

    const todayString = new Date().toISOString().split('T')[0];
    const currentDateString = selectedDate.toISOString().split('T')[0];

    useEffect(() => {
        if (selectedDateProp) {
            setSelectedDate(new Date(selectedDateProp));
        }
    }, [selectedDateProp]);

    const openAddModal = (weekDates = null) => {
        setModalState({ isOpen: true, todo: null, weekDates });
    };

    const openEditModal = (todo) => {
        setModalState({ isOpen: true, todo, weekDates: null });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, todo: null, weekDates: null });
    };

    const handleSaveTodo = (formData) => {
        if (!formData.title.trim()) return;

        if (modalState.todo?.id) {
            // 수정
            setTodos(todos.map(todo =>
                todo.id === modalState.todo.id ? { ...modalState.todo, ...formData } : todo
            ));
        } else {
            // 추가
            const newTodo = {
                id: Date.now().toString(),
                title: formData.title,
                description: formData.description,
                completed: false,
                postponed: false,
                date: formData.date || currentDateString,
                createdAt: new Date().toISOString()
            };
            setTodos([...todos, newTodo]);
        }
        closeModal();
    };

    const handleToggleComplete = (todoId) => {
        setTodos(todos.map(todo =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const handleDeleteTodo = (todoId) => {
        setTodos(todos.filter(todo => todo.id !== todoId));
    };

    const handlePostponeTodo = (todoId, days) => {
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            const newDate = new Date(todo.date);
            newDate.setDate(newDate.getDate() + days);
            const newDateString = newDate.toISOString().split('T')[0];

            const updatedTodos = todos.map(t =>
                t.id === todoId ? { ...t, postponed: true } : t
            );

            const newTodo = {
                ...todo,
                id: Date.now().toString(),
                date: newDateString,
                completed: false,
                postponed: false,
                createdAt: new Date().toISOString()
            };

            setTodos([...updatedTodos, newTodo]);
            setPostponingTodo(null);
        }
    };

    // 클릭 외부 감지를 위한 useEffect 추가
    useEffect(() => {
        const handleClickOutside = (event) => {
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
                    <p className="text-gray-600">오늘 할 일을 관리하세요</p>
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

            {/* 선택된 뷰 렌더링 */}
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