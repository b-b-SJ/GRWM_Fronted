// src/hooks/useFCM.js

import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';

export const requestFCMToken = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'BG6DFWD48oNNaThwt2fTE0g3LRyeqVinP-U2mo8dDSaSO4jgJMGEI3KddVas2ze40Ad3u5e68sevbR9DKryxCLs'
            });
            console.log('FCM 토큰 발급:', token);
            return token;
        }

        console.log('알림 권한 거부됨');
        return null;

    } catch (error) {
        console.error('FCM 토큰 발급 실패:', error);
        return null;
    }
};

// 메시지 리스너 설정 함수
export const setupFCMListener = (onNotificationReceived) => {
    onMessage(messaging, (payload) => {
        console.log('FCM 알림 수신:', payload);

        // 브라우저 알림 표시
        if (Notification.permission === 'granted') {
            new Notification(payload.notification.title, {
                body: payload.notification.body
            });
        }

        // 콜백 실행 (알림 목록 새로고침 등)
        if (onNotificationReceived) {
            onNotificationReceived();
        }
    });
};

export const useFCM = () => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        requestFCMToken().then(setToken);
        setupFCMListener();
    }, []);

    return token;
};
