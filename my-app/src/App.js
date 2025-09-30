import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import MainPage from './components/pages/MainPage';
import PlannerPage from './components/pages/PlannerPage';
import TrackerPage from './components/pages/TrackerPage';
import CommunityPage from "./components/pages/community/CommunityPage";
import WorkspacePage from './components/pages/WorkspacePage';
import { ChatStateProvider } from './hooks/useChatState';
import AuthPage from './components/pages/auth/AuthPage';
import { AuthProvider } from './hooks/AuthContext';
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ChatStateProvider>
                        <Routes>
                            <Route path="auth" element={<AuthPage />} />
                            <Route path="/" element={<Navigate to="/auth" replace />} />

                            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                                <Route path="main" element={<MainPage />} />
                                <Route path="planner" element={<PlannerPage />} />
                                <Route path="tracker" element={<TrackerPage />} />
                                <Route path="workspace/*" element={<WorkspacePage />} />
                                <Route path="community" element={<CommunityPage />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/auth" replace />} />
                        </Routes>
                </ChatStateProvider>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;