import React, { useState } from 'react';
import { Clock, Users, Eye, EyeOff, Key, Plus } from 'lucide-react';
import { useStudyRoomState } from '../../hooks/useStudyRoomState';
import { useAuth } from '../../hooks/AuthContext';

/**
 * 스터디룸 생성 컴포넌트
 * - 스터디룸 이름, 카테고리, 설명 설정
 * - 지속시간, 연장시간 설정
 * - 공개/비공개 설정
 * - useStudyRoomState API 연동
 */
const StudyRoomCreator = ({ onRoomCreated, onCancel }) => {
    const { user } = useAuth();
    const { createStudyRoom, joinStudyRoom, fetchStudyRooms } = useStudyRoomState();

    const [formData, setFormData] = useState({
        studyRoomName: '',
        subject: '일반',
        description: '',
        duration: 30, // 기본 30분
        extensionTime: 10, // 기본 10분
        isPrivate: false,
        password: '',
        maxMembers: 8 // 고정
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');

    const categories = ['일반', '프로그래밍', '자격증', '어학', '취업준비', '기타'];
    const durationOptions = [30, 60, 90, 120]; // 분 단위
    const extensionOptions = [10, 20, 30, 60]; // 분 단위

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 로그인 체크
        if (!user || !user.userId) {
            setError('로그인이 필요합니다.');
            return;
        }

        // 유효성 검사
        if (!formData.studyRoomName.trim()) {
            setError('스터디룸 이름을 입력해주세요.');
            return;
        }

        if (!formData.description.trim()) {
            setError('스터디룸 설명을 입력해주세요.');
            return;
        }

        if (formData.isPrivate && !formData.password.trim()) {
            setError('비공개 스터디룸은 비밀번호가 필요합니다.');
            return;
        }

        if (formData.isPrivate && formData.password.length !== 5) {
            setError('비밀번호는 5자리여야 합니다.');
            return;
        }

        if (formData.isPrivate && !/^\d{5}$/.test(formData.password)) {
            setError('비밀번호는 5자리 숫자여야 합니다.');
            return;
        }

        setIsLoading(true);

        try {
            setLoadingMessage('스터디룸을 생성하고 있습니다...');

            // 1. 스터디룸 생성 API 호출
            const studyRoomData = {
                studyRoomName: formData.studyRoomName,
                subject: formData.subject,
                description: formData.description,
                duration: formData.duration,
                extensionTime: formData.extensionTime,
                maxMembers: formData.maxMembers,
                ...(formData.isPrivate && { password: formData.password })
            };

            console.log('Creating study room with data:', studyRoomData);
            const studyRoomId = await createStudyRoom(studyRoomData);

            if (!studyRoomId) {
                throw new Error('스터디룸 생성에 실패했습니다.');
            }

            console.log('Study room created successfully:', studyRoomId);
            setLoadingMessage('스터디룸에 참여하고 있습니다...');

            // 2. 생성된 스터디룸에 자동 참여
            const joinSuccess = await joinStudyRoom(studyRoomId);

            if (!joinSuccess) {
                throw new Error('스터디룸 참여에 실패했습니다.');
            }

            console.log('Joined study room successfully');
            setLoadingMessage('스터디룸 목록을 업데이트하고 있습니다...');

            // 3. 스터디룸 목록 새로고침
            await fetchStudyRooms(0, 10);

            // 폼 초기화
            setFormData({
                studyRoomName: '',
                subject: '일반',
                description: '',
                duration: 30,
                extensionTime: 10,
                isPrivate: false,
                password: '',
                maxMembers: 8
            });

            alert('스터디룸이 성공적으로 생성되고 입장되었습니다!');

            if (onRoomCreated) {
                onRoomCreated(studyRoomId);
            }

        } catch (error) {
            console.error('Study room creation error:', error);
            setError(error.message || '스터디룸 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (error) {
            setError('');
        }
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}분`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        새 스터디룸 만들기
                    </h1>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* 로딩 메시지 */}
                {loadingMessage && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-green-700 text-sm">{loadingMessage}</p>
                        </div>
                    </div>
                )}

                <div className="max-w-2xl">
                    <div className="space-y-6">
                        {/* 스터디룸 이름 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                스터디룸 이름 *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.studyRoomName}
                                onChange={(e) => handleChange('studyRoomName', e.target.value)}
                                placeholder="스터디룸 이름을 입력하세요"
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={isLoading}
                                maxLength={50}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.studyRoomName.length}/50자
                            </p>
                        </div>

                        {/* 카테고리 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                카테고리 *
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={isLoading}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        {/* 스터디룸 설명 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                스터디룸 설명 *
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="스터디룸에 대한 간단한 설명을 입력하세요"
                                rows={3}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                disabled={isLoading}
                                maxLength={200}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length}/200자
                            </p>
                        </div>

                        {/* 시간 설정 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 지속 시간 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center space-x-2">
                                        <Clock size={16} />
                                        <span>지속 시간 *</span>
                                    </div>
                                </label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={isLoading}
                                >
                                    {durationOptions.map(duration => (
                                        <option key={duration} value={duration}>
                                            {formatDuration(duration)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    스터디룸이 유지되는 시간
                                </p>
                            </div>

                            {/* 연장 시간 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center space-x-2">
                                        <Plus size={16} />
                                        <span>연장 시간 *</span>
                                    </div>
                                </label>
                                <select
                                    value={formData.extensionTime}
                                    onChange={(e) => handleChange('extensionTime', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    disabled={isLoading}
                                >
                                    {extensionOptions.map(time => (
                                        <option key={time} value={time}>
                                            {formatDuration(time)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    투표 시 연장되는 시간
                                </p>
                            </div>
                        </div>

                        {/* 공개/비공개 설정 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                공개 설정 *
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <input
                                        type="radio"
                                        id="public"
                                        name="privacy"
                                        checked={!formData.isPrivate}
                                        onChange={() => handleChange('isPrivate', false)}
                                        className="mr-3 mt-1"
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="public" className="flex-1 cursor-pointer">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Eye size={16} className="text-gray-500" />
                                            <span className="font-medium">공개 스터디룸</span>
                                        </div>
                                        <p className="text-sm text-gray-600">누구나 참여할 수 있습니다</p>
                                    </label>
                                </div>
                                <div className="flex items-start">
                                    <input
                                        type="radio"
                                        id="private"
                                        name="privacy"
                                        checked={formData.isPrivate}
                                        onChange={() => handleChange('isPrivate', true)}
                                        className="mr-3 mt-1"
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="private" className="flex-1 cursor-pointer">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <EyeOff size={16} className="text-gray-500" />
                                            <span className="font-medium">비공개 스터디룸</span>
                                        </div>
                                        <p className="text-sm text-gray-600">비밀번호를 알아야 참여할 수 있습니다</p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* 비밀번호 (비공개일 때만) */}
                        {formData.isPrivate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    비밀번호 *
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="5자리 숫자를 입력하세요"
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        disabled={isLoading}
                                        maxLength={5}
                                        pattern="[0-9]{5}"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    비밀번호는 5자리 숫자여야 합니다. ({formData.password.length}/5자)
                                </p>
                            </div>
                        )}

                        {/* 생성 버튼 */}
                        <div className="pt-4 flex space-x-3">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    disabled={isLoading}
                                >
                                    취소
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`
                                    flex-1 py-3 px-6 rounded-lg font-medium transition-colors
                                    ${isLoading
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }
                                `}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>처리 중...</span>
                                    </div>
                                ) : (
                                    '스터디룸 생성하기'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyRoomCreator;