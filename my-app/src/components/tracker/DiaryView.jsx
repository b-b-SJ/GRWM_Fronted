import React, { useState, useEffect } from 'react';
import {Edit3, Trash2, Plus, Calendar, Hash, Image, X, ChevronLeft, ChevronRight, Search, Filter, Save, Camera, Smile, Loader
} from 'lucide-react';

// 샘플 일기 데이터
const initialDiaries = [
    {
        id: 1,
        date: '2025-08-01',
        title: '바깥은 여름',
        content: '너무 덥다... 너무너무너무너무너무너무 덥다... 그래도 실내에만 있으면 괜찮다. 하늘과 나무가 푸르른 계절이라 눈으로 보기만 하면 아름답다. 시원한 에어컨 바람 맞으며 이불을 덮는 사치를 부려보는 하루',
        mood: '😊',
        tags: ['#여름', '#더움', '#일상'],
        hasImage: true,
        createdAt: '2025-08-01T15:30:00Z'
    },
    {
        id: 2,
        date: '2025-08-02',
        title: '책책책 책을 읽읍시다.',
        content: '책을 읽어야 하는데 영원히 안 읽음. 책 정리 해야하는데 영원히 안 하고 사기만 함. 출판사의 빛과 소금이 되어보겠습니다. 구매비독서의 끝판왕을 보여드리죠.',
        mood: '😌',
        tags: ['#취미'],
        hasImage: false,
        createdAt: '2025-08-02T20:15:00Z'
    },
];

// localStorage 키
const DIARY_STORAGE_KEY = 'user_diaries';

// API 함수들 (localStorage 사용, 실제 API로 교체 가능)
const diaryAPI = {
    // 일기 목록 조회
    async fetchDiaries(page = 1, search = '', mood = 'all') {
        // TODO: 실제 API 호출로 교체
        // const response = await fetch(`/api/diaries?page=${page}&search=${search}&mood=${mood}&limit=6`);
        // const data = await response.json();
        // return data;

        // localStorage에서 데이터 가져오기
        const storedDiaries = localStorage.getItem(DIARY_STORAGE_KEY);
        let diaries = storedDiaries ? JSON.parse(storedDiaries) : initialDiaries;

        // 첫 실행 시 초기 데이터 저장
        if (!storedDiaries) {
            localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(initialDiaries));
            diaries = initialDiaries;
        }

        // 검색 필터링
        if (search) {
            diaries = diaries.filter(diary =>
                diary.title.toLowerCase().includes(search.toLowerCase()) ||
                diary.content.toLowerCase().includes(search.toLowerCase()) ||
                diary.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // 감정 필터링
        if (mood !== 'all') {
            diaries = diaries.filter(diary => diary.mood === mood);
        }

        // 날짜순 정렬 (최신 순)
        diaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 페이징 처리
        const limit = 6;
        const startIndex = (page - 1) * limit;
        const paginatedDiaries = diaries.slice(startIndex, startIndex + limit);

        // API 응답 형태로 반환
        return {
            diaries: paginatedDiaries,
            total: diaries.length,
            totalPages: Math.ceil(diaries.length / limit),
            currentPage: page
        };
    },

    // 새 일기 작성
    async createDiary(diaryData) {
        // TODO: 실제 API 호출로 교체
        // const response = await fetch('/api/diaries', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(diaryData)
        // });
        // return await response.json();

        const storedDiaries = localStorage.getItem(DIARY_STORAGE_KEY);
        const diaries = storedDiaries ? JSON.parse(storedDiaries) : [];

        const newDiary = {
            ...diaryData,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };

        const updatedDiaries = [newDiary, ...diaries];
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updatedDiaries));

        return newDiary;
    },

    // 일기 수정
    async updateDiary(id, diaryData) {
        // TODO: 실제 API 호출로 교체
        // const response = await fetch(`/api/diaries/${id}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(diaryData)
        // });
        // return await response.json();

        const storedDiaries = localStorage.getItem(DIARY_STORAGE_KEY);
        const diaries = storedDiaries ? JSON.parse(storedDiaries) : [];

        const updatedDiaries = diaries.map(diary =>
            diary.id === id ? { ...diary, ...diaryData, updatedAt: new Date().toISOString() } : diary
        );

        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updatedDiaries));

        return updatedDiaries.find(diary => diary.id === id);
    },

    // 일기 삭제
    async deleteDiary(id) {
        // TODO: 실제 API 호출로 교체
        // await fetch(`/api/diaries/${id}`, { method: 'DELETE' });

        const storedDiaries = localStorage.getItem(DIARY_STORAGE_KEY);
        const diaries = storedDiaries ? JSON.parse(storedDiaries) : [];

        const updatedDiaries = diaries.filter(diary => diary.id !== id);
        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updatedDiaries));

        return { success: true };
    }
};

const DiaryView = ({ showHeader = false, writeMode = false, setWriteMode }) => {
    // 상태 관리
    const [diaries, setDiaries] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [showWritePanel, setShowWritePanel] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // 페이징 및 필터 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
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
        mood: '😊',
        tags: [],
        hasImage: false,
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
            setCurrentPage(1); // 검색 시 첫 페이지로
            fetchDiaries(1, searchTerm, selectedMoodFilter);
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
    const fetchDiaries = async (page = currentPage, search = searchTerm, mood = selectedMoodFilter) => {
        setLoading(true);
        setError(null);

        try {
            const data = await diaryAPI.fetchDiaries(page, search, mood);
            setDiaries(data.diaries);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            setError('일기를 불러오는데 실패했습니다.');
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
            newDiary.mood !== '😊';
    };

    // 일기 클릭 핸들러
    const handleDiaryClick = (diary) => {
        setSelectedDiary(diary);
    };

    // 일기 상세보기 닫기
    const closeDiaryDetail = () => {
        setSelectedDiary(null);
    };

    // 새 일기 작성 패널 열기
    const openWritePanel = () => {
        setShowWritePanel(true);
        // 폼 초기화
        setNewDiary({
            title: '',
            content: '',
            mood: '😊',
            tags: [],
            hasImage: false,
            date: new Date().toISOString().split('T')[0]
        });
        setCurrentTag('');
    };

    // 새 일기 작성 패널 닫기
    const closeWritePanel = () => {
        if (hasUnsavedChanges()) {
            setShowExitConfirm(true);
        } else {
            setShowWritePanel(false);
        }
    };

    // 작성 취소 확인
    const confirmCloseWritePanel = () => {
        setShowWritePanel(false);
        setShowExitConfirm(false);
        // 폼 초기화
        setNewDiary({
            title: '',
            content: '',
            mood: '😊',
            tags: [],
            hasImage: false,
            date: new Date().toISOString().split('T')[0]
        });
        setCurrentTag('');
    };

    // 작성 취소 취소
    const cancelCloseWritePanel = () => {
        setShowExitConfirm(false);
    };

    // 일기 저장
    const handleSaveDiary = async () => {
        if (!newDiary.title.trim() || !newDiary.content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            const savedDiary = await diaryAPI.createDiary(newDiary);

            // 성공 시 목록 새로고침
            await fetchDiaries();

            setShowWritePanel(false);
            confirmCloseWritePanel(); // 폼 초기화
            alert('일기가 성공적으로 저장되었습니다!');

        } catch (error) {
            alert('일기 저장에 실패했습니다.');
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
        fetchDiaries(page);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    // 감정 옵션
    const moodOptions = [
        '😊', '😌', '🤔', '😔', '😄', '😢'
    ];

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
            await diaryAPI.deleteDiary(deletingDiaryId);

            // 목록 새로고침
            await fetchDiaries();

            // 상세보기 중이었다면 닫기
            if (selectedDiary && selectedDiary.id === deletingDiaryId) {
                setSelectedDiary(null);
            }

            alert('일기가 성공적으로 삭제되었습니다.');
        } catch (error) {
            alert('일기 삭제에 실패했습니다.');
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
                            <option value="😊">😊 기쁨</option>
                            <option value="😌">😌 평온</option>
                            <option value="🤔">🤔 생각</option>
                            <option value="😔">😔 우울</option>
                            <option value="😄">😄 즐거움</option>
                            <option value="😢">😢 슬픔</option>
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
                    {diaries.map((diary) => (
                        <div
                            key={diary.id}
                            onClick={() => handleDiaryClick(diary)}
                            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer group"
                        >
                            {/* 이미지 영역 */}
                            <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-xl relative overflow-hidden">
                                {diary.hasImage ? (
                                    <div className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                                        <Image size={24} className="text-green-600" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <span className="text-4xl">{diary.mood}</span>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-sm font-medium text-gray-600 shadow-sm">
                                    {diary.date}
                                </div>
                            </div>

                            {/* 내용 영역 */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">
                                        {diary.title}
                                    </h3>
                                    <span className="text-xl ml-2">{diary.mood}</span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {diary.content}
                                </p>

                                {/* 태그 */}
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

                                {/* 하단 정보 */}
                                <div className="flex items-center justify-end text-xs text-gray-500">
                                    <Calendar size={12} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 페이징 */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    currentPage === page
                                        ? 'bg-green-600 text-white'
                                        : 'border hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
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
                                    <span className="text-2xl">{selectedDiary.mood}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{selectedDiary.title}</h2>
                                        <p className="text-sm text-gray-500">{selectedDiary.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {/* 수정 버튼 (향후 구현 가능) */}
                                    <button
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="수정"
                                    >
                                        <Edit3 size={18} />
                                    </button>

                                    {/* 삭제 버튼 - 새로 추가 */}
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
                                {/* 이미지 */}
                                {selectedDiary.hasImage && (
                                    <div className="w-full h-64 bg-gradient-to-br from-green-200 to-blue-200 rounded-lg mb-6 flex items-center justify-center">
                                        <Image size={48} className="text-green-600" />
                                    </div>
                                )}

                                {/* 내용 */}
                                <div className="prose max-w-none mb-6">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedDiary.content}
                                    </p>
                                </div>

                                {/* 태그 */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedDiary.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                                            <Hash size={12} className="mr-1" />
                                            {tag.replace('#', '')}
                                        </span>
                                    ))}
                                </div>

                                {/* 하단 정보 */}
                                <div className="flex items-center justify-end py-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        {selectedDiary.date}
                                    </div>
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
                                    <span className="text-2xl">{newDiary.mood}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">새 일기 작성</h2>
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
                                                <span>저장 중...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>저장</span>
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

                                {/* 감정 선택 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Smile size={16} className="inline mr-1" />
                                        오늘의 감정
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {moodOptions.map((mood) => (
                                            <button
                                                key={mood}
                                                onClick={() => setNewDiary(prev => ({ ...prev, mood }))}
                                                disabled={saving}
                                                className={`text-2xl p-2 rounded-lg border-2 transition-colors disabled:opacity-50 ${
                                                    newDiary.mood === mood
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {mood}
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

                                {/* 이미지 추가 (시각적 표시만) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Camera size={16} className="inline mr-1" />
                                        이미지
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                        <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">이미지를 추가하려면 클릭하세요</p>
                                        <p className="text-xs text-gray-400 mt-1">(현재는 시각적 표시만 지원)</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </>

            {/* 나가기 확인 모달 */}
            {showExitConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
                    {/* 모달 내용 */}
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