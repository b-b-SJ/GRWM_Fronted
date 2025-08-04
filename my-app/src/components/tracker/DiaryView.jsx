import React, { useState } from 'react';
import {
    Plus,
    Calendar,
    Hash,
    Image,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';


// 샘플 일기 데이터
const sampleDiaries = [
    {
        id: 1,
        date: '2025-08-01',
        title: '바깥은 여름',
        content: '너무 덥다... 너무너무너무너무너무너무 덥다... 그래도 실내에만 있으면 괜찮다. 하늘과 나무가 푸르른 계절이라 눈으로 보기만 하면 아름답다. 시원한 에어컨 바람 맞으며 이불을 덮는 사치를 부려보는 하루',
        mood: '😊',
        tags: ['#여름', '#더움', '#일상'],
        hasImage: true
    },
    {
        id: 2,
        date: '2025-08-02',
        title: '책책책 책을 읽읍시다.',
        content: '책을 읽어야 하는데 영원히 안 읽음. 책 정리 해야하는데 영원히 안 하고 사기만 함. 출판사의 빛과 소금이 되어보겠습니다. 구매비독서의 끝판왕을 보여드리죠.',
        mood: '😌',
        tags: ['#취미'],
        hasImage: false
    }
];

const DiaryView = ({ showHeader = false }) => {
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');

    const diariesPerPage = 6;

    // 필터링된 일기 목록
    const filteredDiaries = sampleDiaries.filter(diary => {
        const matchesSearch = diary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            diary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            diary.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesMood = selectedMoodFilter === 'all' || diary.mood === selectedMoodFilter;

        return matchesSearch && matchesMood;
    });

    // 페이징
    const totalPages = Math.ceil(filteredDiaries.length / diariesPerPage);
    const startIndex = (currentPage - 1) * diariesPerPage;
    const currentDiaries = filteredDiaries.slice(startIndex, startIndex + diariesPerPage);

    const handleDiaryClick = (diary) => {
        setSelectedDiary(diary);
    };

    const closeDiaryDetail = () => {
        setSelectedDiary(null);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="space-y-6 relative">
            {/* 헤더 - 조건부 렌더링 */}
            {showHeader && (
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">회고일기</h2>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm">
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
                            <option value="😔">😔 슬픔</option>
                            <option value="😄">😄 즐거움</option>
                            <option value="📚">📚 학습</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 검색 결과가 없을 때 */}
            {filteredDiaries.length === 0 && (
                <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">검색 결과가 없습니다</h3>
                    <p className="text-gray-500">다른 검색어나 필터를 시도해보세요</p>
                </div>
            )}

            {/* 일기 목록 */}
            {filteredDiaries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentDiaries.map((diary) => (
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
            {totalPages > 1 && (
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
                                <button
                                    onClick={closeDiaryDetail}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
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
        </div>
    );
};

export default DiaryView;