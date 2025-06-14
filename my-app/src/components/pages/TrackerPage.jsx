import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const TrackerPage = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <BarChart3 className="mr-3" size={32} />
                        트래커
                    </h1>
                    <p className="text-gray-600">하루를 기록하세요</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp size={32} className="text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">트래커 기능 준비 중</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackerPage;
