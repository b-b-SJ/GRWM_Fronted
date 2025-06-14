import React from 'react';
import { Calendar, Plus} from 'lucide-react';

const PlannerPage = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <Calendar className="mr-3" size={32} />
                        플래너
                    </h1>
                    <p className="text-gray-600">일정과 할 일을 관리하세요</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-8">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus size={32} className="text-blue-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">플래너 기능 준비 중</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlannerPage;