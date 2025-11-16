import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Calendar, RotateCcw, AlertCircle } from 'lucide-react';
import { useTodoApi } from '../../hooks/useTodoApi';
import { useAuth } from "../../hooks/AuthContext";

/**
 * 반복 To-Do 관리 페이지 (수정됨)
 * - isRecurring 필드를 활용한 구분
 * - 데이터 구조 디버깅 개선
 */
const RecurringTodoManager = () => {
    const { user, isAuthenticated, getAuthHeaders } = useAuth();

    const {
        loading: apiLoading,
        error: apiErrorFromHook,
       getRecurringTodos,
        createRecurringTodo,
        updateRecurringTodo,
        deleteRecurringTodo,
    } = useTodoApi(user, isAuthenticated, getAuthHeaders);

    const currentUserId = user?.userId;
    const [recurringTodos, setRecurringTodos] = useState([]);
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        recurrenceType: 'daily',
        recurrenceConfig: {},
        startDate: new Date().toISOString().split('T')[0],
        active : true,
    });
    const [filterStatus, setFilterStatus] = useState('active');
    const [filterType, setFilterType] = useState('');
    const [error, setError] = useState(null);

    const recurrenceTypes = [
        { value: 'daily', label: '매일', description: '매일 반복' },
        { value: 'weekly', label: '매주', description: '특정 요일마다 반복' },
        { value: 'monthly', label: '매월', description: '특정 날짜마다 반복' }
    ];

    const weekDays = [
        { value: 0, label: '일' },
        { value: 1, label: '월' },
        { value: 2, label: '화' },
        { value: 3, label: '수' },
        { value: 4, label: '목' },
        { value: 5, label: '금' },
        { value: 6, label: '토' }
    ];

    const loadRecurringTodos = useCallback(async () => {
        if (!currentUserId) {
            setRecurringTodos([]);
            return;
        }

        try {
            setError(null);

            // 디버깅 1: 현재 적용된 필터 로깅
            console.log(`Loading todos with status: ${filterStatus}, type: ${filterType}`);

            const fetchedResponse = await getRecurringTodos(currentUserId, {
                status: filterStatus,
                type: filterType,
            });

            // 디버깅 2: API가 반환한 원본 리스트 데이터 로깅
            console.log("Raw API response (List<RecurringTodoDto>):", fetchedResponse);

            const recurringTodosList = fetchedResponse || [];

            // 디버깅 3: 리스트 크기 로깅
            console.log(`Fetched list size: ${recurringTodosList.length}`);

            const normalizedTodos = recurringTodosList.map(todo => {
                // recurrenceConfig에서 정보 추출
                const config = todo.recurrenceConfig || {};

                return {
                    ...todo.todoDto, // todoDto의 필드들 (title, description, date 등)
                    recurringId: todo.recurringId,
                    repeatRange: todo.repeatRange,
                    active: todo.active,

                    // recurrenceConfig의 정보를 최상위로 올려서 저장
                    interval: config.interval || 0,     // 일간 반복 간격
                    weekly: config.weekly || [],        // 주간 반복 요일 배열
                    monthly: config.monthly || 0,       // 월간 반복 일자
                };
            });

            // 디버깅 4: 정규화된 (state에 저장될) 데이터 로깅
            console.log("Normalized Todos (for state):", normalizedTodos);

            setRecurringTodos(normalizedTodos);

        } catch (err) {
            console.error('Load error:', err);
            setError(err.message || apiErrorFromHook);
        }
    }, [currentUserId, filterStatus, filterType, getRecurringTodos, apiErrorFromHook]);

    useEffect(() => {
        loadRecurringTodos();
    }, [loadRecurringTodos]);

    const resetForm = () => {
        // 로컬 날짜 문자열 생성 (YYYY-MM-DD)
        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        setFormData({
            title: '',
            description: '',
            recurrenceType: 'daily',
            recurrenceConfig: { interval: 1 },
            startDate: localDate,
            active : true,
        });
        setSelectedTodo(null);
        setIsCreating(false);
    };

    const handleCreateNew = () => {
        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        setFormData({
            title: '',
            description: '',
            recurrenceType: 'daily',
            recurrenceConfig: { interval: 1 },
            startDate: localDate
        });
        setSelectedTodo(null);
        setIsCreating(true);
    };

    const handleEdit = (todo) => {
        // todo는 이제 TodoDto 형태 (recurring: true인 일반 투두)
        const recurrenceType = todo.repeatRange;

        let config = {};

        if (recurrenceType === 'daily') {
            config = { interval: todo.interval || 1 };
        } else if (recurrenceType === 'weekly') {
            config = { daysOfWeek: todo.weekly || [] };
        } else if (recurrenceType === 'monthly') {
            config = { dayOfMonth: todo.monthly || 1 };
        }

        setSelectedTodo(todo);

        // 날짜 처리: ISO 문자열이나 Date 객체를 YYYY-MM-DD로 변환
        let dateStr = '';
        if (todo.date) {
            if (typeof todo.date === 'string') {
                dateStr = todo.date.split('T')[0];
            } else if (todo.date instanceof Date) {
                const d = todo.date;
                dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
        }

        if (!dateStr) {
            const today = new Date();
            dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }

        setFormData({
            title: todo.title || '',
            description: todo.description || '',
            recurrenceType: recurrenceType,
            recurrenceConfig: config,
            startDate: dateStr,
            active : todo.active,
        });
        setIsCreating(true);
    };

    const handleDelete = async (recurringId) => {
        if (!window.confirm('이 반복 루틴을 삭제하시겠습니까?')) return;
        if (!currentUserId) return;

        try {
            await deleteRecurringTodo(currentUserId, recurringId);
            await loadRecurringTodos();
            if (selectedTodo?.recurringId === recurringId) {
                resetForm();
            }
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim() || !currentUserId) {
            alert('제목을 입력하고 로그인해주세요.');
            return;
        }

        try {
            if (selectedTodo) {
                // RecurringTodoUpdateDto 구조에 맞게
                const updatePayload = {
                    title: formData.title,
                    description: formData.description,
                    startDate: formData.startDate,
                    active: formData.active,
                    repeatRange: formData.recurrenceType,
                    // 개별 필드로 전송
                    daily: formData.recurrenceType === 'daily'
                        ? (formData.recurrenceConfig.interval || 1)
                        : 0,
                    weekly: formData.recurrenceType === 'weekly'
                        ? (formData.recurrenceConfig.daysOfWeek || [])
                        : [],
                    monthly: formData.recurrenceType === 'monthly'
                        ? (formData.recurrenceConfig.dayOfMonth || 1)
                        : 0
                };

                console.log('Updating todo with payload:', updatePayload);

                await updateRecurringTodo(currentUserId, selectedTodo.recurringId, updatePayload);
                await loadRecurringTodos();
            } else {
                // 생성 모드
                let processedConfig = {
                    interval: 0,
                    weekly: [],
                    monthly: 0,
                };

                if (formData.recurrenceType === 'daily') {
                    processedConfig = {
                        daily: {
                            repeatInterval: formData.recurrenceConfig.interval || 1
                        }
                    };
                } else if (formData.recurrenceType === 'weekly') {
                    processedConfig = {
                        weekly: {
                            daysOfWeek: formData.recurrenceConfig.daysOfWeek || []
                        }
                    };
                } else if (formData.recurrenceType === 'monthly') {
                    processedConfig = {
                        monthly: {
                            dayOfMonth: formData.recurrenceConfig.dayOfMonth || 1
                        }
                    };
                }

                const createPayload = {
                    title: formData.title,
                    description: formData.description,
                    recurrenceType: formData.recurrenceType,
                    recurrenceConfig: processedConfig,
                    startDate: formData.startDate,
                    active: formData.active,
                };

                console.log('Creating new todo with payload:', createPayload);

                const created = await createRecurringTodo(currentUserId, createPayload);
                console.log('Created response:', created);

                if (created) {
                    // 생성된 투두를 바로 목록에 추가
                    const newRecurringTodo = {
                        ...created.todoDto,
                        recurringId: created.recurringId,
                        title: formData.title,
                        description: formData.description,
                        date: formData.startDate,
                        recurring: true,
                        repeatRange: created.repeatRange,
                        active: created.active,
                        // recurrenceConfig 정보도 추가
                        ...(formData.recurrenceType === 'daily' && {
                            interval: formData.recurrenceConfig.interval
                        }),
                        ...(formData.recurrenceType === 'weekly' && {
                            weekly: formData.recurrenceConfig.daysOfWeek
                        }),
                        ...(formData.recurrenceType === 'monthly' && {
                            monthly: formData.recurrenceConfig.dayOfMonth
                        }),
                    };

                    setRecurringTodos(prev => [newRecurringTodo, ...prev]);
                }
            }

            resetForm();
            if (filterType !== '') {
                setFilterType('');
            }
        } catch (err) {
            alert(selectedTodo ? '수정에 실패했습니다.' : '생성에 실패했습니다.');
            console.error("API Error:", err);
        }
    };

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

    const getRecurrenceDisplay = (todo) => {
        const recurrenceType = todo.repeatRange || todo.recurrenceType;

        switch (recurrenceType) {
            case 'daily':
                return todo.interval > 1 ? `매일 ${todo.interval}일 마다` : '매일';
            case 'weekly':
                const weeklyDays = todo.weekly || [];
                const days = weeklyDays
                    .map(d => weekDays.find(wd => wd.value === d)?.label)
                    .filter(Boolean)
                    .join(', ');
                return `매주 ${days || ''}`;
            case 'monthly':
                const dayOfMonth = todo.monthly || 1;
                return `매월 ${dayOfMonth}일`;
            default:
                return recurrenceType || '알 수 없음';
        }
    };
    const combinedError = error;

    return (
        <div className="flex h-full bg-gray-50">
            <div className="w-1/2 border-r bg-white overflow-y-auto">
                <div className="p-6">
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

                    {combinedError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <p className="text-red-700 text-sm">루틴 오류: {combinedError}</p>
                        </div>
                    )}

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
                                    key={todo.recurringId}
                                    className={`p-4 border rounded-lg transition-all cursor-pointer relative ${ // relative 추가
                                        selectedTodo?.recurringId === todo.recurringId
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                    onClick={() => handleEdit(todo)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800">{todo.title}</h3>
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
                                                    handleDelete(todo.recurringId);
                                                }}
                                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {todo.description && (
                                        <p className="text-sm text-gray-600 mb-3">{todo.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <RotateCcw size={14} />
                                            <span>{getRecurrenceDisplay({
                                                repeatRange: todo.repeatRange,
                                                weekly: todo.weekly,
                                                monthly: todo.monthly
                                            })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>시작: {new Date(todo.date).toLocaleDateString('ko-KR')}</span>
                                        </div>
                                    </div>

                                    <div className="absolute right-4 bottom-4">
                                        <label className="flex items-center cursor-default"> {/* cursor-default로 클릭 방지 */}
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={todo.active}
                                                    readOnly // 클릭 방지
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${
                                                    todo.active ? 'bg-green-400' : 'bg-gray-300'
                                                }`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                                    todo.active ? 'translate-x-4' : 'translate-x-0'
                                                }`}></div>
                                            </div>
                                            <div className={`ml-3 text-sm font-medium ${
                                                todo.active ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                            </div>
                                        </label>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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

                            {/* ... (제목, 설명, 반복 유형 필드 동일) ... */}
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

                            {renderRecurrenceConfig()}

                            {selectedTodo && ( // 수정 모드에서만 활성/비활성 토글 표시
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">활성 상태</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, active: true })}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                                formData.active
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            활성
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, active: false })}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                                !formData.active
                                                    ? 'bg-gray-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            비활성
                                        </button>
                                    </div>
                                </div>
                            )}


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

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