import React, { useState, useEffect } from 'react';
import { Plus, Mail, Clock, Edit3, Trash2, X } from 'lucide-react';

const TomorrowMessage = () => {
    const [messages, setMessages] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        time: '',
        content: ''
    });

    // 컴포넌트 마운트 시 저장된 메시지 불러오기
    useEffect(() => {
        loadMessages();
    }, []);

    // 메시지 불러오기 및 만료된 메시지 정리
    const loadMessages = () => {
        const savedMessages = JSON.parse(localStorage.getItem('tomorrowMessages') || '[]');
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // 오늘 날짜가 지난 메시지들은 삭제
        const validMessages = savedMessages.filter(msg => {
            const deliveryDate = new Date(msg.deliveryDate);
            return deliveryDate >= today;
        });

        // 만료된 메시지가 있다면 localStorage 업데이트
        if (validMessages.length !== savedMessages.length) {
            localStorage.setItem('tomorrowMessages', JSON.stringify(validMessages));
        }

        setMessages(validMessages);
    };

    // 메시지 저장
    const saveMessages = (newMessages) => {
        localStorage.setItem('tomorrowMessages', JSON.stringify(newMessages));
        setMessages(newMessages);
    };

    // 폼 초기화
    const resetForm = () => {
        setFormData({ time: '', content: '' });
        setShowForm(false);
        setEditingMessage(null);
    };

    // 메시지 추가/수정
    const handleSubmit = (e) => {
        e.preventDefault();

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

        const messageData = {
            id: editingMessage ? editingMessage.id : Date.now(),
            content: formData.content,
            deliveryTime: formData.time,
            deliveryDate: tomorrow.toISOString().split('T')[0],
            deliveryDateTime: deliveryDateTime.toISOString(),
            createdAt: editingMessage ? editingMessage.createdAt : new Date().toISOString()
        };

        let newMessages;
        if (editingMessage) {
            newMessages = messages.map(msg =>
                msg.id === editingMessage.id ? messageData : msg
            );
        } else {
            newMessages = [...messages, messageData];
        }

        saveMessages(newMessages);
        resetForm();
    };

    // 메시지 수정 시작
    const startEdit = (message) => {
        setEditingMessage(message);
        setFormData({
            time: message.deliveryTime,
            content: message.content
        });
        setShowForm(true);
    };

    // 메시지 삭제
    const deleteMessage = (messageId) => {
        const newMessages = messages.filter(msg => msg.id !== messageId);
        saveMessages(newMessages);
        setShowDeleteConfirm(null);
    };

    // 메시지가 배달 시간인지 확인
    const isMessageReady = (message) => {
        const now = new Date();
        const deliveryTime = new Date(message.deliveryDateTime);
        return now >= deliveryTime;
    };

    // 배달 예정 시간 포맷팅
    const formatDeliveryTime = (message) => {
        const deliveryDate = new Date(message.deliveryDate);
        const tomorrow = deliveryDate.toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric'
        });
        const [hours, minutes] = message.deliveryTime.split(':');
        const timeString = `${parseInt(hours)}시 ${parseInt(minutes)}분`;

        return `${tomorrow} ${timeString}에 전달 예정`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start py-8">
            {/* 헤더 */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800">내일의 나에게</h2>
                <p className="text-gray-600 mt-2 text-lg">미래의 나에게 전하고 싶은 메시지를 보내보세요</p>
            </div>

            {/* 메시지 입력창 - 메시지가 없거나 수정 모드일 때 표시 */}
            {(messages.length === 0 || showForm) && (
                <div className="w-full max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg border p-8">
                        {editingMessage && (
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">메시지 수정</h3>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-3 text-center">
                                    내일 언제 받아볼까요?
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700 mb-3 text-center">
                                    내일의 나에게 전하고 싶은 말
                                </label>
                                <textarea
                                    rows={8}
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="내일의 나에게 전하고 싶은 말을 적어보세요...&#10;&#10;오늘 힘들었던 일, 응원의 메시지, 내일 기대되는 일 등&#10;무엇이든 좋아요 ✨"
                                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg leading-relaxed"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors text-lg font-medium"
                                >
                                    {editingMessage ? '📮 메시지 수정하기' : '📮 메시지 보내기'}
                                </button>
                                {editingMessage && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-8 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg"
                                    >
                                        취소
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 메시지 목록 */}
            {messages.length > 0 && !showForm && (
                <div className="w-full max-w-2xl mx-auto space-y-6">
                    {messages.map((message) => {
                        const messageReady = isMessageReady(message);

                        return (
                            <div key={message.id} className="bg-white rounded-xl shadow-lg border overflow-hidden">
                                {messageReady ? (
                                    // 배달된 메시지 (열어볼 수 있는 상태)
                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">📬</div>
                                                <span className="text-lg font-medium text-green-600">
                                                    메시지가 도착했습니다!
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => deleteMessage(message.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
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
                                    // 밀봉된 메시지 (아직 시간이 되지 않음)
                                    <div className="p-8 text-center">
                                        <div className="flex justify-end space-x-2 mb-6">
                                            <button
                                                onClick={() => startEdit(message)}
                                                className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                                                title="메시지 수정"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(message.id)}
                                                className="p-3 hover:bg-red-50 rounded-xl transition-colors text-red-500"
                                                title="메시지 삭제"
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
                                                    소중한 메시지가 안전하게 보관되고 있어요 ✨
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

                    {/* 새 메시지 작성 버튼 - 메시지가 있을 때만 표시 */}
                    <div className="text-center pt-4">
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto text-lg"
                        >
                            <Plus size={18} />
                            <span>또 다른 메시지 보내기</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 빈 상태일 때 안내 메시지 (입력창이 바로 표시되므로 제거) */}

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
                                onClick={() => deleteMessage(showDeleteConfirm)}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                            >
                                삭제
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
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