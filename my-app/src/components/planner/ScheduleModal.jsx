import React from "react";

//뜯어 고쳐질 예정인데 일단 유지를 해놓는

{
  /* 일정 상세 모달 (selectedEvent가 있을 때만 표시) */
}
selectedEvent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">일정 상세</h3>
      <div className="space-y-2">
        <p>
          <strong>제목:</strong> {selectedEvent.title}
        </p>
        {selectedEvent.time && (
          <p>
            <strong>시간:</strong> {selectedEvent.time}
          </p>
        )}
        {selectedEvent.location && (
          <p>
            <strong>장소:</strong> {selectedEvent.location}
          </p>
        )}
        {selectedEvent.category && (
          <p>
            <strong>카테고리:</strong> {selectedEvent.category}
          </p>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setSelectedEvent(null)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
);
