// src/components/planner/schedule/ScheduleFormModal.jsx
import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, FileText, Users } from "lucide-react";
import { useTeamPlanner } from "../../hooks/TeamPlannerProvider";
import { useParams } from "react-router-dom";
const ScheduleFormModal = ({
  isOpen,
  onClose,
  mode = "create", // 'create' | 'edit'
  //plannerId,
  plannerType = "shared", // 'personal' | 'shared'
  scheduleId = null, // edit 모드일 때 필요
  initialData = null, // edit 모드일 때 필요
  selectedDate = null, // 날짜 클릭해서 열었을 때 자동 입력
  onSuccess = null, // 성공 후 콜백
}) => {
  const {
    createSchedule,
    updateSchedule,
    fetchCategories,
    categories,
    loading,
  } = useTeamPlanner();

  // ==================== State 관리 ====================
  const { plannerId } = useParams();
  console.log("아이디함 까봐라", plannerId);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: null,
    startDateTime: "",
    finishDateTime: "",
    location: "",
    memo: "",
    editorRange: "creator", // 기본값: 생성자만 수정 가능
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== 초기화 로직 ====================

  /**
   * 모달이 열릴 때 초기화 작업
   * 1. 카테고리 목록 불러오기
   * 2. selectedDate가 있으면 시작/종료 시간 자동 설정
   * 3. edit 모드면 기존 데이터 로드
   */
  useEffect(() => {
    if (isOpen && plannerId) {
      // 카테고리 목록 불러오기
      fetchCategories(plannerId);

      // create 모드 + 날짜가 선택되어 있으면
      if (mode === "create" && selectedDate) {
        const dateStr = formatDateForInput(selectedDate);
        setFormData((prev) => ({
          ...prev,
          startDateTime: `${dateStr}T09:00`, // 기본 9시
          finishDateTime: `${dateStr}T10:00`, // 기본 10시
        }));
      }

      // edit 모드면 기존 데이터로 폼 채우기
      if (mode === "edit" && initialData) {
        setFormData({
          title: initialData.title || "",
          categoryId: initialData.category?.categoryId || null,
          startDateTime: initialData.startDateTime || "",
          finishDateTime: initialData.finishDateTime || "",
          location: initialData.location || "",
          memo: initialData.memo || "",
          editorRange: initialData.editorRange || "creator",
        });
      }
    }
  }, [isOpen, plannerId, mode, selectedDate, initialData, fetchCategories]);

  // ==================== 헬퍼 함수 ====================

  /**
   * Date 객체를 input[type="date"] 형식으로 변환
   * @param {Date} date - 변환할 날짜
   * @returns {string} "YYYY-MM-DD" 형식
   */
  const formatDateForInput = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /**
   * 입력값 변경 핸들러
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * 유효성 검사
   * @returns {boolean} 유효하면 true
   */
  const validate = () => {
    const newErrors = {};

    // 제목 필수
    if (!formData.title.trim()) {
      newErrors.title = "일정 제목을 입력해주세요";
    }

    // 시작 시간 필수
    if (!formData.startDateTime) {
      newErrors.startDateTime = "시작 시간을 선택해주세요";
    }

    // 종료 시간 필수
    if (!formData.finishDateTime) {
      newErrors.finishDateTime = "종료 시간을 선택해주세요";
    }

    // 시작 시간이 종료 시간보다 늦으면 안됨
    if (
      formData.startDateTime &&
      formData.finishDateTime &&
      new Date(formData.startDateTime) >= new Date(formData.finishDateTime)
    ) {
      newErrors.finishDateTime = "종료 시간은 시작 시간보다 늦어야 합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 폼 제출 핸들러 (생성 또는 수정)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        // ===== 일정 생성 =====
        const scheduleData = {
          plannerId: plannerId,
          categoryId: formData.categoryId || null, // Optional<Long>
          title: formData.title,
          startDateTime: formData.startDateTime,
          finishDateTime: formData.finishDateTime,
          location: formData.location || "",
          memo: formData.memo || "",
          editorRange: formData.editorRange,
        };

        console.log("일정 생성 요청:", scheduleData);
        const scheduleId = await createSchedule(plannerId, scheduleData);

        if (scheduleId) {
          alert("일정이 생성되었습니다!");
          handleClose();

          // 성공 콜백 호출
          if (onSuccess) {
            onSuccess({ scheduleId, ...scheduleData });
          }
        }
      } else {
        // ===== 일정 수정 =====
        const updateData = {
          title: formData.title,
          category: formData.categoryId
            ? {
                categoryId: formData.categoryId,
                // 카테고리 이름과 색상은 백엔드가 알아서 채움
              }
            : null,
          startDateTime: formData.startDateTime,
          finishDateTime: formData.finishDateTime,
          location: formData.location || "",
          memo: formData.memo || "",
          editorRange: formData.editorRange,
        };

        console.log("일정 수정 요청:", updateData);
        const updatedSchedule = await updateSchedule(
          plannerId,
          scheduleId,
          updateData
        );

        if (updatedSchedule) {
          alert("일정이 수정되었습니다!");
          handleClose();

          // 성공 콜백 호출
          if (onSuccess) {
            onSuccess(updatedSchedule);
          }
        }
      }
    } catch (error) {
      console.error("일정 처리 실패:", error);
      alert(
        `일정 ${mode === "create" ? "생성" : "수정"}에 실패했습니다: ${
          error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 폼 초기화
   */
  const resetForm = () => {
    setFormData({
      title: "",
      categoryId: null,
      startDateTime: "",
      finishDateTime: "",
      location: "",
      memo: "",
      editorRange: "creator",
    });
    setErrors({});
  };

  /**
   * 모달 닫기 (초기화 포함)
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않게
      >
        {/* ==================== 헤더 ==================== */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {mode === "create" ? "새 일정 만들기" : "일정 수정하기"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ==================== 폼 본문 ==================== */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* 제목 입력 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                일정 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 팀 회의"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                maxLength={50}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                카테고리 <span className="text-gray-400 text-xs">(선택)</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">카테고리 없음</option>
                {categories &&
                  categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* 시작 날짜/시간 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock size={16} />
                시작 시간 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDateTime ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.startDateTime && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.startDateTime}
                </p>
              )}
            </div>

            {/* 종료 날짜/시간 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock size={16} />
                종료 시간 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="finishDateTime"
                value={formData.finishDateTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.finishDateTime ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.finishDateTime && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.finishDateTime}
                </p>
              )}
            </div>

            {/* 장소 입력 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin size={16} />
                장소 <span className="text-gray-400 text-xs">(선택)</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="예: 회의실 A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            </div>

            {/* 메모 입력 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FileText size={16} />
                메모 <span className="text-gray-400 text-xs">(선택)</span>
              </label>
              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                placeholder="일정에 대한 추가 정보를 입력하세요"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              {formData.memo && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.memo.length}/500
                </p>
              )}
            </div>

            {/* 수정 권한 범위 설정 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Users size={16} />
                수정 권한
              </label>
              <select
                name="editorRange"
                value={formData.editorRange}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="creator">생성자만 수정 가능</option>
                <option value="creatorOrManager">
                  생성자와 관리자만 수정 가능
                </option>
                <option value="everyone">모든 멤버 수정 가능</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                이 일정을 누가 수정할 수 있는지 설정합니다
              </p>
            </div>
          </div>

          {/* ==================== 하단 버튼 ==================== */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting || loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting || loading
                ? "처리 중..."
                : mode === "create"
                ? "일정 만들기"
                : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleFormModal;
