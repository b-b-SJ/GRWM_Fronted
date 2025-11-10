import React, { useState, useEffect } from 'react';
import {Edit3, Trash2, Plus, Calendar, Hash, Image, X, ChevronLeft, ChevronRight, Search, Filter, Save, Camera, Smile, Loader
} from 'lucide-react';
import { useDiaryApi } from "../../hooks/useDiaryApi";

const DiaryView = ({ showHeader = false, writeMode = false, setWriteMode }) => {
    // API 훅 사용
    const {
        getDiaryList,
        getDiaryDetail,
        createDiary,
        updateDiary,
        deleteDiary,
        getAllDiaries,
        clearError
    } = useDiaryApi();

    // 상태 관리
    const [diaries, setDiaries] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [showWritePanel, setShowWritePanel] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 여부

    // 페이징 및 필터 상태
    const [currentPage, setCurrentPage] = useState(0); // API는 0부터 시작
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');

    // 로딩 및 에러 상태
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // 삭제 상태
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingDiaryId, setDeletingDiaryId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // 새 일기 작성 폼 상태
    const [newDiary, setNewDiary] = useState({
        title: '',
        content: '',
        emotion: 'happy', // 백엔드 emotion 필드에 맞춤
        tags: [],
        category: '', // 백엔드에 category 필드 추가
        date: new Date().toISOString().split('T')[0]
    });
    const [currentTag, setCurrentTag] = useState('');

    // 초기 데이터 로딩
    useEffect(() => {
        fetchDiaries();
    }, []);

    // 검색/필터 변경 시 데이터 다시 로딩 (디바운스 적용)
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setCurrentPage(0); // 검색 시 첫 페이지로
            fetchDiaries(0, searchTerm, selectedMoodFilter);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, selectedMoodFilter]);

    // writeMode prop 변경 감지
    useEffect(() => {
        if (writeMode) {
            openWritePanel();
            if (setWriteMode) {
                setWriteMode(false);
            }
        }
    }, [writeMode, setWriteMode]);

    // 일기 목록 조회
    const fetchDiaries = async (page = currentPage, keyword = searchTerm, emotion = selectedMoodFilter) => {
        setLoading(true);
        setError(null);
        clearError();

        try {
            let result;
            // 검색어 또는 감정 필터가 있는지 확인
            const isSearching = keyword.trim() !== '' || emotion !== 'all';

            if (isSearching) {
                // 검색/필터링 중: getDiaryList (검색 전용) 사용
                const filters = {
                    page,
                    limit: 6,
                    keyword: keyword.trim(),
                    emotion: emotion
                };
                console.log('VIEW_LOG: 검색/필터링 요청', filters);
                result = await getDiaryList(filters);
            } else {
                // 검색/필터링 아님: getAllDiaries (기본 조회) 사용
                console.log('VIEW_LOG: 기본 목록 조회 요청', { page, limit: 6 });
                result = await getAllDiaries(page, 6);
            }


            if (result.success) {
                setDiaries(result.data.diaries || []);
                setTotalCount(result.data.totalCount || 0);
                setTotalPages(result.data.totalPages || 1);
                setCurrentPage(result.data.currentPage || 0);
            } else {
                setError(result.error || '일기를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('일기를 불러오는 중 오류가 발생했습니다.');
            console.error('Fetch diaries error:', err);
        } finally {
            setLoading(false);
        }
    };

    // 작성 중인 내용이 있는지 확인하는 함수
    const hasUnsavedChanges = () => {
        return newDiary.title.trim() !== '' ||
            newDiary.content.trim() !== '' ||
            newDiary.tags.length > 0 ||
            newDiary.emotion !== 'happy' ||
            newDiary.category.trim() !== '';
    };

    // 일기 클릭 핸들러
    const handleDiaryClick = async (diary) => {
        // 상세 정보 조회
        const result = await getDiaryDetail(diary.id);
        if (result.success) {
            setSelectedDiary(result.data);
        } else {
            alert(result.error || '일기를 불러오는데 실패했습니다.');
        }
    };

    // 일기 상세보기 닫기
    const closeDiaryDetail = () => {
        setSelectedDiary(null);
    };

    // 새 일기 작성 패널 열기
    const openWritePanel = () => {
        setIsEditMode(false);
        setShowWritePanel(true);
        // 폼 초기화
        setNewDiary({
            title: '',
            content: '',
            emotion: 'happy',
            tags: [],
            category: '',
            date: new Date().toISOString().split('T')[0]
        });
        setCurrentTag('');
    };

    // 일기 수정 패널 열기
    const openEditPanel = (diary) => {
        setIsEditMode(true);
        setShowWritePanel(true);
        setSelectedDiary(diary);
        // 수정할 데이터로 폼 채우기
        setNewDiary({
            id: diary.id,
            title: diary.title || '',
            content: diary.content || '',
            emotion: diary.emotion || 'happy',
            tags: diary.tags || [],
            category: diary.category || '',
            date: diary.createdAt ? new Date(diary.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setCurrentTag('');
    };

    // 새 일기 작성 패널 닫기
    const closeWritePanel = () => {
        if (hasUnsavedChanges()) {
            setShowExitConfirm(true);
        } else {
            setShowWritePanel(false);
            setIsEditMode(false);
        }
    };

    // 작성 취소 확인
    const confirmCloseWritePanel = () => {
        setShowWritePanel(false);
        setShowExitConfirm(false);
        setIsEditMode(false);
        // 폼 초기화
        setNewDiary({
            title: '',
            content: '',
            emotion: 'happy',
            tags: [],
            category: '',
            date: new Date().toISOString().split('T')[0]
        });
        setCurrentTag('');
    };

    // 작성 취소 취소
    const cancelCloseWritePanel = () => {
        setShowExitConfirm(false);
    };

    // 일기 저장 (생성 또는 수정)
    const handleSaveDiary = async () => {
        if (!newDiary.title.trim() || !newDiary.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            let result;

            if (isEditMode && newDiary.id) {
                // 수정 모드 (로직 유지)
                result = await updateDiary(newDiary.id, {
                    title: newDiary.title,
                    content: newDiary.content,
                    category: newDiary.category,
                    emotion: newDiary.emotion,
                    tags: newDiary.tags
                });

                if (result.success) {
                    alert('일기가 성공적으로 수정되었습니다!');
                } else {
                    alert(result.error || '일기 수정에 실패했습니다.');
                }
            } else {
                // 생성 모드 (로직 유지)
                result = await createDiary({
                    title: newDiary.title,
                    content: newDiary.content,
                    category: newDiary.category,
                    emotion: newDiary.emotion,
                    tags: newDiary.tags,
                    date: newDiary.date
                });

                if (result.success) {
                    alert('일기가 성공적으로 저장되었습니다!');
                } else {
                    alert(result.error || '일기 저장에 실패했습니다.');
                }
            }

            if (result.success) {
                if (!isEditMode) {
                    console.log('VIEW_LOG: 새 일기 작성 성공. 0페이지 재로딩 시작...');
                    // ⭐ 검색/필터 상태 초기화 (새 글은 전체 목록의 0페이지에 보장되므로)
                    setSearchTerm('');
                    setSelectedMoodFilter('all');
                    // 필터가 없는 상태(keyword='', emotion='all')로 0페이지 재로딩 -> fetchDiaries는 getAllDiaries 호출
                    await fetchDiaries(0, '', 'all');
                    console.log('VIEW_LOG: 0페이지 재로딩 완료.');
                } else {
                    console.log('VIEW_LOG: 일기 수정 성공. 현재 페이지 재로딩 시작...');
                    // 수정은 현재 페이지/필터 상태를 유지하고 재로딩
                    await fetchDiaries();
                    console.log('VIEW_LOG: 현재 페이지 재로딩 완료.');
                }

                setShowWritePanel(false);
                setIsEditMode(false);
                confirmCloseWritePanel(); // 폼 초기화

                // 상세보기가 열려있었다면 닫기
                if (selectedDiary) {
                    setSelectedDiary(null);
                }
            }
        } catch (error) {
            alert(isEditMode ? '일기 수정 중 오류가 발생했습니다.' : '일기 저장 중 오류가 발생했습니다.');
            console.error('Save diary error:', error);
        } finally {
            setSaving(false);
        }
    };

    // 태그 추가
    const handleAddTag = (e) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            const tag = currentTag.trim().startsWith('#') ? currentTag.trim() : `#${currentTag.trim()}`;
            if (!newDiary.tags.includes(tag)) {
                setNewDiary(prev => ({
                    ...prev,
                    tags: [...prev.tags, tag]
                }));
            }
            setCurrentTag('');
        }
    };

    // 태그 제거
    const removeTag = (tagToRemove) => {
        setNewDiary(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // 페이지 이동
    const goToPage = (page) => {
        setCurrentPage(page);
        fetchDiaries(page, searchTerm, selectedMoodFilter);
    };

    const goToPrevPage = () => {
        if (currentPage > 0) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            goToPage(currentPage + 1);
        }
    };

    // 감정 옵션 - 백엔드 Emotion enum과 매핑
    const emotionOptions = [
        { value: 'happy', emoji: '😊', label: '기쁨' },
        { value: 'relieved', emoji: '😌', label: '평온' },
        { value: 'Default', emoji: '😐', label: '기본' },
        { value: 'depressed', emoji: '😔', label: '우울' },
        { value: 'angry', emoji: '😠', label: '분노' },
        { value: 'sad', emoji: '😢', label: '슬픔' }
    ];

    // emotion 값을 이모지로 변환
    const getEmojiFromEmotion = (emotion) => {
        const found = emotionOptions.find(opt => opt.value === emotion?.toLowerCase());
        return found ? found.emoji : '😊';
    };

    // 일기 삭제 요청
    const handleDeleteRequest = (diary) => {
        setDeletingDiaryId(diary.id);
        setShowDeleteConfirm(true);
    };

    // 일기 삭제 확인
    const handleDeleteConfirm = async () => {
        if (!deletingDiaryId) return;

        setDeleting(true);
        try {
            const result = await deleteDiary(deletingDiaryId);

            if (result.success) {
                // 목록 새로고침
                await fetchDiaries();

                // 상세보기 중이었다면 닫기
                if (selectedDiary && selectedDiary.id === deletingDiaryId) {
                    setSelectedDiary(null);
                }

                alert('일기가 성공적으로 삭제되었습니다.');
            } else {
                alert(result.error || '일기 삭제에 실패했습니다.');
            }
        } catch (error) {
            alert('일기 삭제 중 오류가 발생했습니다.');
            console.error('Delete diary error:', error);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
            setDeletingDiaryId(null);
        }
    };

    // 일기 삭제 취소
    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setDeletingDiaryId(null);
    };

    return (
        <div className="space-y-6 relative">
            {/* 헤더 - showHeader가 true일 때만 표시 */}
            {showHeader && (
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">회고일기</h2>
                    <button
                        onClick={openWritePanel}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm"
                    >
                        <Plus size={16} />
                        <span>새 일기 작성</span>
                    </button>
                </div>
            )}

            {/* 메인 헤더 - showHeader가 false일 때만 표시 */}
            {!showHeader && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            회고일기
                        </h1>
                        <p className="text-gray-600">
                            하루를 돌아보고 기록하세요
                        </p>
                    </div>
                    <button
                        onClick={openWritePanel}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        <span>새 일기 작성</span>
                    </button>
                </div>
            )}

            {/* 검색 및 필터 */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* 검색 */}
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="일기 제목이나 내용, 태그로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* 감정 필터 */}
                    <div className="flex items-center space-x-2">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={selectedMoodFilter}
                            onChange={(e) => setSelectedMoodFilter(e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="all">모든 감정</option>
                            {emotionOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.emoji} {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Loader className="animate-spin" size={20} />
                        <span>일기를 불러오는 중...</span>
                    </div>
                </div>
            )}

            {/* 에러 상태 */}
            {error && (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">{error}</div>
                    <button
                        onClick={() => fetchDiaries()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {/* 검색 결과가 없을 때 */}
            {!loading && !error && diaries.length === 0 && (
                <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        {searchTerm || selectedMoodFilter !== 'all' ? '검색 결과가 없습니다' : '작성된 일기가 없습니다'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm || selectedMoodFilter !== 'all' ?
                            '다른 검색어나 필터를 시도해보세요' :
                            '첫 번째 일기를 작성해보세요'
                        }
                    </p>
                </div>
            )}

            {/* 일기 목록 */}
            {!loading && !error && diaries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diaries.map((diary) => {
                        const emoji = getEmojiFromEmotion(diary.emotion);
                        const displayDate = diary.createdAt ? new Date(diary.createdAt).toLocaleDateString('ko-KR') : '';

                        return (
                            <div
                                key={diary.id}
                                onClick={() => handleDiaryClick(diary)}
                                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group"
                            >
                                {/* 이미지 영역 */}
                                <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-xl relative overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <span className="text-4xl">{emoji}</span>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-sm font-medium text-gray-600 shadow-sm">
                                        {displayDate}
                                    </div>
                                </div>

                                {/* 내용 영역 */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">
                                            {diary.title}
                                        </h3>
                                        <span className="text-xl ml-2">{emoji}</span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {diary.content}
                                    </p>

                                    {/* 태그 */}
                                    {diary.tags && diary.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {diary.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                            {diary.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">+{diary.tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* 하단 정보 */}
                                    <div className="flex items-center justify-end text-xs text-gray-500">
                                        <Calendar size={12} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 페이징 */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 0}
                        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToPage(index)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === index
                                    ? 'bg-green-600 text-white'
                                    : 'border hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* 상세보기 슬라이딩 패널 */}
            <>
                {/* 오버레이 */}
                <div
                    className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
                        selectedDiary ? 'bg-opacity-30 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
                    }`}
                    onClick={closeDiaryDetail}
                />

                {/* 슬라이딩 패널 */}
                <div className={`fixed top-0 right-0 w-full md:w-2/3 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
                    selectedDiary ? 'translate-x-0' : 'translate-x-full'
                }`}>
                    {selectedDiary && (
                        <>
                            {/* 헤더 */}
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getEmojiFromEmotion(selectedDiary.emotion)}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{selectedDiary.title}</h2>
                                        <p className="text-sm text-gray-500">
                                            {selectedDiary.createdAt ? new Date(selectedDiary.createdAt).toLocaleDateString('ko-KR') : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {/* 수정 버튼 */}
                                    <button
                                        onClick={() => openEditPanel(selectedDiary)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="수정"
                                    >
                                        <Edit3 size={18} />
                                    </button>

                                    {/* 삭제 버튼 */}
                                    <button
                                        onClick={() => handleDeleteRequest(selectedDiary)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    {/* 닫기 버튼 */}
                                    <button
                                        onClick={closeDiaryDetail}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* 본문 */}
                            <div className="p-6">
                                {/* 카테고리 */}
                                {selectedDiary.category && (
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                            {selectedDiary.category}
                                        </span>
                                    </div>
                                )}

                                {/* 내용 */}
                                <div className="prose max-w-none mb-6">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedDiary.content}
                                    </p>
                                </div>

                                {/* 태그 */}
                                {selectedDiary.tags && selectedDiary.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedDiary.tags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                                <Hash size={12} className="mr-1" />
                                                {tag.replace('#', '')}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* 하단 정보 */}
                                <div className="flex items-center justify-between py-4 border-t text-sm text-gray-500">
                                    <div>
                                        작성: {selectedDiary.createdAt ? new Date(selectedDiary.createdAt).toLocaleString('ko-KR') : ''}
                                    </div>
                                    {selectedDiary.updatedAt && (
                                        <div>
                                            수정: {new Date(selectedDiary.updatedAt).toLocaleString('ko-KR')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </>

            {/* 새 일기 작성 슬라이딩 패널 */}
            <>
                {/* 오버레이 */}
                <div
                    className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
                        showWritePanel ? 'bg-opacity-30 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
                    }`}
                    onClick={closeWritePanel}
                />

                {/* 슬라이딩 패널 */}
                <div className={`fixed top-0 right-0 w-full md:w-2/3 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${
                    showWritePanel ? 'translate-x-0' : 'translate-x-full'
                }`}>
                    {showWritePanel && (
                        <>
                            {/* 헤더 */}
                            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getEmojiFromEmotion(newDiary.emotion)}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {isEditMode ? '일기 수정' : '새 일기 작성'}
                                        </h2>
                                        <p className="text-sm text-gray-500">{newDiary.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleSaveDiary}
                                        disabled={saving}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader className="animate-spin" size={16} />
                                                <span>{isEditMode ? '수정 중...' : '저장 중...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>{isEditMode ? '수정' : '저장'}</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={closeWritePanel}
                                        disabled={saving}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* 작성 폼 */}
                            <div className="p-6 space-y-6">
                                {/* 날짜 표시 - 수정 불가 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-600">
                                        {newDiary.date}
                                    </div>
                                </div>

                                {/* 제목 입력 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                                    <input
                                        type="text"
                                        placeholder="일기 제목을 입력하세요"
                                        value={newDiary.title}
                                        onChange={(e) => setNewDiary(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        disabled={saving}
                                    />
                                </div>

                                {/* 카테고리 입력 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                                    <input
                                        type="text"
                                        placeholder="카테고리를 입력하세요 (예: 일상, 업무, 취미)"
                                        value={newDiary.category}
                                        onChange={(e) => setNewDiary(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        disabled={saving}
                                    />
                                </div>

                                {/* 감정 선택 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Smile size={16} className="inline mr-1" />
                                        오늘의 감정
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {emotionOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setNewDiary(prev => ({ ...prev, emotion: option.value }))}
                                                disabled={saving}
                                                className={`text-2xl p-2 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                                                    newDiary.emotion === option.value
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                title={option.label}
                                            >
                                                {option.emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 내용 입력 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                                    <textarea
                                        placeholder="오늘 하루는 어떠셨나요? 자유롭게 작성해보세요..."
                                        value={newDiary.content}
                                        onChange={(e) => setNewDiary(prev => ({ ...prev, content: e.target.value }))}
                                        rows={10}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                        disabled={saving}
                                    />
                                </div>

                                {/* 태그 입력 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Hash size={16} className="inline mr-1" />
                                        태그
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="태그를 입력하고 Enter를 누르세요"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
                                        disabled={saving}
                                    />

                                    {/* 추가된 태그들 */}
                                    {newDiary.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {newDiary.tags.map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                                    <Hash size={12} className="mr-1" />
                                                    {tag.replace('#', '')}
                                                    <button
                                                        onClick={() => removeTag(tag)}
                                                        disabled={saving}
                                                        className="ml-1 hover:text-red-600 disabled:opacity-50"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </>

            {/* 나가기 확인 모달 */}
            {showExitConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-md w-full">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 14.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">작성 취소</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            작성 중인 내용이 있습니다. 정말로 나가시겠습니까?<br/>
                            <span className="text-sm text-red-500">저장되지 않은 내용은 모두 사라집니다.</span>
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelCloseWritePanel}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                계속 작성
                            </button>
                            <button
                                onClick={confirmCloseWritePanel}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-md w-full">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">일기 삭제</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            정말로 이 일기를 삭제하시겠습니까?<br/>
                            <span className="text-sm text-red-500">삭제된 일기는 복구할 수 없습니다.</span>
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {deleting ? (
                                    <>
                                        <Loader className="animate-spin" size={16} />
                                        <span>삭제 중...</span>
                                    </>
                                ) : (
                                    <span>삭제</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiaryView;