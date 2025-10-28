// /src/hooks/notificationAPI.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 실제 API 함수들
export const notificationAPI = {
    // 전체 알림 조회 (최근 10개)
    getAllNotifications: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications?limit=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 필요시 인증 토큰 추가
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('전체 알림 조회 실패');
            }

            return await response.json();
        } catch (error) {
            console.error('getAllNotifications 에러:', error);
            throw error;
        }
    },

    // 카테고리별 알림 조회 (최근 10개)
    // category: 'planner', 'tracker', 'community'
    getNotificationsByCategory: async (category) => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications?category=${category}&limit=10`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 필요시 인증 토큰 추가
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error(`카테고리 ${category} 알림 조회 실패`);
            }

            return await response.json();
        } catch (error) {
            console.error('getNotificationsByCategory 에러:', error);
            throw error;
        }
    },

    // 개별 알림 읽음 처리
    markNotificationAsRead: async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 필요시 인증 토큰 추가
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('개별 알림 읽음 처리 실패');
            }

            return await response.json();
        } catch (error) {
            console.error('markNotificationAsRead 에러:', error);
            throw error;
        }
    },

    // 모든 알림 읽음 처리
    markAllNotificationsAsRead: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 필요시 인증 토큰 추가
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('모든 알림 읽음 처리 실패');
            }

            return await response.json();
        } catch (error) {
            console.error('markAllNotificationsAsRead 에러:', error);
            throw error;
        }
    },

    // 읽지 않은 알림 여부 확인 (선택사항)
    hasUnreadNotifications: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/unread-exists`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 필요시 인증 토큰 추가
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (!response.ok) {
                throw new Error('읽지 않은 알림 확인 실패');
            }

            const data = await response.json();
            return data.hasUnread;
        } catch (error) {
            console.error('hasUnreadNotifications 에러:', error);
            throw error;
        }
    },

    // 실시간 알림 구독 (WebSocket) - 선택사항
    subscribeToNotifications: (callback) => {
        try {
            const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws/notifications';
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('알림 WebSocket 연결됨');
            };

            ws.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    callback(notification);
                } catch (error) {
                    console.error('WebSocket 메시지 파싱 에러:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket 에러:', error);
            };

            ws.onclose = () => {
                console.log('알림 WebSocket 연결 종료');
            };

            // unsubscribe 함수 반환
            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        } catch (error) {
            console.error('WebSocket 연결 실패:', error);
            return () => {}; // 빈 함수 반환
        }
    }
};

// 개발용 Mock API
export const mockNotificationAPI = {
    getAllNotifications: async () => {
        // 개발용 지연시간 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));

        return [
            { id: 1, type: '공유 플래너', message: '새로운 일정 투표가 시작 되었습니다.', time: '2분 전', isRead: false },
            { id: 2, type: '트래커', message: '어제의 나에게로부터 메시지가 도착했습니다!', time: '5분 전', isRead: false },
            { id: 3, type: '커뮤니티', message: '새로운 댓글이 달렸습니다.', time: '10분 전', isRead: true },
        ];
    },

    getNotificationsByCategory: async (category) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        const mockData = {
            'planner': [
                { id: 1, type: '공유 플래너', message: '새로운 일정 투표가 시작 되었습니다.', time: '2분 전', isRead: false },
            ],
            'tracker': [
                { id: 2, type: '트래커', message: '어제의 나에게로부터 메시지가 도착했습니다!', time: '5분 전', isRead: false },
            ],
            'community': [
                { id: 3, type: '커뮤니티', message: '새로운 댓글이 달렸습니다.', time: '10분 전', isRead: true },
            ]
        };

        return mockData[category] || [];
    },

    markNotificationAsRead: async (notificationId) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`Mock: 알림 ${notificationId} 읽음 처리`);
        return { success: true };
    },

    markAllNotificationsAsRead: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Mock: 모든 알림 읽음 처리');
        return { success: true };
    },

    hasUnreadNotifications: async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return Math.random() > 0.5; // 랜덤하게 true/false 반환
    },

    // 개발 단계에서는 실시간 구독 없음
    subscribeToNotifications: null
};

// 환경에 따라 다른 API 사용
export const useNotificationAPI = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? mockNotificationAPI : notificationAPI;
};