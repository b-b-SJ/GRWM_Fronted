// /src/hooks/notificationAPI.js
import { useAuth } from './AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const useNotificationAPI = () => {
    const { getAuthHeaders } = useAuth();

    return {
        // 최근 7일간의 알림 조회 (최근 날짜순 정렬)
        getAllNotifications: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error('알림 조회 실패');
                }

                return await response.json();
            } catch (error) {
                console.error('getAllNotifications 에러:', error);
                throw error;
            }
        },

        // 타입별 알림 필터링 (클라이언트 측)
        // type: 'COMMUNITY', 'FOR_ME_TOMORROW', 'SCHEDULE'
        filterNotificationsByType: (notifications, type) => {
            if (!type || !notifications) return notifications;
            return notifications.filter(notification => notification.type === type);
        },

        // 읽지 않은 알림만 필터링 (클라이언트 측)
        getUnreadNotifications: (notifications) => {
            if (!notifications) return [];
            return notifications.filter(notification => !notification.isRead);
        },

        // 알림 읽음 처리 (필요시 추가)
        markAsRead: async (notificationId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
                    method: 'PUT',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error('알림 읽음 처리 실패');
                }

                return await response.json();
            } catch (error) {
                console.error('markAsRead 에러:', error);
                throw error;
            }
        }
    };
};