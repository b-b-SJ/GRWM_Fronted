// /src/hooks/notificationAPI.js
import { useAuth } from './AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const useNotificationAPI = () => {
    const { getAuthHeaders } = useAuth();

    return {
        // 전체 알림 조회
        getAllNotifications: async (limit = 10) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/notifications?limit=${limit}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
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

        // 타입별 알림 조회
        // type: 'FOLLOW', 'SCHEDULE', 'FOR_ME_TOMORROW'
        getNotificationsByType: async (type, limit = 10) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/notifications?type=${type}&limit=${limit}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`타입 ${type} 알림 조회 실패`);
                }

                return await response.json();
            } catch (error) {
                console.error('getNotificationsByType 에러:', error);
                throw error;
            }
        }

    };
};