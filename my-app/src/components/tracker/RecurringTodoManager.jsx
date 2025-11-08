import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Calendar, RotateCcw, AlertCircle } from 'lucide-react';
import useTodoApi from "../../hooks/useTodoApi";
import { useAuth } from "../../hooks/AuthContext";

/**
 * 반복 To-Do 관리 페이지
 */
const RecurringTodoManager = () => {
    // 1. AuthContext에서 인증 정보 가져오기
    const { user, isAuthenticated, getAuthHeaders } = useAuth();
    const currentUserId = user?.userId;

    // 2. useTodoApi 훅에 인증 정보 전달
    const {
        loading: apiLoading,
        error: apiError,
        getRecurringTodos,
        createRecurringTodo,
        updateRecurringTodo,
        deleteRecurringTodo,
    } = useTodoApi(user, isAuthenticated, getAuthHeaders);


    const [recurringTodos, setRecurringTodos] = useState([]);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        recurrenceType: 'daily',
        recurrenceConfig: {},
        startDate: new Date().toISOString().split('T')[0]
    });
    const [filterStatus, setFilterStatus] = useState('active');
    // API 훅의 에러와 별도로, 컴포넌트 자체의 에러 메시지를 관리
    const [error, setError] = useState(null);

    // 반복 유형 옵션
    const recurrenceTypes = [
        { value: 'daily', label: '매일', description: '매일 반복' },
        { value: 'weekly', label: '매주', description: '특정 요일마다 반복' },
        { value: 'monthly', label: '매월', description: '특정 날짜마다 반복' }
    ];

    // 요일 옵션
    const weekDays = [
        { value: 1, label: '일' },
        { value: 2, label: '월' },
        { value: 3, label: '화' },
        { value: 4, label: '수' },
        { value: 5, label: '목' },
        { value: 6, label: '금' },
        { value: 7, label: '토' }
    ];

    // loadRecurringTodos 함수 내부
    const loadRecurringTodos = useCallback(async () => {
        if (!currentUserId) {
            setRecurringTodos([]);
            return;
        }
        try {
            setError(null);

            const response = await getRecurringTodos(currentUserId, {
                status: filterStatus
            });
            setRecurringTodos(response.recurringTodos || []);
        } catch (err) {
            // ...
        }
    }, [currentUserId, filterStatus, getRecurringTodos]);

    // 초기 데이터 로드 (의존성: loadRecurringTodos)
    useEffect(() => {
        loadRecurringTodos();
    }, [loadRecurringTodos]);

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            recurrenceType: 'daily',
            recurrenceConfig: {},
            startDate: new Date().toISOString().split('T')[0]
        });
        setSelectedTodo(null);
        setIsCreating(false);
    };

    // 새로운 반복 투두 생성 모드
    const handleCreateNew = () => {
        resetForm();
        setIsCreating(true);
    };

    // 수정 모드로 전환 (데이터 접근 로직 수정)
    const handleEdit = (todo) => {
        // todo는 RecurringTodoDto 객체입니다.
        const todoDetails = todo.todoDto; // 개별 To-Do 정보 접근
        const recurrenceType = todo.repeatRange; // 반복 타입 접근

        let config = {};

        // 백엔드 엔티티 필드를 프론트 폼 구조에 맞게 재구성
        if (recurrenceType === 'weekly') {
            config = { daysOfWeek: todo.weekly || [] };
        } else if (recurrenceType === 'monthly') {
            config = { dayOfMonth: todo.monthly || 1 };
        }

        setSelectedTodo(todo);

        setFormData({
            title: todoDetails?.title || '',
            description: todoDetails?.description || '',
            recurrenceType: recurrenceType,
            recurrenceConfig: config,
            startDate: todoDetails?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        });
        setIsCreating(true);
    };

    // 삭제
    const handleDelete = async (recurringId) => {
        if (!window.confirm('이 반복 루틴을 삭제하시겠습니까?')) return;
        if (!currentUserId) return;

        try {
            // API 함수 호출 시 currentUserId 전달
            await deleteRecurringTodo(currentUserId, recurringId);
            await loadRecurringTodos();
            if (selectedTodo?.recurringId === recurringId) {
                resetForm();
            }
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

    // 폼 제출 (payload 변환 로직 포함)
    const handleSubmit = async () => {
        if (!formData.title.trim() || !currentUserId) {
            alert('제목을 입력하고 로그인해주세요.');
            return;
        }

        let processedConfig = {
            interval: 0, // Daily 간격 설정이 폼에 없으므로 기본값 0
            weekly: [],
            monthly: 0,
        };

        if (formData.recurrenceType === 'weekly') {
            // daysOfWeek (프론트)를 weekly (백엔드)로 매핑
            processedConfig.weekly = formData.recurrenceConfig.daysOfWeek || [];
        } else if (formData.recurrenceType === 'monthly') {
            // dayOfMonth (프론트)를 monthly (백엔드)로 매핑
            processedConfig.monthly = formData.recurrenceConfig.dayOfMonth || 0;
        }

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                recurrenceType: formData.recurrenceType,
                recurrenceConfig: processedConfig, // 변환된 설정
                startDate: formData.startDate // 'YYYY-MM-DD' 문자열
            };

            // API 함수 호출 시 currentUserId 전달
            if (selectedTodo) {
                // 수정: selectedTodo.recurringId 사용 (URL 경로에 사용)
                await updateRecurringTodo(currentUserId, selectedTodo.recurringId, payload);
            } else {
                // 생성
                await createRecurringTodo(currentUserId, payload);
            }

            await loadRecurringTodos();
            resetForm();
        } catch (err) {
            alert(selectedTodo ? '수정에 실패했습니다.' : '생성에 실패했습니다.');
            console.error("API Error:", err);
        }
    };

    // 반복 설정 렌더링
    const renderRecurrenceConfig = () => {
        switch (formData.recurrenceType) {
            case 'weekly':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">반복 요일 선택</label>
                        <div className="flex gap-2 flex-wrap">
                            {weekDays.map(day => {
                                const isSelected = formData.recurrenceConfig.daysOfWeek?.includes(day.value);
                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.recurrenceConfig.daysOfWeek || [];
                                            const newDays = isSelected
                                                ? current.filter(d => d !== day.value)
                                                : [...current, day.value].sort();
                                            setFormData({
                                                ...formData,
                                                recurrenceConfig: { daysOfWeek: newDays }
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            isSelected
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'monthly':
                return (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">반복 날짜</label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={formData.recurrenceConfig.dayOfMonth || 1}
                            onChange={(e) => setFormData({
                                ...formData,
                                recurrenceConfig: { dayOfMonth: parseInt(e.target.value) }
                            })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500">매월 이 날짜에 반복됩니다 (1-31)</p>
                    </div>
                );

            default:
                return null;
        }
    };

    // 반복 정보 표시
    const getRecurrenceDisplay = (todo) => {
        switch (todo.recurrenceType) {
            case 'daily':
                return '매일';
            case 'weekly':
                const days = todo.recurrenceConfig?.daysOfWeek?.map(d => weekDays.find(wd => wd.value === d)?.label).join(', ');
                return `매주 ${days || ''}`;
            case 'monthly':
                return `매월 ${todo.recurrenceConfig?.dayOfMonth || 1}일`;
            default:
                return todo.recurrenceType;
        }
    };

    // 최종 에러 및 로딩 상태
    const combinedError = apiError || error;

    return (
        <div className="flex h-full bg-gray-50">
            {/* 좌측: 반복 투두 목록 */}
            <div className="w-1/2 border-r bg-white overflow-y-auto">
                <div className="p-6">
                    {/* 헤더 */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">반복 루틴 관리</h2>
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Plus size={18} />
                                새 루틴
                            </button>
                        </div>

                        {/* 필터 */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterStatus('active')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'active'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                활성
                            </button>
                            <button
                                onClick={() => setFilterStatus('inactive')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filterStatus === 'inactive'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                비활성
                            </button>
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {combinedError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <p className="text-red-700 text-sm">루틴 오류: {combinedError}</p>
                        </div>
                    )}

                    {/* 비로그인 / 로딩 상태 표시 */}
                    {!isAuthenticated ? (
                        <div className="text-center py-10 text-gray-500 font-medium border rounded-lg bg-gray-50">
                            <p>로그인 후 반복 루틴을 관리할 수 있습니다.</p>
                        </div>
                    ) : apiLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-500">로딩 중...</p>
                        </div>
                    ) : recurringTodos.length === 0 ? (
                        <div className="text-center py-12">
                            <RotateCcw className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500">등록된 반복 루틴이 없습니다.</p>
                            <p className="text-sm text-gray-400 mt-1">새 루틴을 추가해보세요!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recurringTodos.map(todo => (
                                <div
                                    key={todo.todoDto?.todoId}
                                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                                        selectedTodo?.todoDto?.todoId === todo.todoDto?.todoId
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                    onClick={() => handleEdit(todo)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800">{todo.todoDto?.title}</h3>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(todo);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(todo.todoDto?.todoId);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {todo.todoDto?.description && (
                                        <p className="text-sm text-gray-600 mb-3">{todo.todoDto?.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <RotateCcw size={14} />
                                            <span>{getRecurrenceDisplay({
                                                recurrenceType: todo.repeatRange,
                                                recurrenceConfig: {
                                                    daysOfWeek: todo.weekly, // 백엔드 필드를 프론트 폼 키로 매핑하여 표시
                                                    dayOfMonth: todo.monthly
                                                }
                                            })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>시작: {new Date(todo.todoDto?.date).toLocaleDateString('ko-KR')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 우측: 생성/수정 폼 */}
            <div className="w-1/2 overflow-y-auto">
                <div className="p-6">
                    {isCreating ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {selectedTodo ? '반복 루틴 수정' : '새 반복 루틴 추가'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    취소
                                </button>
                            </div>

                            {/* 제목 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    제목 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="예: 아침 운동, 독서 시간"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* 설명 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="루틴에 대한 설명을 입력하세요"
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* 반복 유형 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">반복 유형</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {recurrenceTypes.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                recurrenceType: type.value,
                                                recurrenceConfig: {}
                                            })}
                                            className={`p-4 border rounded-lg text-left transition-all ${
                                                formData.recurrenceType === type.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="font-medium text-gray-800 mb-1">{type.label}</div>
                                            <div className="text-xs text-gray-500">{type.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 반복 설정 */}
                            {renderRecurrenceConfig()}

                            {/* 시작 날짜 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* 제출 버튼 */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    {selectedTodo ? '수정하기' : '추가하기'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Plus className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500">새 루틴을 추가하거나</p>
                            <p className="text-gray-500">기존 루틴을 선택해서 수정하세요</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecurringTodoManager;