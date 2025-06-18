import React, { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    CheckSquare,
    Plus,
    Settings,
    Trash2,
    Clock,
    MapPin,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const PlannerSidebar = ({ isCollapsed, onToggle }) => {
    const [expandedSections, setExpandedSections] = useState({
        schedule: true,
        todo: true,
    });

    // 샘플 스케쥴
    const todaySchedule = [
        {
            id: 1,
            title: "팀 미팅",
            time: "14:00",
            location: "회의실 A",
            category: "업무",
            //color: 'bg-red-500'
        },
        {
            id: 2,
            title: "개인 학습",
            time: "19:00",
            location: "",
            category: "학습",
            //color: 'bg-green-500'
        },
    ];

    // 샘플 투두
    const todayTodos = [
        {
            id: 1,
            title: "보고서 작성",
            completed: false,
            priority: "high",
        },
        {
            id: 2,
            title: "운동하기",
            completed: true,
            priority: "medium",
        },
        {
            id: 3,
            title: "책 읽기",
            completed: false,
            priority: "low",
        },
    ];

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleAddSchedule = () => {
        // 일정 추가
        console.log("일정 추가");
    };

    const handleAddTodo = () => {
        // 할일 추가
        console.log("할일 추가");
    };

    const handleTodoToggle = (todoId) => {
        // 할일 완료/미완료 토글 - 체크
        console.log("할일 토글:", todoId);
    };

    const handleDeleteTodo = (todoId) => {
        // 할일 삭제
        console.log("할일 삭제:", todoId);
    };

    if (isCollapsed) {
        return (
            <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-4">
                <button
                    onClick={onToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronRight size={20} className="text-gray-600" />
                </button>

                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar size={16} className="text-blue-600" />
                </div>

                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckSquare size={16} className="text-green-600" />
                </div>

                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings size={16} className="text-gray-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white border-r flex flex-col">
            {/* 사이드바 헤더 */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    {/* 그 뭐냐.. 다른 플래너 가는 버튼 만들어야됨*/}
                    <button
                        onClick={onToggle}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* 오늘의 일정 */}
            <div className="border-b">
                <div className="p-4">
                    <button
                        onClick={() => toggleSection("schedule")}
                        className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <div className="flex items-center space-x-2">
                            <Calendar size={16} className="text-blue-600" />
                            <span className="font-medium text-gray-800">오늘의 일정</span>
                        </div>
                        {expandedSections.schedule ? (
                            <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                        )}
                    </button>

                    {expandedSections.schedule && (
                        <div className="mt-3 space-y-2">
                            {todaySchedule.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800 text-sm">
                                                {event.title}
                                            </h4>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={12} className="text-gray-500" />
                                                    <span className="text-xs text-gray-600">
                            {event.time}
                          </span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin size={12} className="text-gray-500" />
                                                        <span className="text-xs text-gray-600">
                              {event.location}
                            </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className={`w-3 h-3 rounded-full ${event.color}`}
                                        ></div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleAddSchedule}
                                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Plus size={16} />
                                <span>일정 추가</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 오늘의 할일(투두) -> 체크박스 활성화 필요 */}
            <div className="flex-1 flex flex-col">
                <div className="p-4">
                    <button
                        onClick={() => toggleSection("todo")}
                        className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <div className="flex items-center space-x-2">
                            <CheckSquare size={16} className="text-green-600" />
                            <span className="font-medium text-gray-800">오늘의 태스크</span>
                        </div>
                        {expandedSections.todo ? (
                            <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                        )}
                    </button>

                    {expandedSections.todo && (
                        <div className="mt-3 space-y-2">
                            {todayTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className={`p-2 bg-gray-50 rounded-lg transition-colors group ${
                                        todo.completed ? "opacity-60" : ""
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleTodoToggle(todo.id)}
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                                todo.completed
                                                    ? "bg-green-500 border-green-500"
                                                    : "border-gray-300 hover:border-green-400"
                                            }`}
                                        >
                                            {todo.completed && (
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            )}
                                        </button>

                                        <span
                                            className={`flex-1 text-sm ${
                                                todo.completed
                                                    ? "line-through text-gray-500"
                                                    : "text-gray-800"
                                            }`}
                                        >
                      {todo.title}
                    </span>

                                        <button
                                            onClick={() => handleDeleteTodo(todo.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                        >
                                            <Trash2 size={12} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleAddTodo}
                                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Plus size={16} />
                                <span>태스크 추가</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* 하단 설정 */}
                <div className="p-4 border-t mt-auto">
                    <button className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <Settings size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700">설정</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlannerSidebar;