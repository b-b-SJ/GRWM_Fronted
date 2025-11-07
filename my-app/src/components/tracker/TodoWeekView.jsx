import React from 'react';
import { Plus, Check, Clock, ChevronRight, ChevronLeft, Trash2, Edit2 } from 'lucide-react';
import { getWeekDates, formatShortDate, getDayName } from './TodoView';

const TodoWeekView = ({
                      selectedDate,
                      todos,
                      todayString,
                      onOpenAddModal,
                      onToggleComplete,
                      onEditTodo,
                      onDeleteTodo,
                      onPostponeTodo,
                      postponingTodo,
                      setPostponingTodo,
                      onPreviousWeek,
                      onNextWeek
                  }) => {
    const weekDates = getWeekDates(selectedDate);

    const getTodosForDate = (dateString) => {
        return todos.filter(todo => todo.date === dateString && !todo.postponed);
    };

    const getWeekStats = () => {
        const weekTodos = todos.filter(todo => {
            return weekDates.some(d => d.toISOString().split('T')[0] === todo.date) && !todo.postponed;
        });
        const completed = weekTodos.filter(t => t.completed).length;
        return { total: weekTodos.length, completed };
    };

    const weekStats = getWeekStats();

    return (
        <div className="space-y-4">
            {/* 주간 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onPreviousWeek}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20}/>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {formatShortDate(weekDates[0])} - {formatShortDate(weekDates[6])}
                            </h2>
                            <p className="text-sm text-gray-500">주간 뷰</p>
                        </div>
                        <button
                            onClick={onNextWeek}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight size={20}/>
                        </button>
                    </div>
                    <button
                        onClick={() => onOpenAddModal(weekDates)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18}/>
                        <span>새 할일</span>
                    </button>
                </div>

                {/* 주간 진행률 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                            이번 주 완료: {weekStats.completed} / {weekStats.total}
                        </span>
                        <span className="font-medium text-blue-600">
                            {weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{
                                width: `${weekStats.total > 0 ? (weekStats.completed / weekStats.total) * 100 : 0}%`
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* 주간 그리드 */}
            <div className="grid grid-cols-7 gap-4 px-1">
                {weekDates.map((date) => {
                    const dateString = date.toISOString().split('T')[0];
                    const dayTodos = getTodosForDate(dateString);
                    const completed = dayTodos.filter(t => t.completed).length;
                    const isToday = dateString === todayString;
                    const dayName = getDayName(date);

                    return (
                        <div
                            key={dateString}
                            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                                isToday ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            {/* 날짜 헤더 */}
                            <div className={`p-3 ${
                                isToday
                                    ? 'bg-blue-600 text-white'
                                    : dayName === '일'
                                        ? 'bg-red-50 text-red-700'
                                        : dayName === '토'
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-gray-50 text-gray-700'
                            }`}>
                                <div className="text-center">
                                    <div className="text-xs font-medium mb-1">{dayName}</div>
                                    <div className="text-lg font-bold">{date.getDate()}</div>
                                </div>
                                {dayTodos.length > 0 && (
                                    <div className="text-xs text-center mt-2">
                                        {completed}/{dayTodos.length}
                                    </div>
                                )}
                            </div>

                            {/* 할일 목록 */}
                            <div className="p-2 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
                                {dayTodos.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-xs">
                                        할일 없음
                                    </div>
                                ) : (
                                    dayTodos.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className={`p-2 rounded-lg border ${
                                                todo.completed
                                                    ? 'bg-green-50 border-green-200 opacity-60'
                                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                            } transition-all group`}
                                        >
                                            <div className="flex items-start space-x-2">
                                                <button
                                                    onClick={() => onToggleComplete(todo.id)}
                                                    className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded border-2 transition-colors ${
                                                        todo.completed
                                                            ? 'bg-green-600 border-green-600'
                                                            : 'border-gray-300 hover:border-blue-500'
                                                    }`}
                                                >
                                                    {todo.completed && <Check size={12} className="text-white"/>}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${
                                                        todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                                    }`}>
                                                        {todo.title}
                                                    </p>
                                                    {todo.description && (
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {todo.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 호버 시 액션 버튼 */}
                                            <div
                                                className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex space-x-1">
                                                {!todo.completed && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPostponingTodo(postponingTodo === todo.id ? null : todo.id);
                                                        }}
                                                        className="flex-1 p-1 text-xs text-orange-600 hover:bg-orange-50 rounded transition-colors relative"
                                                        title="미루기"
                                                    >
                                                        <Clock size={12} className="mx-auto"/>
                                                        {postponingTodo === todo.id && (
                                                            <div
                                                                className="absolute left-0 bottom-full mb-1 bg-white border shadow-lg rounded-lg p-1 z-10 whitespace-nowrap">
                                                                <div // <-- <button> 대신 <div>로 변경
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onPostponeTodo(todo.id, 1);
                                                                    }}
                                                                    className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-50 rounded cursor-pointer"
                                                                >
                                                                    내일로 미루기
                                                                </div>
                                                            </div>
                                                        )}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onEditTodo(todo)}
                                                    className="flex-1 p-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="수정"
                                                >
                                                    <Edit2 size={12} className="mx-auto"/>
                                                </button>
                                                <button
                                                    onClick={() => onDeleteTodo(todo.id)}
                                                    className="flex-1 p-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={12} className="mx-auto"/>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TodoWeekView;