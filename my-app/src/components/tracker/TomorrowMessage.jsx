// src/pages/TomorrowMessage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Edit3, Trash2, X, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/AuthContext';
import { useTomorrowMessageApi } from '../../hooks/useTomorrowMessageApi';

const TomorrowMessage = () => {
    const { user } = useAuth();
    const {
        isLoading,
        error,
        getTomorrowMessage,
        createTomorrowMessage,
        updateTomorrowMessage,
        deleteTomorrowMessage,
        clearError
    } = useTomorrowMessageApi();

    const [messages, setMessages] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [formData, setFormData] = useState({
        time: '',
        content: ''
    });

    // 컴포넌트 마운트 시 메시지 목록 불러오기
    useEffect(() => {
        if (user?.userId) {
            loadMessages();
        }
    }, [user]);

    // 에러 표시
    useEffect(() => {
        if (error) {
            alert(error);
            clearError();
        }
    }, [error, clearError]);

    // 메시지 목록 불러오기
    const loadMessages = useCallback(async () => {
        if (!user?.userId) {
            setLoadingMessages(false);
            return;
        }

        setLoadingMessages(true);
        try {
            // localStorage에서 메시지 ID 목록 가져오기
            // 실제로는 GET /api/users/${userId}/future-messages 같은 목록 API 필요
            const messageIds = JSON.parse(
                localStorage.getItem(`messageIds_${user.userId}`) || '[]'
            );

            const loadedMessages = [];
            for (const messageId of messageIds) {
                const result = await getTomorrowMessage(messageId);
                if (result.success) {
                    loadedMessages.push(result.data);
                }
            }

            // 예약 시간순 정렬
            loadedMessages.sort((a, b) =>
                new Date(a.scheduledTime) - new Date(b.scheduledTime)
            );

            setMessages(loadedMessages);
        } catch (error) {
            console.error('메시지 로딩 오류:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, [user, getTomorrowMessage]);

    // 메시지 ID 목록 업데이트
    const updateMessageIds = useCallback((newMessages) => {
        if (!user?.userId) return;

        const messageIds = newMessages.map(msg => msg.messageId);
        localStorage.setItem(
            `messageIds_${user.userId}`,
            JSON.stringify(messageIds)
        );
    }, [user]);

    // 폼 초기화
    const resetForm = useCallback(() => {
        setFormData({ time: '', content: '' });
        setShowForm(false);
        setEditingMessage(null);
    }, []);

    // 메시지 추가/수정
    const handleSubmit = async () => {
        if (!formData.time || !formData.content.trim()) {
            alert('시간과 메시지를 모두 입력해주세요.');
            return;
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 내일 날짜 + 선택한 시간으로 배달 시간 설정
        const [hours, minutes] = formData.time.split(':');
        const deliveryDateTime = new Date(tomorrow);
        deliveryDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (editingMessage) {
            // 메시지 수정
            const result = await updateTomorrowMessage({
                messageId: editingMessage.messageId,
                content: formData.content,
                scheduledTime: deliveryDateTime.toISOString()
            });

            if (result.success) {
                const updatedMessages = messages.map(msg =>
                    msg.messageId === editingMessage.messageId ? result.data : msg
                );
                setMessages(updatedMessages);
                updateMessageIds(updatedMessages);
                alert('메시지가 수정되었습니다! 📝');
                resetForm();
            }
        } else {
            // 새 메시지 생성
            const result = await createTomorrowMessage({
                content: formData.content,
                scheduledTime: deliveryDateTime.toISOString()
            });

            if (result.success) {
                const newMessages = [...messages, result.data];
                setMessages(newMessages);
                updateMessageIds(newMessages);
                alert('메시지가 전송되었습니다! 📮');
                resetForm();
            }
        }
    };

    // 메시지 수정 시작
    const startEdit = useCallback((message) => {
        setEditingMessage(message);
        const scheduledTime = new Date(message.scheduledTime);
        const timeString = `${scheduledTime.getHours().toString().padStart(2, '0')}:${scheduledTime.getMinutes().toString().padStart(2, '0')}`;

        setFormData({
            time: timeString,
            content: message.content
        });
        setShowForm(true);
    }, []);

    // 메시지 삭제
    const handleDelete = async (messageId) => {
        const result = await deleteTomorrowMessage(messageId);

        if (result.success) {
            const newMessages = messages.filter(msg => msg.messageId !== messageId);
            setMessages(newMessages);
            updateMessageIds(newMessages);
            alert('메시지가 삭제되었습니다.');
        }

        setShowDeleteConfirm(null);
    };

    // 메시지가 배달 시간인지 확인
    const isMessageReady = useCallback((message) => {
        const now = new Date();
        const deliveryTime = new Date(message.scheduledTime);
        return now >= deliveryTime;
    }, []);

    // 배달 예정 시간 포맷팅
    const formatDeliveryTime = useCallback((message) => {
        const deliveryDate = new Date(message.scheduledTime);
        const dateString = deliveryDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric'
        });
        const timeString = deliveryDate.toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });

        return `${dateString} ${timeString}에 전달 예정`;
    }, []);

    // 로그인하지 않은 경우
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-4">로그인이 필요한 서비스입니다.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        로그인하러 가기
                    </button>
                </div>
            </div>
        );
    }

    // 로딩 중
    if (loadingMessages) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-gray-600 text-lg">메시지를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-h-screen flex flex-col items-center justify-start py-4">
            {/* 헤더 */}
            <div className="text-center mt-8 mb-12">
                <h2 className="text-3xl font-bold text-gray-800">내일의 나에게</h2>
                <p className="text-gray-600 mt-2 text-lg">미래의 나에게 전하고 싶은 메시지를 보내보세요</p>
            </div>

            {/* 로딩 인디케이터 */}
            {isLoading && (
                <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
                    <Loader className="animate-spin" size={20} />
                    <span>처리 중...</span>
                </div>
            )}

            {/* 메시지 입력창 */}
            {(messages.length === 0 || showForm) && (
                <div className="w-full max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-lg border p-8">
                        {editingMessage && (
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">메시지 수정</h3>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={isLoading}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-3 text-center">
                                    내일 언제 받아볼까요?
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-3 text-center">
                                    내일의 나에게 전하고 싶은 말
                                </label>
                                <textarea
                                    rows={5}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="        ✨ 내일의 나에게 전하고 싶은 말을 무엇이든 적어보세요! ✨"
                                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg leading-relaxed"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {editingMessage ? '📮 메시지 수정하기' : '📮 메시지 보내기'}
                                </button>
                                {editingMessage && (
                                    <button
                                        onClick={resetForm}
                                        className="px-8 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        취소
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 메시지 목록 */}
            {messages.length > 0 && !showForm && (
                <div className="w-full max-w-2xl mx-auto space-y-6 px-4">
                    {messages.map((message) => {
                        const messageReady = isMessageReady(message);

                        return (
                            <div key={message.messageId} className="bg-white rounded-xl shadow-lg border overflow-hidden">
                                {messageReady ? (
                                    // 배달된 메시지
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">📬</div>
                                                <span className="text-lg font-medium text-green-600">
                                                    메시지가 도착했습니다!
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(message.messageId)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                                                disabled={isLoading}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl mb-4">
                                            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500 text-center">
                                            {new Date(message.createdAt).toLocaleDateString('ko-KR')}에 작성된 메시지
                                        </div>
                                    </div>
                                ) : (
                                    // 밀봉된 메시지
                                    <div className="p-8 text-center">
                                        <div className="flex justify-end space-x-2 mb-6">
                                            <button
                                                onClick={() => startEdit(message)}
                                                className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                                                title="메시지 수정"
                                                disabled={isLoading}
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(message.messageId)}
                                                className="p-3 hover:bg-red-50 rounded-xl transition-colors text-red-500"
                                                title="메시지 삭제"
                                                disabled={isLoading}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="text-9xl mb-4">📮</div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-center space-x-2 text-gray-600">
                                                    <Clock size={18} />
                                                    <span className="text-xl font-medium">
                                                        {formatDeliveryTime(message)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-lg">
                                                    메시지가 날아오는 중 . . .
                                                </p>
                                                <div className="text-sm text-gray-400 pt-4">
                                                    {new Date(message.createdAt).toLocaleDateString('ko-KR')}에 작성됨
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                </div>
            )}

            {/* 삭제 확인 팝업 */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-4">🗑️</div>
                            <h3 className="text-xl font-semibold mb-3">메시지 삭제</h3>
                            <p className="text-gray-600">
                                이 메시지를 삭제하시겠습니까?<br />
                                삭제된 메시지는 복구할 수 없습니다.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                disabled={isLoading}
                            >
                                삭제
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TomorrowMessage;