import React from 'react';
import { Plus, Check, Clock, Trash2, ChevronRight } from 'lucide-react';

const TodoSidebarWidget = ({
                               todos = [],          // To-do 목록 배열
                               onToggleComplete,          // 완료/미완료 토글 함수
                               onOpenAddModal,            // 추가 모달 열기 함수
                               onNavigateToTracker,       // Tracker 페이지로 이동 함수
                               loading = false   // 로딩 상태
                           }) => {
    // 오늘의 미완료 To-do만 필터링
    const todayTodos = todos.filter(todo => !todo.postponed && !todo.completed);
    // 완료된 To-do 필터링
    const completedTodos = todos.filter(todo => todo.completed && !todo.postponed);

    return (
        <div className="space-y-3">
            {/* 헤더 버튼 영역 */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-1">
                    <button
                        onClick={onOpenAddModal}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="할일 추가"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={onNavigateToTracker}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Tracker로 이동"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-6 text-sm text-gray-500">
                    로딩 중...
                </div>
            ) : (
                <>
                    {/* 진행률 바 */}
                    {(todayTodos.length > 0 || completedTodos.length > 0) && (
                        <div className="space-y-1 px-2">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>완료: {completedTodos.length} / {todayTodos.length + completedTodos.length}</span>
                                <span className="font-medium">
                  {todayTodos.length + completedTodos.length > 0
                      ? Math.round((completedTodos.length / (todayTodos.length + completedTodos.length)) * 100)
                      : 0}%
                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${todayTodos.length + completedTodos.length > 0
                                            ? (completedTodos.length / (todayTodos.length + completedTodos.length)) * 100
                                            : 0}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* 미완료 할일 목록 (최대 5개만 표시) */}
                    {todayTodos.length > 0 && (
                        <div className="space-y-2">
                            {todayTodos.slice(0, 5).map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <button
                                        onClick={() => onToggleComplete(todo.id)}
                                        className="mt-0.5 flex-shrink-0 w-4 h-4 border-2 border-gray-300 rounded hover:border-blue-500 transition-colors"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 truncate">{todo.title}</p>
                                        {todo.description && (
                                            <p className="text-xs text-gray-500 truncate">{todo.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {todayTodos.length > 5 && (
                                <button
                                    onClick={onNavigateToTracker}
                                    className="w-full text-xs text-blue-600 hover:text-blue-700 text-center py-1"
                                >
                                    +{todayTodos.length - 5}g개 더보기
                                </button>
                            )}
                        </div>
                    )}

                    {/* 완료된 할일 (접을 수 있음) */}
                    {completedTodos.length > 0 && (
                        <details className="text-xs px-2">
                            <summary className="cursor-pointer text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                                <Check size={14} className="text-green-600" />
                                <span>완료됨 ({completedTodos.length})</span>
                            </summary>
                            <div className="mt-2 space-y-1 ml-1">
                                {completedTodos.slice(0, 3).map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="flex items-center space-x-2 p-1 opacity-60"
                                    >
                                        <Check size={12} className="text-green-600 flex-shrink-0" />
                                        <p className="text-xs text-gray-600 line-through truncate flex-1">
                                            {todo.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}

                    {/* 빈 상태 */}
                    {todayTodos.length === 0 && completedTodos.length === 0 && (
                        <div className="text-center py-6 px-2">
                            <Clock size={32} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 mb-2">오늘 할일이 없습니다</p>
                            <button
                                onClick={onOpenAddModal}
                                className="text-xs text-blue-600 hover:text-blue-700"
                            >
                                할일 추가하기
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TodoSidebarWidget;