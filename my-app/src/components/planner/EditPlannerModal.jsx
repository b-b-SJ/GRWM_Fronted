import { useState } from "react";

const EditPlannerModal = ({ isOpen, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">플래너 설정</h2>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
export default EditPlannerModal;
