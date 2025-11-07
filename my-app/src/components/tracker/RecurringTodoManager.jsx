import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, RotateCcw, AlertCircle } from 'lucide-react';

/**
 * 반복 To-Do 관리 페이지
 * @param {Object} props
 * @param {Object} props.todoApi - useTodoApi 훅에서 반환된 API 함수들
 * @param {Object} props.user - 현재 로그인한 사용자 정보
 */
const RecurringTodoManager = ({ todoApi, user }) => {
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
    const [loading, setLoading] = useState(false);
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

    // 초기 데이터 로드
    useEffect(() => {
        if (user?.userId) {
            loadRecurringTodos();
        }
    }, [user, filterStatus]);

    // 반복 투두 목록 로드
    const loadRecurringTodos = async () => {
        try {
            setLoading(true);
            const response = await todoApi.getRecurringTodos(user.userId, {
                status: filterStatus
            });
            setRecurringTodos(response.recurringTodos || []);
            setError(null);
        } catch (err) {
            setError('반복 루틴을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

    // 수정 모드로 전환
    const handleEdit = (todo) => {
        setSelectedTodo(todo);
        setFormData({
            title: todo.title,
            description: todo.description || '',
            recurrenceType: todo.recurrenceType,
            recurrenceConfig: todo.recurrenceConfig || {},
            startDate: todo.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]
        });
        setIsCreating(true);
    };

    // 삭제
    const handleDelete = async (recurringId) => {
        if (!window.confirm('이 반복 루틴을 삭제하시겠습니까?')) return;

        try {
            await todoApi.deleteRecurringTodo(user.userId, recurringId);
            await loadRecurringTodos();
            if (selectedTodo?.recurringId === recurringId) {
                resetForm();
            }
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
    };

    // 폼 제출
    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                recurrenceType: formData.recurrenceType,
                recurrenceConfig: formData.recurrenceConfig,
                startDate: formData.startDate
            };

            if (selectedTodo) {
                await todoApi.updateRecurringTodo(user.userId, selectedTodo.recurringId, payload);
            } else {
                await todoApi.createRecurringTodo(user.userId, payload);
            }

            await loadRecurringTodos();
            resetForm();
        } catch (err) {
            alert(selectedTodo ? '수정에 실패했습니다.' : '생성에 실패했습니다.');
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
                const days = todo.recurrenceConfig?.daysOfWeek?.map(d => weekDays[d].label).join(', ');
                return `매주 ${days || ''}`;
            case 'monthly':
                return `매월 ${todo.recurrenceConfig?.dayOfMonth || 1}일`;
            default:
                return todo.recurrenceType;
        }
    };

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
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* 로딩 */}
                    {loading ? (
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
                                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
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
                                            <span>{getRecurrenceDisplay(todo)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>시작: {new Date(todo.startDate).toLocaleDateString('ko-KR')}</span>
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