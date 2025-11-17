// src/components/planner/CategoryManager.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, Check } from "lucide-react";
import { usePlannerContext } from "../../hooks/PlannerContext";
import { useCurrentPlanner } from "../../hooks/useCurrentPlanner";

const CategoryManager = ({ isOpen, onClose, plannerId }) => {
  const { plannerType } = usePlannerContext();
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
  } = useCurrentPlanner(plannerType);

  const [categoryName, setCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FDA4AF");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("#FDA4AF"); // 수정용 색상 추가

  // 색상 팔레트
  const colorPalette = [
    "#FDA4AF", // 분홍
    "#45B7D1", // 파랑
    "#FFA07A", // 연어
    "#F7DC6F", // 노랑
    "#BB8FCE", // 보라
  ];

  useEffect(() => {
    if (isOpen && plannerId) {
      fetchCategories(plannerId);
    }
  }, [isOpen, plannerId]);

  // 카테고리 생성
  const handleCreate = async () => {
    if (!categoryName.trim()) {
      alert("카테고리 이름을 입력하세요");
      return;
    }

    try {
      await createCategory(plannerId, {
        name: categoryName,
        color: selectedColor,
      });
      setCategoryName("");
      setSelectedColor("#FDA4AF");
      alert("카테고리가 추가되었습니다");
    } catch (error) {
      alert("카테고리 추가 실패: " + error.message);
    }
  };

  // 카테고리 수정
  const handleUpdate = async (categoryId) => {
    if (!editingName.trim()) {
      alert("카테고리 이름을 입력하세요");
      return;
    }

    try {
      await updateCategory(plannerId, categoryId, {
        name: editingName,
        color: editingColor, // 수정된 색상도 함께 전송
      });

      // 수정 완료 후 초기화
      setEditingId(null);
      setEditingName("");
      setEditingColor("#FDA4AF");

      alert("카테고리가 수정되었습니다");
    } catch (error) {
      alert("카테고리 수정 실패: " + error.message);
    }
  };

  // 카테고리 삭제
  const handleDelete = async (categoryId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteCategory(plannerId, categoryId);
        alert("카테고리가 삭제되었습니다");
      } catch (error) {
        alert("카테고리 삭제 실패: " + error.message);
      }
    }
  };

  // 수정 모드 진입
  const startEditing = (category) => {
    setEditingId(category.categoryId);
    setEditingName(category.categoryName);
    setEditingColor(category.color); // 현재 색상도 함께 설정
  };

  // 수정 취소
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
    setEditingColor("#FDA4AF");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">카테고리 관리</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* 카테고리 추가 */}
        <div className="p-4 border-b space-y-3">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="새 카테고리 이름"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={20}
          />

          {/* 색상 선택 */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-600">색상:</span>
            {colorPalette.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color
                    ? "border-gray-800 scale-110"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            <Plus size={18} />
            카테고리 추가
          </button>
        </div>

        {/* 카테고리 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              카테고리가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.categoryId}
                  className="border rounded-lg hover:bg-gray-50 p-3"
                >
                  {editingId === category.categoryId ? (
                    // 수정 모드
                    <div className="space-y-3">
                      {/* 색상 선택 (수정 모드) */}
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-600">색상:</span>
                        {colorPalette.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditingColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              editingColor === color
                                ? "border-gray-800 scale-110"
                                : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {/* 이름 입력 */}
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={20}
                        autoFocus
                      />

                      {/* 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(category.categoryId)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <Check size={16} />
                          저장
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          <X size={16} />
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 일반 모드
                    <div className="flex items-center gap-2">
                      {/* 색상 표시 */}
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />

                      {/* 카테고리 이름 */}
                      <span className="flex-1 font-medium">
                        {category.categoryName}
                      </span>

                      {/* 액션 버튼 */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="수정"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.categoryId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
