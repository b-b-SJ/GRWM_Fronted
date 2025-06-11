import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import MainPage from './components/pages/MainPage';
import PlannerPage from './components/pages/PlannerPage';
import TrackerPage from './components/pages/TrackerPage';
import CommunityPage from './components/pages/CommunityPage';
import WorkspacePage from './components/pages/WorkspacePage';
import { ChatStateProvider } from './hooks/useChatState';

const App = () => {
    return (
        <ChatStateProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<Navigate to="/main" replace />} />
                        <Route path="main" element={<MainPage />} />
                        <Route path="planner" element={<PlannerPage />} />
                        <Route path="tracker" element={<TrackerPage />} />
                        <Route path="workspace/*" element={<WorkspacePage />} />
                        <Route path="community" element={<CommunityPage />} />
                    </Route>
                    {/* 404 페이지 등... 이후 추가 라우트 */}
                    <Route path="*" element={<Navigate to="/main" replace />} />
                </Routes>
            </Router>
        </ChatStateProvider>
    );
};

export default App;