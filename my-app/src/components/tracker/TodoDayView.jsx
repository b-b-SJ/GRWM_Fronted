import React from 'react';
import { Plus, Check, Clock, Trash2, Edit2, Calendar, AlertCircle } from 'lucide-react';
import { formatDate } from './TodoView';

const TodoDayView = ({
                     selectedDate,
                     todos,
                     todayString,
                     onOpenAddModal,
                     onToggleComplete,
                     onEditTodo,
                     onDeleteTodo,
                     onPostponeTodo,
                     postponingTodo,
                     setPostponingTodo
                 }) => {
    const currentDateString = selectedDate.toISOString().split('T')[0];
    const allDayTodos = todos.filter(todo => todo.date === currentDateString);
    const todayTodos = allDayTodos.filter(todo => !todo.postponed);
    const postponedTodos = allDayTodos.filter(todo => todo.postponed);
    const completedTodos = todayTodos.filter(todo => todo.completed);
    const incompleteTodos = todayTodos.filter(todo => !todo.completed);
    const completionRate = todayTodos.length > 0
        ? Math.round((completedTodos.length / todayTodos.length) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* 날짜 헤더 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {formatDate(selectedDate)}
                        </h2>
                        {currentDateString === todayString && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                오늘
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => onOpenAddModal()}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>새 할일</span>
                    </button>
                </div>

                {/* 진행률 */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                            완료: {completedTodos.length} / {todayTodos.length}
                        </span>
                        <span className="font-medium text-blue-600">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 미완료 할일 */}
            {incompleteTodos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-3 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                                <AlertCircle size={18} className="text-orange-600" />
                                <span>진행 중</span>
                            </h3>
                            <span className="text-sm font-medium text-orange-600">
                                {incompleteTodos.length}개
                            </span>
                        </div>
                    </div>
                    <div className="divide-y">
                        {incompleteTodos.map((todo) => (
                            <div key={todo.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start space-x-3">
                                    <button
                                        onClick={() => onToggleComplete(todo.id)}
                                        className="mt-1 flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded hover:border-blue-500 transition-colors"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-800">{todo.title}</h4>
                                        {todo.description && (
                                            <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPostponingTodo(postponingTodo === todo.id ? null : todo.id);
                                            }}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors relative"
                                            title="미루기"
                                        >
                                            <Clock size={16} />
                                            {postponingTodo === todo.id && (
                                                <div className="absolute right-0 bottom-full mb-1 bg-white border shadow-lg rounded-lg p-2 z-10 whitespace-nowrap">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onPostponeTodo(todo.id, 1);
                                                        }}
                                                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                                                    >
                                                        내일로 미루기
                                                    </button>
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => onEditTodo(todo)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="수정"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteTodo(todo.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 완료된 할일 */}
            {completedTodos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                                <Check size={18} className="text-green-600" />
                                <span>완료</span>
                            </h3>
                            <span className="text-sm font-medium text-green-600">
                                {completedTodos.length}개
                            </span>
                        </div>
                    </div>
                    <div className="divide-y">
                        {completedTodos.map((todo) => (
                            <div key={todo.id} className="p-4 hover:bg-gray-50 transition-colors opacity-75">
                                <div className="flex items-start space-x-3">
                                    <button
                                        onClick={() => onToggleComplete(todo.id)}
                                        className="mt-1 flex-shrink-0 w-5 h-5 bg-green-600 rounded flex items-center justify-center hover:bg-green-700 transition-colors"
                                    >
                                        <Check size={14} className="text-white" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-600 line-through">{todo.title}</h4>
                                        {todo.description && (
                                            <p className="text-sm text-gray-400 mt-1 line-through">{todo.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onDeleteTodo(todo.id)}
                                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 미뤄진 할일 */}
            {postponedTodos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                                <Clock size={18} className="text-gray-500" />
                                <span>미뤄짐</span>
                            </h3>
                            <span className="text-sm font-medium text-gray-500">
                                {postponedTodos.length}개
                            </span>
                        </div>
                    </div>
                    <div className="divide-y">
                        {postponedTodos.map((todo) => (
                            <div key={todo.id} className="p-4 bg-gray-50 opacity-50">
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded bg-gray-200" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-500 line-through">{todo.title}</h4>
                                        {todo.description && (
                                            <p className="text-sm text-gray-400 mt-1 line-through">{todo.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-2">다른 날짜로 미뤄짐</p>
                                    </div>
                                    <button
                                        onClick={() => onDeleteTodo(todo.id)}
                                        className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 빈 상태 */}
            {todayTodos.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                    <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        등록된 할일이 없습니다
                    </h3>
                    <p className="text-gray-500 mb-4">
                        새로운 할일을 추가해보세요
                    </p>
                    <button
                        onClick={() => onOpenAddModal()}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>할일 추가</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodoDayView;